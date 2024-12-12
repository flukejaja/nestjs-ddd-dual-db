import { AuthThrottlerGuard } from '@/infrastructure/guards/auth-throttler.guard';
import { ThrottlerStorageService } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

class TestableAuthThrottlerGuard extends AuthThrottlerGuard {
  public async testShouldSkip(context: ExecutionContext): Promise<boolean> {
    return this.shouldSkip(context);
  }
}

describe('AuthThrottlerGuard', () => {
  let guard: TestableAuthThrottlerGuard;

  beforeEach(() => {
    const options = {
      ttl: 60,
      limit: 10,
      storage: new ThrottlerStorageService(),
      skipIf: () => false,
      ignoreUserAgents: [],
      throttlers: [{ ttl: 60, limit: 10 }],
    };
    guard = new TestableAuthThrottlerGuard(
      options,
      new ThrottlerStorageService(),
      new Reflector(),
    );
  });

  it('should skip throttling for health check user agent', async () => {
    // Mock ExecutionContext
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'user-agent': 'ELB-HealthChecker/2.0',
          },
        }),
      }),
    } as ExecutionContext;

    const shouldSkip = await guard.testShouldSkip(mockContext);
    expect(shouldSkip).toBe(true);
  });

  it('should not skip throttling for regular user agent', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'user-agent': 'Mozilla/5.0',
          },
        }),
      }),
    } as ExecutionContext;

    const shouldSkip = await guard.testShouldSkip(mockContext);
    expect(shouldSkip).toBe(false);
  });
});
