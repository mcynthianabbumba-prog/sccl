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
