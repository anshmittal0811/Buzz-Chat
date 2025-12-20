import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chatService';
import { getSocket } from '@/lib/socket';
import { useAuth } from './AuthContext';
import type { Group, Message, User, Attachment } from '@/types';

interface ChatContextType {
  groups: Group[];
  isLoadingGroups: boolean;
  selectedGroup: Group | null;
  messages: Message[];
  isLoadingMessages: boolean;
  selectGroup: (group: Group) => void;
  sendMessage: (content: string, attachment?: Attachment) => void;
  createGroup: (name: string | null, memberIds: string[]) => Promise<void>;
  getUserById: (userId: string) => User | undefined;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // User cache - maps userId to User object for quick lookup
  const userCacheRef = useRef<Map<string, User>>(new Map());

  // Fetch groups
  const { data: groupsData, isLoading: isLoadingGroups } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await chatService.fetchGroups();
      return response.data;
    },
    enabled: isAuthenticated,
  });

  // Populate user cache from groups
  useEffect(() => {
    if (!groupsData) return;
    
    groupsData.forEach((group) => {
      // Cache all members from each group
      group.members?.forEach((member) => {
        if (member?._id) {
          userCacheRef.current.set(member._id, member);
        }
      });
    });
    
    // Also cache current user
    if (user) {
      userCacheRef.current.set(user._id, user);
    }
  }, [groupsData, user]);

  // Get user from cache by ID
  const getUserById = useCallback((userId: string): User | undefined => {
    return userCacheRef.current.get(userId);
  }, []);

  // Fetch messages for selected group
  const { isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedGroup?._id],
    queryFn: async () => {
      if (!selectedGroup) return { data: [] };
      const response = await chatService.fetchMessages(selectedGroup._id, { limit: 50 });
      return response.data;
    },
    enabled: !!selectedGroup,
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: ({ name, memberIds }: { name: string | null; memberIds: string[] }) =>
      chatService.createGroup(name, memberIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  // Socket event handlers
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isAuthenticated) return;

    const handleIncomingMessage = (message: Message & { groupId?: string; senderId?: string }) => {
      console.log('📩 Incoming message received:', message);
      // Backend sends groupId, frontend uses group
      const messageGroupId = message.group || message.groupId || '';
      
      if (messageGroupId === selectedGroup?._id) {
        // Look up sender from cache if we only have senderId
        const senderId = message.sender?._id || message.senderId || '';
        const cachedSender = userCacheRef.current.get(senderId);
        
        // Transform message to match our Message type
        const normalizedMessage: Message = {
          ...message,
          group: messageGroupId,
          _id: message._id || `incoming-${Date.now()}`,
          createdAt: message.createdAt || new Date().toISOString(),
          updatedAt: message.updatedAt || new Date().toISOString(),
          sender: cachedSender || message.sender || { 
            _id: senderId,
            firstName: '',
            lastName: '',
            email: '',
          } as User,
        };
        setMessages((prev) => [...prev, normalizedMessage]);
      }
      // Refresh groups to update last message
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    };

    const handleGroupCreated = () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    };

    socket.on('chat.message.incoming', handleIncomingMessage);
    socket.on('group.created', handleGroupCreated);

    return () => {
      socket.off('chat.message.incoming', handleIncomingMessage);
      socket.off('group.created', handleGroupCreated);
    };
  }, [isAuthenticated, selectedGroup, queryClient]);

  // Load messages when group changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedGroup) {
        setMessages([]);
        return;
      }
      try {
        const response = await chatService.fetchMessages(selectedGroup._id, { limit: 50 });
        // API returns { messages: [...], canLoadMore: boolean }
        const messagesData = response.data?.messages || [];
        // Messages come in reverse order (newest first), reverse for display (oldest first)
        setMessages([...messagesData].reverse());
      } catch (error) {
        console.error('Failed to load messages:', error);
        setMessages([]);
      }
    };
    
    loadMessages();
  }, [selectedGroup]);

  const selectGroup = useCallback((group: Group) => {
    setSelectedGroup(group);
  }, []);

  const sendMessage = useCallback(
    (content: string, attachment?: Attachment) => {
      const socket = getSocket();
      console.log('sendMessage called', { socket: !!socket, connected: socket?.connected, selectedGroup: selectedGroup?._id });
      
      if (!socket) {
        console.error('Socket not available');
        return;
      }
      
      if (!socket.connected) {
        console.error('Socket not connected');
        return;
      }
      
      if (!selectedGroup || !user) {
        console.error('No group selected or user not logged in');
        return;
      }

      const messageData: {
        content?: string;
        groupId: string;
        attachment?: {
          url: string;
          type: string;
          name: string;
          size?: number;
        };
      } = {
        groupId: selectedGroup._id,
      };

      // Add content if provided
      if (content) {
        messageData.content = content;
      }

      // Add attachment if provided
      if (attachment) {
        messageData.attachment = {
          url: attachment.url,
          type: attachment.type,
          name: attachment.filename,
          size: attachment.size,
        };
      }

      console.log('Emitting chat.message.send:', messageData);
      
      // Optimistic update - add message to UI immediately
      const optimisticMessage: Message = {
        _id: `temp-${Date.now()}`,
        content: content || undefined,
        attachment: attachment,
        sender: {
          _id: user._id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          profileUrl: user.profileUrl,
        },
        group: selectedGroup._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMessage]);
      
      // Backend expects JSON string, not object
      socket.emit('chat.message.send', JSON.stringify(messageData));
      
      // Refresh groups to update sorting (move this conversation to top)
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    [selectedGroup, user, queryClient]
  );

  const createGroup = useCallback(
    async (name: string | null, memberIds: string[]) => {
      await createGroupMutation.mutateAsync({ name, memberIds });
    },
    [createGroupMutation]
  );

  return (
    <ChatContext.Provider
      value={{
        groups: groupsData || [],
        isLoadingGroups,
        selectedGroup,
        messages,
        isLoadingMessages,
        selectGroup,
        sendMessage,
        createGroup,
        getUserById,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

