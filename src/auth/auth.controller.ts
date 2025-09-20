import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { CreateUserDto, RegisterUserDto } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/user.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // @UseGuards(JwtAuthGuard) //← "Cổng kiểm soát" - chỉ user có token hợp lệ mới vào được ==> đã dùng global
  @Get('profile')
  getProfile(@User() user: IUser) {
    return user;
  }

  @Public()
  @Post('register')
  @ResponseMessage('Register a new user')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }
}
