import { IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'name must not be empty' })
  name: string;

  @IsNotEmpty({ message: 'apiPath must not be empty' })
  apiPath: string;

  @IsNotEmpty({ message: 'method must not be empty' })
  method: string;

  @IsNotEmpty({ message: 'module must not be empty' })
  module: string;
}
