// src/presentation/hooks/useRealtimeRouters.ts

'use client';

import { useEffect } from 'react';
import { Router, RouterEntity } from '@/core/entities/Router';
import { SupabaseRouterRepository } from '@/infrastructure/supabase/RouterRepository';

const repository = new SupabaseRouterRepository();

export function useRealtimeRouters(
  onUpdate: (routers: Router[]) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = repository.subscribeToChanges((routers) => {
      const processedData = routers.map(r => new RouterEntity(r).getData());
      onUpdate(processedData);
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, onUpdate]);
}