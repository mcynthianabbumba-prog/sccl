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
