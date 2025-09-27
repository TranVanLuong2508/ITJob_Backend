import { IsNotEmpty } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;

  @IsNotEmpty({ message: 'Address must not be empty' })
  address: string;

  @IsNotEmpty({ message: 'logo must not be empty' })
  logo: string;

  @IsNotEmpty({ message: 'Description must not be empty' })
  description: string;
}
