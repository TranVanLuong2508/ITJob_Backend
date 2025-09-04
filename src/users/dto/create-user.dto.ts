import { IsEmail, IsEmpty, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Phải ở định dạng Email' })
  @IsNotEmpty({ message: 'Không được để trống Email' })
  email: string;

  @IsNotEmpty({ message: 'Không được để trống Password' })
  password: string;

  name: string;

  address: string;
}
