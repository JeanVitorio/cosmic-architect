export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          client_id: string
          clinic_id: string
          confirmed: boolean
          created_at: string
          ends_at: string
          id: string
          notes: string | null
          procedure_id: string | null
          professional_id: string
          reminder_sent: boolean
          room_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
        }
        Insert: {
          client_id: string
          clinic_id: string
          confirmed?: boolean
          created_at?: string
          ends_at: string
          id?: string
          notes?: string | null
          procedure_id?: string | null
          professional_id: string
          reminder_sent?: boolean
          room_id?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
        }
        Update: {
          client_id?: string
          clinic_id?: string
          confirmed?: boolean
          created_at?: string
          ends_at?: string
          id?: string
          notes?: string | null
          procedure_id?: string | null
          professional_id?: string
          reminder_sent?: boolean
          room_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hours: {
        Row: {
          clinic_id: string
          closes_at: string
          id: string
          opens_at: string
          weekday: number
        }
        Insert: {
          clinic_id: string
          closes_at: string
          id?: string
          opens_at: string
          weekday: number
        }
        Update: {
          clinic_id?: string
          closes_at?: string
          id?: string
          opens_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "business_hours_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      client_anamnesis: {
        Row: {
          client_id: string
          clinic_id: string
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          clinic_id: string
          data?: Json
          id?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          clinic_id?: string
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_anamnesis_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_anamnesis_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      client_photos: {
        Row: {
          client_id: string
          clinic_id: string
          id: string
          kind: Database["public"]["Enums"]["photo_kind"]
          notes: string | null
          procedure_id: string | null
          taken_at: string
          url: string
        }
        Insert: {
          client_id: string
          clinic_id: string
          id?: string
          kind?: Database["public"]["Enums"]["photo_kind"]
          notes?: string | null
          procedure_id?: string | null
          taken_at?: string
          url: string
        }
        Update: {
          client_id?: string
          clinic_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["photo_kind"]
          notes?: string | null
          procedure_id?: string | null
          taken_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_photos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_photos_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          allergies: string[] | null
          avatar_url: string | null
          birth_date: string | null
          chronic_conditions: string[] | null
          clinic_id: string
          cpf: string | null
          created_at: string
          email: string | null
          emergency_contact: string | null
          full_name: string
          gender: string | null
          how_found_us: string | null
          id: string
          medications: string[] | null
          notes: string | null
          phone: string | null
          previous_procedures: Json | null
          skin_type: string | null
          surgeries: Json | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: string[] | null
          avatar_url?: string | null
          birth_date?: string | null
          chronic_conditions?: string[] | null
          clinic_id: string
          cpf?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          full_name: string
          gender?: string | null
          how_found_us?: string | null
          id?: string
          medications?: string[] | null
          notes?: string | null
          phone?: string | null
          previous_procedures?: Json | null
          skin_type?: string | null
          surgeries?: Json | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: string[] | null
          avatar_url?: string | null
          birth_date?: string | null
          chronic_conditions?: string[] | null
          clinic_id?: string
          cpf?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          full_name?: string
          gender?: string | null
          how_found_us?: string | null
          id?: string
          medications?: string[] | null
          notes?: string | null
          phone?: string | null
          previous_procedures?: Json | null
          skin_type?: string | null
          surgeries?: Json | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_members: {
        Row: {
          active: boolean
          clinic_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          active?: boolean
          clinic_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          active?: boolean
          clinic_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_members_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          catalog_slug: string | null
          city: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          name: string
          phone: string | null
          plan: string
          primary_color: string | null
          slug: string
          state: string | null
          status: Database["public"]["Enums"]["clinic_status"]
          updated_at: string
          whatsapp_attendant: string | null
          whatsapp_owner: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          catalog_slug?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          plan?: string
          primary_color?: string | null
          slug: string
          state?: string | null
          status?: Database["public"]["Enums"]["clinic_status"]
          updated_at?: string
          whatsapp_attendant?: string | null
          whatsapp_owner?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          catalog_slug?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          plan?: string
          primary_color?: string | null
          slug?: string
          state?: string | null
          status?: Database["public"]["Enums"]["clinic_status"]
          updated_at?: string
          whatsapp_attendant?: string | null
          whatsapp_owner?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category_id: string | null
          clinic_id: string
          created_at: string
          date: string
          description: string
          due_date: string | null
          id: string
          installment_number: number | null
          installments_total: number | null
          notes: string | null
          paid: boolean
          paid_at: string | null
          parent_expense_id: string | null
          recurrence: string | null
          recurring: boolean
        }
        Insert: {
          amount: number
          category_id?: string | null
          clinic_id: string
          created_at?: string
          date?: string
          description: string
          due_date?: string | null
          id?: string
          installment_number?: number | null
          installments_total?: number | null
          notes?: string | null
          paid?: boolean
          paid_at?: string | null
          parent_expense_id?: string | null
          recurrence?: string | null
          recurring?: boolean
        }
        Update: {
          amount?: number
          category_id?: string | null
          clinic_id?: string
          created_at?: string
          date?: string
          description?: string
          due_date?: string | null
          id?: string
          installment_number?: number | null
          installments_total?: number | null
          notes?: string | null
          paid?: boolean
          paid_at?: string | null
          parent_expense_id?: string | null
          recurrence?: string | null
          recurring?: boolean
        }
        Relationships: []
      }
      financial_categories: {
        Row: {
          clinic_id: string
          color: string | null
          created_at: string
          id: string
          name: string
          type: string
        }
        Insert: {
          clinic_id: string
          color?: string | null
          created_at?: string
          id?: string
          name: string
          type: string
        }
        Update: {
          clinic_id?: string
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      lead_form_templates: {
        Row: {
          clinic_id: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          fields: Json
          id: string
          is_global: boolean
          kind: Database["public"]["Enums"]["lead_form_kind"]
          name: string
        }
        Insert: {
          clinic_id?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          is_global?: boolean
          kind?: Database["public"]["Enums"]["lead_form_kind"]
          name: string
        }
        Update: {
          clinic_id?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          is_global?: boolean
          kind?: Database["public"]["Enums"]["lead_form_kind"]
          name?: string
        }
        Relationships: []
      }
      lead_forms: {
        Row: {
          active: boolean
          clinic_id: string
          cover_url: string | null
          created_at: string
          description: string | null
          fields: Json
          headline: string
          id: string
          kind: Database["public"]["Enums"]["lead_form_kind"]
          procedure_id: string | null
          redirect_url: string | null
          slug: string
          subheadline: string | null
          success_message: string | null
          theme_color: string | null
        }
        Insert: {
          active?: boolean
          clinic_id: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          fields?: Json
          headline: string
          id?: string
          kind?: Database["public"]["Enums"]["lead_form_kind"]
          procedure_id?: string | null
          redirect_url?: string | null
          slug: string
          subheadline?: string | null
          success_message?: string | null
          theme_color?: string | null
        }
        Update: {
          active?: boolean
          clinic_id?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          fields?: Json
          headline?: string
          id?: string
          kind?: Database["public"]["Enums"]["lead_form_kind"]
          procedure_id?: string | null
          redirect_url?: string | null
          slug?: string
          subheadline?: string | null
          success_message?: string | null
          theme_color?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_forms_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_forms_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          clinic_id: string
          created_at: string
          email: string | null
          form_data: Json | null
          id: string
          kanban_stage: string
          lead_form_id: string | null
          message: string | null
          name: string
          phone: string | null
          procedure_id: string | null
          scheduled_appointment_id: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
        }
        Insert: {
          assigned_to?: string | null
          clinic_id: string
          created_at?: string
          email?: string | null
          form_data?: Json | null
          id?: string
          kanban_stage?: string
          lead_form_id?: string | null
          message?: string | null
          name: string
          phone?: string | null
          procedure_id?: string | null
          scheduled_appointment_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
        }
        Update: {
          assigned_to?: string | null
          clinic_id?: string
          created_at?: string
          email?: string | null
          form_data?: Json | null
          id?: string
          kanban_stage?: string
          lead_form_id?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          procedure_id?: string | null
          scheduled_appointment_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
        }
        Relationships: [
          {
            foreignKeyName: "leads_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_lead_form_id_fkey"
            columns: ["lead_form_id"]
            isOneToOne: false
            referencedRelation: "lead_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          client_id: string
          clinic_id: string
          created_at: string
          id: string
          price: number
          procedure_id: string
          status: Database["public"]["Enums"]["package_status"]
          total_sessions: number
          used_sessions: number
        }
        Insert: {
          client_id: string
          clinic_id: string
          created_at?: string
          id?: string
          price?: number
          procedure_id: string
          status?: Database["public"]["Enums"]["package_status"]
          total_sessions: number
          used_sessions?: number
        }
        Update: {
          client_id?: string
          clinic_id?: string
          created_at?: string
          id?: string
          price?: number
          procedure_id?: string
          status?: Database["public"]["Enums"]["package_status"]
          total_sessions?: number
          used_sessions?: number
        }
        Relationships: [
          {
            foreignKeyName: "packages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          client_id: string | null
          clinic_id: string
          created_at: string
          id: string
          method: string | null
          notes: string | null
          package_id: string | null
          paid_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          client_id?: string | null
          clinic_id: string
          created_at?: string
          id?: string
          method?: string | null
          notes?: string | null
          package_id?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          client_id?: string | null
          clinic_id?: string
          created_at?: string
          id?: string
          method?: string | null
          notes?: string | null
          package_id?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      procedure_products: {
        Row: {
          clinic_id: string
          id: string
          procedure_id: string
          product_id: string
          quantity_used: number
        }
        Insert: {
          clinic_id: string
          id?: string
          procedure_id: string
          product_id: string
          quantity_used?: number
        }
        Update: {
          clinic_id?: string
          id?: string
          procedure_id?: string
          product_id?: string
          quantity_used?: number
        }
        Relationships: []
      }
      procedures: {
        Row: {
          active: boolean
          category: string | null
          clinic_id: string
          cover_url: string | null
          created_at: string
          description: string | null
          duration_min: number
          id: string
          images: string[] | null
          instructions_post: string | null
          instructions_pre: string | null
          lead_form_id: string | null
          name: string
          photos: string[] | null
          price: number
          show_price: boolean | null
        }
        Insert: {
          active?: boolean
          category?: string | null
          clinic_id: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_min?: number
          id?: string
          images?: string[] | null
          instructions_post?: string | null
          instructions_pre?: string | null
          lead_form_id?: string | null
          name: string
          photos?: string[] | null
          price?: number
          show_price?: boolean | null
        }
        Update: {
          active?: boolean
          category?: string | null
          clinic_id?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_min?: number
          id?: string
          images?: string[] | null
          instructions_post?: string | null
          instructions_pre?: string | null
          lead_form_id?: string | null
          name?: string
          photos?: string[] | null
          price?: number
          show_price?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "procedures_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          brand: string | null
          category: string | null
          clinic_id: string
          created_at: string
          current_stock: number
          id: string
          image_url: string | null
          last_purchase_date: string | null
          last_purchase_price: number | null
          last_purchase_qty: number | null
          min_stock: number
          name: string
          notes: string | null
          sku: string | null
          supplier: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          brand?: string | null
          category?: string | null
          clinic_id: string
          created_at?: string
          current_stock?: number
          id?: string
          image_url?: string | null
          last_purchase_date?: string | null
          last_purchase_price?: number | null
          last_purchase_qty?: number | null
          min_stock?: number
          name: string
          notes?: string | null
          sku?: string | null
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          brand?: string | null
          category?: string | null
          clinic_id?: string
          created_at?: string
          current_stock?: number
          id?: string
          image_url?: string | null
          last_purchase_date?: string | null
          last_purchase_price?: number | null
          last_purchase_qty?: number | null
          min_stock?: number
          name?: string
          notes?: string | null
          sku?: string | null
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      professionals: {
        Row: {
          active: boolean
          clinic_id: string
          color: string | null
          created_at: string
          id: string
          name: string
          specialties: string[] | null
          user_id: string | null
        }
        Insert: {
          active?: boolean
          clinic_id: string
          color?: string | null
          created_at?: string
          id?: string
          name: string
          specialties?: string[] | null
          user_id?: string | null
        }
        Update: {
          active?: boolean
          clinic_id?: string
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          specialties?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          active: boolean
          clinic_id: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          clinic_id: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          clinic_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_blocks: {
        Row: {
          clinic_id: string
          ends_at: string
          id: string
          professional_id: string | null
          reason: string | null
          room_id: string | null
          starts_at: string
        }
        Insert: {
          clinic_id: string
          ends_at: string
          id?: string
          professional_id?: string | null
          reason?: string | null
          room_id?: string | null
          starts_at: string
        }
        Update: {
          clinic_id?: string
          ends_at?: string
          id?: string
          professional_id?: string | null
          reason?: string | null
          room_id?: string | null
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_blocks_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_blocks_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_blocks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          appointment_id: string | null
          clinic_id: string
          created_at: string
          created_by: string | null
          id: string
          product_id: string
          quantity: number
          reason: string | null
          type: string
          unit_cost: number | null
        }
        Insert: {
          appointment_id?: string | null
          clinic_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          product_id: string
          quantity: number
          reason?: string | null
          type: string
          unit_cost?: number | null
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          product_id?: string
          quantity?: number
          reason?: string | null
          type?: string
          unit_cost?: number | null
        }
        Relationships: []
      }
      treatment_records: {
        Row: {
          client_id: string
          clinic_id: string
          id: string
          notes: string | null
          performed_at: string
          photos: string[] | null
          procedure_id: string | null
          professional_id: string | null
        }
        Insert: {
          client_id: string
          clinic_id: string
          id?: string
          notes?: string | null
          performed_at?: string
          photos?: string[] | null
          procedure_id?: string | null
          professional_id?: string | null
        }
        Update: {
          client_id?: string
          clinic_id?: string
          id?: string
          notes?: string | null
          performed_at?: string
          photos?: string[] | null
          procedure_id?: string | null
          professional_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_records_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_records_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_records_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_records_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_clinic_role: {
        Args: {
          _clinic_id: string
          _roles: Database["public"]["Enums"]["app_role"][]
        }
        Returns: boolean
      }
      is_clinic_member: { Args: { _clinic_id: string }; Returns: boolean }
      user_clinics: { Args: never; Returns: string[] }
    }
    Enums: {
      app_role: "owner" | "admin" | "reception" | "professional" | "finance"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "done"
        | "no_show"
        | "canceled"
      clinic_status: "pending" | "active" | "suspended"
      lead_form_kind:
        | "procedure"
        | "product"
        | "appointment"
        | "generic"
        | "catalog"
      lead_status:
        | "new"
        | "contacted"
        | "scheduled"
        | "won"
        | "lost"
        | "converted"
      package_status: "active" | "completed" | "canceled"
      payment_status: "pending" | "paid" | "refunded" | "canceled"
      photo_kind: "before" | "after" | "evolution"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "reception", "professional", "finance"],
      appointment_status: [
        "scheduled",
        "confirmed",
        "done",
        "no_show",
        "canceled",
      ],
      clinic_status: ["pending", "active", "suspended"],
      lead_form_kind: [
        "procedure",
        "product",
        "appointment",
        "generic",
        "catalog",
      ],
      lead_status: [
        "new",
        "contacted",
        "scheduled",
        "won",
        "lost",
        "converted",
      ],
      package_status: ["active", "completed", "canceled"],
      payment_status: ["pending", "paid", "refunded", "canceled"],
      photo_kind: ["before", "after", "evolution"],
    },
  },
} as const
