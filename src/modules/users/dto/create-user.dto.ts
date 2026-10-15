import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ValidateIf((o) => !o.phone || o.email)
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi jika nomor telepon kosong' })
  email?: string;

  @ValidateIf((o) => !o.email || o.phone)
  @IsString()
  @IsNotEmpty({ message: 'Nomor telepon wajib diisi jika email kosong' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password?: string;

  @IsOptional()
  @IsString()
  firebaseUid?: string;
}
