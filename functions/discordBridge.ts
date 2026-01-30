import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { type, data } = await req.json();

    // Handle Discord message webhook
    if (type === 'MESSAGE_CREATE') {
      const { channel_id, author, content, attachments = [] } = data;

      // Find bridge configuration
      const bridges = await base44.asServiceRole.entities.CrossAppBridge.filter({
        platform: 'discord',
        external_channel_id: channel_id,
        is_active: true
      });

      if (bridges.length === 0) {
        return Response.json({ error: 'No active bridge found' }, { status: 404 });
      }

      const bridge = bridges[0];

      // Create or update cross-app user
      const existingUsers = await base44.asServiceRole.entities.CrossAppUser.filter({
        platform: 'discord',
        platform_user_id: author.id
      });

      let crossAppUser;
      if (existingUsers.length > 0) {
        crossAppUser = existingUsers[0];
        await base44.asServiceRole.entities.CrossAppUser.update(crossAppUser.id, {
          platform_username: author.username,
          platform_avatar: author.avatar,
          last_message_at: new Date().toISOString()
        });
      } else {
        crossAppUser = await base44.asServiceRole.entities.CrossAppUser.create({
          platform: 'discord',
          platform_user_id: author.id,
          platform_username: author.username,
          platform_avatar: author.avatar,
          kairo_channel_id: bridge.kairo_channel_id,
          kairo_server_id: bridge.kairo_server_id,
          external_channel_id: channel_id,
          last_message_at: new Date().toISOString()
        });
      }

      // Create message in Kairo
      const message = await base44.asServiceRole.entities.Message.create({
        channel_id: bridge.kairo_channel_id,
        server_id: bridge.kairo_server_id,
        author_id: `discord_${author.id}`,
        author_name: author.username,
        author_avatar: author.avatar,
        content: content,
        attachments: attachments.map(a => ({
          url: a.url,
          filename: a.filename,
          content_type: a.content_type,
          size: a.size
        })),
        type: 'default',
        metadata: {
          platform: 'discord',
          platform_user_id: author.id,
          external_message_id: data.id
        }
      });

      return Response.json({ 
        success: true, 
        message_id: message.id,
        bridge_id: bridge.id
      });
    }

    // Handle Discord reaction webhook
    if (type === 'MESSAGE_REACTION_ADD') {
      const { message_id, emoji, user_id } = data;

      // Find the Kairo message
      const messages = await base44.asServiceRole.entities.Message.filter({
        'metadata.external_message_id': message_id
      });

      if (messages.length > 0) {
        const message = messages[0];
        const reactions = message.reactions || [];
        const emojiStr = emoji.name;

        const existingReaction = reactions.find(r => r.emoji === emojiStr);
        let newReactions;

        if (existingReaction) {
          newReactions = reactions.map(r => 
            r.emoji === emojiStr 
              ? { ...r, count: r.count + 1, users: [...(r.users || []), `discord_${user_id}`] }
              : r
          );
        } else {
          newReactions = [...reactions, { emoji: emojiStr, count: 1, users: [`discord_${user_id}`] }];
        }

        await base44.asServiceRole.entities.Message.update(message.id, {
          reactions: newReactions
        });

        return Response.json({ success: true, message_id: message.id });
      }
    }

    return Response.json({ error: 'Unknown event type' }, { status: 400 });
  } catch (error) {
    console.error('Discord bridge error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});