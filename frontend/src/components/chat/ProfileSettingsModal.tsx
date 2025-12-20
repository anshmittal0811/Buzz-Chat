import { useState, useRef } from 'react';
import { X, Camera } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { compressImage } from '@/utils/imageUtils';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSettingsModal = ({ isOpen, onClose }: ProfileSettingsModalProps) => {
  const { user, login } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = useMutation({
    mutationFn: (profileUrl: string) => userService.updateProfileImage(profileUrl),
    onSuccess: (response) => {
      // Update the user in auth context
      if (user) {
        const accessToken = localStorage.getItem('accessToken') || '';
        const refreshToken = localStorage.getItem('refreshToken') || '';
        login(
          { ...user, profileUrl: response.data.profileUrl },
          accessToken,
          refreshToken
        );
      }
      handleClose();
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
        setNewImageUrl(compressedDataUrl);
      } catch (error) {
        console.error('Failed to compress image:', error);
        // Fallback to original if compression fails
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setPreviewUrl(dataUrl);
          setNewImageUrl(dataUrl);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSave = () => {
    if (newImageUrl) {
      updateMutation.mutate(newImageUrl);
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    setPreviewUrl(null);
    setNewImageUrl(null);
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-ivory rounded-2xl w-full max-w-sm mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-stone flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-navy-deep">Profile Settings</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {isCompressing && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink/30 rounded-full z-10">
                  <div className="w-6 h-6 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <Avatar
                src={previewUrl || user.profileUrl}
                name={`${user.firstName} ${user.lastName}`}
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
              {isCompressing ? 'Compressing...' : 'Click to change profile picture'}
            </p>
          </div>

          {/* User Info (read-only) */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-graphite mb-1">Name</label>
              <p className="text-charcoal font-medium">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite mb-1">Email</label>
              <p className="text-charcoal">{user.email}</p>
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
            disabled={!newImageUrl}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

