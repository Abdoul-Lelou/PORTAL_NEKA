// src/presentation/hooks/useRouters.ts

'use client';

import { useState, useEffect } from 'react';
import { Router, RouterEntity } from '@/core/entities/Router';
import { SupabaseRouterRepository } from '@/infrastructure/supabase/RouterRepository';

const repository = new SupabaseRouterRepository();

export function useRouters() {
  const [routers, setRouters] = useState<Router[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRouters();
  }, []);

  const loadRouters = async () => {
    try {
      setLoading(true);
      const data = await repository.getAll();
      const processedData = data.map(r => new RouterEntity(r).getData());
      setRouters(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const updateAdUrl = async (routerId: string, adUrl: string) => {
    try {
      await repository.updateAdUrl(routerId, adUrl);
      await loadRouters();
    } catch (err) {
      throw err;
    }
  };

  return { routers, loading, error, updateAdUrl, refresh: loadRouters };
}