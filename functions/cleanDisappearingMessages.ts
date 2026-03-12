import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all user profiles with disappearing messages enabled
    const profiles = await base44.asServiceRole.entities.UserProfile.list('-updated_date', 500);
    const now = Date.now();
    let deleted = 0;

    for (const profile of profiles) {
      const setting = profile.settings?.disappearing_messages;
      if (!setting || setting === 'off') continue;

      const maxAge = setting === '24h' ? 86400000 : setting === '7d' ? 604800000 : setting === '30d' ? 2592000000 : 0;
      if (maxAge === 0) continue;

      // Find and delete old DMs from this user
      const dms = await base44.asServiceRole.entities.DirectMessage.filter({ author_id: profile.user_id });
      for (const dm of dms) {
        const age = now - new Date(dm.created_date).getTime();
        if (age > maxAge && !dm.is_deleted) {
          await base44.asServiceRole.entities.DirectMessage.update(dm.id, { is_deleted: true, content: '[Message expired]' });
          deleted++;
        }
      }
    }

    console.log(`Cleaned ${deleted} disappearing messages`);
    return Response.json({ deleted });
  } catch (error) {
    console.error('Disappearing messages cleanup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});