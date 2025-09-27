import { matchingApi } from '@/lib/api/matching.api';
import type { RizzScore } from '@/types/matching.types';

export class RizzScoreService {
   private static instance: RizzScoreService;
   private cache: Map<string, RizzScore> = new Map();
   private cacheTimeout = 5 * 60 * 1000; // 5 minutes

   static getInstance(): RizzScoreService {
      if (!RizzScoreService.instance) {
         RizzScoreService.instance = new RizzScoreService();
      }
      return RizzScoreService.instance;
   }

   async getRizzScore(userId?: string): Promise<RizzScore> {
      const cacheKey = userId || 'current-user';
      const cached = this.cache.get(cacheKey);

      if (cached && this.isCacheValid(cached)) {
         return cached;
      }

      try {
         const response = await matchingApi.getRizzScore();
         const rizzScore = response.rizzScore;

         this.cache.set(cacheKey, rizzScore);
         return rizzScore;
      } catch (error) {
         console.error('Failed to fetch Rizz Score:', error);
         throw new Error('Unable to load Rizz Score data');
      }
   }

   async recalculateRizzScore(): Promise<RizzScore> {
      try {
         const response = await matchingApi.recalculateRizzScore();
         const rizzScore = response.rizzScore;

         // Update cache
         this.cache.set('current-user', rizzScore);
         return rizzScore;
      } catch (error) {
         console.error('Failed to recalculate Rizz Score:', error);
         throw new Error('Unable to recalculate Rizz Score');
      }
   }

   private isCacheValid(rizzScore: RizzScore): boolean {
      const now = Date.now();
      const lastCalculated = new Date(rizzScore.lastCalculated).getTime();
      return (now - lastCalculated) < this.cacheTimeout;
   }

   clearCache(): void {
      this.cache.clear();
   }
}

export const rizzScoreService = RizzScoreService.getInstance();
