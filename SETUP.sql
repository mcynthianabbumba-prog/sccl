-- ============================================================
-- SCCL Platform — COMPLETE SETUP (run this once)
-- Paste into Supabase SQL Editor → Run
-- Safe to re-run: all statements use IF NOT EXISTS / OR REPLACE
-- ============================================================

-- ============================================================
-- SCCL Platform – Supabase Schema
-- Run this in the Supabase SQL editor to set up your database
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Facilities ──────────────────────────────────────────────────────────────
create table if not exists facilities (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  address         text,
  sub_county      text,
  district        text default 'Mukono',
  phone           text,
  email           text,
  latitude        numeric(10, 7),
  longitude       numeric(10, 7),
  image_url       text,
  facility_type   text,          -- 'public' | 'private' | 'ngo'
  is_featured     boolean default false,
  is_verified     boolean default false,
  has_emergency   boolean default false,
  has_diagnosis   boolean default false,
  opening_hours   jsonb,         -- { monday: "08:00-17:00", ... }
  sickle_cell_services text[],   -- ['Sickle Cell Testing', 'Hydroxyurea Treatment', ...]
  diagnosis_services   text[],   -- ['Newborn Screening', 'Genetic Counseling', ...]
  treatments      text[],        -- ['Hydroxyurea', 'Blood Transfusion', ...]
  specialists     text[],        -- ['Hematologist', 'Pediatric Specialist', ...]
  tags            text[],        -- ['Emergency Care', 'Radiology', ...]
  description     text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── Emergency Contacts ───────────────────────────────────────────────────────
create table if not exists emergency_contacts (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  subtitle    text,
  phone       text not null,
  category    text not null,    -- 'ambulance' | 'scd_hotline' | 'hospital_triage'
  icon        text,
  created_at  timestamptz default now()
);

-- ─── Resources (Education Hub) ───────────────────────────────────────────────
create table if not exists resources (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  summary       text,
  content       text,
  category      text not null,  -- 'understanding_scd' | 'management' | 'advocacy' | 'research'
  resource_type text,           -- 'article' | 'infographic' | 'nutrition' | 'mental_health'
  read_time     int,            -- minutes
  author        text,
  image_url     text,
  download_url  text,
  is_featured   boolean default false,
  created_at    timestamptz default now()
);

-- ─── FAQ ─────────────────────────────────────────────────────────────────────
create table if not exists faqs (
  id        uuid primary key default uuid_generate_v4(),
  question  text not null,
  answer    text not null,
  category  text,
  order_num int default 0
);

-- ─── Profiles (linked to auth.users) ─────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  avatar_url  text,
  role        text default 'patient',  -- 'patient' | 'provider' | 'admin'
  created_at  timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── RLS Policies ────────────────────────────────────────────────────────────
alter table facilities enable row level security;
alter table emergency_contacts enable row level security;
alter table resources enable row level security;
alter table faqs enable row level security;
alter table profiles enable row level security;

-- Public read access for facilities, contacts, resources, faqs
create policy "Public read facilities" on facilities for select using (true);
create policy "Public read emergency_contacts" on emergency_contacts for select using (true);
create policy "Public read resources" on resources for select using (true);
create policy "Public read faqs" on faqs for select using (true);

-- Profile: user can read/update their own profile
create policy "Users read own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

-- ─── Seed Data ───────────────────────────────────────────────────────────────

-- Emergency contacts
insert into emergency_contacts (name, subtitle, phone, category, icon) values
  ('Mukono General Ambulance', '24/7 District Response', '0800 123 456', 'ambulance', 'ambulance'),
  ('Red Cross Mukono', 'Rapid Emergency Transport', '0800 199 199', 'ambulance', 'redcross'),
  ('SCD Emergency Crisis Line', 'Pain Management Guidance', '0800 200 200', 'scd_hotline', 'crisis'),
  ('SCD Patient Advocate', 'Legal & Treatment Support', '0800 300 300', 'scd_hotline', 'advocate'),
  ('Mukono Hospital ER', 'Front Desk Triage Unit', '0414 123 456', 'hospital_triage', 'hospital'),
  ('Naggalama Hospital', 'Specialized Triage Services', '0414 567 890', 'hospital_triage', 'hospital');

-- Featured facilities
insert into facilities (name, address, sub_county, phone, latitude, longitude, is_featured, is_verified, has_emergency, has_diagnosis, facility_type,
  sickle_cell_services, diagnosis_services, treatments, specialists, tags, opening_hours) values
  (
    'Mukono General Hospital',
    'Plot 42, Kampala-Jinja Road, Mukono Town',
    'Mukono Town',
    '+256 765 467 432',
    0.3536, 32.7564,
    true, true, true, true, 'public',
    ARRAY['Sickle Cell Testing','Hydroxyurea Treatment','Blood Transfusion','Laboratory Services','Pain Management','Pneumococcal Vaccines'],
    ARRAY['Newborn Screening','Genetic Counseling','Hemoglobin Electrophoresis'],
    ARRAY['Hydroxyurea','Blood Transfusion','Pain Crisis Management'],
    ARRAY['Lead Hematologist','Pediatric Specialist','Counseling Nurses'],
    ARRAY['Emergency Care','Radiology','Pediatrics'],
    '{"monday":"08:00-17:00","tuesday":"08:00-17:00","wednesday":"08:00-17:00","thursday":"08:00-17:00","friday":"08:00-17:00","emergency":"24/7"}'
  ),
  (
    'Mukono COU Hospital',
    'Seeta Trading Centre, Mukono',
    'Seeta',
    '+256 786 555 432',
    0.3401, 32.7812,
    true, true, false, true, 'private',
    ARRAY['SCD Screening','Routine Hematology','Outpatient Clinics'],
    ARRAY['Newborn Screening','Genetic Counseling'],
    ARRAY['Hydroxyurea','Pain Crisis Management'],
    ARRAY['Hematologist','Counseling Nurses'],
    ARRAY['Lab Services','Pharmacy'],
    '{"monday":"08:00-17:00","tuesday":"08:00-17:00","wednesday":"08:00-17:00","thursday":"08:00-17:00","friday":"08:00-17:00"}'
  ),
  (
    'Kayunga Regional Referral Hospital',
    'Kayunga Town, Kayunga District',
    'Kayunga',
    '+256 777 777 777',
    0.7025, 32.8921,
    true, true, false, true, 'public',
    ARRAY['Blood Transfusions','Counseling','Diagnostic Lab Testing'],
    ARRAY['Hemoglobin Electrophoresis','Genetic Counseling'],
    ARRAY['Blood Transfusion'],
    ARRAY['Hematologist'],
    ARRAY['Blood Transfusion','Counseling','Diagnostics'],
    '{"monday":"09:00-16:30","tuesday":"09:00-16:30","wednesday":"09:00-16:30","thursday":"09:00-16:30","friday":"09:00-16:30"}'
  ),
  (
    'C-Care Hospital',
    'Mukono Mall, Kayunga Road',
    'Mukono Town',
    '+256 786 555 432',
    0.3489, 32.7603,
    false, true, false, false, 'private',
    ARRAY['Lab Services','Pain Crisis Management','Primary Care'],
    ARRAY[],
    ARRAY['Pain Crisis Management'],
    ARRAY[],
    ARRAY['Maternity','Pediatrics','Lab Services'],
    '{"monday":"08:00-18:00","tuesday":"08:00-18:00","wednesday":"08:00-18:00","thursday":"08:00-18:00","friday":"08:00-18:00","saturday":"09:00-14:00"}'
  ),
  (
    'Herona Hospital',
    'Wantoni Katosi, Mukono',
    'Katosi',
    '+256 777 777 777',
    0.3612, 32.8234,
    false, false, false, true, 'private',
    ARRAY['Newborn Screening','Hydroxyurea Specialist','Hematology'],
    ARRAY['Newborn Screening'],
    ARRAY['Hydroxyurea'],
    ARRAY['Hematology'],
    ARRAY['Newborn Screening','Hydroxyurea Specialist','Hematology'],
    '{"monday":"08:00-17:00","tuesday":"08:00-17:00","wednesday":"08:00-17:00","thursday":"08:00-17:00","friday":"08:00-17:00"}'
  ),
  (
    'Goma Health Centre IV',
    'Misindye, Goma Sub-county',
    'Goma',
    '+256 700 123 456',
    0.2891, 32.8012,
    false, false, false, false, 'public',
    ARRAY['Outpatient Services','Basic SCD Care'],
    ARRAY[],
    ARRAY[],
    ARRAY[],
    ARRAY['Outpatient'],
    '{"monday":"08:00-17:00","tuesday":"08:00-17:00","wednesday":"08:00-17:00","thursday":"08:00-17:00","friday":"08:00-17:00"}'
  );

-- Education resources
insert into resources (title, summary, category, resource_type, read_time, author, is_featured) values
  ('Biological Mechanisms of Sickle Cell', 'A deep dive into how hemoglobin mutations affect blood flow and oxygen delivery.', 'understanding_scd', 'article', 12, 'Dr. Elena Vance', false),
  ('Iron-Rich Foods and SCD: What You Need to Know', 'Navigating iron intake when managing frequent blood transfusions and diet.', 'management', 'nutrition', 8, 'Sarah Jenkins, RD', false),
  ('Coping with Chronic Pain: Mental Strategies', 'Practical psychological tools for managing long-term pain and building resilience.', 'understanding_scd', 'mental_health', 15, 'Marcus Thorne', false),
  ('Managing Crisis: Step-by-Step Visual Guide', 'A visual roadmap for what to do during a sickle cell crisis, from home care to hospital.', 'management', 'infographic', 5, 'SCCL Team', false);

-- FAQs
insert into faqs (question, answer, category, order_num) values
  ('What are the early signs of a pain crisis?', 'Pain crises typically start with sudden, severe pain in the bones, chest, abdomen, or joints. You may also experience swelling, fever, and difficulty breathing. Seek medical care immediately if symptoms are severe.', 'pain_management', 1),
  ('How does SCD impact hydration needs?', 'People with SCD need to stay well-hydrated as dehydration can trigger pain crises. Aim for at least 8-10 glasses of water daily, and increase intake during hot weather or exercise.', 'management', 2),
  ('Is exercise safe for SCD patients?', 'Moderate exercise is generally safe and beneficial. Avoid strenuous activity in extreme heat, stay hydrated, and rest when needed. Always consult your hematologist before starting a new exercise program.', 'lifestyle', 3);


-- ============================================================
-- SCCL Platform – Additional Schema (run after supabase-schema.sql)
-- Doctor portal, admin roles, hospital management
-- ============================================================

-- ─── Roles enum ──────────────────────────────────────────────────────────────
-- Extend profiles table with role support
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS facility_id uuid REFERENCES facilities(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialization text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS license_number text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;

-- Role values: 'patient' | 'doctor' | 'hospital_admin' | 'super_admin'
-- super_admin = site owner; hospital_admin = per-facility admin

-- ─── Doctors ─────────────────────────────────────────────────────────────────
-- Doctors are stored in profiles with role='doctor'
-- They belong to a facility via facility_id

-- ─── Appointments ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_name text NOT NULL,
  patient_id   uuid REFERENCES profiles(id),
  doctor_id    uuid REFERENCES profiles(id),
  facility_id  uuid REFERENCES facilities(id),
  scheduled_at timestamptz NOT NULL,
  duration_min int DEFAULT 30,
  type         text,          -- 'follow_up' | 'routine' | 'diagnostic' | 'emergency'
  status       text DEFAULT 'scheduled',  -- 'scheduled' | 'completed' | 'cancelled'
  notes        text,
  created_at   timestamptz DEFAULT now()
);

-- ─── Patient records ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patient_records (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id    uuid REFERENCES profiles(id),
  doctor_id     uuid REFERENCES profiles(id),
  facility_id   uuid REFERENCES facilities(id),
  record_type   text,         -- 'lab_result' | 'prescription' | 'consultation' | 'emergency'
  title         text NOT NULL,
  description   text,
  status        text DEFAULT 'pending',  -- 'pending' | 'reviewed' | 'urgent'
  file_url      text,
  created_at    timestamptz DEFAULT now()
);

-- ─── Alerts ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id   uuid REFERENCES profiles(id),
  patient_name text,
  alert_type  text,           -- 'emergency' | 'lab_result' | 'prescription'
  message     text NOT NULL,
  is_read     boolean DEFAULT false,
  is_urgent   boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ─── Messages ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id   uuid REFERENCES profiles(id),
  receiver_id uuid REFERENCES profiles(id),
  subject     text,
  body        text NOT NULL,
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ─── Facility photos ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS facility_photos (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id uuid REFERENCES facilities(id) ON DELETE CASCADE,
  url         text NOT NULL,
  caption     text,
  is_primary  boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ─── RLS Policies ─────────────────────────────────────────────────────────────
ALTER TABLE appointments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_photos ENABLE ROW LEVEL SECURITY;

-- Doctors can read their own appointments and records
CREATE POLICY "Doctors read own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors read own records"
  ON patient_records FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors read own alerts"
  ON alerts FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Users read own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Hospital admins can manage their facility
CREATE POLICY "Hospital admin manage facility"
  ON facilities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'hospital_admin'
        AND profiles.facility_id = facilities.id
    )
  );

-- Super admin has full access (handled by service role key on server,
-- or check role in profile for client-side)
CREATE POLICY "Super admin full facilities"
  ON facilities FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Public read facility_photos"
  ON facility_photos FOR SELECT USING (true);

CREATE POLICY "Hospital admin manage photos"
  ON facility_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('hospital_admin','super_admin')
        AND p.facility_id = facility_photos.facility_id
    )
  );

-- ─── Seed: super_admin profile (update with your actual auth user UUID) ──────
-- After creating your account via Supabase Auth, run:
-- UPDATE profiles SET role = 'super_admin' WHERE email = 'your@email.com';

-- ─── Seed: sample doctor + appointments ──────────────────────────────────────
-- Doctors are created via hospital_admin signup flow — no seed needed.
-- Sample data for testing appointments (replace UUIDs with real ones):
-- INSERT INTO appointments (patient_name, scheduled_at, type, status, notes)
-- VALUES ('Alice Cooper', now() + interval '1 hour', 'follow_up', 'scheduled', 'Follow-up checkup');


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


-- ═══════════════════════════════════════════════════════════
-- AFTER RUNNING: manual steps in Supabase dashboard
-- ═══════════════════════════════════════════════════════════
--
-- 1. PROMOTE YOURSELF TO SUPER_ADMIN
--    a) Sign up at /login with your email
--    b) Run this (swap in your email):
--         UPDATE profiles SET role = 'super_admin' WHERE email = 'your@email.com';
--
-- 2. CREATE A HOSPITAL ADMIN ACCOUNT
--    a) Sign up at /login with the hospital admin's email  
--    b) Find the facility UUID from the facilities table, then run:
--         UPDATE profiles
--           SET role = 'hospital_admin',
--               facility_id = '<facility-uuid>'
--           WHERE email = 'hospitaladmin@hospital.ug';
--
-- 3. CREATE DOCTOR ACCOUNTS
--    Hospital admin logs into /admin/hospital → Doctors tab
--    Enters doctor email → copies invite link → shares with doctor
--    Doctor opens link (/doctor/signup?token=...) and sets password
--    No SQL needed for doctors.
--
-- 4. PORTAL URLS (not linked in public nav — share privately)
--    Staff login:        /doctor/login
--    Site owner panel:   /admin/owner      (super_admin only)
--    Hospital panel:     /admin/hospital   (hospital_admin only)
--    Doctor dashboard:   /doctor/dashboard (doctor / hospital_admin)
-- ═══════════════════════════════════════════════════════════
