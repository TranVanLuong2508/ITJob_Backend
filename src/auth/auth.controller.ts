import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/user.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
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

  @Get('account')
  @ResponseMessage('Get user information')
  GetAccount(@User() user: IUser) {
    return {
      user: user,
    };
  }

  @Public()
  @Get('refresh')
  @ResponseMessage('Get User by refresh token')
  handleRefresh(
    @Req() request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refresh_token = request.cookies['refresh_token'];
    return this.authService.processNewToken(refresh_token, response);
  }

  @Post('logout')
  @ResponseMessage('Logout User')
  logout(@User() user: IUser, @Res({ passthrough: true }) response: Response) {
    return this.authService.handleLogout(user, response);
  }
}
