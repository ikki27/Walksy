import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // GET / → quick "is the server running?" check, no login needed
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
