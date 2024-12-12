export interface SessionConfig {
  ttl: number; // Time-to-live in seconds
  prefix: string;
  cleanupInterval: number; // Cleanup interval in seconds
}

export const SESSION_CONFIG = 'SESSION_CONFIG';

export const defaultSessionConfig: SessionConfig = {
  ttl: 4 * 60 * 60, // 4 hours
  prefix: 'session:',
  cleanupInterval: 15 * 60, // 15 minutes
};
