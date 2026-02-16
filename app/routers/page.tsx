// src/app/routers/page.tsx

'use client';

import { useState } from 'react';
import { useRouters } from '@/presentation/hooks/useRouters';
import { useRealtimeRouters } from '@/presentation/hooks/useRealtimeRouters';
import { RouterCard } from '@/presentation/components/routers/RouterCard';
import { AdModal } from '@/presentation/components/routers/AdModal';
import { Router } from '@/core/entities/Router';
import { RefreshCw, Search } from 'lucide-react';

export default function RoutersPage() {
  const { routers, loading, updateAdUrl, refresh } = useRouters();
  const [selectedRouter, setSelectedRouter] = useState<Router | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Mise à jour temps réel
  useRealtimeRouters((_updatedRouters) => {
    // Automatiquement mis à jour
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredRouters = routers.filter(
    (router) =>
      router.router_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      router.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Gestion des routeurs
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            {routers.length} routeurs • {routers.filter((r) => r.status === 'online').length} en ligne
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Rechercher un routeur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRouters.map((router) => (
          <RouterCard
            key={router.router_id}
            router={router}
            onEditAd={() => setSelectedRouter(router)}
          />
        ))}
      </div>

      {selectedRouter && (
        <AdModal
          router={selectedRouter}
          isOpen={!!selectedRouter}
          onClose={() => setSelectedRouter(null)}
          onSave={updateAdUrl}
        />
      )}
    </div>
  );
}