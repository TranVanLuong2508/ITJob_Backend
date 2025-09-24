import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/user.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByUserName(username);
    if (user) {
      const isValidPass = this.userService.isValidPassword(pass, user.password);
      if (isValidPass) {
        const { password, ...result } = user.toObject();
        return result;
        // return true;
      }
    }
    return null;
  }

  generateRefreshToken = (payload: any) => {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(
          this.configService.get<string>(
            'REFRESH_TOKEN_expiresIn',
          ) as ms.StringValue,
        ) / 1000,
    });
    return refreshToken;
  };

  async login(user: IUser, response: Response) {
    const { _id, name, role, email } = user;
    const payload = {
      iss: 'from server',
      sub: 'token login',
      _id,
      name,
      role,
      email,
    };

    //create refresh_token
    const refresh_token = this.generateRefreshToken(payload);
    await this.userService.updateUserToken(refresh_token, _id.toString());

    //set cookies
    response.cookie('refresh_token', refresh_token, {
      maxAge: ms(
        this.configService.get<string>(
          'REFRESH_TOKEN_expiresIn',
        ) as ms.StringValue,
      ),
      httpOnly: true,
    });
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        role,
        email,
      },
    };
  }

  async register(registerUserDto: RegisterUserDto) {
    const newUser = await this.userService.register(registerUserDto);
    return {
      _id: newUser?._id,
      createdAt: newUser.createdAt,
    };
  }

  async processNewToken(token: string, response: Response) {
    try {
      this.jwtService.verify(token, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      const user = await this.userService.findUserByRefreshToken(token);
      if (user) {
        console.log('user', user);
        const { _id, name, role, email } = user;
        const payload = {
          iss: 'from server',
          sub: 'refresh token',
          _id,
          name,
          role,
          email,
        };
        console.log('user', user.email);
        //create refresh_token
        const refresh_token = this.generateRefreshToken(payload);
        await this.userService.updateUserToken(refresh_token, _id.toString());

        //set cookies
        response.cookie('refresh_token', refresh_token, {
          maxAge: ms(
            this.configService.get<string>(
              'REFRESH_TOKEN_expiresIn',
            ) as ms.StringValue,
          ),
          httpOnly: true,
        });
        //       this.config
        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            name,
            role,
            email,
          },
        };
      }
    } catch (error) {
      throw new BadRequestException(
        'refresh_token is not valid ! Please login',
      );
    }
  }

  async handleLogout(user: IUser, respone: Response) {
    await this.userService.updateUserToken('', user._id);
    respone.clearCookie('refresh_token');
    return '0k';
  }
}
