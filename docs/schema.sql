
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('owner','admin','reception','professional','finance');
CREATE TYPE public.clinic_status AS ENUM ('pending','active','suspended');
CREATE TYPE public.appointment_status AS ENUM ('scheduled','confirmed','done','no_show','canceled');
CREATE TYPE public.photo_kind AS ENUM ('before','after','evolution');
CREATE TYPE public.lead_status AS ENUM ('new','contacted','scheduled','won','lost');
CREATE TYPE public.package_status AS ENUM ('active','completed','canceled');
CREATE TYPE public.payment_status AS ENUM ('pending','paid','refunded','canceled');

-- ============ CORE ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  status public.clinic_status NOT NULL DEFAULT 'pending',
  plan TEXT NOT NULL DEFAULT 'starter',
  logo_url TEXT,
  primary_color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.clinics (slug);

CREATE TABLE public.clinic_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'reception',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, user_id)
);
CREATE INDEX ON public.clinic_members (user_id);
CREATE INDEX ON public.clinic_members (clinic_id);

-- ============ SECURITY DEFINER HELPERS ============
CREATE OR REPLACE FUNCTION public.is_clinic_member(_clinic_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.clinic_members
    WHERE clinic_id = _clinic_id AND user_id = auth.uid() AND active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_clinic_role(_clinic_id UUID, _roles public.app_role[])
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.clinic_members
    WHERE clinic_id = _clinic_id AND user_id = auth.uid() AND active = true AND role = ANY(_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.user_clinics()
RETURNS SETOF UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid() AND active = true;
$$;

-- Trigger: cria profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============ DOMAIN TABLES ============
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.clients (clinic_id);

CREATE TABLE public.client_anamnesis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.client_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  kind public.photo_kind NOT NULL DEFAULT 'evolution',
  procedure_id UUID,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

CREATE TABLE public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#22D3EE',
  specialties TEXT[] DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE public.business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL,
  opens_at TIME NOT NULL,
  closes_at TIME NOT NULL
);

CREATE TABLE public.schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason TEXT
);

CREATE TABLE public.procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration_min INT NOT NULL DEFAULT 60,
  photos TEXT[] DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.procedures (clinic_id);

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE RESTRICT,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  procedure_id UUID REFERENCES public.procedures(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.appointments (clinic_id, starts_at);

CREATE TABLE public.lead_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  procedure_id UUID REFERENCES public.procedures(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  headline TEXT NOT NULL,
  subheadline TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, slug)
);

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  lead_form_id UUID REFERENCES public.lead_forms(id) ON DELETE SET NULL,
  procedure_id UUID REFERENCES public.procedures(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  message TEXT,
  source TEXT,
  status public.lead_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.leads (clinic_id, created_at DESC);

CREATE TABLE public.treatment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  procedure_id UUID REFERENCES public.procedures(id) ON DELETE SET NULL,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  photos TEXT[] DEFAULT '{}'
);

CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  procedure_id UUID NOT NULL REFERENCES public.procedures(id) ON DELETE RESTRICT,
  total_sessions INT NOT NULL,
  used_sessions INT NOT NULL DEFAULT 0,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  status public.package_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  method TEXT,
  paid_at TIMESTAMPTZ,
  status public.payment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.payments (clinic_id, paid_at DESC);

-- updated_at triggers
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_clinics_updated BEFORE UPDATE ON public.clinics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ RLS ============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "own profile read" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- clinics
CREATE POLICY "members read clinic" ON public.clinics FOR SELECT USING (public.is_clinic_member(id));
CREATE POLICY "anyone authenticated can create clinic" ON public.clinics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "owners/admins update clinic" ON public.clinics FOR UPDATE USING (public.has_clinic_role(id, ARRAY['owner','admin']::public.app_role[]));

-- clinic_members
CREATE POLICY "members read clinic_members" ON public.clinic_members FOR SELECT USING (user_id = auth.uid() OR public.is_clinic_member(clinic_id));
CREATE POLICY "self-insert membership" ON public.clinic_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.has_clinic_role(clinic_id, ARRAY['owner','admin']::public.app_role[]));
CREATE POLICY "owners/admins manage members" ON public.clinic_members FOR UPDATE USING (public.has_clinic_role(clinic_id, ARRAY['owner','admin']::public.app_role[]));
CREATE POLICY "owners/admins delete members" ON public.clinic_members FOR DELETE USING (public.has_clinic_role(clinic_id, ARRAY['owner','admin']::public.app_role[]));

-- generic per-clinic policies (helper macro via repetition)
-- clients
CREATE POLICY "tenant access clients" ON public.clients FOR ALL USING (public.is_clinic_member(clinic_id)) WITH CHECK (public.is_clinic_member(clinic_id));
CREATE POLICY "tenant access anamnesis" ON public.client_anamnesis FOR ALL USING (public.is_clinic_member(clinic_id)) WITH CHECK (public.is_clinic_member(clinic_id));
CREATE POLICY "tenant access photos" ON public.client_photos FOR ALL USING (public.is_clinic_member(clinic_id)) WITH CHECK (public.is_clinic_member(clinic_id));
CREATE POLICY "tenant access professionals" ON public.professionals FOR ALL USING (public.is_clinic_member(clinic_id)) WITH CHECK (public.is_clinic_member(clinic_id));
CREATE POLICY "tenant access rooms" ON public.rooms FOR ALL USING (public.is_clinic_member(clinic_id)) WITH CHECK (public.is_clinic_member(clinic_id));
CREATE POLICY "tenant access business_hours" ON public.business_hours FOR ALL USING (public.is_clinic_member(clinic_id)) WITH CHECK (public.is_clinic_member(clinic_id));
CREATE POLICY "tenant access schedule_blocks" ON public.schedule_blocks FOR ALL USING (public.is_clinic_member(clinic_id)) WITH CHECK (public.is_clinic_member(clinic_id));
CREATE POLICY "tenant access procedures" ON public.procedures FOR ALL USING (public.is_clinic_member(clinic_id)) WITH CHECK (public.is_clinic_member(clinic_id));
CREATE POLICY "tenant access appointments" ON public.appointments FOR ALL USING (public.is_clinic_member(clinic_id)) WITH CHECK (public.is_clinic_member(clinic_id));
CREATE POLICY "tenant access lead_forms" ON public.lead_forms FOR ALL USING (public.is_clinic_member(clinic_id)) WITH CHECK (public.is_clinic_member(clinic_id));
CREATE POLICY "tenant access treatment_records" ON public.treatment_records FOR ALL USING (public.is_clinic_member(clinic_id)) WITH CHECK (public.is_clinic_member(clinic_id));
CREATE POLICY "tenant access packages" ON public.packages FOR ALL USING (public.is_clinic_member(clinic_id)) WITH CHECK (public.is_clinic_member(clinic_id));
CREATE POLICY "tenant access payments" ON public.payments FOR ALL USING (public.is_clinic_member(clinic_id)) WITH CHECK (public.is_clinic_member(clinic_id));

-- leads: members can read/update; public can insert via active form
CREATE POLICY "tenant read leads" ON public.leads FOR SELECT USING (public.is_clinic_member(clinic_id));
CREATE POLICY "tenant update leads" ON public.leads FOR UPDATE USING (public.is_clinic_member(clinic_id));
CREATE POLICY "tenant delete leads" ON public.leads FOR DELETE USING (public.is_clinic_member(clinic_id));
CREATE POLICY "public can submit leads" ON public.leads FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.lead_forms lf
            WHERE lf.id = lead_form_id AND lf.clinic_id = leads.clinic_id AND lf.active = true)
  );

-- public can view active lead_forms (for the public capture page)
CREATE POLICY "public read active lead_forms" ON public.lead_forms FOR SELECT TO anon, authenticated
  USING (active = true);

-- ============ STORAGE ============
INSERT INTO storage.buckets (id, name, public) VALUES ('clinic-media','clinic-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "clinic-media read" ON storage.objects FOR SELECT
  USING (bucket_id = 'clinic-media');
CREATE POLICY "clinic-media write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'clinic-media'
    AND public.is_clinic_member( ((storage.foldername(name))[1])::uuid )
  );
CREATE POLICY "clinic-media update" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'clinic-media'
    AND public.is_clinic_member( ((storage.foldername(name))[1])::uuid )
  );
CREATE POLICY "clinic-media delete" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'clinic-media'
    AND public.is_clinic_member( ((storage.foldername(name))[1])::uuid )
  );
