import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;
  @IsNotEmpty()
  name: string;
}

export class CreateJobDto {
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;

  @IsNotEmpty({ message: 'skills must not be empty' })
  @IsArray({ message: 'Skills must be in Array format' })
  @IsString({ each: true, message: 'skill must be in String format' })
  skills: string[];

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;

  @IsNotEmpty({ message: 'location must not be empty' })
  location: string;

  @IsNotEmpty({ message: 'salary must not be empty' })
  salary: number;

  @IsNotEmpty({ message: 'quantity must not be empty' })
  quantity: number;

  @IsNotEmpty({ message: 'level must not be empty' })
  level: string;

  @IsNotEmpty({ message: 'description must not be empty' })
  description: string;

  @IsNotEmpty({ message: 'startDate must not be empty' })
  @Transform(({ value }) => {
    return new Date(value);
  })
  @IsDate({ message: 'startDate must be in Date format' })
  startDate: Date;

  @IsNotEmpty({ message: 'endDate must not be empty' })
  @Transform(({ value }) => {
    return new Date(value);
  })
  @IsDate({ message: 'endDate must be in Date format' })
  endDate: Date;

  @IsNotEmpty({ message: 'isActive must not be empty' })
  @IsBoolean({ message: 'isActive must be in Boolean format' })
  isActive: boolean;
}
