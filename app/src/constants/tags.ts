/**
 * Sistema Canônico de Tags e Dicionário de Aliases
 * Biblioteca Infinita
 */

export interface TagCategory {
  name: string
  tags: string[]
}

// 1. Grupos Canônicos Organizados
export const TAG_CATEGORIES: TagCategory[] = [
  {
    name: "Nível & Dificuldade",
    tags: [
      "Iniciante",
      "Intermediário",
      "Avançado",
      "Materiais Adaptados",
    ],
  },
  {
    name: "Legendas & Transcrição",
    tags: [
      "Legendas [CC]",
      "Legendas bilíngues",
      "Legendas fixas",
      "Sem legendas",
      "Com transcrição",
      "Sem transcrição",
    ],
  },
  {
    name: "Didático & Ensino",
    tags: [
      "Professor de Idiomas",
      "Aprendizado de Idiomas",
      "Educação",
      "Gramática",
      "Diálogos",
      "Guia e Prática",
      "Material de Apoio",
      "Escuta & Áudio",
      "Vídeo",
      "Artigo",
      "Site",
      "App",
      "IPA",
      "Fonética",
      "Shadowing",
      "Entonação",
    ],
  },
  {
    name: "Gêneros & Ficção",
    tags: [
      "Drama",
      "Sitcom",
      "Cotidiano",
      "Ação",
      "Aventura",
      "Ação & Aventura",
      "Humor",
      "Fantasia",
      "Ficção Científica",
      "Mistério",
      "Suspense",
      "Crime & Suspense",
      "Policial",
      "Romance",
      "Infantil",
      "Animação",
      "Anime",
      "Terror",
      "Documentários",
    ],
  },
  {
    name: "Cultura & Vida Real",
    tags: [
      "Cultura",
      "Vlog",
      "Experimentos",
      "Ciência",
      "Engenharia",
      "Notícias",
      "Gastronomia",
      "Games",
      "Streamer",
      "League of Legends",
      "Magic the Gathering",
      "Commander",
      "Produtividade",
      "Tecnologia",
      "História",
      "Finanças",
      "Filosofia",
      "Música",
      "Esportes",
      "Fitness",
      "Calistenia",
      "Moda Masculina",
      "Marketing",
      "Criação de Conteúdo",
      "Comentários",
      "Influencers",
      "Geopolítica",
      "Economia",
      "Cinema",
      "Arquitetura",
      "Design",
      "Viagem",
      "Família",
      "Curiosidades",
      "Entrevistas",
      "Humor",
    ],
  },
]

// Lista plana de todas as tags canônicas
export const ALL_CANONICAL_TAGS: string[] = TAG_CATEGORIES.flatMap((c) => c.tags)

// 2. Dicionário de Aliases (sinônimos, termos em inglês, gírias e variações)
export const TAG_ALIASES: Record<string, string> = {
  // Nível & Dificuldade
  "iniciante": "Iniciante",
  "iniciantes": "Iniciante",
  "beginner": "Iniciante",
  "beginners": "Iniciante",
  "easy": "Iniciante",
  "facil": "Iniciante",
  "fácil": "Iniciante",
  "basico": "Iniciante",
  "básico": "Iniciante",
  "zero": "Iniciante",
  "a1": "Iniciante",
  "a2": "Iniciante",
  "intermediario": "Intermediário",
  "intermediário": "Intermediário",
  "intermediate": "Intermediário",
  "b1": "Intermediário",
  "b2": "Intermediário",
  "avancado": "Avançado",
  "avançado": "Avançado",
  "advanced": "Avançado",
  "c1": "Avançado",
  "c2": "Avançado",
  "adaptado": "Materiais Adaptados",
  "adaptados": "Materiais Adaptados",
  "material adaptado": "Materiais Adaptados",
  "materiais adaptados": "Materiais Adaptados",
  "input compreensivel": "Materiais Adaptados",
  "input compreensível": "Materiais Adaptados",
  "comprehensible input": "Materiais Adaptados",
  "comprehensible": "Materiais Adaptados",

  // Legendas & Transcrição
  "cc": "Legendas [CC]",
  "legenda": "Legendas [CC]",
  "legendas": "Legendas [CC]",
  "sub": "Legendas [CC]",
  "subs": "Legendas [CC]",
  "subtitles": "Legendas [CC]",
  "bilingue": "Legendas bilíngues",
  "bilingues": "Legendas bilíngues",
  "bilingual": "Legendas bilíngues",
  "legenda fixa": "Legendas fixas",
  "legendas fixas": "Legendas fixas",
  "sem legenda": "Sem legendas",
  "sem legendas": "Sem legendas",
  "transcricao": "Com transcrição",
  "transcrição": "Com transcrição",
  "transcript": "Com transcrição",
  "transcripts": "Com transcrição",
  "com transcricao": "Com transcrição",
  "com transcrição": "Com transcrição",
  "sem transcricao": "Sem transcrição",
  "sem transcrição": "Sem transcrição",

  // Ficção Científica
  "scifi": "Ficção Científica",
  "sci-fi": "Ficção Científica",
  "ficcao cientifica": "Ficção Científica",
  "ficção científica": "Ficção Científica",
  "ficcao": "Ficção Científica",
  "ficção": "Ficção Científica",

  // Humor & Comédia
  "comedy": "Humor",
  "comedia": "Humor",
  "comédia": "Humor",
  "humor": "Humor",
  "standup": "Humor",
  "stand up": "Humor",

  // Gastronomia
  "cooking": "Gastronomia",
  "cook": "Gastronomia",
  "comida": "Gastronomia",
  "culinaria": "Gastronomia",
  "culinária": "Gastronomia",
  "gastronomia": "Gastronomia",
  "receitas": "Gastronomia",
  "food": "Gastronomia",

  // Games & Streaming
  "gaming": "Games",
  "jogos": "Games",
  "jogo": "Games",
  "gameplay": "Games",
  "videogames": "Games",
  "game": "Games",
  "streamer": "Streamer",
  "streamers": "Streamer",
  "stream": "Streamer",
  "streaming": "Streamer",
  "lol": "League of Legends",
  "league of legends": "League of Legends",

  // Magic the Gathering
  "magic": "Magic the Gathering",
  "mtg": "Magic the Gathering",
  "magic the gathering": "Magic the Gathering",
  "magic: the gathering": "Magic the Gathering",
  "edh": "Commander",
  "commander": "Commander",
  "cedh": "Commander",

  // Notícias
  "news": "Notícias",
  "noticias": "Notícias",
  "notícias": "Notícias",
  "jornalismo": "Notícias",
  "atualidades": "Notícias",

  // Experimentos
  "experimentos": "Experimentos",
  "experimento": "Experimentos",
  "experiments": "Experimentos",
  "experiment": "Experimentos",

  // Tecnologia
  "tech": "Tecnologia",
  "technology": "Tecnologia",
  "programacao": "Tecnologia",
  "programação": "Tecnologia",

  // Ciência & Engenharia
  "science": "Ciência",
  "ciencia": "Ciência",
  "ciência": "Ciência",
  "astronomia": "Ciência & Astronomia",
  "espaco": "Ciência & Astronomia",
  "espaço": "Ciência & Astronomia",
  "engenharia": "Engenharia",
  "engineering": "Engenharia",

  // Vlog
  "vlogs": "Vlog",
  "daily vlog": "Vlog",
  "rotina": "Vlog",
  // Cultura
  "cultura": "Cultura",
  "culture": "Cultura",

  // Documentários
  "doc": "Documentários",
  "docs": "Documentários",
  "documentario": "Documentários",
  "documentário": "Documentários",
  "documentary": "Documentários",

  // Gramática
  "grammar": "Gramática",
  "gramatica": "Gramática",

  // Produtividade
  "desenvolvimento pessoal": "Produtividade",
  "self development": "Produtividade",
  "produtividade": "Produtividade",
  "productivity": "Produtividade",
  "autoajuda": "Produtividade",
  "self improvement": "Produtividade",
  "habitos": "Produtividade",
  "hábitos": "Produtividade",

  // Anime & Mangá
  "manga": "Anime",
  "mangá": "Anime",
  "otaku": "Anime",

  // Ação & Aventura
  "action": "Ação & Aventura",
  "acao": "Ação & Aventura",
  "ação": "Ação & Aventura",
  "aventura": "Ação & Aventura",
  "adventure": "Ação & Aventura",

  // Crime & Suspense
  "crime": "Crime & Suspense",
  "suspense": "Crime & Suspense",
  "thriller": "Crime & Suspense",
  "misterio": "Crime & Suspense",
  "mistério": "Crime & Suspense",
  "true crime": "Crime & Suspense",

  // Terror
  "horror": "Terror",

  // História
  "history": "História",
  "historia": "História",

  // Viagem
  "travel": "Viagem",
  "viagens": "Viagem",
  "turismo": "Viagem",

  // Música
  "music": "Música",
  "musica": "Música",

  // Esportes
  "sports": "Esportes",
  "sport": "Esportes",

  // Fitness & Calistenia
  "fitness": "Fitness",
  "academia": "Fitness",
  "musculacao": "Fitness",
  "musculação": "Fitness",
  "bodybuilding": "Fitness",
  "treino": "Fitness",
  "calistenia": "Calistenia",
  "calisthenics": "Calistenia",
  "bodyweight": "Calistenia",
  "esporte": "Esportes",
  "futebol": "Esportes",

  // Moda Masculina
  "moda": "Moda Masculina",
  "moda masculina": "Moda Masculina",
  "menswear": "Moda Masculina",
  "estilo": "Moda Masculina",
  "estilo masculino": "Moda Masculina",
  "fashion": "Moda Masculina",

  // Marketing & Criação de Conteúdo
  "marketing": "Marketing",
  "vendas": "Marketing",
  "criacao de conteudo": "Criação de Conteúdo",
  "criação de conteúdo": "Criação de Conteúdo",
  "content creation": "Criação de Conteúdo",
  "creator economy": "Criação de Conteúdo",

  // Geopolítica & Economia
  "geopolitica": "Geopolítica",
  "geopolítica": "Geopolítica",
  "geopolitics": "Geopolítica",
  "politica": "Geopolítica",
  "política": "Geopolítica",
  "politics": "Geopolítica",
  "economia": "Economia",
  "economics": "Economia",
  "economy": "Economia",

  // Finanças
  "finance": "Finanças",
  "financas": "Finanças",
  "investimentos": "Finanças",
  "dinheiro": "Finanças",
  "money": "Finanças",
  // Cinema, Arquitetura & Design
  "cinema": "Cinema",
  "filmmaking": "Cinema",
  "movies": "Cinema",
  "filmes": "Cinema",
  "arquitetura": "Arquitetura",
  "architecture": "Arquitetura",
  "design": "Design",

  // Comentários & Influencers
  "comentarios": "Comentários",
  "comentários": "Comentários",
  "commentary": "Comentários",
  "react": "Comentários",
  "reacts": "Comentários",
  "influencers": "Influencers",
  "influencer": "Influencers",
  "redes sociais": "Influencers",
  "social media": "Influencers",

  // Palestras, Educação & Auditório
  "educacao": "Educação",
  "educação": "Educação",
  "education": "Educação",
  "palestras": "Educação",
  "palestra": "Educação",
  "talks": "Educação",
  "talk": "Educação",
  "ted": "Educação",
  "programa de auditorio": "Entrevistas",
  "programa de auditório": "Entrevistas",

  // Didático / Aulas
  "aula": "Professor de Idiomas",
  "aulas": "Professor de Idiomas",
  "curso": "Professor de Idiomas",
  "teacher": "Professor de Idiomas",
  "professor": "Professor de Idiomas",
  "video": "Vídeo",
  "vídeo": "Vídeo",
  "videos": "Vídeo",
  "vídeos": "Vídeo",
  "artigo": "Artigo",
  "artigos": "Artigo",
  "guia": "Artigo",
  "site": "Site",
  "sites": "Site",
  "app": "App",
  "apps": "App",
  "aplicativo": "App",
  "aplicativos": "App",
  "ipa": "IPA",
  "fonetica": "Fonética",
  "fonética": "Fonética",
  "shadowing": "Shadowing",
  "entonacao": "Entonação",
  "entonação": "Entonação",
}

// Normalizador de busca
function normalizeKey(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
}

/**
 * Resolve qualquer texto/alias para uma tag canônica ou formata uma nova tag
 */
export function resolveTag(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ""

  const key = normalizeKey(trimmed)

  // 1. Verifica no dicionário de aliases
  for (const [alias, canonical] of Object.entries(TAG_ALIASES)) {
    if (normalizeKey(alias) === key) {
      return canonical
    }
  }

  // 2. Verifica se já é uma tag canônica (case-insensitive)
  const exactCanonical = ALL_CANONICAL_TAGS.find((t) => normalizeKey(t) === key)
  if (exactCanonical) {
    return exactCanonical
  }

  // 3. Fallback: formata com Capital Case limpo
  const words = trimmed.split(/\s+/)
  const connectors = new Set(["de", "da", "do", "dos", "das", "e", "em", "com", "para", "por", "a", "o"])
  return words
    .map((word, index) => {
      const lower = word.toLowerCase()
      if (index > 0 && connectors.has(lower)) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(" ")
}
