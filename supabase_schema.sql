-- ============================================================
-- SCCL Uganda — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (for both patients and doctors)
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('patient', 'doctor', 'admin')),
  full_name text,
  email text,
  avatar_url text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'patient'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- HOSPITALS / FACILITIES
-- ============================================================
create table public.hospitals (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique,
  description text,
  address text,
  sub_county text,
  district text default 'Mukono',
  latitude double precision,
  longitude double precision,
  phone text,
  email text,
  website text,
  photo_url text,
  is_verified boolean default false,
  is_active boolean default true,
  emergency_available boolean default false,
  operating_hours jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- HOSPITAL SERVICES (sickle cell specific)
-- ============================================================
create table public.hospital_services (
  id uuid default uuid_generate_v4() primary key,
  hospital_id uuid references public.hospitals on delete cascade,
  service_type text not null,
  -- Types: 'sickle_cell_testing', 'hydroxyurea_treatment', 'blood_transfusion',
  --        'pain_crisis_management', 'lab_services', 'newborn_screening',
  --        'genetic_counseling', 'hemoglobin_electrophoresis', 'pneumococcal_vaccines',
  --        'maternal_health', 'pediatrics', 'pharmacy', 'radiology', 'outpatient'
  description text,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- HOSPITAL SPECIALISTS
-- ============================================================
create table public.hospital_specialists (
  id uuid default uuid_generate_v4() primary key,
  hospital_id uuid references public.hospitals on delete cascade,
  role text not null,
  clinic_schedule text,
  created_at timestamptz default now()
);

-- ============================================================
-- DOCTORS (linked to hospitals)
-- ============================================================
create table public.doctors (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles on delete cascade,
  hospital_id uuid references public.hospitals on delete set null,
  specialty text,
  department text,
  scc_id text unique,
  is_approved boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- EMERGENCY CONTACTS
-- ============================================================
create table public.emergency_contacts (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null check (category in ('ambulance', 'scd_hotline', 'hospital_triage')),
  description text,
  phone text not null,
  district text default 'Mukono',
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- EDUCATION ARTICLES
-- ============================================================
create table public.education_articles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique,
  category text not null check (category in ('understanding_scd', 'management_nutrition', 'advocacy', 'latest_research')),
  content text,
  summary text,
  author text,
  read_time_minutes int default 5,
  content_type text default 'article' check (content_type in ('article', 'infographic', 'faq', 'guide')),
  is_published boolean default true,
  cover_image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PATIENT FAVORITES
-- ============================================================
create table public.patient_favorites (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.profiles on delete cascade,
  hospital_id uuid references public.hospitals on delete cascade,
  created_at timestamptz default now(),
  unique(patient_id, hospital_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Hospitals (public read, restricted write)
alter table public.hospitals enable row level security;
create policy "Anyone can view active hospitals" on public.hospitals for select using (is_active = true);
create policy "Admins can do anything with hospitals" on public.hospitals
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Hospital doctors can update their hospital" on public.hospitals for update
  using (exists (
    select 1 from public.doctors d
    join public.profiles p on p.id = d.profile_id
    where p.id = auth.uid() and d.hospital_id = hospitals.id and d.is_approved = true
  ));

-- Hospital services (public read)
alter table public.hospital_services enable row level security;
create policy "Anyone can view services" on public.hospital_services for select using (true);
create policy "Approved hospital doctors can manage services" on public.hospital_services
  using (exists (
    select 1 from public.doctors d
    join public.profiles p on p.id = d.profile_id
    where p.id = auth.uid() and d.hospital_id = hospital_services.hospital_id and d.is_approved = true
  ));
create policy "Admins can manage all services" on public.hospital_services
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Emergency contacts (public read, admin write)
alter table public.emergency_contacts enable row level security;
create policy "Anyone can view emergency contacts" on public.emergency_contacts for select using (is_active = true);
create policy "Admins can manage emergency contacts" on public.emergency_contacts
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Education articles (public read, admin write)
alter table public.education_articles enable row level security;
create policy "Anyone can view published articles" on public.education_articles for select using (is_published = true);
create policy "Admins can manage articles" on public.education_articles
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Doctors
alter table public.doctors enable row level security;
create policy "Doctors can view own record" on public.doctors for select using (
  exists (select 1 from public.profiles where id = auth.uid() and id = doctors.profile_id)
);
create policy "Admins can view all doctors" on public.doctors for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Patient favorites
alter table public.patient_favorites enable row level security;
create policy "Patients can manage own favorites" on public.patient_favorites
  using (auth.uid() = patient_id);

-- ============================================================
-- SEED: Emergency Contacts for Mukono District
-- ============================================================
insert into public.emergency_contacts (name, category, description, phone, sort_order) values
  ('Mukono General Ambulance', 'ambulance', '24/7 District Response', '+256 800 111 222', 1),
  ('Red Cross Mukono', 'ambulance', 'Rapid Emergency Transport', '+256 800 111 333', 2),
  ('SCD Emergency Crisis Line', 'scd_hotline', 'Pain Management Guidance', '+256 800 222 100', 3),
  ('SCD Patient Advocate', 'scd_hotline', 'Legal & Treatment Support', '+256 800 222 200', 4),
  ('Mukono Hospital ER', 'hospital_triage', 'Front Desk Triage Unit', '+256 41 4 123456', 5),
  ('Naggalama Hospital', 'hospital_triage', 'Specialized Triage Services', '+256 41 4 234567', 6);

-- ============================================================
-- SEED: Sample Hospitals
-- ============================================================
insert into public.hospitals (name, slug, address, sub_county, latitude, longitude, phone, is_verified, emergency_available) values
  ('Mukono General Hospital', 'mukono-general-hospital', 'Plot 42, Kampala-Jinja Road', 'Mukono Town', 0.3532, 32.7559, '+256 765 467 432', true, true),
  ('C-Care Hospital', 'c-care-hospital', 'Kayunga Road, Mukono', 'Mukono Town', 0.3558, 32.7612, '+256 786 555 432', true, false),
  ('Mukono Church of Uganda Hospital', 'mukono-cou-hospital', 'Seeta Trading Centre', 'Seeta', 0.3480, 32.7700, '+256 700 111 222', true, false),
  ('Herona Hospital', 'herona-hospital', 'Wantoni Katosi', 'Katosi', 0.3200, 32.8100, '+256 777 777 777', false, false),
  ('Kayunga Regional Referral Hospital', 'kayunga-regional-referral', 'Kayunga Town', 'Kayunga', 0.7023, 32.8965, '+256 700 333 444', true, true),
  ('Goma Health Centre IV', 'goma-health-centre-iv', 'Misindye, Goma Sub-county', 'Goma', 0.2845, 32.7234, '+256 700 555 666', false, false);
