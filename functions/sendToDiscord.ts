import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channel_id, content, attachments = [] } = await req.json();

    // Find bridge for this channel
    const bridges = await base44.asServiceRole.entities.CrossAppBridge.filter({
      kairo_channel_id: channel_id,
      platform: 'discord',
      is_active: true
    });

    if (bridges.length === 0) {
      return Response.json({ error: 'No Discord bridge configured' }, { status: 404 });
    }

    const bridge = bridges[0];

    if (!bridge.webhook_url) {
      return Response.json({ error: 'No webhook URL configured' }, { status: 400 });
    }

    // Send to Discord via webhook
    const discordPayload = {
      content: content,
      username: user.full_name || user.email?.split('@')[0] || 'Kairo User',
      avatar_url: user.avatar_url,
      embeds: attachments.length > 0 ? [{
        description: 'Attachments',
        fields: attachments.map(a => ({
          name: a.filename,
          value: a.url,
          inline: false
        }))
      }] : []
    };

    const response = await fetch(bridge.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.statusText}`);
    }

    return Response.json({ success: true, bridge_id: bridge.id });
  } catch (error) {
    console.error('Send to Discord error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});