import * as React from "react"
import {
  Check,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  Plus,
  X,
  Clock,
  RefreshCw,
  Sparkles,
  Subtitles,
  Headphones,
  Pencil,
} from "lucide-react"
import type { ContentItem } from "./ContentCard"
import { LANGUAGES, FORMAT_TABS } from "@/constants/content"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const SUBTITLE_OPTIONS = [
  "Legendas [CC]",
  "Legendas bilíngues",
  "Legendas fixas",
  "Sem legendas",
]

const TRANSCRIPT_OPTIONS = ["Com transcrição", "Sem transcrição"]

export interface ReviewQueueProps {
  dataStore: Record<string, Record<string, ContentItem[]>>
  onUpdateItem: (item: ContentItem, format: string, langKey: string) => Promise<void>
  onDeleteItem: (id: string, format: string, langKey: string) => Promise<void>
  onMoveItem: (
    id: string,
    fromFormat: string,
    toFormat: string,
    fromLangKey: string,
    toLangKey: string
  ) => Promise<void>
}

interface FlattenedReviewItem extends ContentItem {
  _langKey: string
  _format: string
}

export function ReviewQueue({
  dataStore,
  onUpdateItem,
  onDeleteItem,
  onMoveItem,
}: ReviewQueueProps) {
  // --- FILTROS DA FILA ---
  const [selectedLangKey, setSelectedLangKey] = React.useState<string>("all")
  const [selectedFormat, setSelectedFormat] = React.useState<string>("all")
  const [filterStatus, setFilterStatus] = React.useState<"pending" | "later" | "all">("pending")

  const [filterLangOpen, setFilterLangOpen] = React.useState(false)
  const [filterFormatOpen, setFilterFormatOpen] = React.useState(false)

  // Índice ativo
  const [currentIndex, setCurrentIndex] = React.useState(0)

  // --- CAMPOS EDITÁVEIS DIRETOS ---
  const [currUrl, setCurrUrl] = React.useState("")
  const [currName, setCurrName] = React.useState("")
  const [currAvatar, setCurrAvatar] = React.useState("")
  const [currDesc, setCurrDesc] = React.useState("")
  const [currFormat, setCurrFormat] = React.useState<string>("YouTube")
  const [currLangKey, setCurrLangKey] = React.useState<string>("english")
  const [currDifficulty, setCurrDifficulty] = React.useState<string>("normal")
  const [currSubtitleTag, setCurrSubtitleTag] = React.useState<string>("Sem legendas")
  const [currTranscriptTag, setCurrTranscriptTag] = React.useState<string>(TRANSCRIPT_OPTIONS[0])
  const [currTags, setCurrTags] = React.useState<string[]>([])

  // Edição de URL inline
  const [isEditingUrl, setIsEditingUrl] = React.useState(false)

  // Popovers
  const [cardLangOpen, setCardLangOpen] = React.useState(false)
  const [cardFormatOpen, setCardFormatOpen] = React.useState(false)
  const [cardSupportOpen, setCardSupportOpen] = React.useState(false)
  const [cardTagPickerOpen, setCardTagPickerOpen] = React.useState(false)
  const [tagSearch, setTagSearch] = React.useState("")

  // Estados de carregamento
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isRefreshingAvatar, setIsRefreshingAvatar] = React.useState(false)
  const [isRegeneratingDesc, setIsRegeneratingDesc] = React.useState(false)

  // Feedback Toast com Desfazer
  const [toast, setToast] = React.useState<{
    message: string
    type: "approved" | "deleted" | "later"
    item: FlattenedReviewItem
    prevIndex: number
    targetFormat?: string
    targetLangKey?: string
  } | null>(null)

  // Tags disponíveis no acervo
  const allAvailableTags = React.useMemo(() => {
    const set = new Set<string>()
    Object.values(dataStore).forEach((formats) => {
      if (formats && typeof formats === "object") {
        Object.values(formats).forEach((items) => {
          if (Array.isArray(items)) {
            items.forEach((item) => {
              item.tags?.forEach((t) => set.add(t))
            })
          }
        })
      }
    })
    return Array.from(set).sort()
  }, [dataStore])

  const filteredTagSuggestions = React.useMemo(() => {
    const q = tagSearch.trim().toLowerCase()
    return allAvailableTags.filter(
      (t) =>
        !currTags.some((st) => st.toLowerCase() === t.toLowerCase()) &&
        (!q || t.toLowerCase().includes(q))
    )
  }, [allAvailableTags, currTags, tagSearch])

  // Estatísticas globais
  const stats = React.useMemo(() => {
    let total = 0
    let reviewed = 0
    let later = 0
    Object.values(dataStore).forEach((fmts) => {
      if (fmts && typeof fmts === "object") {
        Object.values(fmts).forEach((items) => {
          if (Array.isArray(items)) {
            items.forEach((i) => {
              total++
              if (i.reviewed) reviewed++
              if (i.needsAttention) later++
            })
          }
        })
      }
    })
    const pending = total - reviewed - later
    return { total, reviewed, later, pending }
  }, [dataStore])

  // Monta a lista filtrada de itens
  const items: FlattenedReviewItem[] = React.useMemo(() => {
    const list: FlattenedReviewItem[] = []
    const langKeys = selectedLangKey === "all" ? Object.keys(dataStore) : [selectedLangKey]

    for (const lk of langKeys) {
      if (!dataStore[lk]) continue
      const formats = selectedFormat === "all" ? FORMAT_TABS : [selectedFormat]

      for (const fmt of formats) {
        const catItems = dataStore[lk][fmt] || []
        for (const item of catItems) {
          if (filterStatus === "pending") {
            if (item.reviewed || item.needsAttention) continue
          } else if (filterStatus === "later") {
            if (!item.needsAttention) continue
          }
          list.push({
            ...item,
            _langKey: lk,
            _format: fmt,
          })
        }
      }
    }
    return list
  }, [dataStore, selectedLangKey, selectedFormat, filterStatus])

  const safeIndex = Math.min(currentIndex, Math.max(0, items.length - 1))
  const currentItem: FlattenedReviewItem | undefined = items[safeIndex]

  // Sincroniza campos quando o item ativo muda
  React.useEffect(() => {
    if (currentItem) {
      setCurrUrl(currentItem.url || "")
      setCurrName(currentItem.name || "")
      setCurrAvatar(currentItem.avatar || "")
      setCurrDesc(currentItem.desc || "")
      const itemFormat = currentItem._format || "YouTube"
      setCurrFormat(itemFormat)
      setCurrLangKey(currentItem._langKey || "english")
      setCurrDifficulty(currentItem.difficulty === "iniciante" ? "iniciante" : "normal")
      const defaultSubtitle = itemFormat === "YouTube" ? "Sem legendas" : SUBTITLE_OPTIONS[0]
      setCurrSubtitleTag(currentItem.subtitleTag || defaultSubtitle)
      setCurrTranscriptTag(currentItem.transcriptTag || TRANSCRIPT_OPTIONS[0])
      setCurrTags(currentItem.tags || [])
      setIsEditingUrl(false)
    }
  }, [currentItem?.id, currentItem?._format, currentItem?._langKey])

  const currentCardLang = React.useMemo(() => {
    return LANGUAGES.find((l) => l.id === currLangKey) || LANGUAGES[0]
  }, [currLangKey])

  // --- AÇÕES ---

  // Salvar e Próximo
  const handleSaveAndNext = async () => {
    if (!currentItem || isProcessing) return
    setIsProcessing(true)

    try {
      const updated: ContentItem = {
        ...currentItem,
        name: currName.trim() || currentItem.name,
        url: currUrl.trim() || currentItem.url,
        avatar: currAvatar || currentItem.avatar,
        desc: currDesc.trim(),
        difficulty: currDifficulty === "iniciante" ? "iniciante" : undefined,
        subtitleTag: currFormat !== "Podcasts" ? currSubtitleTag : undefined,
        transcriptTag: currFormat === "Podcasts" ? currTranscriptTag : undefined,
        tags: currTags,
        reviewed: true,
        needsAttention: false,
      }

      const formatChanged = currFormat !== currentItem._format
      const langChanged = currLangKey !== currentItem._langKey

      if (formatChanged || langChanged) {
        await onMoveItem(
          currentItem.id,
          currentItem._format,
          currFormat,
          currentItem._langKey,
          currLangKey
        )
        await onUpdateItem(updated, currFormat, currLangKey)
      } else {
        await onUpdateItem(updated, currentItem._format, currentItem._langKey)
      }

      setToast({
        message: `✓ "${updated.name}" aprovado com sucesso`,
        type: "approved",
        item: currentItem,
        prevIndex: safeIndex,
        targetFormat: currFormat,
        targetLangKey: currLangKey,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Pular / Ajustar Depois
  const handleMarkLater = async () => {
    if (!currentItem || isProcessing) return
    setIsProcessing(true)

    try {
      const updated: ContentItem = {
        ...currentItem,
        name: currName.trim() || currentItem.name,
        url: currUrl.trim() || currentItem.url,
        avatar: currAvatar || currentItem.avatar,
        desc: currDesc.trim(),
        difficulty: currDifficulty === "iniciante" ? "iniciante" : undefined,
        subtitleTag: currFormat !== "Podcasts" ? currSubtitleTag : undefined,
        transcriptTag: currFormat === "Podcasts" ? currTranscriptTag : undefined,
        tags: currTags,
        needsAttention: true,
        reviewed: false,
      }

      await onUpdateItem(updated, currentItem._format, currentItem._langKey)

      setToast({
        message: `Enviado para a fila de Ajustar Depois: "${updated.name}"`,
        type: "later",
        item: currentItem,
        prevIndex: safeIndex,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Excluir
  const handleDelete = async () => {
    if (!currentItem || isProcessing) return
    setIsProcessing(true)

    try {
      const deleted = { ...currentItem }
      await onDeleteItem(currentItem.id, currentItem._format, currentItem._langKey)

      setToast({
        message: `Removido do acervo: "${deleted.name}"`,
        type: "deleted",
        item: deleted,
        prevIndex: safeIndex,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Desfazer
  const handleUndo = async () => {
    if (!toast || isProcessing) return
    setIsProcessing(true)

    try {
      const { type, item, targetFormat, targetLangKey } = toast

      if (type === "approved") {
        if (
          targetFormat &&
          targetLangKey &&
          (targetFormat !== item._format || targetLangKey !== item._langKey)
        ) {
          await onMoveItem(item.id, targetFormat, item._format, targetLangKey, item._langKey)
        }
        await onUpdateItem({ ...item, reviewed: false }, item._format, item._langKey)
      } else if (type === "deleted") {
        await onUpdateItem(item, item._format, item._langKey)
      } else if (type === "later") {
        await onUpdateItem({ ...item, needsAttention: false }, item._format, item._langKey)
      }

      setToast(null)
    } finally {
      setIsProcessing(false)
    }
  }

  // Re-extrair foto
  const handleRefreshAvatar = async () => {
    if (!currUrl.trim() || isRefreshingAvatar) return
    setIsRefreshingAvatar(true)

    try {
      const res = await fetch("/api/refresh-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentItem?.id || "temp",
          name: currName,
          url: currUrl,
          avatar: currAvatar,
          desc: currDesc,
          tags: currTags,
          _format: currFormat,
          _langKey: currLangKey,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.item?.avatar) {
          setCurrAvatar(data.item.avatar)
        }
      }
    } catch (err) {
      console.error("Erro ao re-extrair avatar:", err)
    } finally {
      setIsRefreshingAvatar(false)
    }
  }

  // Regenerar descrição
  const handleRegenerateDesc = async () => {
    if (!currUrl.trim() || isRegeneratingDesc) return
    setIsRegeneratingDesc(true)

    try {
      const res = await fetch("/api/regenerate-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: currUrl,
          name: currName,
          currentDesc: currDesc,
          format: currFormat,
          langKey: currLangKey,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.desc) {
          setCurrDesc(data.desc)
        }
      }
    } catch (err) {
      console.error("Erro ao regenerar descrição:", err)
    } finally {
      setIsRegeneratingDesc(false)
    }
  }

  // Adicionar Tag
  const handleAddTag = (rawTag: string) => {
    const clean = rawTag.trim().replace(/^#+/, "")
    if (!clean) return
    if (!currTags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setCurrTags([...currTags, clean])
    }
    setTagSearch("")
    setCardTagPickerOpen(false)
  }

  // Remover Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setCurrTags(currTags.filter((t) => t !== tagToRemove))
  }

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  const handleNext = () => {
    if (currentIndex < items.length - 1) setCurrentIndex(currentIndex + 1)
  }

  // Atalhos de teclado
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement

      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleSaveAndNext()
        return
      }

      if (isInput) return

      if (e.key === "Enter") {
        e.preventDefault()
        handleSaveAndNext()
      } else if (e.key.toLowerCase() === "s") {
        e.preventDefault()
        handleMarkLater()
      } else if (e.key.toLowerCase() === "d") {
        e.preventDefault()
        handleDelete()
      } else if (e.key.toLowerCase() === "z" && (e.ctrlKey || e.metaKey || !e.shiftKey)) {
        if (toast) {
          e.preventDefault()
          handleUndo()
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        handlePrev()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        handleNext()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [
    currentItem,
    currName,
    currUrl,
    currAvatar,
    currDesc,
    currDifficulty,
    currFormat,
    currLangKey,
    currSubtitleTag,
    currTranscriptTag,
    currTags,
    toast,
    currentIndex,
    items.length,
  ])

  // Limpa exibição de URL
  const displayUrl = currUrl.replace(/^https?:\/\/(www\.)?/, "")

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 pb-20 pt-4">
      {/* ================= BARRA DE CONTROLE DA FILA (LIMPA & ESPAÇOSA) ================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-sm pb-2 border-b border-zinc-800/80">
        {/* Lado Esquerdo: Status da Fila */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setFilterStatus("pending")
              setCurrentIndex(0)
            }}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2",
              filterStatus === "pending"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            <span>Pendentes</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold">
              {stats.pending}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterStatus("later")
              setCurrentIndex(0)
            }}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2",
              filterStatus === "later"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            <span>Ajustar Depois</span>
            {stats.later > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/60 font-semibold">
                {stats.later}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterStatus("all")
              setCurrentIndex(0)
            }}
            className={cn(
              "px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer",
              filterStatus === "all"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            Todos
          </button>
        </div>

        {/* Lado Direito: Filtro de Idioma e Formato */}
        <div className="flex items-center gap-2">
          {/* Idioma */}
          <Popover open={filterLangOpen} onOpenChange={setFilterLangOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 cursor-pointer text-xs font-medium transition-colors"
              >
                <span>
                  {selectedLangKey === "all"
                    ? "Todos os Idiomas"
                    : LANGUAGES.find((l) => l.id === selectedLangKey)?.flag +
                      " " +
                      LANGUAGES.find((l) => l.id === selectedLangKey)?.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-1.5 bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl">
              <button
                type="button"
                onClick={() => {
                  setSelectedLangKey("all")
                  setFilterLangOpen(false)
                  setCurrentIndex(0)
                }}
                className={cn(
                  "w-full px-3 py-2 text-xs rounded-lg flex items-center justify-between cursor-pointer",
                  selectedLangKey === "all"
                    ? "bg-zinc-800 text-white font-medium"
                    : "text-zinc-300 hover:bg-zinc-900"
                )}
              >
                <span>Todos os Idiomas</span>
                {selectedLangKey === "all" && <Check className="w-3.5 h-3.5 text-purple-400" />}
              </button>
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    setSelectedLangKey(l.id)
                    setFilterLangOpen(false)
                    setCurrentIndex(0)
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-xs rounded-lg flex items-center justify-between cursor-pointer",
                    selectedLangKey === l.id
                      ? "bg-zinc-800 text-white font-medium"
                      : "text-zinc-300 hover:bg-zinc-900"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span>{l.flag}</span>
                    <span>{l.name}</span>
                  </span>
                  {selectedLangKey === l.id && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Formato */}
          <Popover open={filterFormatOpen} onOpenChange={setFilterFormatOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 cursor-pointer text-xs font-medium transition-colors"
              >
                <span>{selectedFormat === "all" ? "Todos os Formatos" : selectedFormat}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-1.5 bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl">
              <button
                type="button"
                onClick={() => {
                  setSelectedFormat("all")
                  setFilterFormatOpen(false)
                  setCurrentIndex(0)
                }}
                className={cn(
                  "w-full px-3 py-2 text-xs rounded-lg flex items-center justify-between cursor-pointer",
                  selectedFormat === "all"
                    ? "bg-zinc-800 text-white font-medium"
                    : "text-zinc-300 hover:bg-zinc-900"
                )}
              >
                <span>Todos os Formatos</span>
                {selectedFormat === "all" && <Check className="w-3.5 h-3.5 text-purple-400" />}
              </button>
              {FORMAT_TABS.map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => {
                    setSelectedFormat(fmt)
                    setFilterFormatOpen(false)
                    setCurrentIndex(0)
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-xs rounded-lg flex items-center justify-between cursor-pointer",
                    selectedFormat === fmt
                      ? "bg-zinc-800 text-white font-medium"
                      : "text-zinc-300 hover:bg-zinc-900"
                  )}
                >
                  <span>{fmt}</span>
                  {selectedFormat === fmt && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ================= TOAST COM UNDO [Z] ================= */}
      {toast && (
        <div className="bg-zinc-900 border border-zinc-700/80 px-4 py-3 rounded-xl flex items-center justify-between text-sm text-zinc-100 shadow-xl animate-in fade-in-0 duration-150">
          <span className="truncate mr-4">{toast.message}</span>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleUndo}
              className="inline-flex items-center gap-1.5 font-medium text-purple-400 hover:text-purple-300 underline underline-offset-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Desfazer [Z]</span>
            </button>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-zinc-400 hover:text-zinc-100 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= CARD PRINCIPAL DE CURADORIA ================= */}
      {items.length === 0 ? (
        <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-100">
            Fila zerada para estes filtros!
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            {filterStatus === "pending"
              ? "Todos os conteúdos foram revisados. Você pode alterar os filtros acima para revisar outros idiomas ou formatos."
              : "Nenhum conteúdo marcado como pendente de ajuste neste recorte."}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedLangKey("all")
                setSelectedFormat("all")
                setFilterStatus("pending")
                setCurrentIndex(0)
              }}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium cursor-pointer transition-colors"
            >
              Exibir fila geral
            </button>
          </div>
        </div>
      ) : currentItem ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          {/* BARRA SUPERIOR DO ITEM: Contador & Navegação */}
          <div className="px-6 py-3.5 bg-zinc-950/60 border-b border-zinc-800/80 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span className="font-medium text-zinc-200">
                Item <span className="font-bold text-white">{safeIndex + 1}</span> de{" "}
                <span className="text-zinc-400">{items.length}</span>
              </span>
              {currentItem.needsAttention && (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300">
                  Ajustar Depois
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={safeIndex === 0}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 disabled:opacity-20 cursor-pointer transition-colors"
                title="Item anterior [←]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={safeIndex >= items.length - 1}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 disabled:opacity-20 cursor-pointer transition-colors"
                title="Próximo item [→]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-7">
            {/* 1. CABEÇALHO DO CONTEÚDO: Avatar + Título + URL + Idioma/Formato */}
            <div className="flex items-start gap-4">
              {/* Foto do Conteúdo */}
              <div className="relative group shrink-0">
                {currAvatar ? (
                  <img
                    src={currAvatar}
                    alt={currName}
                    className="w-16 h-16 rounded-2xl object-cover border border-zinc-700/80 bg-zinc-800 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-500 font-bold text-lg">
                    ?
                  </div>
                )}
                {currUrl && (
                  <button
                    type="button"
                    onClick={handleRefreshAvatar}
                    disabled={isRefreshingAvatar}
                    title="Atualizar ícone pela URL"
                    className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-zinc-800 border border-zinc-600 text-zinc-300 hover:text-white shadow cursor-pointer transition-transform hover:scale-105"
                  >
                    <RefreshCw
                      className={cn("w-3.5 h-3.5", isRefreshingAvatar && "animate-spin")}
                    />
                  </button>
                )}
              </div>

              {/* Informações Principais */}
              <div className="flex-1 min-w-0 space-y-1.5">
                {/* Título Editável */}
                <input
                  type="text"
                  value={currName}
                  onChange={(e) => setCurrName(e.target.value)}
                  placeholder="Nome do canal ou conteúdo..."
                  className="w-full bg-transparent text-xl sm:text-2xl font-bold text-zinc-100 placeholder:text-zinc-600 outline-none border-b border-transparent hover:border-zinc-700 focus:border-purple-500 pb-0.5 transition-colors"
                />

                {/* Linha de Link & URL */}
                <div className="flex items-center gap-3 pt-0.5">
                  {isEditingUrl ? (
                    <div className="flex items-center gap-2 w-full max-w-lg">
                      <input
                        autoFocus
                        type="text"
                        value={currUrl}
                        onChange={(e) => setCurrUrl(e.target.value)}
                        onBlur={() => setIsEditingUrl(false)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setIsEditingUrl(false)
                        }}
                        placeholder="https://..."
                        className="w-full bg-zinc-950 border border-zinc-700 text-xs font-mono text-zinc-200 px-3 py-1.5 rounded-lg outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => setIsEditingUrl(false)}
                        className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded cursor-pointer"
                      >
                        Pronto
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                      {currUrl ? (
                        <a
                          href={currUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-purple-300 inline-flex items-center gap-1.5 transition-colors"
                          title="Abrir conteúdo no navegador"
                        >
                          <span className="truncate max-w-md">{displayUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-zinc-600">Sem link cadastrado</span>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsEditingUrl(true)}
                        className="text-zinc-500 hover:text-zinc-300 p-0.5 transition-colors cursor-pointer"
                        title="Editar URL"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Seletores de Contexto: Idioma & Formato */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Idioma */}
                <Popover open={cardLangOpen} onOpenChange={setCardLangOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 hover:border-zinc-500 cursor-pointer text-xs font-medium transition-colors"
                    >
                      <span className="text-sm">{currentCardLang.flag}</span>
                      <span>{currentCardLang.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-1.5 bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          setCurrLangKey(l.id)
                          setCardLangOpen(false)
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-xs rounded-lg flex items-center justify-between cursor-pointer",
                          currLangKey === l.id
                            ? "bg-zinc-800 text-white font-medium"
                            : "text-zinc-300 hover:bg-zinc-900"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm">{l.flag}</span>
                          <span>{l.name}</span>
                        </span>
                        {currLangKey === l.id && (
                          <Check className="w-3.5 h-3.5 text-purple-400" />
                        )}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>

                {/* Formato */}
                <Popover open={cardFormatOpen} onOpenChange={setCardFormatOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 hover:border-zinc-500 cursor-pointer text-xs font-medium transition-colors"
                    >
                      <span>{currFormat}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-1.5 bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl">
                    {FORMAT_TABS.map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => {
                          setCurrFormat(fmt)
                          if (!currentItem?.subtitleTag) {
                            setCurrSubtitleTag(fmt === "YouTube" ? "Sem legendas" : SUBTITLE_OPTIONS[0])
                          }
                          setCardFormatOpen(false)
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-xs rounded-lg flex items-center justify-between cursor-pointer",
                          currFormat === fmt
                            ? "bg-zinc-800 text-white font-medium"
                            : "text-zinc-300 hover:bg-zinc-900"
                        )}
                      >
                        <span>{fmt}</span>
                        {currFormat === fmt && (
                          <Check className="w-3.5 h-3.5 text-purple-400" />
                        )}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 2. LINHA DE CURADORIA: Nível & Legendas (Agrupadas lado a lado) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Classificação & Acessibilidade
              </label>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Botão de 1 clique: Para Iniciantes */}
                <button
                  type="button"
                  onClick={() =>
                    setCurrDifficulty((prev) => (prev === "iniciante" ? "normal" : "iniciante"))
                  }
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium cursor-pointer transition-all",
                    currDifficulty === "iniciante"
                      ? "bg-emerald-950/80 border-emerald-600/80 text-emerald-300 shadow-sm"
                      : "bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
                  )}
                >
                  <span>🌱</span>
                  <span>Para Iniciantes</span>
                  {currDifficulty === "iniciante" && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>

                {/* Seletor de Legendas / Transcrição */}
                <Popover open={cardSupportOpen} onOpenChange={setCardSupportOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-zinc-200 hover:border-zinc-500 cursor-pointer text-sm font-medium transition-colors"
                    >
                      {currFormat === "Podcasts" ? (
                        <Headphones className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Subtitles className="w-4 h-4 text-purple-400" />
                      )}
                      <span>
                        {currFormat === "Podcasts" ? currTranscriptTag : currSubtitleTag}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-52 p-1.5 bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl">
                    {(currFormat === "Podcasts" ? TRANSCRIPT_OPTIONS : SUBTITLE_OPTIONS).map(
                      (s) => {
                        const isSelected =
                          currFormat === "Podcasts"
                            ? currTranscriptTag === s
                            : currSubtitleTag === s
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              if (currFormat === "Podcasts") setCurrTranscriptTag(s)
                              else setCurrSubtitleTag(s)
                              setCardSupportOpen(false)
                            }}
                            className={cn(
                              "w-full px-3 py-2 text-xs rounded-lg flex items-center justify-between cursor-pointer",
                              isSelected
                                ? "bg-zinc-800 text-white font-medium"
                                : "text-zinc-300 hover:bg-zinc-900"
                            )}
                          >
                            <span>{s}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-purple-400" />
                            )}
                          </button>
                        )
                      }
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 3. TAGS TEMÁTICAS (Discretas, sem contorno neon) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Tags & Temas
              </label>

              <div className="flex items-center gap-2 flex-wrap">
                {currTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg bg-zinc-800/90 text-zinc-200 border border-zinc-700/60 text-xs font-medium"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-zinc-400 hover:text-white p-0.5 cursor-pointer rounded"
                      aria-label={`Remover tag ${tag}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}

                <Popover open={cardTagPickerOpen} onOpenChange={setCardTagPickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar tag</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2 bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Buscar ou criar nova tag..."
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && tagSearch.trim()) {
                          e.preventDefault()
                          handleAddTag(tagSearch)
                        }
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 px-3 py-2 rounded-lg mb-2 outline-none focus:border-purple-500"
                    />
                    <div className="max-h-48 overflow-y-auto space-y-0.5">
                      {filteredTagSuggestions.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleAddTag(t)}
                          className="w-full px-2.5 py-1.5 text-xs text-left text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          #{t}
                        </button>
                      ))}
                      {tagSearch.trim() && (
                        <button
                          type="button"
                          onClick={() => handleAddTag(tagSearch.trim())}
                          className="w-full px-2.5 py-2 text-xs text-left text-purple-300 hover:bg-zinc-800 rounded-lg cursor-pointer flex items-center gap-1.5 font-medium border-t border-zinc-800 mt-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Criar "#{tagSearch.trim()}"</span>
                        </button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 4. DESCRIÇÃO: Espaçosa, Confortável e sem Cortes Artificiais */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Descrição do Conteúdo
                </label>

                <button
                  type="button"
                  onClick={handleRegenerateDesc}
                  disabled={isRegeneratingDesc}
                  className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors cursor-pointer disabled:opacity-40"
                  title="Regenerar descrição com IA a partir do conteúdo do canal"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isRegeneratingDesc ? "Gerando..." : "Regenerar IA"}</span>
                </button>
              </div>

              <textarea
                value={currDesc}
                onChange={(e) => setCurrDesc(e.target.value)}
                placeholder="Escreva ou edite o resumo explicativo deste canal..."
                rows={4}
                className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-zinc-600 rounded-xl p-4 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none leading-relaxed transition-colors resize-y min-h-[110px]"
              />
            </div>

            {/* 5. RODAPÉ DE DECISÃO TÁTIL (Botões Primários & Atalhos) */}
            <div className="border-t border-zinc-800/80 pt-6 flex items-center justify-between">
              {/* Lado Esquerdo: Excluir */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={isProcessing}
                className="px-4 py-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl cursor-pointer transition-colors text-sm font-medium flex items-center gap-2"
                title="Excluir do catálogo [D]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir [D]</span>
              </button>

              {/* Lado Direito: Ajustar Depois & Aprovar/Próximo */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleMarkLater}
                  disabled={isProcessing}
                  className="px-4 py-2.5 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700/60 rounded-xl cursor-pointer transition-colors text-sm font-medium flex items-center gap-2"
                  title="Pular para a fila de ajuste posterior [S]"
                >
                  <Clock className="w-4 h-4" />
                  <span>Ajustar depois [S]</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndNext}
                  disabled={isProcessing || !currName.trim()}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl cursor-pointer transition-colors shadow-md flex items-center gap-2 text-sm disabled:opacity-40"
                  title="Aprovar e avançar para o próximo item [Enter]"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar & Próximo [Enter]</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
