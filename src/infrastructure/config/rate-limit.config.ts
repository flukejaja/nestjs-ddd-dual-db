export interface RateLimitConfig {
  points: number;
  duration: number;
  blockDuration: number;
}

export const getRateLimitConfig = (userType: string): RateLimitConfig => {
  switch (userType) {
    case 'premium':
      return { points: 100, duration: 60, blockDuration: 0 };
    case 'basic':
      return { points: 30, duration: 60, blockDuration: 300 };
    default:
      return { points: 10, duration: 60, blockDuration: 600 };
  }
};
