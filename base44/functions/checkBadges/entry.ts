import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Badge conditions checked server-side
const BADGE_CHECKS = {
  friendly: async (base44, userId) => {
    const friends = await base44.asServiceRole.entities.Friendship.filter({ user_id: userId, status: 'accepted' });
    return friends.length >= 1;
  },
  explorer: async (base44, userId) => {
    const memberships = await base44.asServiceRole.entities.ServerMember.filter({ user_id: userId });
    return memberships.filter(m => !m.is_banned).length >= 5;
  },
  conversationalist: async (base44, userId) => {
    const msgs = await base44.asServiceRole.entities.Message.filter({ author_id: userId });
    return msgs.length >= 1000;
  },
  night_owl: async (base44, userId) => {
    const msgs = await base44.asServiceRole.entities.Message.filter({ author_id: userId });
    return msgs.some(m => {
      const h = new Date(m.created_date).getHours();
      return h >= 2 && h < 4;
    });
  },
  kairo_friend: async (base44, userId) => {
    // Check if user is a member of the official Kairo server (first server created)
    const servers = await base44.asServiceRole.entities.Server.filter({ name: 'Kairo' });
    if (servers.length === 0) return false;
    const membership = await base44.asServiceRole.entities.ServerMember.filter({ server_id: servers[0].id, user_id: userId });
    return membership.length > 0;
  },
  anniversary: async (base44, userId, profile) => {
    if (!profile?.created_date) return false;
    const created = new Date(profile.created_date);
    const now = new Date();
    const diffMs = now - created;
    const oneYear = 365.25 * 24 * 60 * 60 * 1000;
    return diffMs >= oneYear;
  },
  early_adopter: async (base44, userId, profile) => {
    if (!profile?.created_date) return false;
    // First 6 months of the app — hardcoded launch window
    const launchDate = new Date('2025-01-01');
    const cutoff = new Date(launchDate);
    cutoff.setMonth(cutoff.getMonth() + 6);
    return new Date(profile.created_date) <= cutoff;
  },
  curator: async (base44, userId) => {
    const msgs = await base44.asServiceRole.entities.Message.filter({ author_id: userId, is_pinned: true });
    return msgs.length >= 50;
  },
  server_legend: async (base44, userId) => {
    const memberships = await base44.asServiceRole.entities.ServerMember.filter({ user_id: userId });
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return memberships.some(m => m.joined_at && new Date(m.joined_at) <= oneYearAgo);
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { user_id } = await req.json();
    const targetId = user_id || user.id;

    // Get existing profile
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: targetId });
    if (!profiles.length) return Response.json({ badges: [], newBadges: [] });
    const profile = profiles[0];

    const currentBadges = profile.badges || [];
    const badgesEarned = profile.badges_earned || [];
    const newBadges = [];

    for (const [badgeId, checkFn] of Object.entries(BADGE_CHECKS)) {
      if (currentBadges.includes(badgeId)) continue;
      try {
        const earned = await checkFn(base44, targetId, profile);
        if (earned) {
          currentBadges.push(badgeId);
          badgesEarned.push({ badge_id: badgeId, earned_at: new Date().toISOString() });
          newBadges.push(badgeId);
        }
      } catch (err) {
        console.error(`Badge check failed for ${badgeId}:`, err.message);
      }
    }

    // Check Elite badge — deactivate if no longer subscribed
    const credits = await base44.asServiceRole.entities.UserCredits.filter({ user_id: targetId });
    const hasElite = credits.length > 0 && credits[0].has_nitro;
    if (!hasElite && currentBadges.includes('kairo_elite')) {
      const idx = currentBadges.indexOf('kairo_elite');
      currentBadges.splice(idx, 1);
      // Also check premium (legacy)
    }
    if (!hasElite && currentBadges.includes('premium')) {
      const idx = currentBadges.indexOf('premium');
      currentBadges.splice(idx, 1);
    }
    if (hasElite && !currentBadges.includes('kairo_elite')) {
      currentBadges.push('kairo_elite');
      badgesEarned.push({ badge_id: 'kairo_elite', earned_at: new Date().toISOString() });
      newBadges.push('kairo_elite');
    }

    // Check if elite effect should be deactivated
    const eliteEffects = ['solar_flare', 'deep_space', 'sakura_storm', 'void_rift', 'crystalline', 'dragon_scale'];
    let profileEffect = profile.profile_effect;
    let effectDeactivated = false;
    if (!hasElite && eliteEffects.includes(profileEffect)) {
      profileEffect = 'none';
      effectDeactivated = true;
    }

    // Update profile if anything changed
    if (newBadges.length > 0 || effectDeactivated || currentBadges.length !== (profile.badges || []).length) {
      const updateData = { badges: currentBadges, badges_earned: badgesEarned };
      if (effectDeactivated) updateData.profile_effect = 'none';
      await base44.asServiceRole.entities.UserProfile.update(profile.id, updateData);
    }

    return Response.json({
      badges: currentBadges,
      newBadges,
      effectDeactivated,
    });
  } catch (error) {
    console.error('Badge check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});