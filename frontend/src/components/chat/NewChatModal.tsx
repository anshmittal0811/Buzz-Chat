import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Search, Check, Users } from 'lucide-react';
import { userService } from '@/services/userService';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import type { User } from '@/types';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewChatModal = ({ isOpen, onClose }: NewChatModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { createGroup } = useChat();
  const { user: currentUser } = useAuth();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      const response = await userService.getUsers({ search: searchQuery, limit: 20 });
      return response.data;
    },
    enabled: isOpen,
  });

  const users = usersData?.data?.filter((u) => u._id !== currentUser?._id) || [];

  const resetModal = () => {
    setSelectedUsers([]);
    setGroupName('');
    setSearchQuery('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u._id === user._id);
      if (isSelected) {
        return prev.filter((u) => u._id !== user._id);
      }
      return [...prev, user];
    });
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;

    setIsCreating(true);
    try {
      const memberIds = selectedUsers.map((u) => u._id);
      const name = selectedUsers.length > 1 ? groupName || null : null;
      
      await createGroup(name, memberIds);
      
      // Close and reset modal after successful creation
      handleClose();
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-ivory rounded-2xl w-full max-w-md mx-4 shadow-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-stone flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-navy-deep">New Conversation</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="p-4 border-b border-stone">
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-2 bg-parchment rounded-full pl-1 pr-3 py-1"
                >
                  <Avatar
                    src={user.profileUrl}
                    name={`${user.firstName} ${user.lastName}`}
                    size="sm"
                  />
                  <span className="text-sm text-charcoal">
                    {user.firstName}
                  </span>
                  <button
                    onClick={() => toggleUserSelection(user)}
                    className="text-graphite hover:text-burgundy"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {selectedUsers.length > 1 && (
              <div className="mt-3">
                <Input
                  placeholder="Group name (optional)"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="p-4 border-b border-stone">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-cream border border-stone rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                  <div className="w-10 h-10 bg-stone rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-stone rounded w-3/4" />
                    <div className="h-3 bg-stone rounded w-1/2 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-stone mx-auto mb-3" />
              <p className="text-graphite">No users found</p>
            </div>
          ) : (
            users.map((user) => {
              const isSelected = selectedUsers.some((u) => u._id === user._id);
              return (
                <button
                  key={user._id}
                  onClick={() => toggleUserSelection(user)}
                  className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                    isSelected ? 'bg-navy/10' : 'hover:bg-parchment'
                  }`}
                >
                  <Avatar
                    src={user.profileUrl}
                    name={`${user.firstName} ${user.lastName}`}
                    size="md"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-charcoal">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-graphite">{user.email}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-navy rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-ivory" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone">
          <Button
            className="w-full"
            disabled={selectedUsers.length === 0}
            isLoading={isCreating}
            onClick={handleCreateChat}
          >
            {selectedUsers.length > 1 ? 'Create Group' : 'Start Chat'}
          </Button>
        </div>
      </div>
    </div>
  );
};

