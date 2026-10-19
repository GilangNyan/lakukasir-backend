import { Injectable } from '@nestjs/common';
import { t } from './utils/i18n.util.js';

@Injectable()
export class AppService {
  getHello(): string {
    return t('common.WELCOME');
  }
}
