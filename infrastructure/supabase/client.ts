// src/infrastructure/supabase/client.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      router_management: {
        Row: {
          router_id: string;
          location: string;
          status: string;
          last_seen: string;
          client_count: number;
          metadata: unknown;
          ad_url: string | null;
        };
      };
      wifi_users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          router_origin: string;
          connected_at: string;
          created_at: string;
        };
      };
    };
  };
};