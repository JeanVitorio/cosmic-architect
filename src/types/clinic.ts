// Tipos de domínio para a Lumière (SaaS para clínicas de estética)

export type AppointmentStatus = "scheduled" | "confirmed" | "done" | "canceled" | "no_show";
export type LeadStage = "new" | "contacted" | "scheduled" | "showed" | "converted" | "lost";
export type FinanceKind = "income" | "expense";
export type FinanceFrequency = "once" | "monthly" | "yearly";

export interface ClinicClient {
  id: string;
  name: string;
  email?: string;
  phone: string;
  birthdate?: string; // ISO
  cpf?: string;
  address?: string;
  instagram?: string;
  photo_url?: string;
  tags: string[]; // VIP, Fidelidade, Indicação...
  // Saúde
  allergies: { name: string; severity: "low" | "medium" | "high" }[];
  medications: string[];
  conditions: string[]; // diabetes, hipertensão, gestante, etc.
  surgeries: { name: string; year: number }[];
  notes?: string;
  created_at: string;
  first_visit_at?: string;
}

export interface Procedure {
  id: string;
  name: string;
  category: string; // Facial, Corporal, Capilar...
  description: string;
  duration_min: number;
  price?: number; // undefined = sob consulta
  image_url?: string;
  contraindications?: string[];
  // Produtos consumidos por sessão (privado)
  consumables: { product_id: string; qty: number }[];
  form_id?: string; // formulário associado
  active: boolean;
  created_at: string;
}

export interface InventoryProduct {
  id: string;
  name: string;
  brand?: string;
  unit: string; // ml, g, un
  qty_on_hand: number;
  qty_min: number;
  last_purchase?: { date: string; qty: number; total_cost: number };
  avg_unit_cost: number;
  expires_at?: string;
  category?: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  procedure_id: string;
  start_at: string; // ISO
  duration_min: number;
  status: AppointmentStatus;
  notes?: string;
  price_charged?: number;
  professional_id?: string;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  procedure_interest_id?: string;
  form_id: string;
  responses: Record<string, unknown>;
  stage: LeadStage;
  source?: string;
  notes: { id: string; body: string; created_at: string }[];
  created_at: string;
  stage_changed_at: string;
}

export interface FinanceEntry {
  id: string;
  kind: FinanceKind;
  category: string;
  description: string;
  amount: number;
  date: string; // primeiro vencimento
  frequency: FinanceFrequency;
  installments?: { total: number; paid: number; per_installment: number };
  appointment_id?: string;
  paid: boolean;
}

export type FormFieldType =
  | "short_text" | "long_text" | "email" | "phone" | "number"
  | "select" | "multi_select" | "radio" | "checkbox"
  | "date" | "time" | "scheduler" | "image_upload" | "file_upload"
  | "signature" | "scale" | "cpf" | "address" | "terms"
  | "image_block" | "divider" | "info_block";

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // para select/radio/multi
  min?: number; max?: number;
  // condicional
  show_if?: { field_id: string; equals: string };
}

export interface ClinicForm {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  procedure_id?: string;
  theme?: { color: string; cover_url?: string };
  published: boolean;
  created_at: string;
}

export interface Procedurelog {
  id: string;
  client_id: string;
  procedure_id: string;
  appointment_id?: string;
  date: string;
  evolution: string;
  photos_before: string[];
  photos_after: string[];
  prescriptions?: string;
  professional_id?: string;
}

export interface ClinicSettings {
  name: string;
  description: string;
  slogan?: string;
  logo_url?: string;
  address: string;
  phone: string;
  email: string;
  instagram?: string;
  whatsapp_owner: string;
  whatsapp_attendant?: string;
  business_hours: { day: string; open: string; close: string; closed?: boolean }[];
  catalog_theme: { primary: string; font: string };
  // slug derivado
  slug: string;
}
