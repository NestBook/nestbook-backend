import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../infrastructures/redis/redis.service';
import { AvailabilityContext } from '../types/availability-context.type';

@Injectable()
export class RedisHoldStrategy {
    constructor(private readonly redis: RedisService) { }

    /*async getHeld(ctx: AvailabilityContext): Promise<number> {
      const keys = await this.redis.redis.keys('booking:hold:*');
  
      let total = 0;
  
      for (const key of keys) {
        const data = await this.redis.get(key);
  
        if (!data) continue;
  
        const parsed = JSON.parse(data);
  
        if (parsed.roomTypeId === ctx.roomTypeId) {
          total += parsed.quantity;
        }
      }
  
      return total;
    }*/
    async getHeld(): Promise<number> {
        return 0;
    }
}