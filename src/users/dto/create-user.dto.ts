import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';

export class Company {
  @IsNotEmpty({ message: 'Company id must not be empty' })
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Company Name must not be empty' })
  name: string;
}

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;

  @IsEmail({}, { message: 'Must be in email format' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @IsNotEmpty({ message: 'Password must not be empty' })
  password: string;

  @IsNotEmpty({ message: 'Age must not be empty' })
  age: number;

  @IsNotEmpty({ message: 'Gender must not be empty' })
  gender: string;

  @IsNotEmpty({ message: 'Address must not be empty' })
  address: string;

  @IsNotEmpty({ message: 'Role must not be empty' })
  role: string;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;

  @IsEmail({}, { message: 'Must be in email format' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @IsNotEmpty({ message: 'Password must not be empty' })
  password: string;

  @IsNotEmpty({ message: 'Age must not be empty' })
  age: number;

  @IsNotEmpty({ message: 'Gender must not be empty' })
  gender: string;

  @IsNotEmpty({ message: 'Address must not be empty' })
  address: string;
}
