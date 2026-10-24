export interface Language {
  id: string
  name: string
  flag: string
}

export const LANGUAGES: Language[] = [
  { id: "english", name: "Inglês", flag: "🇺🇸" },
]


export const FORMAT_TABS = [
  "YouTube",
  "Podcasts",
  "Séries",
  "Pronúncia",
  "Recursos",
  "Professores",
] as const

export const SORT_OPTIONS = [
  { id: "name-asc", label: "Nome (A-Z)" },
  { id: "name-desc", label: "Nome (Z-A)" },
  { id: "favorites", label: "Favoritos primeiro" },
] as const

export type SortOptionId = (typeof SORT_OPTIONS)[number]["id"]
