export interface IEvent {
  eventName: string;
  timestamp: Date;
  data: any;
}

export class BaseEvent implements IEvent {
  eventName: string;
  timestamp: Date;
  data: any;

  constructor(eventName: string, data: any) {
    this.eventName = eventName;
    this.timestamp = new Date();
    this.data = data;
  }
}
