import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { t } from '../../../utils/i18n.util.js';

export class LoginDto {
  @IsString()
  @IsNotEmpty({
    message: t('validation.REQUIRED', {
      args: {
        field: t('common.A_OR_B', {
          args: { a: t('field.EMAIL'), b: 'field.PHONE' },
        }),
      },
    }),
  })
  identifier: string;

  @IsString()
  @MinLength(6, {
    message: t('validation.MIN_LENGTH', {
      args: { field: t('field.PASSWORD'), min: 6 },
    }),
  })
  password: string;
}
