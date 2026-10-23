import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { t } from '../../../utils/i18n.util.js';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({
    message: t('validation.REQUIRED', {
      args: {
        field: t('field.FULL_NAME'),
      },
    }),
  })
  fullName: string;

  @ValidateIf((o) => !o.phone || o.email)
  @IsEmail(
    {},
    {
      message: t('validation.FORMAT_INVALID', {
        args: {
          field: t('field.EMAIL'),
        },
      }),
    },
  )
  @IsNotEmpty({
    message: t('validation.REQUIRED_IF_OTHER_EMPTY', {
      args: { field: t('field.EMAIL'), field2: t('field.PHONE') },
    }),
  })
  email?: string;

  @ValidateIf((o) => !o.email || o.phone)
  @IsString()
  @IsNotEmpty({
    message: t('validation.REQUIRED_IF_OTHER_EMPTY', {
      args: { field: t('field.PHONE'), field2: t('field.EMAIL') },
    }),
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, {
    message: t('validation.MIN_LENGTH', {
      args: { field: t('field.PASSWORD'), min: 6 },
    }),
  })
  password?: string;

  @IsOptional()
  @IsString()
  firebaseUid?: string;
}
