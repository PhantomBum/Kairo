import { base44 } from '@/api/base44Client';

// Auto-moderation processor
export async function processAutoMod(message, serverId, rules) {
  if (!rules || rules.length === 0) return { allowed: true };
  
  const activeRules = rules.filter(r => r.is_enabled);
  const violations = [];
  
  for (const rule of activeRules) {
    const violation = await checkRule(message, rule);
    if (violation) {
      violations.push({ rule, violation });
    }
  }
  
  if (violations.length === 0) return { allowed: true };
  
  // Get highest severity action
  const actions = violations.map(v => v.rule.action);
  const actionPriority = { delete: 1, warn: 2, timeout: 3, kick: 4, ban: 5 };
  const highestAction = actions.sort((a, b) => actionPriority[b] - actionPriority[a])[0];
  
  return {
    allowed: false,
    action: highestAction,
    violations,
    rule: violations.find(v => v.rule.action === highestAction)?.rule,
  };
}

async function checkRule(message, rule) {
  const content = message.content?.toLowerCase() || '';
  
  switch (rule.type) {
    case 'banned_words':
      return checkBannedWords(content, rule.trigger_config?.banned_words || []);
    
    case 'spam_detection':
      return checkSpam(message, rule.trigger_config);
    
    case 'link_filter':
      return checkLinks(content, rule.trigger_config);
    
    case 'caps_filter':
      return checkCaps(content, rule.trigger_config?.max_caps_percent || 70);
    
    case 'mention_spam':
      return checkMentionSpam(content, rule.trigger_config?.max_mentions || 5);
    
    case 'invite_filter':
      return checkInvites(content);
    
    default:
      return null;
  }
}

function checkBannedWords(content, bannedWords) {
  for (const word of bannedWords) {
    const pattern = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i');
    if (pattern.test(content)) {
      return { type: 'banned_word', word };
    }
  }
  return null;
}

function checkSpam(message, config) {
  // Would need message history to properly detect spam
  // For now, check for repeated characters
  const repeatedPattern = /(.)\1{9,}/;
  if (repeatedPattern.test(message.content)) {
    return { type: 'spam', reason: 'repeated_characters' };
  }
  return null;
}

function checkLinks(content, config) {
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  const links = content.match(urlPattern) || [];
  
  if (links.length === 0) return null;
  
  const allowedDomains = config?.allowed_links || [];
  
  for (const link of links) {
    try {
      const url = new URL(link);
      const isAllowed = allowedDomains.some(d => url.hostname.includes(d));
      if (!isAllowed && allowedDomains.length > 0) {
        return { type: 'blocked_link', link };
      }
    } catch {
      // Invalid URL
    }
  }
  
  return null;
}

function checkCaps(content, maxPercent) {
  if (content.length < 10) return null;
  
  const letters = content.replace(/[^a-zA-Z]/g, '');
  if (letters.length === 0) return null;
  
  const upperCount = (content.match(/[A-Z]/g) || []).length;
  const capsPercent = (upperCount / letters.length) * 100;
  
  if (capsPercent > maxPercent) {
    return { type: 'excessive_caps', percent: capsPercent };
  }
  
  return null;
}

function checkMentionSpam(content, maxMentions) {
  const mentions = (content.match(/@/g) || []).length;
  if (mentions > maxMentions) {
    return { type: 'mention_spam', count: mentions };
  }
  return null;
}

function checkInvites(content) {
  const invitePatterns = [
    /discord\.gg\/\w+/i,
    /discord\.com\/invite\/\w+/i,
    /kairo\.app\/invite\/\w+/i,
  ];
  
  for (const pattern of invitePatterns) {
    if (pattern.test(content)) {
      return { type: 'invite_link' };
    }
  }
  
  return null;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Execute auto-mod action
export async function executeAutoModAction(result, message, serverId, authorId) {
  if (result.allowed) return;
  
  const { action, rule, violations } = result;
  
  // Log to audit
  await base44.entities.AuditLog.create({
    server_id: serverId,
    action_type: `automod_${action}`,
    target_id: authorId,
    target_type: 'member',
    changes: {
      rule_name: rule.name,
      rule_type: rule.type,
      violations: violations.map(v => v.violation),
    },
  });
  
  switch (action) {
    case 'delete':
      // Message won't be created
      return { blocked: true, reason: violations[0]?.violation?.type };
    
    case 'warn':
      // Send warning notification
      await base44.entities.Notification.create({
        user_id: authorId,
        type: 'warning',
        title: 'Message Blocked',
        content: `Your message was blocked by auto-moderation: ${rule.name}`,
        server_id: serverId,
      });
      return { blocked: true, warned: true };
    
    case 'timeout':
      const members = await base44.entities.ServerMember.filter({
        server_id: serverId,
        user_id: authorId,
      });
      if (members.length > 0) {
        const timeoutUntil = new Date();
        timeoutUntil.setMinutes(timeoutUntil.getMinutes() + (rule.action_duration || 5));
        await base44.entities.ServerMember.update(members[0].id, {
          timeout_until: timeoutUntil.toISOString(),
        });
      }
      return { blocked: true, timedOut: true };
    
    case 'kick':
      const kickMembers = await base44.entities.ServerMember.filter({
        server_id: serverId,
        user_id: authorId,
      });
      if (kickMembers.length > 0) {
        await base44.entities.ServerMember.delete(kickMembers[0].id);
      }
      return { blocked: true, kicked: true };
    
    case 'ban':
      const banMembers = await base44.entities.ServerMember.filter({
        server_id: serverId,
        user_id: authorId,
      });
      if (banMembers.length > 0) {
        await base44.entities.ServerMember.update(banMembers[0].id, {
          is_banned: true,
          ban_reason: `Auto-mod: ${rule.name}`,
        });
      }
      return { blocked: true, banned: true };
  }
  
  return { blocked: true };
}