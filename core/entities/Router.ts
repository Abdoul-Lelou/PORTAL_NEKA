// src/core/entities/Router.ts

export interface Router {
  router_id: string;
  location: string;
  status: 'online' | 'offline';
  last_seen: string;
  client_count: number;
  metadata?: Record<string, unknown>;
  ad_url?: string;
}

export class RouterEntity {
  constructor(private router: Router) { }

  isOnline(): boolean {
    const lastSeen = new Date(this.router.last_seen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / 1000 / 60;
    return diffMinutes <= 2;
  }

  getStatus(): 'online' | 'offline' {
    return this.isOnline() ? 'online' : 'offline';
  }

  getData(): Router {
    return {
      ...this.router,
      status: this.getStatus()
    };
  }
}