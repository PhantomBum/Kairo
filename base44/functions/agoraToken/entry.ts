import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { RtcTokenBuilder, RtcRole } from 'npm:agora-token@2.0.3';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channelName } = await req.json();

    if (!channelName) {
      return Response.json({ error: 'Channel name is required' }, { status: 400 });
    }

    const appId = Deno.env.get('AGORA_APP_ID');
    const appCertificate = Deno.env.get('AGORA_APP_CERTIFICATE');

    if (!appId || !appCertificate) {
      console.error('Missing Agora credentials — AGORA_APP_ID or AGORA_APP_CERTIFICATE not set');
      return Response.json({ error: 'Agora not configured' }, { status: 500 });
    }

    // Use uid 0 so any user can join with string account
    const uid = 0;
    const role = RtcRole.PUBLISHER;
    // Token expires in 24 hours
    const expireTs = Math.floor(Date.now() / 1000) + 86400;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      expireTs,
      expireTs
    );

    console.log(`Token generated for channel "${channelName}" by user ${user.email}`);

    return Response.json({
      token,
      appId,
      channel: channelName,
      uid,
    });
  } catch (error) {
    console.error('Error generating Agora token:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});