import { useEffect, useRef } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import type { Message } from '@/types';

const formatMessageDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'h:mm a')}`;
  }
  return format(date, 'MMM d, h:mm a');
};

// Get a display name for the sender, handling missing data gracefully
const getSenderDisplayName = (sender: Message['sender'] | undefined): string => {
  if (!sender) return 'Unknown';
  
  const firstName = sender.firstName || '';
  const lastName = sender.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  if (fullName) return fullName;
  if (sender.email) return sender.email.split('@')[0];
  return 'User';
};

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

const MessageBubble = ({ message, isOwn, showAvatar }: MessageBubbleProps) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
        {/* Avatar for other users - aligned to top of message bubble */}
        {!isOwn && (
          <div className="flex-shrink-0 mt-5">
            {showAvatar ? (
              <Avatar
                src={message.sender?.profileUrl}
                name={getSenderDisplayName(message.sender)}
                size="sm"
              />
            ) : (
              <div className="w-8" />
            )}
          </div>
        )}

        {/* Message content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {showAvatar && !isOwn && (
            <p className="text-xs text-graphite mb-1 ml-1">
              {getSenderDisplayName(message.sender)}
            </p>
          )}
          
          <div
            className={`px-4 py-2.5 rounded-2xl ${
              isOwn
                ? 'bg-navy text-ivory rounded-br-md'
                : 'bg-parchment text-charcoal rounded-bl-md'
            }`}
          >
            {message.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
            
            {message.attachment && (
              <div className={`mt-2 ${message.content ? 'pt-2 border-t border-current/10' : ''}`}>
                {message.attachment.type.startsWith('image/') ? (
                  <img
                    src={message.attachment.url}
                    alt={message.attachment.filename}
                    className="max-w-full rounded-lg"
                  />
                ) : (
                  <a
                    href={message.attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 text-sm ${
                      isOwn ? 'text-gold-light hover:text-gold' : 'text-navy hover:text-navy-deep'
                    }`}
                  >
                    📎 {message.attachment.filename}
                  </a>
                )}
              </div>
            )}
          </div>

          <p className={`text-[10px] text-graphite mt-1 ${isOwn ? 'mr-1' : 'ml-1'}`}>
            {formatMessageDate(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export const MessageList = () => {
  const { messages, isLoadingMessages } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-lg p-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
              <div className={`h-12 bg-stone rounded-2xl ${i % 2 === 0 ? 'w-48' : 'w-64'}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-parchment rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💬</span>
          </div>
          <p className="text-graphite">No messages yet</p>
          <p className="text-sm text-stone mt-1">Send a message to start the conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message, index) => {
        const isOwn = message.sender._id === user?._id;
        const prevMessage = messages[index - 1];
        const showAvatar = !prevMessage || prevMessage.sender._id !== message.sender._id;
        // Add more spacing when sender changes
        const marginTop = index === 0 ? '' : showAvatar ? 'mt-4' : 'mt-1';

        return (
          <div key={message._id} className={marginTop}>
            <MessageBubble
              message={message}
              isOwn={isOwn}
              showAvatar={showAvatar}
            />
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

