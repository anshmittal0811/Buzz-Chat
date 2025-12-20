import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { NewChatModal } from '@/components/chat/NewChatModal';
import { MessageCircle } from 'lucide-react';

const ChatContent = () => {
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const { selectedGroup } = useChat();

  return (
    <div className="h-screen flex bg-ivory">
      <ChatSidebar onNewChat={() => setIsNewChatOpen(true)} />

      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            <ChatHeader />
            <MessageList />
            <MessageInput />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-cream to-ivory">
            <div className="text-center">
              <div className="w-24 h-24 bg-parchment rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-stone/20">
                <MessageCircle className="w-12 h-12 text-navy" />
              </div>
              <h2 className="font-display text-2xl font-bold text-navy-deep mb-2">
                Welcome to Buzz Chat
              </h2>
              <p className="text-graphite max-w-sm mx-auto">
                Select a conversation from the sidebar or start a new chat to begin messaging
              </p>
            </div>
          </div>
        )}
      </div>

      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
      />
    </div>
  );
};

export const ChatPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <img src="/bee-logo.svg" alt="Loading" className="w-16 h-16 mb-4" />
          <div className="h-2 bg-stone rounded w-24" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  );
};

