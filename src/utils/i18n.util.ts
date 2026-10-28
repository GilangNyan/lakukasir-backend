import {
  I18nContext,
  I18nTranslation,
  Path,
  TranslateOptions,
} from 'nestjs-i18n';
import type { ValidationArguments } from 'class-validator';

export function translate(
  key: Path<I18nTranslation>,
  options?: TranslateOptions,
): string {
  const i18n = I18nContext.current();

  if (!i18n) {
    return key;
  }

  return i18n.t(key, options);
}

export function validationMessage(
  key: Path<I18nTranslation>,
  options?: TranslateOptions | (() => TranslateOptions),
): (args: ValidationArguments) => string {
  return () => {
    const i18n = I18nContext.current();

    if (!i18n) {
      return key;
    }

    return i18n.t(key, typeof options === 'function' ? options() : options);
  };
}

export const t = translate;
