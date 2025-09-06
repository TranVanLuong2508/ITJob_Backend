import { Controller, Get, Post, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
    private authService: AuthService,
  ) {}

  @Get()
  getHello(): string {
    console.log('check port', this.configService.get<string>('PORT'));
    return this.appService.getHello();
  }

  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
