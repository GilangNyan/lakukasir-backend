import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { t, validationMessage } from '../../../utils/i18n.util.js';

export class LoginDto {
  @IsString({
    message: validationMessage('validation.STRING', () => ({
      args: { field: t('field.IDENTIFIER') },
    })),
  })
  @IsNotEmpty({
    message: validationMessage('validation.REQUIRED', () => ({
      args: { field: t('field.IDENTIFIER') },
    })),
  })
  identifier: string;

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
