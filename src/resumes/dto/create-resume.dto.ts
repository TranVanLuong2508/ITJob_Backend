import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateResumeDto {
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @IsNotEmpty({ message: 'UserId must not be empty' })
  userId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'URL must not be empty' })
  url: string;

  @IsNotEmpty({ message: 'Status must not be empty' })
  status: string;

  @IsNotEmpty({ message: 'CompanyId must not be empty' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'JobId must not be empty' })
  jobId: mongoose.Schema.Types.ObjectId;
}

export class CreateUserCvDto {
  @IsNotEmpty({ message: 'URL must not be empty' })
  url: string;

  @IsNotEmpty({ message: 'CompanyId must not be empty' })
  @IsMongoId({ message: 'CompanyId must be a valid Mongo ObjectId' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'JobId must not be empty' })
  @IsMongoId({ message: 'JobId must be a valid Mongo ObjectId' })
  jobId: mongoose.Schema.Types.ObjectId;
}
