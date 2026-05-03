import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { UserPreferences } from '../types';

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;
function getClient(): SupabaseClient | null {
  if (!URL || !KEY) return null;
  if (!client) client = createClient(URL, KEY);
  return client;
}

function getUserId(): string {
  let id = localStorage.getItem('f1_paddock_user_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('f1_paddock_user_id', id);
  }
  return id;
}

export async function getPreferences(): Promise<UserPreferences | null> {
  const sb = getClient();
  if (!sb) return null;
  try {
    const userId = getUserId();
    const { data } = await sb
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (!data) return null;
    return {
      favourite_drivers: data.favourite_drivers || [],
      favourite_teams: data.favourite_teams || [],
      theme: data.theme || 'dark',
    };
  } catch {
    return null;
  }
}

export async function savePreferences(prefs: Partial<UserPreferences>): Promise<{ ok: boolean }> {
  const sb = getClient();
  if (!sb) return { ok: false };
  try {
    const userId = getUserId();
    const { error } = await sb
      .from('user_preferences')
      .upsert(
        { user_id: userId, ...prefs, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    return { ok: !error };
  } catch {
    return { ok: false };
  }
}
