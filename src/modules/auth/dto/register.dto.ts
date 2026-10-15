import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi' })
  fullname: string;

  //   @ValidateIf((o) => !o.phoneNumber || o.email)
  //   @IsEmail({}, { message: 'Format email tidak valid' })
  //   @IsNotEmpty({ message: 'Email wajib diisi jika nomor telepon kosong' })
  //   email?: string;

  //   @ValidateIf((o) => !o.email || o.phoneNumber)
  @IsString()
  @IsNotEmpty({ message: 'Nomor telepon wajib diisi jika email kosong' })
  phone?: string;

  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;
}
