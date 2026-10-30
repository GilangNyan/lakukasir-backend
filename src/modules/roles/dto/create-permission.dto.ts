import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { t, validationMessage } from '../../../utils/i18n.util.js';
import { Channel } from '../../../common/enums/channel.enum.js';

export class CreatePermissionDto {
  @IsString({
    message: validationMessage('validation.STRING', () => ({
      args: { field: t('field.NAME') },
    })),
  })
  @IsNotEmpty({
    message: validationMessage('validation.REQUIRED', () => ({
      args: { field: t('field.NAME') },
    })),
  })
  name: string;

  @IsOptional()
  @IsEnum(Channel, {
    message: validationMessage('validation.FORMAT_INVALID', () => ({
      args: { field: t('field.CHANNEL') },
    })),
  })
  channel?: Channel;
}
