// src/lib/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);   // includes role + facility_id
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    if (!userId) { setProfile(null); return; }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      fetchProfile(session?.user?.id).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      fetchProfile(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const role        = profile?.role ?? null;
  const isSuperAdmin   = role === 'super_admin';
  const isHospitalAdmin= role === 'hospital_admin';
  const isDoctor       = role === 'doctor';

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, isSuperAdmin, isHospitalAdmin, isDoctor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
