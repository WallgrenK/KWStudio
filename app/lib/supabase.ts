import { createClient } from "@supabase/supabase-js";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          org_number: string | null;
          name: string;
          city: string | null;
          municipality: string | null;
          county: string | null;
          industry_code: string | null;
          industry_label: string | null;
          phone: string | null;
          email: string | null;
          website_url: string | null;
          website_found: boolean;
          website_confidence: string;
          source: string;
          raw_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_number?: string | null;
          name: string;
          city?: string | null;
          municipality?: string | null;
          county?: string | null;
          industry_code?: string | null;
          industry_label?: string | null;
          phone?: string | null;
          email?: string | null;
          website_url?: string | null;
          website_found?: boolean;
          website_confidence?: string;
          source?: string;
          raw_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          company_id: string | null;
          status: string;
          priority: string;
          score: number;
          estimated_value: number | null;
          source: string;
          service_interest: string | null;
          next_action: string | null;
          notes: string | null;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          status?: string;
          priority?: string;
          score?: number;
          estimated_value?: number | null;
          source?: string;
          service_interest?: string | null;
          next_action?: string | null;
          notes?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: [];
      };
      website_audits: {
        Row: {
          id: string;
          company_id: string | null;
          lead_id: string | null;
          website_url: string | null;
          status_code: number | null;
          has_ssl: boolean | null;
          has_title: boolean | null;
          title: string | null;
          has_meta_description: boolean | null;
          meta_description: string | null;
          has_robots_txt: boolean | null;
          has_sitemap: boolean | null;
          performance_score: number | null;
          seo_score: number | null;
          accessibility_score: number | null;
          best_practices_score: number | null;
          audit_summary: string | null;
          raw_result: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          lead_id?: string | null;
          website_url?: string | null;
          status_code?: number | null;
          has_ssl?: boolean | null;
          has_title?: boolean | null;
          title?: string | null;
          has_meta_description?: boolean | null;
          meta_description?: string | null;
          has_robots_txt?: boolean | null;
          has_sitemap?: boolean | null;
          performance_score?: number | null;
          seo_score?: number | null;
          accessibility_score?: number | null;
          best_practices_score?: number | null;
          audit_summary?: string | null;
          raw_result?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["website_audits"]["Insert"]>;
        Relationships: [];
      };
      lead_events: {
        Row: {
          id: string;
          lead_id: string | null;
          type: string;
          message: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id?: string | null;
          type: string;
          message: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lead_events"]["Insert"]>;
        Relationships: [];
      };
      scb_import_runs: {
        Row: {
          id: string;
          status: string;
          filters: Json;
          imported_count: number;
          created_leads_count: number;
          websites_found_count: number;
          error_message: string | null;
          started_at: string;
          finished_at: string | null;
        };
        Insert: {
          id?: string;
          status?: string;
          filters?: Json;
          imported_count?: number;
          created_leads_count?: number;
          websites_found_count?: number;
          error_message?: string | null;
          started_at?: string;
          finished_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["scb_import_runs"]["Insert"]>;
        Relationships: [];
      };
      enquiries: {
        Row: {
          id: string;
          name: string;
          company: string | null;
          email: string;
          budget: string | null;
          message: string;
          recipient: string | null;
          subject: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          company?: string | null;
          email: string;
          budget?: string | null;
          message: string;
          recipient?: string | null;
          subject?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["enquiries"]["Insert"]>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category: string | null;
          description: string | null;
          tags: string[] | null;
          image_url: string | null;
          featured: boolean | null;
          published: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          category?: string | null;
          description?: string | null;
          tags?: string[] | null;
          image_url?: string | null;
          featured?: boolean | null;
          published?: boolean | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string | null;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.error(
    "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.",
  );
}

const configuredSupabaseUrl = supabaseUrl ?? "https://supabase-not-configured.invalid";
const configuredSupabaseAnonKey = supabaseAnonKey ?? "supabase-not-configured";

export const supabase = createClient<Database>(
  configuredSupabaseUrl,
  configuredSupabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: "public",
    },
  },
);
