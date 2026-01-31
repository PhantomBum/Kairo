import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { type, platform, data } = await req.json();

    console.log('[DM Bridge] Received event:', type, 'from platform:', platform);

    // Handle incoming DM from external platform
    if (type === 'DIRECT_MESSAGE') {
      const { chat_id, author, content, attachments = [] } = data;

      // Find DM bridge configuration
      const bridges = await base44.asServiceRole.entities.CrossAppBridge.filter({
        platform: platform,
        external_chat_id: chat_id,
        bridge_type: 'dm',
        is_active: true
      });

      if (bridges.length === 0) {
        console.log('[DM Bridge] No active bridge found for chat:', chat_id);
        return Response.json({ error: 'No active DM bridge found' }, { status: 404 });
      }

      const bridge = bridges[0];

      // Create or update cross-app user for DMs
      const existingUsers = await base44.asServiceRole.entities.CrossAppUser.filter({
        platform: platform,
        platform_user_id: author.id,
        kairo_channel_id: bridge.conversation_id
      });

      let crossAppUser;
      if (existingUsers.length > 0) {
        crossAppUser = existingUsers[0];
        await base44.asServiceRole.entities.CrossAppUser.update(crossAppUser.id, {
          platform_username: author.username || author.name,
          platform_avatar: author.avatar,
          last_message_at: new Date().toISOString()
        });
      } else {
        crossAppUser = await base44.asServiceRole.entities.CrossAppUser.create({
          platform: platform,
          platform_user_id: author.id,
          platform_username: author.username || author.name,
          platform_avatar: author.avatar,
          kairo_channel_id: bridge.conversation_id,
          external_channel_id: chat_id,
          last_message_at: new Date().toISOString()
        });
      }

      // Update conversation last message
      await base44.asServiceRole.entities.Conversation.update(bridge.conversation_id, {
        last_message_at: new Date().toISOString(),
        last_message_preview: content?.slice(0, 50)
      });

      // Create DM message in Kairo
      const message = await base44.asServiceRole.entities.DirectMessage.create({
        conversation_id: bridge.conversation_id,
        author_id: `${platform}_${author.id}`,
        author_name: author.username || author.name,
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
          platform: platform,
          platform_user_id: author.id,
          external_message_id: data.id
        }
      });

      console.log('[DM Bridge] Created message:', message.id);

      return Response.json({ 
        success: true, 
        message_id: message.id,
        bridge_id: bridge.id
      });
    }

    // Handle sending message TO external platform (from Kairo)
    if (type === 'SEND_TO_EXTERNAL') {
      const { conversation_id, content, attachments = [] } = data;

      // Find bridge for this conversation
      const bridges = await base44.asServiceRole.entities.CrossAppBridge.filter({
        conversation_id: conversation_id,
        bridge_type: 'dm',
        is_active: true
      });

      if (bridges.length === 0) {
        console.log('[DM Bridge] No bridge found for conversation:', conversation_id);
        return Response.json({ error: 'No bridge configured' }, { status: 404 });
      }

      const bridge = bridges[0];

      // Send to external platform via webhook
      if (bridge.webhook_url) {
        try {
          const webhookPayload = {
            content: content,
            username: data.author_name || 'Kairo User',
            avatar_url: data.author_avatar
          };

          // Handle attachments for Discord webhooks
          if (bridge.platform === 'discord' && attachments.length > 0) {
            webhookPayload.embeds = attachments.map(a => ({
              image: a.content_type?.startsWith('image/') ? { url: a.url } : null,
              title: a.filename
            })).filter(e => e.image);
          }

          const response = await fetch(bridge.webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload)
          });

          if (!response.ok) {
            console.error('[DM Bridge] Webhook failed:', await response.text());
            return Response.json({ error: 'Failed to send to external platform' }, { status: 500 });
          }

          console.log('[DM Bridge] Sent to external platform:', bridge.platform);
          return Response.json({ success: true });
        } catch (error) {
          console.error('[DM Bridge] Webhook error:', error);
          return Response.json({ error: error.message }, { status: 500 });
        }
      }

      return Response.json({ error: 'No webhook configured' }, { status: 400 });
    }

    // Handle Telegram updates
    if (type === 'TELEGRAM_UPDATE' && data.message) {
      const msg = data.message;
      const chatId = msg.chat.id.toString();

      const bridges = await base44.asServiceRole.entities.CrossAppBridge.filter({
        platform: 'telegram',
        external_chat_id: chatId,
        is_active: true
      });

      if (bridges.length === 0) {
        return Response.json({ error: 'No bridge found' }, { status: 404 });
      }

      const bridge = bridges[0];
      const isBridgeDM = bridge.bridge_type === 'dm';

      // Create message
      const messageData = {
        [isBridgeDM ? 'conversation_id' : 'channel_id']: isBridgeDM ? bridge.conversation_id : bridge.kairo_channel_id,
        author_id: `telegram_${msg.from.id}`,
        author_name: msg.from.first_name + (msg.from.last_name ? ` ${msg.from.last_name}` : ''),
        content: msg.text || '[Media]',
        type: 'default',
        metadata: {
          platform: 'telegram',
          platform_user_id: msg.from.id,
          external_message_id: msg.message_id
        }
      };

      const entity = isBridgeDM ? 'DirectMessage' : 'Message';
      const message = await base44.asServiceRole.entities[entity].create(messageData);

      return Response.json({ success: true, message_id: message.id });
    }

    // Handle Slack events
    if (type === 'SLACK_EVENT' && data.event) {
      const event = data.event;
      
      if (event.type === 'message' && !event.subtype) {
        const channelId = event.channel;

        const bridges = await base44.asServiceRole.entities.CrossAppBridge.filter({
          platform: 'slack',
          external_chat_id: channelId,
          is_active: true
        });

        if (bridges.length === 0) {
          return Response.json({ error: 'No bridge found' }, { status: 404 });
        }

        const bridge = bridges[0];
        const isBridgeDM = bridge.bridge_type === 'dm';

        const messageData = {
          [isBridgeDM ? 'conversation_id' : 'channel_id']: isBridgeDM ? bridge.conversation_id : bridge.kairo_channel_id,
          author_id: `slack_${event.user}`,
          author_name: event.user, // Would need to look up display name
          content: event.text,
          type: 'default',
          metadata: {
            platform: 'slack',
            platform_user_id: event.user,
            external_message_id: event.ts
          }
        };

        const entity = isBridgeDM ? 'DirectMessage' : 'Message';
        const message = await base44.asServiceRole.entities[entity].create(messageData);

        return Response.json({ success: true, message_id: message.id });
      }
    }

    return Response.json({ error: 'Unknown event type' }, { status: 400 });
  } catch (error) {
    console.error('[DM Bridge] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});