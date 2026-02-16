// src/infrastructure/supabase/UserRepository.ts

import { supabase } from './client';
import { IUserRepository } from '@/core/repositories/IUserRepository';
import { WifiUser } from '@/core/entities/WifiUser';

export class SupabaseUserRepository implements IUserRepository {
  async getRecentUsers(limit: number = 50): Promise<WifiUser[]> {
    const { data, error } = await supabase
      .from('wifi_users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as WifiUser[];
  }

  async getUsersByRouter(routerId: string): Promise<WifiUser[]> {
    const { data, error } = await supabase
      .from('wifi_users')
      .select('*')
      .eq('router_origin', routerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as WifiUser[];
  }

  async getTotalUserCount(): Promise<number> {
    const { count, error } = await supabase
      .from('wifi_users')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }
}