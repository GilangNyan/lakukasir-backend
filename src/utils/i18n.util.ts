import {
  I18nContext,
  I18nTranslation,
  Path,
  TranslateOptions,
} from 'nestjs-i18n';

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

export const t = translate;
