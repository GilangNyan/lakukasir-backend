import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { t, validationMessage } from '../../../utils/i18n.util.js';

export class RegisterDto {
  @IsString({
    message: validationMessage('validation.STRING', () => ({
      args: { field: t('field.FULL_NAME') },
    })),
  })
  @IsNotEmpty({
    message: validationMessage('validation.REQUIRED', () => ({
      args: { field: t('field.FULL_NAME') },
    })),
  })
  fullname: string;

  //   @ValidateIf((o) => !o.phoneNumber || o.email)
  //   @IsEmail({}, { message: 'Format email tidak valid' })
  //   @IsNotEmpty({ message: 'Email wajib diisi jika nomor telepon kosong' })
  //   email?: string;

  //   @ValidateIf((o) => !o.email || o.phoneNumber)
  @IsString({
    message: validationMessage('validation.STRING', () => ({
      args: { field: t('field.PHONE') },
    })),
  })
  @IsNotEmpty({
    message: validationMessage('validation.REQUIRED_IF_OTHER_EMPTY', () => ({
      args: { field: t('field.PHONE'), field2: t('field.EMAIL') },
    })),
  })
  phone?: string;

  @IsString({
    message: validationMessage('validation.STRING', () => ({
      args: { field: t('field.PASSWORD') },
    })),
  })
  @MinLength(6, {
    message: validationMessage('validation.MIN_LENGTH', () => ({
      args: { field: t('field.PASSWORD'), min: 6 },
    })),
  })
  password: string;
}
