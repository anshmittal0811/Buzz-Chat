import { useState, useMemo } from 'react';
import { Settings, Users } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { GroupSettingsModal } from './GroupSettingsModal';
import { getGroupDisplayName, getGroupAvatar } from '@/utils/groupUtils';
import { usePresence, formatLastSeen } from '@/hooks/usePresence';

export const ChatHeader = () => {
  const { selectedGroup } = useChat();
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  // Determine if this is a 1:1 chat and get the other user's ID
  const otherUser = useMemo(() => {
    if (!selectedGroup || selectedGroup.name) return null;
    const members = selectedGroup.members || [];
    if (members.length !== 2) return null;
    return members.find((m) => m._id !== user?._id) || null;
  }, [selectedGroup, user?._id]);

  const isOneToOne = !!otherUser;
  const isGroupChat = !isOneToOne && (selectedGroup?.members?.length || 0) >= 2;

  console.log('[ChatHeader] Presence check:', {
    isOneToOne,
    otherUserId: otherUser?._id,
    groupName: selectedGroup?.name,
    memberCount: selectedGroup?.members?.length
  });

  // Track presence for 1:1 chats
  const { isOnline, lastSeen } = usePresence(otherUser?._id || null, isOneToOne);
  
  console.log('[ChatHeader] Presence status:', { isOnline, lastSeen });

  if (!selectedGroup) return null;

  const displayName = getGroupDisplayName(selectedGroup, user?._id || '');
  const avatarProps = getGroupAvatar(selectedGroup, user?._id || '');
  const memberCount = selectedGroup.members?.length || 0;

  // Get status text for 1:1 chats
  const getStatusText = () => {
    if (isOnline) {
      return <span className="text-sage">Online</span>;
    }
    if (lastSeen) {
      return `Last seen ${formatLastSeen(lastSeen)}`;
    }
    return 'Offline';
  };

  return (
    <>
      <div className="h-16 px-4 border-b border-stone bg-cream flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar {...avatarProps} size="md" />
            {isOneToOne && isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-sage border-2 border-cream rounded-full" />
            )}
          </div>
          <div>
            <h2 className="font-medium text-charcoal">{displayName}</h2>
            <p className="text-xs text-graphite">
              {isGroupChat ? (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {memberCount} members
                </span>
              ) : (
                getStatusText()
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isGroupChat && (
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {isGroupChat && (
        <GroupSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          group={selectedGroup}
        />
      )}
    </>
  );
};

