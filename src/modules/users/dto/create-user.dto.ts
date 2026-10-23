import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { t, validationMessage } from '../../../utils/i18n.util.js';

export class CreateUserDto {
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
  fullName: string;

  @ValidateIf((o) => !o.phone || o.email)
  @IsEmail(
    {},
    {
      message: validationMessage('validation.FORMAT_INVALID', () => ({
        args: { field: t('field.EMAIL') },
      })),
    },
  )
  @IsNotEmpty({
    message: validationMessage('validation.REQUIRED_IF_OTHER_EMPTY', () => ({
      args: { field: t('field.EMAIL'), field2: t('field.PHONE') },
    })),
  })
  email?: string;

  @ValidateIf((o) => !o.email || o.phone)
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

  @IsOptional()
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
  password?: string;

  @IsOptional()
  @IsString({
    message: validationMessage('validation.STRING', () => ({
      args: { field: t('field.FULL_NAME') },
    })),
  })
  firebaseUid?: string;
}
