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

// ─── Admin: Facilities CRUD (super_admin) ────────────────────────────────────
export const adminCreateFacility = async (data) => {
  const { data: result, error } = await supabase
    .from('facilities').insert([data]).select().single();
  return { data: result, error };
};

export const adminUpdateFacility = async (id, updates) => {
  const { data, error } = await supabase
    .from('facilities').update(updates).eq('id', id).select().single();
  return { data, error };
};

export const adminDeleteFacility = async (id) => {
  const { error } = await supabase.from('facilities').delete().eq('id', id);
  return { error };
};

// ─── Admin: Profiles (super_admin) ───────────────────────────────────────────
export const adminGetProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles').select('*, facilities(name)').order('created_at', { ascending: false });
  return { data, error };
};

export const adminSetRole = async (userId, role, facilityId = null) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role, facility_id: facilityId })
    .eq('id', userId)
    .select().single();
  return { data, error };
};

// ─── Hospital admin: update own facility ─────────────────────────────────────
export const hospitalUpdateFacility = async (facilityId, updates) => {
  const { data, error } = await supabase
    .from('facilities').update(updates).eq('id', facilityId).select().single();
  return { data, error };
};

// ─── Doctor invitations ───────────────────────────────────────────────────────
export const createDoctorInvitation = async ({ email, facilityId }) => {
  const { data, error } = await supabase
    .from('doctor_invitations')
    .insert([{ email, facility_id: facilityId }])
    .select().single();
  return { data, error };
};

export const getInvitationsByFacility = async (facilityId) => {
  const { data, error } = await supabase
    .from('doctor_invitations')
    .select('*')
    .eq('facility_id', facilityId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const validateInvitationToken = async (token) => {
  const { data, error } = await supabase
    .from('doctor_invitations')
    .select('*, facilities(name)')
    .eq('token', token)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single();
  return { data, error };
};

export const markInvitationUsed = async (token) => {
  const { error } = await supabase
    .from('doctor_invitations').update({ used: true }).eq('token', token);
  return { error };
};

// ─── Doctor signup via invitation token ──────────────────────────────────────
export const doctorSignUpWithToken = async ({ email, password, fullName, token, facilityId }) => {
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName } },
  });
  if (authError) return { error: authError };

  // 2. Set role to doctor on their profile
  const userId = authData.user?.id;
  if (userId) {
    await supabase.from('profiles').update({
      role: 'doctor',
      facility_id: facilityId,
      full_name: fullName,
    }).eq('id', userId);

    // 3. Mark invitation as used
    await markInvitationUsed(token);
  }
  return { data: authData, error: null };
};
