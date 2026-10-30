import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { t, validationMessage } from '../../../utils/i18n.util.js';
import { Channel } from '../../../common/enums/channel.enum.js';

export class CreateRoleDto {
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
  @IsString({
    message: validationMessage('validation.STRING', () => ({
      args: { field: t('field.DESCRIPTION') },
    })),
  })
  description: string;

  @IsOptional()
  @IsEnum(Channel, {
    message: validationMessage('validation.FORMAT_INVALID', () => ({
      args: { field: t('field.CHANNEL') },
    })),
  })
  channel?: Channel;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsArray({
    message: validationMessage('validation.FORMAT_INVALID', () => ({
      args: { field: t('field.PERMISSION') },
    })),
  })
  @ArrayNotEmpty({
    message: validationMessage('validation.REQUIRED', () => ({
      args: { field: t('field.PERMISSION') },
    })),
  })
  @ArrayUnique({
    message: validationMessage('validation.FORMAT_INVALID', () => ({
      args: { field: t('field.PERMISSION') },
    })),
  })
  @IsUUID('4', {
    each: true,
    message: validationMessage('validation.FORMAT_INVALID', () => ({
      args: { field: t('field.PERMISSION') },
    })),
  })
  permission: string[];
}
