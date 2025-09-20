import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
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

  async login(user: IUser) {
    const { _id, name, role, email } = user;
    const payload = {
      iss: 'from server',
      sub: 'token login',
      _id,
      name,
      role,
      email,
    };
    return {
      access_token: this.jwtService.sign(payload),
      _id,
      name,
      role,
      email,
    };
  }
}
