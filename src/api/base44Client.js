import { supabase } from './supabaseClient';
import { sanitizeObject } from '@/lib/security/sanitizer';

/**
 * Base44-compatible shim backed by Supabase.
 *
 * Every component in the app calls base44.entities.X.filter(), .create(), etc.
 * This file translates those calls into Supabase queries against a single
 * "entities" table with a JSONB "data" column, so zero component code changes
 * are needed.
 *
 * Table schema (must exist in Supabase):
 *   entities(id uuid PK, entity_type text, data jsonb, created_by uuid, created_date timestamptz, updated_date timestamptz)
 */

// ─── Auth shim ───────────────────────────────────────────────────────────────

const auth = {
  async isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
      role: user.user_metadata?.role || 'user',
    };
  },

  async updateMe(data) {
    const { data: result, error } = await supabase.auth.updateUser({
      data: { ...data },
    });
    if (error) throw error;
    return result;
  },

  redirectToLogin(returnUrl) {
    const url = returnUrl || window.location.href;
    window.location.href = `/login?returnUrl=${encodeURIComponent(url)}`;
  },

  async loginViaEmailPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async register({ email, password, full_name }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    });
    if (error) throw error;
    return data;
  },

  async loginWithProvider(provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) throw error;
    return data;
  },

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (redirectUrl) window.location.href = redirectUrl;
  },

  setToken() { /* no-op: Supabase manages tokens internally */ },

  async inviteUser() { /* deferred */ },
  async verifyOtp() { /* deferred */ },
  async resendOtp() { /* deferred */ },
  async resetPasswordRequest(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },
  async resetPassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
  async changePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
};

// ─── Entities shim ───────────────────────────────────────────────────────────

function parseOrderBy(orderByStr) {
  if (!orderByStr || typeof orderByStr !== 'string') return null;
  const desc = orderByStr.startsWith('-');
  const column = desc ? orderByStr.slice(1) : orderByStr;
  return { column, ascending: !desc };
}

function buildQuery(entityType) {
  return supabase.from('entities').select('*').eq('entity_type', entityType);
}

function rowToEntity(row) {
  if (!row) return null;
  return {
    id: row.id,
    created_date: row.created_date,
    updated_date: row.updated_date,
    created_by: row.created_by,
    ...(row.data || {}),
  };
}

function createEntityProxy(entityType) {
  return {
    async get(id) {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('entity_type', entityType)
        .eq('id', id)
        .single();
      if (error || !data) return null;
      return rowToEntity(data);
    },

    async filter(criteria, orderBy, limit) {
      let query = buildQuery(entityType);

      if (criteria && typeof criteria === 'object') {
        const keys = Object.keys(criteria);
        if (keys.length > 0) {
          query = query.contains('data', criteria);
        }
      }

      const order = parseOrderBy(orderBy);
      if (order) {
        if (order.column === 'created_date' || order.column === 'updated_date') {
          query = query.order(order.column, { ascending: order.ascending });
        } else {
          query = query.order('data->' + order.column, { ascending: order.ascending });
        }
      } else {
        query = query.order('created_date', { ascending: false });
      }

      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) {
        console.error(`[entities.${entityType}.filter]`, error);
        return [];
      }
      return (data || []).map(rowToEntity);
    },

    async list(orderBy, limit) {
      return this.filter({}, orderBy, limit);
    },

    async create(entityData) {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      const sanitized = sanitizeObject(entityData);

      const { data, error } = await supabase.from('entities').insert({
        entity_type: entityType,
        data: sanitized,
        created_by: userId,
      }).select().single();

      if (error) {
        console.error(`[entities.${entityType}.create]`, error);
        throw error;
      }
      return rowToEntity(data);
    },

    async update(id, updates) {
      const { data: existing, error: fetchErr } = await supabase
        .from('entities')
        .select('data')
        .eq('id', id)
        .single();

      if (fetchErr) {
        console.error(`[entities.${entityType}.update] fetch`, fetchErr);
        throw fetchErr;
      }

      const sanitizedUpdates = sanitizeObject(updates);
      const merged = { ...(existing?.data || {}), ...sanitizedUpdates };

      const { data, error } = await supabase
        .from('entities')
        .update({ data: merged, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`[entities.${entityType}.update]`, error);
        throw error;
      }
      return rowToEntity(data);
    },

    async delete(id) {
      const { error } = await supabase.from('entities').delete().eq('id', id);
      if (error) {
        console.error(`[entities.${entityType}.delete]`, error);
        throw error;
      }
    },

    subscribe(callback) {
      const channel = supabase
        .channel(`realtime-${entityType}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'entities',
            filter: `entity_type=eq.${entityType}`,
          },
          (payload) => {
            const event = {
              type: payload.eventType,
              record: payload.new ? rowToEntity(payload.new) : null,
              old_record: payload.old ? rowToEntity(payload.old) : null,
            };
            callback(event);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    },
  };
}

const entitiesCache = {};

const entities = new Proxy({}, {
  get(_, entityType) {
    if (typeof entityType !== 'string') return undefined;
    if (!entitiesCache[entityType]) {
      entitiesCache[entityType] = createEntityProxy(entityType);
    }
    return entitiesCache[entityType];
  },
});

// ─── Functions shim (deferred — returns no-ops) ─────────────────────────────

const functions = new Proxy({}, {
  get(_, fnName) {
    return async (payload) => {
      console.warn(`[base44.functions.${fnName}] Edge function not yet migrated. Called with:`, payload);
      return { data: null };
    };
  },
});

// ─── App Logs shim (no-op) ───────────────────────────────────────────────────

const appLogs = {
  async logUserInApp() {},
  async log() {},
};

// ─── Users shim ──────────────────────────────────────────────────────────────

const users = {
  async inviteUser(email) {
    const { error } = await supabase.auth.admin?.inviteUserByEmail?.(email) || {};
    if (error) console.warn('[base44.users.inviteUser] Not available:', error);
  },
  async list() { return []; },
};

// ─── Integrations shim (Supabase Storage) ────────────────────────────────────

const BUCKET = 'uploads';
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB for avatars/banners

const integrations = {
  Core: {
    async UploadFile({ file }) {
      if (!file || !(file instanceof File)) throw new Error('Invalid file');
      if (file.size > MAX_FILE_SIZE) throw new Error(`File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/jpeg/, 'jpg');
      const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'png';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;
      const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
      return { file_url: urlData.publicUrl };
    },
    async InvokeLLM() { return { content: '' }; },
  },
};

// ─── Export ──────────────────────────────────────────────────────────────────

export const base44 = { auth, entities, functions, appLogs, users, integrations };
