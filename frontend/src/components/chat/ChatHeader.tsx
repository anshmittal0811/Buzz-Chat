import { useState } from 'react';
import { Settings, Users } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { GroupSettingsModal } from './GroupSettingsModal';
import { getGroupDisplayName, getGroupAvatar } from '@/utils/groupUtils';

export const ChatHeader = () => {
  const { selectedGroup } = useChat();
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  if (!selectedGroup) return null;

  const displayName = getGroupDisplayName(selectedGroup, user?._id || '');
  const avatarProps = getGroupAvatar(selectedGroup, user?._id || '');
  const isGroupChat = !!selectedGroup.name || (selectedGroup.members?.length || 0) > 2;
  const memberCount = selectedGroup.members?.length || 0;

  return (
    <>
      <div className="h-16 px-4 border-b border-stone bg-cream flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar {...avatarProps} size="md" />
          <div>
            <h2 className="font-medium text-charcoal">{displayName}</h2>
            <p className="text-xs text-graphite">
              {isGroupChat ? (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {memberCount} members
                </span>
              ) : (
                'Online'
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

