export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
}

export const CIRCUIT_BREAKER_OPTIONS = 'CIRCUIT_BREAKER_OPTIONS';

export const defaultCircuitBreakerOptions: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeout: 60000,
};
