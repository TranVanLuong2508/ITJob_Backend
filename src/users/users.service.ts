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
    const isUserExist = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (isUserExist) {
      throw new BadRequestException(
        `Email: ${createUserDto.email} already exists in the system. Please use a different email.`,
      );
    } else {
      const hasedPassword = this.getHashPassword(createUserDto.password);

      const newUser = await this.userModel.create({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hasedPassword,
        age: createUserDto.age,
        gender: createUserDto.gender,
        address: createUserDto.address,
        role: createUserDto.role,
        company: createUserDto.company,
        createdBy: {
          _id: currentUser._id,
          email: currentUser.email,
        },
      });
      return {
        _id: newUser._id,
        createdAt: newUser.createdAt,
      };
    }
  }

  async register(registerUserDto: RegisterUserDto) {
    const isExist = await this.userModel.findOne({
      email: registerUserDto.email,
    });
    if (isExist) {
      throw new BadRequestException(
        `Email: ${registerUserDto.email} already exists in the system. Please use a different email.`,
      );
    }
    const hasedPassword = this.getHashPassword(registerUserDto.password);

    const newUser = await this.userModel.create({
      name: registerUserDto.name,
      email: registerUserDto.email,
      password: hasedPassword,
      age: registerUserDto.age,
      gender: registerUserDto.gender,
      address: registerUserDto.address,
      role: 'USER',
    });
    return newUser;
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

  async findUserByRefreshToken(refresh_token: string) {
    return await this.userModel.findOne({ refreshToken: refresh_token });
  }

  async updateUserToken(refresh_token: string, id: string) {
    return await this.userModel.updateOne(
      { _id: id },
      { refreshToken: refresh_token },
    );
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(updateUserDto: UpdateUserDto, currentUser: IUser) {
    const updatedUser = await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        $set: {
          name: updateUserDto.name,
          age: updateUserDto.age,
          gender: updateUserDto.gender,
          address: updateUserDto.address,
          role: updateUserDto.role,
          company: updateUserDto.company,
          updatedBy: {
            _id: currentUser._id,
            email: currentUser.email,
          },
        },
      },
    );

    return {
      updatedUser,
    };
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'not found user';
    }

    const foundUser = await this.userModel.findById(id);
    if (foundUser && foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException(
        'CAN NOT DELETE ADMIN ACCOUNT : admin@gmail.com',
      );
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

    return this.userModel.softDelete({
      _id: id,
    });
  }
}
