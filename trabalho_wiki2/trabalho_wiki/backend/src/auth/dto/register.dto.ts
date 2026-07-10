import { IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(60)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password: string;
}
