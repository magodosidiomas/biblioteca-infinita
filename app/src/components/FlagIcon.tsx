import React from 'react';
import * as Flags from 'country-flag-icons/react/3x2';
import { Globe } from 'lucide-react';

export const LANGUAGE_COUNTRY_MAP: Record<string, string> = {
  english: 'US',
  german: 'DE',
  french: 'FR',
  italian: 'IT',
  spanish: 'ES',
  japanese: 'JP',
  portuguese: 'BR',
  russian: 'RU',
  polish: 'PL',
  ukrainian: 'UA',
  arabic: 'SA',
  korean: 'KR',
  chinese: 'CN',
  dutch: 'NL',
  swedish: 'SE',
  norwegian: 'NO',
  danish: 'DK',
  finnish: 'FI',
  turkish: 'TR',
  greek: 'GR',
  hebrew: 'IL',
  hindi: 'IN',
  vietnamese: 'VN',
  thai: 'TH',
  indonesian: 'ID',
  czech: 'CZ',
  hungarian: 'HU',
  romanian: 'RO',
  croatian: 'HR',
};

/**
 * Extracts 2-letter ISO country code from a Unicode flag emoji (e.g. 🇺🇸 -> US)
 */
export function emojiToCountryCode(emoji: string): string | null {
  if (!emoji) return null;
  const chars = [...emoji];
  if (chars.length === 2) {
    const c1 = chars[0].codePointAt(0);
    const c2 = chars[1].codePointAt(0);
    if (c1 && c2 && c1 >= 0x1f1e6 && c1 <= 0x1f1ff && c2 >= 0x1f1e6 && c2 <= 0x1f1ff) {
      return String.fromCharCode(c1 - 0x1f1e6 + 65, c2 - 0x1f1e6 + 65);
    }
  }
  return null;
}

interface FlagIconProps {
  countryCode?: string;
  languageId?: string;
  flag?: string;
  className?: string;
  alt?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({
  countryCode,
  languageId,
  flag,
  className = '',
  alt,
}) => {
  // 1. Resolve country code
  let code: string | null = null;

  if (countryCode) {
    code = countryCode.toUpperCase();
  } else if (flag) {
    code = emojiToCountryCode(flag);
  }

  if (!code && languageId) {
    code = LANGUAGE_COUNTRY_MAP[languageId.toLowerCase()] || null;
  }

  // 2. Special cases (Globe / All languages)
  if (flag === '🌐' || languageId === 'all') {
    return (
      <Globe
        className={`w-4 h-4 text-zinc-400 shrink-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  // 3. Render SVG Flag if country code matched
  if (code && (Flags as Record<string, React.ComponentType<{ className?: string; title?: string }>>)[code]) {
    const Component = (Flags as Record<string, React.ComponentType<{ className?: string; title?: string }>>)[code];
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-[2.5px] overflow-hidden ring-1 ring-white/15 shadow-xs align-middle leading-none ${className || 'w-[18px] h-[12px]'}`}
        title={alt || code}
      >
        <Component className="w-full h-full object-cover" title={alt || code} />
      </span>
    );
  }

  // 4. Fallback: emoji or text character
  return (
    <span className={`inline-block leading-none shrink-0 ${className}`}>
      {flag || '🌐'}
    </span>
  );
};
