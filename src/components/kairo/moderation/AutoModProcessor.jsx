import { base44 } from '@/api/base44Client';

export async function processAutoMod(message, serverId, rules) {
  if (!rules || rules.length === 0) return { allowed: true };

  const activeRules = rules.filter(r => r.is_enabled);
  const violations = [];

  for (const rule of activeRules) {
    const violation = await checkRule(message, rule);
    if (violation) violations.push({ rule, violation });
  }

  if (violations.length === 0) return { allowed: true };

  const actions = violations.map(v => v.rule.action || 'delete');
  const actionPriority = { delete: 1, warn: 2, timeout: 3, kick: 4, ban: 5 };
  const highestAction = actions.sort((a, b) => (actionPriority[b] || 0) - (actionPriority[a] || 0))[0];

  return {
    allowed: false,
    action: highestAction,
    violations,
    rule: violations.find(v => (v.rule.action || 'delete') === highestAction)?.rule,
  };
}

async function checkRule(message, rule) {
  const content = message.content || '';
  const contentLower = content.toLowerCase();

  switch (rule.type) {
    case 'banned_words':
      return checkBannedWords(contentLower, rule.trigger_config?.banned_words || []);
    case 'spam_detection':
      return checkSpam(content, rule.trigger_config);
    case 'link_filter':
      return checkLinks(contentLower, rule.trigger_config);
    case 'caps_filter':
      return checkCaps(content, rule.trigger_config?.max_caps_percent || 70);
    case 'mention_spam':
      return checkMentionSpam(content, rule.trigger_config?.max_mentions || 5);
    case 'invite_filter':
      return checkInvites(contentLower);
    case 'new_account_gate':
      return null; // Checked at join time, not message time
    case 'custom_word_filter':
      return checkCustomWords(contentLower, rule.trigger_config?.words || []);
    case 'repetitive_chars':
      return checkRepetitiveChars(content, rule.trigger_config?.max_repeat || 6);
    case 'all_caps':
      return checkAllCaps(content, rule.trigger_config?.min_length || 10);
    default:
      return null;
  }
}

function checkBannedWords(content, bannedWords) {
  for (const word of bannedWords) {
    if (!word) continue;
    const pattern = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i');
    if (pattern.test(content)) return { type: 'banned_word', word };
  }
  return null;
}

function checkSpam(content, config) {
  if (/(.)\1{9,}/.test(content)) return { type: 'spam', reason: 'repeated_characters' };
  if (content.length > 2000) return { type: 'spam', reason: 'message_too_long' };
  return null;
}

function checkLinks(content, config) {
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  const links = content.match(urlPattern) || [];
  if (links.length === 0) return null;

  const allowedDomains = config?.allowed_links || [];
  if (allowedDomains.length === 0) return { type: 'blocked_link', link: links[0] };

  for (const link of links) {
    try {
      const url = new URL(link);
      const isAllowed = allowedDomains.some(d => url.hostname.includes(d));
      if (!isAllowed) return { type: 'blocked_link', link };
    } catch { /* invalid URL */ }
  }
  return null;
}

function checkCaps(content, maxPercent) {
  if (content.length < 10) return null;
  const letters = content.replace(/[^a-zA-Z]/g, '');
  if (letters.length === 0) return null;
  const upperCount = (content.match(/[A-Z]/g) || []).length;
  const capsPercent = (upperCount / letters.length) * 100;
  if (capsPercent > maxPercent) return { type: 'excessive_caps', percent: Math.round(capsPercent) };
  return null;
}

function checkMentionSpam(content, maxMentions) {
  const mentions = (content.match(/@/g) || []).length;
  if (mentions > maxMentions) return { type: 'mention_spam', count: mentions };
  return null;
}

function checkInvites(content) {
  const patterns = [
    /discord\.gg\/\w+/i, /discord\.com\/invite\/\w+/i,
    /kairo\.app\/invite\/\w+/i, /kairo\.chat\/invite\/\w+/i,
  ];
  for (const p of patterns) {
    if (p.test(content)) return { type: 'invite_link' };
  }
  return null;
}

function checkCustomWords(content, words) {
  for (const word of words) {
    if (!word) continue;
    if (content.includes(word.toLowerCase())) return { type: 'custom_word', word };
  }
  return null;
}

function checkRepetitiveChars(content, maxRepeat) {
  const pattern = new RegExp(`(.)\\1{${maxRepeat - 1},}`);
  if (pattern.test(content)) return { type: 'repetitive_chars' };
  return null;
}

function checkAllCaps(content, minLength) {
  const letters = content.replace(/[^a-zA-Z]/g, '');
  if (letters.length < minLength) return null;
  if (letters === letters.toUpperCase()) return { type: 'all_caps' };
  return null;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function executeAutoModAction(result, message, serverId, authorId) {
  if (result.allowed) return;

  const { action, rule, violations } = result;

  try {
    await base44.entities.AuditLog.create({
      server_id: serverId,
      action_type: `automod_${action}`,
      actor_name: 'AutoMod',
      target_id: authorId,
      target_type: 'member',
      changes: {
        rule_name: rule?.name,
        rule_type: rule?.type,
        violations: violations.map(v => v.violation),
      },
    });
  } catch {}

  switch (action) {
    case 'delete':
      return { blocked: true, reason: violations[0]?.violation?.type };

    case 'warn':
      try {
        await base44.entities.Notification.create({
          user_id: authorId, type: 'warning', title: 'Message Blocked',
          content: `Your message was blocked by auto-moderation: ${rule?.name}`,
          server_id: serverId,
        });
      } catch {}
      return { blocked: true, warned: true };

    case 'timeout': {
      try {
        const members = await base44.entities.ServerMember.filter({ server_id: serverId, user_id: authorId });
        if (members.length > 0) {
          const until = new Date();
          until.setMinutes(until.getMinutes() + (rule?.action_duration || 5));
          await base44.entities.ServerMember.update(members[0].id, { timeout_until: until.toISOString() });
        }
      } catch {}
      return { blocked: true, timedOut: true };
    }

    case 'kick': {
      try {
        const members = await base44.entities.ServerMember.filter({ server_id: serverId, user_id: authorId });
        if (members.length > 0) await base44.entities.ServerMember.delete(members[0].id);
      } catch {}
      return { blocked: true, kicked: true };
    }

    case 'ban': {
      try {
        const members = await base44.entities.ServerMember.filter({ server_id: serverId, user_id: authorId });
        if (members.length > 0) await base44.entities.ServerMember.update(members[0].id, { is_banned: true, ban_reason: `Auto-mod: ${rule?.name}` });
      } catch {}
      return { blocked: true, banned: true };
    }
  }

  return { blocked: true };
}
