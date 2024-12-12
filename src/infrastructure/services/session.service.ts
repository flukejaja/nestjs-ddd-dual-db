import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { SessionGateway } from '../gateways/session.gateway';
import { SessionConfig, SESSION_CONFIG } from '../config/session.config';

interface SessionData {
  id: string;
  userId: string;
  createdAt: Date;
  lastAccessed: Date;
  [key: string]: any;
}

@Injectable()
export class SessionService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private sessionGateway: SessionGateway,
    @Inject(SESSION_CONFIG) private config: SessionConfig,
  ) {}

  async createSession(userId: string, data: any = {}): Promise<string> {
    const sessionId = uuidv4();
    const sessionData = {
      id: sessionId,
      userId,
      createdAt: new Date(),
      lastAccessed: new Date(),
      ...data,
    };

    await this.cacheManager.set(
      this.getSessionKey(sessionId),
      sessionData,
      this.config.ttl,
    );

    this.sessionGateway.notifyNewLogin(userId);
    return sessionId;
  }

  async getSession(sessionId: string): Promise<any | null> {
    const session = await this.cacheManager.get(this.getSessionKey(sessionId));
    if (session) {
      await this.updateLastAccessed(sessionId);
    }
    return session;
  }

  async updateSession(sessionId: string, data: any): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      const updatedSession = {
        ...session,
        ...data,
        lastAccessed: new Date(),
      };
      await this.cacheManager.set(
        this.getSessionKey(sessionId),
        updatedSession,
        this.config.ttl,
      );
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.cacheManager.del(this.getSessionKey(sessionId));
  }

  async getUserSessions(userId: string): Promise<string[]> {
    const sessions = await this.cacheManager.store.keys(
      `${this.config.prefix}*`,
    );
    const userSessions = [];

    for (const key of sessions) {
      const session = (await this.cacheManager.get(key)) as SessionData;
      if (session?.userId === userId) {
        userSessions.push(session.id);
      }
    }

    return userSessions;
  }

  async handleExpiredSession(userId: string) {
    this.sessionGateway.notifySessionExpired(userId);
  }

  private getSessionKey(sessionId: string): string {
    return `${this.config.prefix}${sessionId}`;
  }

  private async updateLastAccessed(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.lastAccessed = new Date();
      await this.cacheManager.set(
        this.getSessionKey(sessionId),
        session,
        this.config.ttl,
      );
    }
  }
}
