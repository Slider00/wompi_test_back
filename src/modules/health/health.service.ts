import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  checkDb(): { status: string; database: { state: string; connected: boolean } } {
    const states: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const readyState = this.connection.readyState;
    const isConnected = readyState === 1;

    return {
      status: isConnected ? 'ok' : 'error',
      database: {
        state: states[readyState] || 'unknown',
        connected: isConnected,
      },
    };
  }
}
