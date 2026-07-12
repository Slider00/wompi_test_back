import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    const env = this.configService.get<string>('APP_ENV');
    const testVar = this.configService.get<string>('TEST_VAR');
    return `Hello World! Environment: ${env}, Test Var: ${testVar}`;
  }
}
