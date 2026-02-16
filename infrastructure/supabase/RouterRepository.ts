// src/infrastructure/supabase/RouterRepository.ts

import { supabase } from './client';
import { IRouterRepository } from '@/core/repositories/IRouterRepository';
import { Router } from '@/core/entities/Router';

export class SupabaseRouterRepository implements IRouterRepository {
  async getAll(): Promise<Router[]> {
    const { data, error } = await supabase
      .from('router_management')
      .select('*')
      .order('location', { ascending: true });

    if (error) throw error;
    return data as Router[];
  }

  async getById(id: string): Promise<Router | null> {
    const { data, error } = await supabase
      .from('router_management')
      .select('*')
      .eq('router_id', id)
      .single();

    if (error) throw error;
    return data as Router;
  }

  async updateAdUrl(routerId: string, adUrl: string): Promise<Router> {
    const { data, error } = await supabase
      .from('router_management')
      .update({ ad_url: adUrl })
      .eq('router_id', routerId)
      .select()
      .single();

    if (error) throw error;
    return data as Router;
  }

  subscribeToChanges(callback: (routers: Router[]) => void): () => void {
    const channel = supabase
      .channel('router_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'router_management'
        },
        async () => {
          const routers = await this.getAll();
          callback(routers);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}