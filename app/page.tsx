// src/app/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouters } from '@/presentation/hooks/useRouters';
import { useRealtimeRouters } from '@/presentation/hooks/useRealtimeRouters';
import { StatsCard } from '@/presentation/components/dashboard/StatsCard';
import { Wifi, Users, TrendingUp, Activity } from 'lucide-react';
import { SupabaseUserRepository } from '@/infrastructure/supabase/UserRepository';

const userRepository = new SupabaseUserRepository();

export default function DashboardPage() {
  const { routers, loading } = useRouters();
  const [totalUsers, setTotalUsers] = useState(0);

  // Mise à jour temps réel
  useRealtimeRouters((_updatedRouters) => {
    // Les routeurs sont mis à jour automatiquement
  });

  useEffect(() => {
    userRepository.getTotalUserCount().then(setTotalUsers);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const onlineRouters = routers.filter((r) => r.status === 'online').length;
  const totalClients = routers.reduce((sum, r) => sum + r.client_count, 0);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Vue d&apos;ensemble
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Statistiques en temps réel de votre réseau NEKA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Routeurs en ligne"
          value={onlineRouters}
          icon={Wifi}
          description={`${onlineRouters}/${routers.length} actifs`}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Clients connectés"
          value={totalClients}
          icon={Activity}
          description="Connexions actives"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Utilisateurs total"
          value={totalUsers}
          icon={Users}
          description="Depuis le début"
          trend={{ value: 23, isPositive: true }}
        />
        <StatsCard
          title="Taux d'activité"
          value={`${Math.round((onlineRouters / routers.length) * 100)}%`}
          icon={TrendingUp}
          description="Routeurs actifs"
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
          Activité récente
        </h2>
        <div className="space-y-3">
          {routers.slice(0, 5).map((router) => (
            <div
              key={router.router_id}
              className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${router.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {router.router_id}
                  </p>
                  <p className="text-sm text-zinc-500">{router.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {router.client_count} clients
                </p>
                <p className="text-xs text-zinc-500">
                  {router.status === 'online' ? 'En ligne' : 'Hors ligne'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}