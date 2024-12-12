import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Injectable()
export class EventBusService {
  constructor(@Inject('MAIN_SERVICE') private readonly client: ClientProxy) {}

  async emit(pattern: string, data: any): Promise<void> {
    this.client.emit(pattern, data).subscribe();
  }

  async send(pattern: string, data: any): Promise<any> {
    return this.client.send(pattern, data).toPromise();
  }
}
