// src/lib/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);  // true until user + profile both resolved

  const fetchProfile = async (userId) => {
    if (!userId) { setProfile(null); return; }
    const { data } = await supabase
      .from('profiles').select('*').eq('id', userId).single();
    setProfile(data ?? null);
  };

  useEffect(() => {
    // Initial load — wait for profile before clearing loading
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      await fetchProfile(session?.user?.id ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        await fetchProfile(session?.user?.id ?? null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const role            = profile?.role ?? null;
  const isSuperAdmin    = role === 'super_admin';
  const isHospitalAdmin = role === 'hospital_admin';
  const isDoctor        = role === 'doctor';
  const isStaff         = isSuperAdmin || isHospitalAdmin || isDoctor;

  return (
    <AuthContext.Provider value={{
      user, profile, role, loading,
      isSuperAdmin, isHospitalAdmin, isDoctor, isStaff,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
