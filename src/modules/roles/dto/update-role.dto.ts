import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { t, validationMessage } from '../../../utils/i18n.util.js';
import { Channel } from '../../../common/enums/channel.enum.js';

export class UpdateRoleDto {
  @ValidateIf((_object, value) => value !== undefined)
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
  name?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString({
    message: validationMessage('validation.STRING', () => ({
      args: { field: t('field.DESCRIPTION') },
    })),
  })
  description?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(Channel, {
    message: validationMessage('validation.FORMAT_INVALID', () => ({
      args: { field: t('field.CHANNEL') },
    })),
  })
  channel?: Channel;

  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;

  @ValidateIf((_object, value) => value !== undefined)
  @IsArray({
    message: validationMessage('validation.FORMAT_INVALID', () => ({
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
  permission?: string[];
}