import { I18nContext, Path, TranslateOptions } from 'nestjs-i18n';

export function translate(key: Path<any>, options?: TranslateOptions): string {
  const i18n = I18nContext.current();

  if (!i18n) {
    return key as string;
  }

  return i18n.t(key, options);
}

export const t = translate;
