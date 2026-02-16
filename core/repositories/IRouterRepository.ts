// src/core/repositories/IRouterRepository.ts

import { Router } from '../entities/Router';

export interface IRouterRepository {
  getAll(): Promise<Router[]>;
  getById(id: string): Promise<Router | null>;
  updateAdUrl(routerId: string, adUrl: string): Promise<Router>;
  subscribeToChanges(callback: (routers: Router[]) => void): () => void;
}