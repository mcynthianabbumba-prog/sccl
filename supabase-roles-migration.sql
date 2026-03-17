-- ============================================================
-- SCCL Platform – Role & Admin Migration
-- Run this in the Supabase SQL editor AFTER the base schema
-- ============================================================

-- ─── 1. Add role column to profiles (if not present) ─────────────────────────
alter table profiles
  add column if not exists role text not null default 'patient'
    check (role in ('patient', 'doctor', 'hospital_admin', 'super_admin'));

-- ─── 2. Add facility_id FK to profiles (for hospital_admin / doctor) ─────────
alter table profiles
  add column if not exists facility_id uuid references facilities(id) on delete set null;

-- ─── 3. Tighten RLS: profiles ────────────────────────────────────────────────
-- Users can read their own profile
drop policy if exists "Users read own profile"   on profiles;
drop policy if exists "Users update own profile" on profiles;

create policy "Users read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);

-- super_admin can read ALL profiles
create policy "Super admin reads all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

-- ─── 4. Facilities: hospital_admin can update their own facility ──────────────
drop policy if exists "Hospital admin update own facility" on facilities;

create policy "Hospital admin update own facility"
  on facilities for update
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'hospital_admin'
        and p.facility_id = facilities.id
    )
  );

-- super_admin full CRUD on facilities
drop policy if exists "Super admin CRUD facilities" on facilities;

create policy "Super admin CRUD facilities"
  on facilities for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

-- ─── 5. Helper function: get current user role ───────────────────────────────
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ─── 6. Helper function: get current user facility_id ────────────────────────
create or replace function public.get_my_facility_id()
returns uuid
language sql
security definer
stable
as $$
  select facility_id from public.profiles where id = auth.uid();
$$;

-- ─── 7. Seed the super_admin account ─────────────────────────────────────────
-- IMPORTANT: First create the user in Supabase Auth dashboard (Authentication → Users → Invite)
-- using YOUR email. Then run this to promote them:
--
--   update profiles set role = 'super_admin' where email = 'your@email.com';
--
-- The hospital_admin accounts are created by you via Admin1.
-- Doctors are created by hospital admins via Admin2 (no public signup).

-- ─── 8. Prevent public signup for doctors/admins ─────────────────────────────
-- In Supabase Dashboard → Authentication → Settings:
--   • Set "Disable email confirmations" = false (require email confirm)
--   • Optionally turn off "Enable Email Signup" if you want zero public signups
--   • Use Supabase "Invite" flow for all non-patient users

-- ─── 9. Doctor invitations table ─────────────────────────────────────────────
create table if not exists doctor_invitations (
  id           uuid primary key default uuid_generate_v4(),
  email        text not null unique,
  facility_id  uuid references facilities(id) on delete cascade,
  token        text not null default encode(gen_random_bytes(32), 'hex'),
  used         boolean default false,
  created_by   uuid references profiles(id),
  created_at   timestamptz default now(),
  expires_at   timestamptz default now() + interval '7 days'
);

alter table doctor_invitations enable row level security;

-- hospital_admin can manage invitations for their facility
create policy "Hospital admin manage invitations"
  on doctor_invitations for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role in ('hospital_admin', 'super_admin')
        and (p.facility_id = doctor_invitations.facility_id or p.role = 'super_admin')
    )
  );

-- Anyone can read an invitation by token (for the signup flow)
create policy "Public read invitation by token"
  on doctor_invitations for select
  using (true);
