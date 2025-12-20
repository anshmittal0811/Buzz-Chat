import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { Send, Paperclip, Smile, X, FileIcon, ImageIcon } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/Button';
import { EmojiPicker } from './EmojiPicker';
import { uploadService } from '@/services/uploadService';
import { formatFileSize } from '@/utils/imageUtils';
import type { Attachment } from '@/types';

export const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { sendMessage, selectedGroup } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !attachment) || !selectedGroup) return;

    let uploadedAttachment: Attachment | undefined;

    // Upload attachment if present
    if (attachment) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        const result = await uploadService.uploadFile(attachment, (progress) => {
          setUploadProgress(progress.percentage);
        });
        uploadedAttachment = {
          url: result.url,
          type: result.type,
          filename: result.name,
          size: result.size,
        };
      } catch (error) {
        console.error('Failed to upload attachment:', error);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    sendMessage(message.trim(), uploadedAttachment);
    setMessage('');
    setAttachment(null);
    setAttachmentPreview(null);
    setUploadProgress(0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachmentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachmentPreview(null);
      }
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!selectedGroup) return null;

  return (
    <div className="border-t border-stone bg-cream">
      {/* Attachment Preview */}
      {attachment && (
        <div className="px-4 pt-3">
          <div className="inline-flex items-center gap-3 bg-parchment rounded-lg px-3 py-2 max-w-xs">
            {attachmentPreview ? (
              <img
                src={attachmentPreview}
                alt="Preview"
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <div className="w-12 h-12 bg-stone rounded flex items-center justify-center">
                <FileIcon className="w-6 h-6 text-graphite" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal truncate">{attachment.name}</p>
              <p className="text-xs text-graphite">{formatFileSize(attachment.size)}</p>
            </div>
            <button
              type="button"
              onClick={removeAttachment}
              className="p-1 hover:bg-stone rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-graphite" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="px-4 pt-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-stone rounded-full overflow-hidden">
              <div
                className="h-full bg-navy transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-graphite">{uploadProgress}%</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
        />
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-10 w-10 p-0 flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {attachment ? (
            attachment.type.startsWith('image/') ? (
              <ImageIcon className="w-5 h-5 text-navy" />
            ) : (
              <FileIcon className="w-5 h-5 text-navy" />
            )
          ) : (
            <Paperclip className="w-5 h-5" />
          )}
        </Button>

        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={attachment ? "Add a caption..." : "Type a message..."}
            rows={1}
            disabled={isUploading}
            className="w-full px-4 py-2.5 bg-ivory border border-stone rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-navy-light focus:border-navy-light min-h-[40px] max-h-32 leading-5 disabled:opacity-50"
            style={{
              height: '40px',
              overflow: 'hidden',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = '40px';
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />
        </div>

        <div className="relative">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-10 w-10 p-0 flex-shrink-0"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isUploading}
          >
            <Smile className="w-5 h-5" />
          </Button>
          
          {showEmojiPicker && (
            <EmojiPicker
              onSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>

        <Button
          type="submit"
          disabled={(!message.trim() && !attachment) || isUploading}
          size="sm"
          className="h-10 w-10 p-0 flex-shrink-0"
          isLoading={isUploading}
        >
          {!isUploading && <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
};

