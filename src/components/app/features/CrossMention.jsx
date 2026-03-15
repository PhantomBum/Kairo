import { base44 } from '@/api/base44Client';

export async function sendCrossMention({ mentionedUserId, mentionedUserEmail, message, serverName, channelName, authorName, serverId, channelId }) {
  try {
    await base44.entities.Notification.create({
      user_id: mentionedUserId,
      user_email: mentionedUserEmail,
      type: 'cross_mention',
      title: `${authorName} mentioned you in ${serverName}`,
      body: message.content?.slice(0, 200) || 'Mentioned you in a message',
      data: {
        server_id: serverId,
        channel_id: channelId,
        message_id: message.id,
        server_name: serverName,
        channel_name: channelName,
        author_name: authorName,
      },
      read: false,
    });
  } catch {
    // Notification entity may not exist yet
  }
}

export function parseMentions(content, friends = []) {
  if (!content) return [];
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    const username = match[1];
    const friend = friends.find(f =>
      f.friend_name?.toLowerCase() === username.toLowerCase() ||
      f.friend_username?.toLowerCase() === username.toLowerCase()
    );
    if (friend) {
      mentions.push({
        username,
        userId: friend.friend_id,
        userEmail: friend.friend_email,
      });
    }
  }
  return mentions;
}
