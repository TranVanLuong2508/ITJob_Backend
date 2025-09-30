import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { RolesService } from 'src/roles/roles.service';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/user.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private roleService: RolesService,
  ) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle(10, 60)
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
  async GetAccount(@User() user: IUser) {
    const temp = (await this.roleService.findOne(user.role._id)) as any;
    user.permissions = temp.permissions;
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
