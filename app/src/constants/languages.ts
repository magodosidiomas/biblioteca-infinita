export interface LanguageItem {
  id: string;
  name: string;
  flag: string;
  count?: number;
  active: boolean;
}

export interface PresetCatalogItem {
  id: string;
  name: string;
  flag: string;
}

export const PRESET_CATALOG: PresetCatalogItem[] = [
  { id: "korean", name: "Coreano", flag: "🇰🇷" },
  { id: "chinese", name: "Mandarim", flag: "🇨🇳" },
  { id: "dutch", name: "Holandês", flag: "🇳🇱" },
  { id: "swedish", name: "Sueco", flag: "🇸🇪" },
  { id: "norwegian", name: "Norueguês", flag: "🇳🇴" },
  { id: "danish", name: "Dinamarquês", flag: "🇩🇰" },
  { id: "finnish", name: "Finlandês", flag: "🇫🇮" },
  { id: "turkish", name: "Turco", flag: "🇹🇷" },
  { id: "greek", name: "Grego", flag: "🇬🇷" },
  { id: "hebrew", name: "Hebraico", flag: "🇮🇱" },
  { id: "hindi", name: "Hindi", flag: "🇮🇳" },
  { id: "vietnamese", name: "Vietnamita", flag: "🇻🇳" },
  { id: "thai", name: "Tailandês", flag: "🇹🇭" },
  { id: "indonesian", name: "Indonésio", flag: "🇮🇩" },
  { id: "czech", name: "Tcheco", flag: "🇨🇿" },
  { id: "hungarian", name: "Húngaro", flag: "🇭🇺" },
  { id: "romanian", name: "Romeno", flag: "🇷🇴" },
  { id: "catalan", name: "Catalão", flag: "🏴󠁥󠁳󠁣󠁴󠁿" },
  { id: "croatian", name: "Croata", flag: "🇭🇷" },
  { id: "esperanto", name: "Esperanto", flag: "🟢" }
];

export const INITIAL_LANGS: LanguageItem[] = [
  { id: "english", name: "Inglês", flag: "🇺🇸", active: true },
  { id: "german", name: "Alemão", flag: "🇩🇪", active: false },
  { id: "french", name: "Francês", flag: "🇫🇷", active: false },
  { id: "spanish", name: "Espanhol", flag: "🇪🇸", active: false },
  { id: "italian", name: "Italiano", flag: "🇮🇹", active: false },
  { id: "russian", name: "Russo", flag: "🇷🇺", active: false },
  { id: "japanese", name: "Japonês", flag: "🇯🇵", active: false },
  { id: "portuguese", name: "Português", flag: "🇧🇷", active: false },
  { id: "polish", name: "Polonês", flag: "🇵🇱", active: false },
  { id: "ukrainian", name: "Ucraniano", flag: "🇺🇦", active: false },
  { id: "arabic", name: "Árabe", flag: "🇸🇦", active: false },
  { id: "latin", name: "Latim", flag: "🏛️", active: false },
  { id: "korean", name: "Coreano", flag: "🇰🇷", active: false },
  { id: "chinese", name: "Mandarim", flag: "🇨🇳", active: false },
  { id: "dutch", name: "Holandês", flag: "🇳🇱", active: false },
  { id: "swedish", name: "Sueco", flag: "🇸🇪", active: false },
  { id: "norwegian", name: "Norueguês", flag: "🇳🇴", active: false },
  { id: "danish", name: "Dinamarquês", flag: "🇩🇰", active: false },
  { id: "finnish", name: "Finlandês", flag: "🇫🇮", active: false },
  { id: "turkish", name: "Turco", flag: "🇹🇷", active: false },
  { id: "greek", name: "Grego", flag: "🇬🇷", active: false },
  { id: "hebrew", name: "Hebraico", flag: "🇮🇱", active: false },
  { id: "hindi", name: "Hindi", flag: "🇮🇳", active: false },
  { id: "vietnamese", name: "Vietnamita", flag: "🇻🇳", active: false },
  { id: "thai", name: "Tailandês", flag: "🇹🇭", active: false },
  { id: "indonesian", name: "Indonésio", flag: "🇮🇩", active: false },
  { id: "czech", name: "Tcheco", flag: "🇨🇿", active: false },
  { id: "hungarian", name: "Húngaro", flag: "🇭🇺", active: false },
  { id: "romanian", name: "Romeno", flag: "🇷🇴", active: false }
];

export function mergeWithInitialLangs(saved: LanguageItem[] | null | undefined): LanguageItem[] {
  if (!Array.isArray(saved) || saved.length === 0) return INITIAL_LANGS;
  const savedMap = new Map(saved.map((l) => [l.id, l]));
  const result = [...saved];
  for (const init of INITIAL_LANGS) {
    if (!savedMap.has(init.id)) {
      result.push(init);
    }
  }
  return result;
}

export const LANG_STORAGE_KEY = 'immersion_admin_languages_v1';
export const SELECTED_LANG_KEY = 'immersion_selected_language_v1';

