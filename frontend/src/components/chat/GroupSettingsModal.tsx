import { useState, useRef } from 'react';
import { X, Camera, Users } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chatService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { compressImage } from '@/utils/imageUtils';
import type { Group } from '@/types';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
}

export const GroupSettingsModal = ({ isOpen, onClose, group }: GroupSettingsModalProps) => {
  const [groupName, setGroupName] = useState(group.name || '');
  const [imageUrl, setImageUrl] = useState(group.imageUrl || '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; imageUrl?: string }) =>
      chatService.updateGroup(group._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      onClose();
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        // Compress image to reduce size (200px max width, 80% quality)
        const compressedDataUrl = await compressImage(file, 200, 0.8);
        setPreviewUrl(compressedDataUrl);
        setImageUrl(compressedDataUrl);
      } catch (error) {
        console.error('Failed to compress image:', error);
        // Fallback to original if compression fails
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
          setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSave = () => {
    const updates: { name?: string; imageUrl?: string } = {};
    
    if (groupName !== group.name) {
      updates.name = groupName;
    }
    if (imageUrl !== group.imageUrl) {
      updates.imageUrl = imageUrl;
    }

    if (Object.keys(updates).length > 0) {
      updateMutation.mutate(updates);
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    setGroupName(group.name || '');
    setImageUrl(group.imageUrl || '');
    setPreviewUrl(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-ivory rounded-2xl w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-stone flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-navy-deep">Group Settings</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Group Image */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {isCompressing && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink/30 rounded-full z-10">
                  <div className="w-6 h-6 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <Avatar
                src={previewUrl || imageUrl}
                name={groupName || 'Group'}
                size="xl"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
                className="absolute bottom-0 right-0 w-8 h-8 bg-navy text-ivory rounded-full flex items-center justify-center shadow-md hover:bg-navy-deep transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="text-sm text-graphite mt-2">
              {isCompressing ? 'Compressing...' : 'Click to change group image'}
            </p>
          </div>

          {/* Group Name */}
          <Input
            id="groupName"
            label="Group Name"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          {/* Members */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Members ({group.members?.length || 0})
              </span>
            </label>
            <div className="bg-cream rounded-lg p-3 max-h-40 overflow-y-auto scrollbar-thin">
              {group.members?.map((member) => (
                <div key={member._id} className="flex items-center gap-3 py-2">
                  <Avatar
                    src={member.profileUrl}
                    name={`${member.firstName} ${member.lastName}`}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-graphite truncate">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            isLoading={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

