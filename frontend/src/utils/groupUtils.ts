import type { Group, Message } from '@/types';

/**
 * Get display name for a group
 * For direct messages, shows the other user's name
 */
export const getGroupDisplayName = (group: Group, currentUserId: string): string => {
  if (group.name) return group.name;

  // API returns members as User[] directly
  const members = group.members || [];
  const otherUser = members.find((user) => user?._id && user._id !== currentUserId);

  if (otherUser) {
    return `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 'User';
  }

  return 'Conversation';
};

/**
 * Get avatar props for a group
 */
export const getGroupAvatar = (
  group: Group,
  currentUserId: string
): { src?: string; name: string } => {
  if (group.imageUrl) {
    return { src: group.imageUrl, name: group.name || 'Group' };
  }

  if (group.name) {
    return { name: group.name };
  }

  // API returns members as User[] directly
  const members = group.members || [];
  const otherUser = members.find((user) => user?._id && user._id !== currentUserId);

  if (otherUser) {
    return {
      src: otherUser.profileUrl,
      name: `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 'User',
    };
  }

  return { name: 'Conversation' };
};

/**
 * Get the latest message from a group (from lastMessages array or lastMessage)
 */
export const getLatestMessage = (group: Group): Message | undefined => {
  if (group.lastMessages && group.lastMessages.length > 0) {
    return group.lastMessages[0];
  }
  return group.lastMessage;
};

/**
 * Get timestamp for sorting groups by latest activity
 */
export const getGroupSortTime = (group: Group): number => {
  const lastMessage = getLatestMessage(group);
  if (lastMessage?.createdAt) {
    return new Date(lastMessage.createdAt).getTime();
  }
  return new Date(group.updatedAt || group.createdAt).getTime();
};

