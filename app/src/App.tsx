import * as React from "react"
import { Search, X, Check, ChevronDown, Heart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const LANGUAGES = [
  { name: "Francês", flag: "🇫🇷" },
  { name: "Russo", flag: "🇷🇺" },
  { name: "Inglês", flag: "🇬🇧" },
  { name: "Alemão", flag: "🇩🇪" },
  { name: "Italiano", flag: "🇮🇹" },
  { name: "Espanhol", flag: "🇪🇸" },
  { name: "Japonês", flag: "🇯🇵" },
]

const FORMAT_TABS = ["YouTube", "Podcasts", "Séries", "Filmes", "Sites"]

const FILTER_TEMAS = [
  "Cultura",
  "História",
  "Humor",
  "Linguística",
  "Cotidiano",
  "Cinema",
]

const FILTER_LEGENDAS = [
  "Legendas [CC]",
  "Legendas fixas",
  "Legendas bilíngues",
  "Sem legendas",
]

const FILTER_VELOCIDADES = [
  "Fala pausada",
  "Fala natural",
  "Fala rápida",
]

export default function App() {
  const [selectedLanguage, setSelectedLanguage] = React.useState(LANGUAGES[0])
  const [activeTab, setActiveTab] = React.useState("YouTube")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedTema, setSelectedTema] = React.useState<string | null>(null)
  const [selectedLegendas, setSelectedLegendas] = React.useState<string | null>(null)
  const [selectedVelocidade, setSelectedVelocidade] = React.useState<string | null>(null)
  const [onlyFavorites, setOnlyFavorites] = React.useState(false)

  // Mobile sheet states
  const [mobileSheetType, setMobileSheetType] = React.useState<
    "lang" | "tema" | "legendas" | "velocidade" | null
  >(null)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  const hasAnyFilter =
    Boolean(searchQuery) ||
    Boolean(selectedTema) ||
    Boolean(selectedLegendas) ||
    Boolean(selectedVelocidade) ||
    onlyFavorites

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedTema(null)
    setSelectedLegendas(null)
    setSelectedVelocidade(null)
    setOnlyFavorites(false)
  }

  const handleOpenFilter = (type: "lang" | "tema" | "legendas" | "velocidade") => {
    if (isMobile) {
      setMobileSheetType(type)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-purple-900 selection:text-white pb-20 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ================= TOPNAV LIMPO (CONTEXTO GLOBAL) ================= */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-[#09090b]/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0 select-none">
            <span className="text-xl">🧙🏻‍♂️</span>
            <span className="text-base font-bold tracking-tight text-zinc-100 whitespace-nowrap">
              Biblioteca Infinita
            </span>
          </div>

          {/* Seletor de Idioma (Popover no Desktop / Bottom Sheet no Mobile) */}
          <div className="relative flex-shrink-0">
            {isMobile ? (
              <button
                type="button"
                onClick={() => handleOpenFilter("lang")}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold bg-[#141417] text-zinc-200 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all shadow-sm active:scale-95"
              >
                <span className="text-lg leading-none">{selectedLanguage.flag}</span>
                <span className="font-semibold text-zinc-100 text-sm">{selectedLanguage.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold bg-[#141417] text-zinc-200 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all shadow-sm"
                  >
                    <span className="text-lg leading-none">{selectedLanguage.flag}</span>
                    <span className="font-semibold text-zinc-100 text-sm">
                      {selectedLanguage.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-2 space-y-1">
                  {LANGUAGES.map((lang) => {
                    const isSelected = selectedLanguage.name === lang.name
                    return (
                      <button
                        key={lang.name}
                        type="button"
                        onClick={() => setSelectedLanguage(lang)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-sm flex items-center justify-between transition-colors",
                          isSelected
                            ? "bg-purple-950/40 text-purple-200"
                            : "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl leading-none">{lang.flag}</span>
                          <span className="font-medium text-sm">{lang.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                      </button>
                    )
                  })}
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </header>

      {/* ================= CONTEÚDO PRINCIPAL ================= */}
      <main className="max-w-5xl mx-auto px-0 sm:px-6 pt-3 sm:pt-4 pb-12 space-y-4">
        {/* CONTROLES COM RESPIRO LATERAL */}
        <div className="px-4 sm:px-0 space-y-3.5">
          {/* Abas de Formato (Opção B: Tipográfica com Underline Violeta) */}
          <div className="flex items-center gap-6 px-0.5 overflow-x-auto no-scrollbar border-b border-zinc-800/40 pb-0.5">
            {FORMAT_TABS.map((tab) => {
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "pb-2 text-sm transition-all flex-shrink-0 whitespace-nowrap border-b-2 font-medium",
                    isActive
                      ? "text-white border-purple-400 font-bold"
                      : "text-zinc-400 hover:text-zinc-200 border-transparent"
                  )}
                >
                  {tab}
                </button>
              )
            })}
          </div>

          {/* Bloco de Refinamento (Busca + Filtros) */}
          <div className="space-y-3">
            {/* Linha de Busca */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Search className="w-4 h-4" />
              </div>
              <Input
                type="text"
                placeholder="Buscar canais..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-9 py-2.5 h-10 bg-[#121215] border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 rounded-xl focus-visible:ring-1 focus-visible:ring-purple-500/20 focus-visible:border-purple-500/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-200"
                  title="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Linha de Filtros */}
            <div className="flex items-center gap-1.5 overflow-x-auto sm:overflow-visible no-scrollbar py-0.5">
              {/* Filtro Tema */}
              <div className="relative flex-shrink-0">
                {isMobile ? (
                  <div
                    className={cn(
                      "inline-flex items-center rounded-xl border transition-colors",
                      selectedTema
                        ? "bg-[#1a1625] text-purple-200 border-purple-800/60"
                        : "bg-[#141417] text-zinc-300 border-zinc-800"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenFilter("tema")}
                      className="px-3.5 py-1.5 text-sm font-medium flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <span>{selectedTema || "Tema"}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                    </button>
                    {selectedTema && (
                      <button
                        type="button"
                        onClick={() => setSelectedTema(null)}
                        className="pr-2.5 pl-0.5 py-1.5 text-zinc-400 hover:text-zinc-100"
                        title="Limpar este filtro"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <Popover>
                    <div
                      className={cn(
                        "inline-flex items-center rounded-xl border transition-colors",
                        selectedTema
                          ? "bg-[#1a1625] text-purple-200 border-purple-800/60"
                          : "bg-[#141417] text-zinc-300 border-zinc-800"
                      )}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="px-3.5 py-1.5 text-sm font-medium hover:text-zinc-100 flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <span>{selectedTema || "Tema"}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                        </button>
                      </PopoverTrigger>
                      {selectedTema && (
                        <button
                          type="button"
                          onClick={() => setSelectedTema(null)}
                          className="pr-2.5 pl-0.5 py-1.5 text-zinc-400 hover:text-zinc-100"
                          title="Limpar este filtro"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <PopoverContent className="w-52 p-1.5 space-y-0.5">
                      {FILTER_TEMAS.map((tema) => {
                        const isSelected = selectedTema === tema
                        return (
                          <button
                            key={tema}
                            type="button"
                            onClick={() =>
                              setSelectedTema(isSelected ? null : tema)
                            }
                            className={cn(
                              "w-full text-left px-3 py-2 text-sm rounded-xl flex items-center justify-between transition-colors",
                              isSelected
                                ? "bg-purple-950/40 text-purple-200"
                                : "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                            )}
                          >
                            <span>{tema}</span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-purple-400 font-semibold" />
                            )}
                          </button>
                        )
                      })}
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Filtro Legendas */}
              <div className="relative flex-shrink-0">
                {isMobile ? (
                  <div
                    className={cn(
                      "inline-flex items-center rounded-xl border transition-colors",
                      selectedLegendas
                        ? "bg-[#1a1625] text-purple-200 border-purple-800/60"
                        : "bg-[#141417] text-zinc-300 border-zinc-800"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenFilter("legendas")}
                      className="px-3.5 py-1.5 text-sm font-medium flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <span>{selectedLegendas || "Legendas"}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                    </button>
                    {selectedLegendas && (
                      <button
                        type="button"
                        onClick={() => setSelectedLegendas(null)}
                        className="pr-2.5 pl-0.5 py-1.5 text-zinc-400 hover:text-zinc-100"
                        title="Limpar este filtro"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <Popover>
                    <div
                      className={cn(
                        "inline-flex items-center rounded-xl border transition-colors",
                        selectedLegendas
                          ? "bg-[#1a1625] text-purple-200 border-purple-800/60"
                          : "bg-[#141417] text-zinc-300 border-zinc-800"
                      )}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="px-3.5 py-1.5 text-sm font-medium hover:text-zinc-100 flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <span>{selectedLegendas || "Legendas"}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                        </button>
                      </PopoverTrigger>
                      {selectedLegendas && (
                        <button
                          type="button"
                          onClick={() => setSelectedLegendas(null)}
                          className="pr-2.5 pl-0.5 py-1.5 text-zinc-400 hover:text-zinc-100"
                          title="Limpar este filtro"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <PopoverContent className="w-52 p-1.5 space-y-0.5">
                      {FILTER_LEGENDAS.map((leg) => {
                        const isSelected = selectedLegendas === leg
                        return (
                          <button
                            key={leg}
                            type="button"
                            onClick={() =>
                              setSelectedLegendas(isSelected ? null : leg)
                            }
                            className={cn(
                              "w-full text-left px-3 py-2 text-sm rounded-xl flex items-center justify-between transition-colors",
                              isSelected
                                ? "bg-purple-950/40 text-purple-200"
                                : "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                            )}
                          >
                            <span>{leg}</span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-purple-400 font-semibold" />
                            )}
                          </button>
                        )
                      })}
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Filtro Velocidade */}
              <div className="relative flex-shrink-0">
                {isMobile ? (
                  <div
                    className={cn(
                      "inline-flex items-center rounded-xl border transition-colors",
                      selectedVelocidade
                        ? "bg-[#1a1625] text-purple-200 border-purple-800/60"
                        : "bg-[#141417] text-zinc-300 border-zinc-800"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenFilter("velocidade")}
                      className="px-3.5 py-1.5 text-sm font-medium flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <span>{selectedVelocidade || "Velocidade da fala"}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                    </button>
                    {selectedVelocidade && (
                      <button
                        type="button"
                        onClick={() => setSelectedVelocidade(null)}
                        className="pr-2.5 pl-0.5 py-1.5 text-zinc-400 hover:text-zinc-100"
                        title="Limpar este filtro"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <Popover>
                    <div
                      className={cn(
                        "inline-flex items-center rounded-xl border transition-colors",
                        selectedVelocidade
                          ? "bg-[#1a1625] text-purple-200 border-purple-800/60"
                          : "bg-[#141417] text-zinc-300 border-zinc-800"
                      )}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="px-3.5 py-1.5 text-sm font-medium hover:text-zinc-100 flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <span>{selectedVelocidade || "Velocidade da fala"}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                        </button>
                      </PopoverTrigger>
                      {selectedVelocidade && (
                        <button
                          type="button"
                          onClick={() => setSelectedVelocidade(null)}
                          className="pr-2.5 pl-0.5 py-1.5 text-zinc-400 hover:text-zinc-100"
                          title="Limpar este filtro"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <PopoverContent className="w-52 p-1.5 space-y-0.5">
                      {FILTER_VELOCIDADES.map((vel) => {
                        const isSelected = selectedVelocidade === vel
                        return (
                          <button
                            key={vel}
                            type="button"
                            onClick={() =>
                              setSelectedVelocidade(isSelected ? null : vel)
                            }
                            className={cn(
                              "w-full text-left px-3 py-2 text-sm rounded-xl flex items-center justify-between transition-colors",
                              isSelected
                                ? "bg-purple-950/40 text-purple-200"
                                : "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                            )}
                          >
                            <span>{vel}</span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-purple-400 font-semibold" />
                            )}
                          </button>
                        )
                      })}
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Botão Favoritos */}
              <button
                type="button"
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-sm font-medium flex items-center gap-2 flex-shrink-0 whitespace-nowrap transition-all border",
                  onlyFavorites
                    ? "bg-[#25121b] text-rose-300 border-rose-900/60"
                    : "bg-[#141417] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border-zinc-800 hover:border-zinc-700"
                )}
              >
                <Heart
                  className={cn(
                    "w-4 h-4 transition-colors",
                    onlyFavorites
                      ? "fill-rose-500 text-rose-500"
                      : "text-zinc-500"
                  )}
                />
                <span>Favoritos</span>
              </button>

              {/* Botão Global Limpar Filtros */}
              {hasAnyFilter && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-sm text-zinc-400 hover:text-zinc-100 flex items-center gap-1.5 px-3 py-1.5 font-medium ml-auto flex-shrink-0 whitespace-nowrap transition-colors rounded-lg hover:bg-zinc-800/50"
                >
                  <X className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Limpar filtros</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================= GRADE DE CARDS (PADRÃO ARTCRAFT / SKELETON SEM CONTEÚDO) ================= */}
        {/* Quando não há conteúdo ainda (estado pedido: build existing design with DS, no content yet): */}
        <div className="w-full border-y sm:border border-zinc-800 sm:rounded-xl bg-[#09090b] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-hidden shadow-lg">
          {Array.from({ length: 9 }).map((_, idx) => (
            <article
              key={idx}
              className="channel-card group relative p-6 sm:p-7 flex flex-col justify-between border-b border-zinc-800 last:border-b-0 md:last:border-b lg:border-b lg:border-zinc-800 lg:border-r lg:border-zinc-800 md:max-lg:border-r md:max-lg:border-zinc-800 md:max-lg:border-b md:max-lg:border-zinc-800"
            >
              <div className="space-y-4">
                {/* Cabeçalho do Card: Avatar e Botão Favorito */}
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0">
                    <Skeleton className="w-full h-full rounded-full" />
                  </div>
                  <div className="w-8 h-8 rounded-lg border border-zinc-800/80 bg-zinc-900/40 flex items-center justify-center text-zinc-700">
                    <Heart className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Título & Descrição / Bio Placeholder */}
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <div className="space-y-1.5 pt-1">
                    <Skeleton className="h-3.5 w-full rounded-md" />
                    <Skeleton className="h-3.5 w-5/6 rounded-md" />
                  </div>
                </div>
              </div>

              {/* Tags / Badges: Linha 1 Temas e Linha 2 Suporte Técnico */}
              <div className="pt-6 space-y-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="theme" className="opacity-60">
                    Tema
                  </Badge>
                  <Badge variant="theme" className="opacity-40">
                    Subtema
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="default" className="opacity-50">
                    Legendas CC
                  </Badge>
                  <Badge variant="default" className="opacity-50">
                    Fala natural
                  </Badge>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* ================= BOTTOM SHEET MOBILE PARA FILTROS (VAUL) ================= */}
      <Sheet
        open={Boolean(mobileSheetType)}
        onOpenChange={(open) => !open && setMobileSheetType(null)}
      >
        <SheetContent>
          <SheetHeader className="pb-3 border-b border-zinc-800/80">
            <SheetTitle>
              {mobileSheetType === "lang" && "Selecionar Idioma"}
              {mobileSheetType === "tema" && "Filtrar por Tema"}
              {mobileSheetType === "legendas" && "Filtrar por Legendas"}
              {mobileSheetType === "velocidade" && "Filtrar por Velocidade"}
            </SheetTitle>
          </SheetHeader>

          <div className="py-3 space-y-1 overflow-y-auto max-h-[60vh]">
            {mobileSheetType === "lang" &&
              LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage.name === lang.name
                return (
                  <button
                    key={lang.name}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(lang)
                      setMobileSheetType(null)
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-base flex items-center justify-between transition-colors",
                      isSelected
                        ? "bg-[#1a1625] text-purple-200"
                        : "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-purple-400" />}
                  </button>
                )
              })}

            {mobileSheetType === "tema" &&
              FILTER_TEMAS.map((tema) => {
                const isSelected = selectedTema === tema
                return (
                  <button
                    key={tema}
                    type="button"
                    onClick={() => {
                      setSelectedTema(isSelected ? null : tema)
                      setMobileSheetType(null)
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-base flex items-center justify-between transition-colors",
                      isSelected
                        ? "bg-[#1a1625] text-purple-200"
                        : "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                    )}
                  >
                    <span>{tema}</span>
                    {isSelected && <Check className="w-5 h-5 text-purple-400" />}
                  </button>
                )
              })}

            {mobileSheetType === "legendas" &&
              FILTER_LEGENDAS.map((leg) => {
                const isSelected = selectedLegendas === leg
                return (
                  <button
                    key={leg}
                    type="button"
                    onClick={() => {
                      setSelectedLegendas(isSelected ? null : leg)
                      setMobileSheetType(null)
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-base flex items-center justify-between transition-colors",
                      isSelected
                        ? "bg-[#1a1625] text-purple-200"
                        : "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                    )}
                  >
                    <span>{leg}</span>
                    {isSelected && <Check className="w-5 h-5 text-purple-400" />}
                  </button>
                )
              })}

            {mobileSheetType === "velocidade" &&
              FILTER_VELOCIDADES.map((vel) => {
                const isSelected = selectedVelocidade === vel
                return (
                  <button
                    key={vel}
                    type="button"
                    onClick={() => {
                      setSelectedVelocidade(isSelected ? null : vel)
                      setMobileSheetType(null)
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-base flex items-center justify-between transition-colors",
                      isSelected
                        ? "bg-[#1a1625] text-purple-200"
                        : "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                    )}
                  >
                    <span>{vel}</span>
                    {isSelected && <Check className="w-5 h-5 text-purple-400" />}
                  </button>
                )
              })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
