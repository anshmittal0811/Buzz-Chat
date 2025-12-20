import { useState } from 'react';
import { LogOut, Plus, Search, MessageCircle, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import {
  getGroupDisplayName,
  getGroupAvatar,
  getLatestMessage,
  getGroupSortTime,
} from '@/utils/groupUtils';

interface ChatSidebarProps {
  onNewChat: () => void;
}

export const ChatSidebar = ({ onNewChat }: ChatSidebarProps) => {
  const { groups, selectedGroup, selectGroup, isLoadingGroups } = useChat();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  // Sort groups by latest message (most recent first), then filter by search
  const sortedAndFilteredGroups = [...groups]
    .sort((a, b) => getGroupSortTime(b) - getGroupSortTime(a))
    .filter((group) => {
      const displayName = getGroupDisplayName(group, user?._id || '');
      return displayName.toLowerCase().includes(searchQuery.toLowerCase());
    });

  return (
    <div className="w-80 h-full bg-cream border-r border-stone flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-stone">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src="/bee-logo.svg" alt="Buzz Chat" className="w-8 h-8" />
            <h1 className="font-display text-xl font-bold text-navy-deep">Buzz Chat</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={onNewChat}>
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-ivory border border-stone rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-light focus:border-navy-light"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingGroups ? (
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
        ) : sortedAndFilteredGroups.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-stone mx-auto mb-3" />
            <p className="text-graphite">No conversations yet</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={onNewChat}>
              Start a new chat
            </Button>
          </div>
        ) : (
          <div className="p-2">
            {sortedAndFilteredGroups.map((group) => {
              const displayName = getGroupDisplayName(group, user?._id || '');
              const avatarProps = getGroupAvatar(group, user?._id || '');
              const isSelected = selectedGroup?._id === group._id;
              const lastMessage = getLatestMessage(group);
              const lastMessageTime = lastMessage?.createdAt
                ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })
                : '';

              return (
                <button
                  key={group._id}
                  onClick={() => selectGroup(group)}
                  className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                    isSelected
                      ? 'bg-navy/10 border border-navy/20'
                      : 'hover:bg-parchment'
                  }`}
                >
                  <Avatar {...avatarProps} size="md" />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium truncate ${isSelected ? 'text-navy-deep' : 'text-charcoal'}`}>
                        {displayName}
                      </span>
                      {lastMessageTime && (
                        <span className="text-xs text-graphite ml-2 flex-shrink-0">
                          {lastMessageTime}
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <p className="text-sm text-graphite truncate mt-0.5">
                        {lastMessage.content || '📎 Attachment'}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-stone bg-ivory/50">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setShowProfileSettings(true)}
            className="flex items-center gap-3 hover:bg-parchment rounded-lg p-1 -m-1 transition-colors"
          >
            <Avatar
              src={user?.profileUrl}
              name={`${user?.firstName} ${user?.lastName}`}
              size="md"
            />
            <div className="min-w-0 text-left">
              <p className="font-medium text-charcoal truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-graphite truncate">{user?.email}</p>
            </div>
          </button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowProfileSettings(true)}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <ProfileSettingsModal
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
      />
    </div>
  );
};

