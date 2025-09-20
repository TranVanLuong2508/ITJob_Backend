import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { IUser } from 'src/users/user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ResponseMessage('Fetch user with paginate')
  findAll(
    @Query('page') currentPage: number,
    @Query('limit') limit: number,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(currentPage, limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Fetch user by id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ResponseMessage('Create a new User')
  create(@Body() newToCreate: CreateUserDto, @User() currentUser: IUser) {
    return this.usersService.create(newToCreate, currentUser);
  }

  @Patch()
  @ResponseMessage('Update a User')
  update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return this.usersService.update(updateUserDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a User')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }
}
