import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import mongoose, { Model, mongo } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/user.interface';
import aqp from 'api-query-params';

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

  async create(createUserDto: CreateUserDto, currentUser: IUser) {
    const hasedPassword = this.getHashPassword(createUserDto.password);
    const isUserExist = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (isUserExist) {
      return {
        message: 'User Already existed',
      };
    } else {
      await this.userModel.create({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hasedPassword,
        age: createUserDto.age,
        gender: createUserDto.gender,
        address: createUserDto.address,
        role: createUserDto.role,
        company: {
          _id: createUserDto.company._id,
          name: createUserDto.company.name,
        },
        createdBy: {
          _id: currentUser._id,
          email: currentUser.email,
        },
      });
      return {
        _id: currentUser._id,
        createdAt: new Date(),
      };
    }
  }

  async register(registerUserDto: RegisterUserDto) {
    const hasedPassword = this.getHashPassword(registerUserDto.password);
    const user = await this.userModel.create({
      name: registerUserDto.name,
      email: registerUserDto.email,
      password: hasedPassword,
      age: registerUserDto.age,
      gender: registerUserDto.gender,
      address: registerUserDto.address,
    });
    return user;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.page;
    delete filter.limit;
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'not found user';
    return await this.userModel
      .findOne({ _id: id })
      .select(['-password', '-__v']);
  }

  async findOneByUserName(username: string) {
    return await this.userModel.findOne({
      email: username,
    });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(updateUserDto: UpdateUserDto, currentUser: IUser) {
    const userUpdated = await this.userModel.updateOne(
      { email: updateUserDto.email },
      {
        $set: {
          name: updateUserDto.name,
          age: updateUserDto.age,
          gender: updateUserDto.gender,
          address: updateUserDto.address,
          role: updateUserDto.role,
          company: {
            _id: updateUserDto.company._id,
            name: updateUserDto.company.name,
          },
          updatedBy: {
            _id: currentUser._id,
            email: currentUser.email,
          },
        },
      },
      { runValidators: true },
    );

    return {
      userUpdated,
    };
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'not found user';
    }

    const foundUser = await this.userModel.findById(id);
    if (foundUser && foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException('CAN NOT DELETE ADMIN ACCOUNT');
    }
    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return await this.userModel.softDelete({
      _id: id,
    });
  }
}
