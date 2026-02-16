// src/core/repositories/IUserRepository.ts

import { WifiUser } from '../entities/WifiUser';

export interface IUserRepository {
  getRecentUsers(limit?: number): Promise<WifiUser[]>;
  getUsersByRouter(routerId: string): Promise<WifiUser[]>;
  getTotalUserCount(): Promise<number>;
}