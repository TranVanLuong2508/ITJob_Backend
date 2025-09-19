import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  async create(createUserDto: CreateUserDto) {
    const hasedPassword = this.getHashPassword(createUserDto.password);
    const user = await this.userModel.create({
      email: createUserDto.email,
      password: hasedPassword,
      name: createUserDto.name,
    });
    return user;
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'not found user';
    return await this.userModel.findOne({
      _id: id,
    });
  }

  async findOneByUserName(username: string) {
    return await this.userModel.findOne({
      email: username,
    });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto },
    );
  }

  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'not found user';
    return await this.userModel.softDelete({
      _id: id,
    });
  }
}
