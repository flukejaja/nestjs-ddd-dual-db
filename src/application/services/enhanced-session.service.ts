import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { CacheService } from '@/infrastructure/services/cache.service';

type SessionData = {
  userId: string;
  metadata: any;
  createdAt: Date;
  lastActive: Date;
};

@Injectable()
export class EnhancedSessionService {
  constructor(private readonly cacheService: CacheService) {}

  async createSession(userId: string, metadata: any): Promise<string> {
    const sessionId = this.generateSecureSessionId();
    const sessionData = {
      userId,
      metadata,
      createdAt: new Date(),
      lastActive: new Date(),
      deviceInfo: metadata.userAgent,
      ipAddress: metadata.ipAddress,
    };

    await this.cacheService.set(`session:${sessionId}`, sessionData, 3600); // 1 hour
    return sessionId;
  }

  private generateSecureSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const session = await this.cacheService.get(`session:${sessionId}`);
    if (!session) return false;

    // Update last active timestamp
    (session as SessionData).lastActive = new Date();
    await this.cacheService.set(`session:${sessionId}`, session, 3600);

    return true;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.cacheService.delete(`session:${sessionId}`);
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const session = await this.cacheService.get(`session:${sessionId}`);
    return session ? (session as SessionData) : null;
  }
}
