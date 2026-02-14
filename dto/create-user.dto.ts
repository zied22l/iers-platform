import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  matricule: string;

  @IsNotEmpty()
  @IsString()
  telephone: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsDateString()
  date_embauche: Date;

  @IsOptional()
  @IsString()
  departement_id?: string;

  @IsOptional()
  @IsString()
  manager_id?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
