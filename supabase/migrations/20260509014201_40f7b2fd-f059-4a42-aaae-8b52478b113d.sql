
-- ============ EXTEND CLINICS ============
ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS zip text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS instagram text,
  ADD COLUMN IF NOT EXISTS whatsapp_owner text,
  ADD COLUMN IF NOT EXISTS whatsapp_attendant text,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS catalog_slug text;

-- ============ EXTEND CLIENTS ============
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS allergies text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS medications text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS chronic_conditions text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS surgeries jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS previous_procedures jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS skin_type text,
  ADD COLUMN IF NOT EXISTS emergency_contact text,
  ADD COLUMN IF NOT EXISTS how_found_us text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- ============ EXTEND PROCEDURES ============
ALTER TABLE public.procedures
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS show_price boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS lead_form_id uuid,
  ADD COLUMN IF NOT EXISTS instructions_pre text,
  ADD COLUMN IF NOT EXISTS instructions_post text;

-- ============ EXTEND LEAD_FORMS ============
DO $$ BEGIN
  CREATE TYPE lead_form_kind AS ENUM ('procedure','product','appointment','generic','catalog');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.lead_forms
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS fields jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS theme_color text DEFAULT '#3B82F6',
  ADD COLUMN IF NOT EXISTS success_message text DEFAULT 'Recebemos seu contato! Em breve retornaremos.',
  ADD COLUMN IF NOT EXISTS redirect_url text,
  ADD COLUMN IF NOT EXISTS kind lead_form_kind NOT NULL DEFAULT 'generic';

-- ============ EXTEND LEADS ============
DO $$ BEGIN
  ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'contacted';
  ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'scheduled';
  ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'converted';
  ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'lost';
EXCEPTION WHEN others THEN NULL; END $$;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS form_data jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS kanban_stage text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS assigned_to uuid,
  ADD COLUMN IF NOT EXISTS scheduled_appointment_id uuid;

-- ============ EXTEND APPOINTMENTS ============
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_sent boolean NOT NULL DEFAULT false;

-- ============ PRODUCTS / STOCK ============
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  name text NOT NULL,
  sku text,
  brand text,
  category text,
  unit text NOT NULL DEFAULT 'un',
  current_stock numeric NOT NULL DEFAULT 0,
  min_stock numeric NOT NULL DEFAULT 0,
  last_purchase_price numeric,
  last_purchase_qty numeric,
  last_purchase_date timestamptz,
  supplier text,
  notes text,
  image_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant access products" ON public.products FOR ALL USING (is_clinic_member(clinic_id)) WITH CHECK (is_clinic_member(clinic_id));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  product_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('in','out','adjustment')),
  quantity numeric NOT NULL,
  unit_cost numeric,
  reason text,
  appointment_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant access stock_movements" ON public.stock_movements FOR ALL USING (is_clinic_member(clinic_id)) WITH CHECK (is_clinic_member(clinic_id));

CREATE TABLE IF NOT EXISTS public.procedure_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  procedure_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity_used numeric NOT NULL DEFAULT 1,
  UNIQUE(procedure_id, product_id)
);
ALTER TABLE public.procedure_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant access procedure_products" ON public.procedure_products FOR ALL USING (is_clinic_member(clinic_id)) WITH CHECK (is_clinic_member(clinic_id));

-- Update product current_stock from movements
CREATE OR REPLACE FUNCTION public.apply_stock_movement()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.type = 'in' THEN
    UPDATE public.products SET current_stock = current_stock + NEW.quantity,
      last_purchase_price = COALESCE(NEW.unit_cost, last_purchase_price),
      last_purchase_qty = CASE WHEN NEW.unit_cost IS NOT NULL THEN NEW.quantity ELSE last_purchase_qty END,
      last_purchase_date = CASE WHEN NEW.unit_cost IS NOT NULL THEN NEW.created_at ELSE last_purchase_date END
      WHERE id = NEW.product_id;
  ELSIF NEW.type = 'out' THEN
    UPDATE public.products SET current_stock = current_stock - NEW.quantity WHERE id = NEW.product_id;
  ELSIF NEW.type = 'adjustment' THEN
    UPDATE public.products SET current_stock = NEW.quantity WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER stock_movements_apply AFTER INSERT ON public.stock_movements
FOR EACH ROW EXECUTE FUNCTION public.apply_stock_movement();

-- Auto-consume stock when appointment completes
CREATE OR REPLACE FUNCTION public.consume_stock_on_complete()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE r record;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') AND NEW.procedure_id IS NOT NULL THEN
    FOR r IN SELECT product_id, quantity_used FROM public.procedure_products WHERE procedure_id = NEW.procedure_id LOOP
      INSERT INTO public.stock_movements (clinic_id, product_id, type, quantity, reason, appointment_id)
      VALUES (NEW.clinic_id, r.product_id, 'out', r.quantity_used, 'Consumo automático em atendimento', NEW.id);
    END LOOP;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER appointments_consume_stock AFTER UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.consume_stock_on_complete();

-- ============ FORM TEMPLATES ============
CREATE TABLE IF NOT EXISTS public.lead_form_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid,
  name text NOT NULL,
  description text,
  kind lead_form_kind NOT NULL DEFAULT 'generic',
  fields jsonb NOT NULL DEFAULT '[]',
  cover_url text,
  is_global boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lead_form_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read global or own templates" ON public.lead_form_templates FOR SELECT USING (is_global = true OR (clinic_id IS NOT NULL AND is_clinic_member(clinic_id)));
CREATE POLICY "manage own templates" ON public.lead_form_templates FOR ALL USING (clinic_id IS NOT NULL AND is_clinic_member(clinic_id)) WITH CHECK (clinic_id IS NOT NULL AND is_clinic_member(clinic_id));

-- Seed global templates
INSERT INTO public.lead_form_templates (name, description, kind, is_global, fields) VALUES
('Avaliação inicial', 'Captação completa para primeira consulta', 'generic', true, '[
  {"id":"name","type":"text","label":"Nome completo","required":true},
  {"id":"phone","type":"phone","label":"WhatsApp","required":true},
  {"id":"email","type":"email","label":"E-mail","required":false},
  {"id":"birth","type":"date","label":"Data de nascimento"},
  {"id":"interest","type":"textarea","label":"O que você gostaria de tratar?","required":true},
  {"id":"how","type":"select","label":"Como nos conheceu?","options":["Instagram","Indicação","Google","Outros"]}
]'::jsonb),
('Agendamento rápido', 'Cliente escolhe data e horário direto', 'appointment', true, '[
  {"id":"name","type":"text","label":"Seu nome","required":true},
  {"id":"phone","type":"phone","label":"WhatsApp","required":true},
  {"id":"datetime","type":"datetime","label":"Quando deseja ser atendida?","required":true},
  {"id":"notes","type":"textarea","label":"Observações"}
]'::jsonb),
('Pré-procedimento', 'Anamnese antes do atendimento', 'procedure', true, '[
  {"id":"title","type":"heading","label":"Antes do seu procedimento"},
  {"id":"name","type":"text","label":"Nome completo","required":true},
  {"id":"phone","type":"phone","label":"WhatsApp","required":true},
  {"id":"allergies","type":"textarea","label":"Possui alguma alergia?"},
  {"id":"medications","type":"textarea","label":"Medicações em uso"},
  {"id":"pregnant","type":"radio","label":"Está grávida?","options":["Sim","Não","Não se aplica"]},
  {"id":"accept","type":"acceptance","label":"Li e concordo com as orientações","required":true}
]'::jsonb),
('Catálogo de produtos', 'Cliente escolhe produto de interesse', 'product', true, '[
  {"id":"name","type":"text","label":"Nome","required":true},
  {"id":"phone","type":"phone","label":"WhatsApp","required":true},
  {"id":"product","type":"select","label":"Qual produto te interessa?","options":["Skincare","Suplementos","Cosméticos"]},
  {"id":"qty","type":"number","label":"Quantidade desejada"}
]'::jsonb),
('Pós-atendimento (NPS)', 'Avaliação do atendimento', 'generic', true, '[
  {"id":"name","type":"text","label":"Nome","required":true},
  {"id":"rating","type":"rating","label":"Como avalia o atendimento?","required":true},
  {"id":"comments","type":"textarea","label":"Comentários e sugestões"},
  {"id":"recommend","type":"radio","label":"Indicaria para uma amiga?","options":["Com certeza","Talvez","Não"]}
]'::jsonb);

-- ============ FINANCIAL ============
CREATE TABLE IF NOT EXISTS public.financial_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income','expense')),
  color text DEFAULT '#3B82F6',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant access financial_categories" ON public.financial_categories FOR ALL USING (is_clinic_member(clinic_id)) WITH CHECK (is_clinic_member(clinic_id));

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  category_id uuid,
  date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  paid boolean NOT NULL DEFAULT false,
  paid_at timestamptz,
  recurring boolean NOT NULL DEFAULT false,
  recurrence text CHECK (recurrence IN ('weekly','monthly','yearly')),
  installments_total int,
  installment_number int,
  parent_expense_id uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant access expenses" ON public.expenses FOR ALL USING (is_clinic_member(clinic_id)) WITH CHECK (is_clinic_member(clinic_id));

CREATE INDEX IF NOT EXISTS idx_expenses_clinic_date ON public.expenses(clinic_id, date);
CREATE INDEX IF NOT EXISTS idx_products_clinic ON public.products(clinic_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_clinic_product ON public.stock_movements(clinic_id, product_id);
CREATE INDEX IF NOT EXISTS idx_leads_clinic_stage ON public.leads(clinic_id, kanban_stage);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_starts ON public.appointments(clinic_id, starts_at);
