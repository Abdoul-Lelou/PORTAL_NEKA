// src/presentation/components/routers/RouterCard.tsx

'use client';

import { Router } from '@/core/entities/Router';
import { Wifi, MapPin, Users, Edit3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RouterCardProps {
  router: Router;
  onEditAd: () => void;
}

export function RouterCard({ router, onEditAd }: RouterCardProps) {
  const isOnline = router.status === 'online';

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isOnline ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            <Wifi className={`w-5 h-5 ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {router.router_id}
            </h3>
            <div className="flex items-center gap-1 text-sm text-zinc-500 mt-1">
              <MapPin className="w-3 h-3" />
              <span>{router.location}</span>
            </div>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            isOnline
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {isOnline ? 'En ligne' : 'Hors ligne'}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">Clients connectés</span>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-zinc-900 dark:text-white">
              {router.client_count}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">Dernière activité</span>
          <span className="text-zinc-900 dark:text-white font-medium">
            {formatDistanceToNow(new Date(router.last_seen), {
              addSuffix: true,
              locale: fr,
            })}
          </span>
        </div>

        {router.ad_url && (
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">URL Publicité</p>
            <p className="text-sm text-blue-600 dark:text-blue-400 truncate">
              {router.ad_url}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onEditAd}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors"
      >
        <Edit3 className="w-4 h-4" />
        <span className="text-sm font-medium">Modifier la publicité</span>
      </button>
    </div>
  );
}