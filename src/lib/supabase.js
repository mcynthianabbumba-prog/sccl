// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// ─── Guard: crash with a clear message in dev, silent no-op in prod ──────────
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[SCCL] Supabase env vars are missing.\n' +
    'Create a .env file (or set Netlify env vars) with:\n' +
    '  REACT_APP_SUPABASE_URL=https://xxxx.supabase.co\n' +
    '  REACT_APP_SUPABASE_ANON_KEY=your-anon-key'
  );
}

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
);

// ─── Auth helpers ────────────────────────────────────────────────────────────
export const signUp = async ({ fullName, email, password }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  return { data, error };
};

export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { data, error };
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// ─── Facilities ──────────────────────────────────────────────────────────────
export const getFacilities = async ({ search, diagnosis, treatment, specialist, emergency } = {}) => {
  let query = supabase.from('facilities').select('*');
  if (search)    query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
  if (diagnosis) query = query.contains('diagnosis_services', [diagnosis]);
  if (treatment) query = query.contains('treatments', [treatment]);
  if (specialist)query = query.contains('specialists', [specialist]);
  if (emergency) query = query.eq('has_emergency', true);
  const { data, error } = await query.order('name');
  return { data, error };
};

export const getFacilityById = async (id) => {
  const { data, error } = await supabase
    .from('facilities').select('*').eq('id', id).single();
  return { data, error };
};

export const getFeaturedFacilities = async () => {
  const { data, error } = await supabase
    .from('facilities').select('*').eq('is_featured', true).limit(3);
  return { data, error };
};

export const getFacilitiesStats = async () => {
  const [a, b, c] = await Promise.all([
    supabase.from('facilities').select('*', { count: 'exact', head: true }),
    supabase.from('facilities').select('*', { count: 'exact', head: true }).eq('has_diagnosis', true),
    supabase.from('facilities').select('*', { count: 'exact', head: true }).eq('has_emergency', true),
  ]);
  return {
    totalFacilities:  a.count ?? 0,
    diagnosisServices: b.count ?? 0,
    emergencyCare:    c.count ?? 0,
  };
};

// ─── Resources ───────────────────────────────────────────────────────────────
export const getResources = async (category) => {
  let query = supabase.from('resources').select('*');
  if (category && category !== 'all') query = query.eq('category', category);
  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
};

// ─── Emergency contacts ──────────────────────────────────────────────────────
export const getEmergencyContacts = async () => {
  const { data, error } = await supabase
    .from('emergency_contacts').select('*').order('category');
  return { data, error };
};

// ─── FAQs ────────────────────────────────────────────────────────────────────
export const getFaqs = async (category) => {
  let query = supabase.from('faqs').select('*').order('order_num');
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  return { data, error };
};
