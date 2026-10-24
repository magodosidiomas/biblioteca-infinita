import * as React from "react"
import {
  ChevronDown,
  Check,
  X,
  Plus,
  Loader2,
  RotateCcw,
  AlertTriangle,
  Trash2,
  Pencil,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  CheckSquare,
  Square,
  MoveRight,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ContentCard, type ContentItem } from "@/components/ContentCard"
import { ReviewQueue } from "./ReviewQueue"
import { resolveTag } from "@/constants/tags"
import contentData from "@/data/content.json"
import { LANGUAGES, FORMAT_TABS, type Language } from "@/constants/content"
import { cn } from "@/lib/utils"

const SORT_OPTIONS = [
  { id: "name-asc", label: "Nome (A-Z)" },
  { id: "name-desc", label: "Nome (Z-A)" },
] as const

type SortOptionId = (typeof SORT_OPTIONS)[number]["id"]

const DIFFICULTY_OPTIONS = [
  { id: "normal", label: "Imersão Padrão (Nativo)" },
  { id: "iniciante", label: "🌱 Iniciante (Acessível / Guiado)" },
] as const

type DifficultyId = (typeof DIFFICULTY_OPTIONS)[number]["id"]

const SUBTITLE_OPTIONS = [
  "Legendas [CC]",
  "Legendas bilíngues",
  "Legendas fixas",
  "Sem legendas",
]

const TRANSCRIPT_OPTIONS = ["Com transcrição", "Sem transcrição"]

const CONNECTORS = new Set([
  "de",
  "da",
  "do",
  "dos",
  "das",
  "e",
  "em",
  "com",
  "para",
  "por",
  "a",
  "o",
  "as",
  "os",
])

function normalizeTag(raw: string, existingList: string[]): string {
  const trimmed = raw.trim().replace(/\s+/g, " ")
  if (!trimmed) return ""

  const match = existingList.find((t) => t.toLowerCase() === trimmed.toLowerCase())
  if (match) return match

  const words = trimmed.toLowerCase().split(" ")
  const formattedWords = words.map((word, index) => {
    if (index > 0 && CONNECTORS.has(word)) {
      return word
    }
    return word.charAt(0).toUpperCase() + word.slice(1)
  })

  return formattedWords.join(" ")
}

function extractChannelHandle(rawUrl: string): string {
  if (!rawUrl) return ""
  const u = rawUrl.toLowerCase().split("?")[0].replace(/\/+$/, "")
  const handleMatch = u.match(/@([a-z0-9_.-]+)/)
  if (handleMatch) return handleMatch[1].replace(/[^a-z0-9]/g, "")
  const cMatch = u.match(/\/(c|user)\/([a-z0-9_.-]+)/)
  if (cMatch) return cMatch[2].replace(/[^a-z0-9]/g, "")
  const chMatch = u.match(/\/channel\/([a-z0-9_-]+)/)
  if (chMatch) return chMatch[1]
  return ""
}

function normalizeKey(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
}

interface AdminFormProps {
  onBackToCatalog: () => void
}

interface ManagedItem extends ContentItem {
  _langKey: string
  _format: string
}

export function AdminForm({ onBackToCatalog }: AdminFormProps) {
  // Aba ativa: 'review' (Revisão Rápida), 'add' (Novo Conteúdo), 'manage' (Acervo Completo)
  const [activeAdminTab, setActiveAdminTab] = React.useState<"review" | "add" | "manage">("review")

  // Base de dados local em memória
  const [dataStore, setDataStore] = React.useState<Record<string, Record<string, ContentItem[]>>>(
    () => contentData as unknown as Record<string, Record<string, ContentItem[]>>
  )

  // Drawer / Sheet lateral de edição rápida
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [sheetItem, setSheetItem] = React.useState<ManagedItem | null>(null)

  // Estados dos campos de formulário (usados no Sheet e na Adição)
  const [url, setUrl] = React.useState("")
  const [format, setFormat] = React.useState("YouTube")
  const [language, setLanguage] = React.useState<Language>(LANGUAGES[0])
  const [name, setName] = React.useState("")
  const [creator, setCreator] = React.useState("")
  const [id, setId] = React.useState("")
  const [avatar, setAvatar] = React.useState("")
  const [desc, setDesc] = React.useState("")
  const [difficulty, setDifficulty] = React.useState<DifficultyId>("normal")
  const [subtitleTag, setSubtitleTag] = React.useState("Sem legendas")
  const [transcriptTag, setTranscriptTag] = React.useState(TRANSCRIPT_OPTIONS[0])
  const platformTag = "Netflix"
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])

  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [hasExtracted, setHasExtracted] = React.useState(false)

  // Popovers do formulário
  const [langOpen, setLangOpen] = React.useState(false)
  const [formatOpen, setFormatOpen] = React.useState(false)
  const [tagPickerOpen, setTagPickerOpen] = React.useState(false)
  const [tagSearch, setTagSearch] = React.useState("")
  const [supportOpen, setSupportOpen] = React.useState(false)

  // Feedback Toast com Undo
  const [toast, setToast] = React.useState<{
    id: string
    name: string
    format: string
    langKey: string
    item?: ContentItem
    items?: ManagedItem[]
    type: "add" | "delete" | "update" | "bulk-delete" | "bulk-move"
  } | null>(null)

  // Exclusão individual
  const [itemToDelete, setItemToDelete] = React.useState<ManagedItem | null>(null)

  // --- ESTADOS DA ABA "GERENCIAMENTO EM LOTE" ---
  const [searchTableQuery, setSearchTableQuery] = React.useState("")
  const [selectedFilterLang, setSelectedFilterLang] = React.useState<string>("all")
  const [selectedFilterFormat, setSelectedFilterFormat] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<SortOptionId>("name-asc")
  const [sortPopoverOpen, setSortPopoverOpen] = React.useState(false)
  const [tablePage, setTablePage] = React.useState(1)
  const [refreshingItemId, setRefreshingItemId] = React.useState<string | null>(null)
  const PAGE_SIZE = 25

  // Seleção múltipla para ações em lote
  const [selectedItemKeys, setSelectedItemKeys] = React.useState<Set<string>>(new Set())
  const [isBulkDeleting, setIsBulkDeleting] = React.useState(false)
  const [isBulkRefreshing, setIsBulkRefreshing] = React.useState(false)
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = React.useState(false)
  const [bulkMovePopoverOpen, setBulkMovePopoverOpen] = React.useState(false)
  const [bulkMoveTargetLang, setBulkMoveTargetLang] = React.useState<string>(LANGUAGES[0].id)
  const [bulkMoveTargetFormat, setBulkMoveTargetFormat] = React.useState<string>(FORMAT_TABS[0])

  // Lista plana de todos os itens para busca e operações globais
  const allManagedItems: ManagedItem[] = React.useMemo(() => {
    const list: ManagedItem[] = []
    Object.entries(dataStore).forEach(([langKey, formats]) => {
      if (formats && typeof formats === "object") {
        Object.entries(formats).forEach(([fmt, items]) => {
          if (Array.isArray(items)) {
            items.forEach((item) => {
              list.push({ ...item, _langKey: langKey, _format: fmt })
            })
          }
        })
      }
    })
    return list
  }, [dataStore])

  // Todas as tags conhecidas
  const allAvailableTags = React.useMemo(() => {
    const set = new Set<string>()
    allManagedItems.forEach((item) => {
      item.tags?.forEach((t) => set.add(t))
    })
    return Array.from(set).sort()
  }, [allManagedItems])

  const filteredTags = React.useMemo(() => {
    const q = tagSearch.trim().toLowerCase()
    return allAvailableTags.filter(
      (t) =>
        !selectedTags.some((st) => st.toLowerCase() === t.toLowerCase()) &&
        (!q || t.toLowerCase().includes(q))
    )
  }, [allAvailableTags, selectedTags, tagSearch])

  // Detecção de duplicata ao colar link no Novo Conteúdo
  const existingDuplicate = React.useMemo(() => {
    if (!url.trim() || sheetItem) return null
    const cleanUrl = url.trim().toLowerCase().replace(/\/+$/, "").split("?")[0]
    const inputHandle = extractChannelHandle(cleanUrl)
    const inputNameKey = normalizeKey(name)
    const inputIdKey = normalizeKey(id)

    return allManagedItems.find((x) => {
      const xUrl = (x.url || "").toLowerCase().replace(/\/+$/, "").split("?")[0]
      if (cleanUrl && xUrl === cleanUrl) return true
      const xHandle = extractChannelHandle(xUrl)
      if (inputHandle && xHandle && inputHandle === xHandle) return true
      if (inputNameKey && inputNameKey.length >= 3 && normalizeKey(x.name) === inputNameKey) {
        return true
      }
      if (inputIdKey && inputIdKey.length >= 3 && normalizeKey(x.id).includes(inputIdKey)) {
        return true
      }
      return false
    })
  }, [url, id, name, allManagedItems, sheetItem])

  // Itens filtrados para a tabela da aba Gerenciamento em Lote
  const filteredTableItems = React.useMemo(() => {
    const q = searchTableQuery.trim().toLowerCase()
    const filtered = allManagedItems.filter((item) => {
      if (selectedFilterLang !== "all" && item._langKey !== selectedFilterLang) return false
      if (selectedFilterFormat !== "all" && item._format !== selectedFilterFormat) return false

      if (q) {
        const matchesName = item.name.toLowerCase().includes(q)
        const matchesDesc = (item.desc || "").toLowerCase().includes(q)
        const matchesTag = item.tags?.some((t) => t.toLowerCase().includes(q))
        const matchesUrl = (item.url || "").toLowerCase().includes(q)
        if (!matchesName && !matchesDesc && !matchesTag && !matchesUrl) return false
      }
      return true
    })

    return filtered.sort((a, b) => {
      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name, undefined, { sensitivity: "base", numeric: true })
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true })
    })
  }, [allManagedItems, searchTableQuery, selectedFilterLang, selectedFilterFormat, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredTableItems.length / PAGE_SIZE))
  const paginatedItems = React.useMemo(() => {
    const start = (tablePage - 1) * PAGE_SIZE
    return filteredTableItems.slice(start, start + PAGE_SIZE)
  }, [filteredTableItems, tablePage])

  // Extração automática ao colar URL
  const extractMetadata = async (targetUrl: string) => {
    if (!targetUrl || (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://"))) {
      return
    }

    setIsLoading(true)
    try {
      const isYt = /youtube\.com|youtu\.be/i.test(targetUrl)
      const isPod = /spotify\.com|apple\.com\/podcast|podcasts\./i.test(targetUrl)
      const isSeries = /netflix\.com|imdb\.com|thetvdb\.com/i.test(targetUrl)

      let detectedFormat = "YouTube"
      if (isPod) detectedFormat = "Podcasts"
      else if (isSeries) detectedFormat = "Séries"
      else if (!isYt) detectedFormat = "Recursos"

      setFormat(detectedFormat)
      if (detectedFormat === "YouTube" && (!sheetItem || !sheetItem.subtitleTag)) {
        setSubtitleTag("Sem legendas")
      }

      const resp = await fetch(`/api/fetch-meta?url=${encodeURIComponent(targetUrl)}`)
      if (!resp.ok) throw new Error("Falha ao puxar metadados")

      const data = await resp.json()
      setName(data.title || "")
      setDesc(data.desc || "")
      setAvatar(data.avatar || "")

      if (data.creator) setCreator(data.creator)

      const slug = (data.title || "item")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
      setId(slug)

      setHasExtracted(true)
    } catch {
      // continua limpo
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlChange = (val: string) => {
    setUrl(val)
    if (val.startsWith("http://") || val.startsWith("https://")) {
      const timer = setTimeout(() => extractMetadata(val), 300)
      return () => clearTimeout(timer)
    }
  }

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").trim()
    if (pasted.startsWith("http://") || pasted.startsWith("https://")) {
      setUrl(pasted)
      extractMetadata(pasted)
    }
  }

  const handleAddTag = (tagInput: string) => {
    const resolved = resolveTag(tagInput) || normalizeTag(tagInput, allAvailableTags)
    if (!resolved) return

    if (!selectedTags.some((t) => t.toLowerCase() === resolved.toLowerCase())) {
      setSelectedTags((prev) => [...prev, resolved])
    }
    setTagSearch("")
    setTagPickerOpen(false)
  }

  const handleCreateCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagSearch.trim()) {
      e.preventDefault()
      handleAddTag(tagSearch.trim())
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags((prev) =>
      prev.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase())
    )
  }

  const resetFormFields = () => {
    setUrl("")
    setName("")
    setCreator("")
    setId("")
    setAvatar("")
    setDesc("")
    setDifficulty("normal")
    setSubtitleTag("Sem legendas")
    setSelectedTags([])
    setHasExtracted(false)
    setSheetItem(null)
  }

  // Abrir o Sheet lateral para editar o card clicado
  const openSheetForEdit = (item: ContentItem, currentLangKey?: string, currentFormat?: string) => {
    const lk = currentLangKey || (item as ManagedItem)._langKey || LANGUAGES[0].id
    const fmt = currentFormat || (item as ManagedItem)._format || FORMAT_TABS[0]
    const managed: ManagedItem = { ...item, _langKey: lk, _format: fmt }

    setSheetItem(managed)
    setUrl(managed.url || "")
    setName(managed.name || "")
    setId(managed.id)
    setAvatar(managed.avatar || "")
    setDesc(managed.desc || "")
    setFormat(fmt)
    const foundLang = LANGUAGES.find((l) => l.id === lk) || LANGUAGES[0]
    setLanguage(foundLang)
    setDifficulty((managed.difficulty as DifficultyId) || "normal")
    const defaultSub = fmt === "YouTube" ? "Sem legendas" : SUBTITLE_OPTIONS[0]
    setSubtitleTag(managed.subtitleTag || defaultSub)
    setTranscriptTag(managed.transcriptTag || TRANSCRIPT_OPTIONS[0])
    setSelectedTags(managed.tags || [])
    setCreator(managed.creator || "")
    setHasExtracted(true)
    setIsSheetOpen(true)
  }

  // Gravar no backend e atualizar dataStore
  const handleSave = async (isUpdate = false) => {
    if (!url.trim() || !name.trim()) return

    setIsSaving(true)
    const finalId = id.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "_")

    const newItem: ContentItem = {
      id: finalId,
      name: name.trim(),
      url: url.trim(),
      language: language.name,
      tags: selectedTags.length > 0 ? selectedTags : ["Cultura"],
      ...(difficulty !== "normal" && { difficulty }),
      avatar:
        avatar.trim() ||
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
      desc: desc.trim(),
      ...((format === "YouTube" || format === "Professores" || format === "Pronúncia") && { subtitleTag }),
      ...(format === "Podcasts" && { transcriptTag, ...(creator && { creator: creator.trim() }) }),
      ...(format === "Séries" && { platformTag }),
    }

    try {
      const originalLangKey = sheetItem?._langKey
      const originalFormat = sheetItem?._format

      const res = await fetch("/api/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          item: newItem,
          isUpdate: isUpdate || Boolean(sheetItem),
          langKey: language.id,
          originalLangKey,
          originalFormat,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        if (errData.error === "already_exists") {
          setIsSaving(false)
          return
        }
        throw new Error("Erro ao salvar")
      }

      // Atualiza dataStore local
      setDataStore((prev) => {
        const next = { ...prev }
        const langK = language.id

        if (originalLangKey || originalFormat) {
          const prevLang = originalLangKey || langK
          const prevFmt = originalFormat || format
          if (prevLang !== langK || prevFmt !== format) {
            if (next[prevLang] && next[prevLang][prevFmt]) {
              next[prevLang][prevFmt] = next[prevLang][prevFmt].filter(
                (x) => x.id !== finalId && x.url !== newItem.url
              )
            }
          }
        }

        if (!next[langK]) next[langK] = {}
        const currentList = [...(next[langK][format] || [])]
        const existingIdx = currentList.findIndex((x) => x.id === finalId)
        if (existingIdx >= 0) {
          currentList[existingIdx] = newItem
        } else {
          currentList.unshift(newItem)
        }
        next[langK][format] = currentList
        return next
      })

      setToast({
        id: finalId,
        name: newItem.name,
        format,
        langKey: language.id,
        item: newItem,
        type: sheetItem ? "update" : "add",
      })

      setIsSheetOpen(false)
      resetFormFields()
    } catch {
      // Trata erro
    } finally {
      setIsSaving(false)
    }
  }

  // Exclusão individual
  const handleDeleteItem = async (targetItem: ManagedItem) => {
    try {
      const res = await fetch("/api/delete-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: targetItem._format,
          id: targetItem.id,
          langKey: targetItem._langKey,
        }),
      })

      if (!res.ok) throw new Error("Erro ao excluir")

      setDataStore((prev) => {
        const next = { ...prev }
        const lk = targetItem._langKey
        const fmt = targetItem._format
        if (next[lk] && next[lk][fmt]) {
          next[lk][fmt] = next[lk][fmt].filter((x) => x.id !== targetItem.id)
        }
        return next
      })

      // Se estava selecionado no bulk, desmarca
      setSelectedItemKeys((prev) => {
        const next = new Set(prev)
        next.delete(`${targetItem._langKey}:${targetItem._format}:${targetItem.id}`)
        return next
      })

      setToast({
        id: targetItem.id,
        name: targetItem.name,
        format: targetItem._format,
        langKey: targetItem._langKey,
        item: targetItem,
        type: "delete",
      })
    } catch {
      // Trata erro
    }
  }

  // Re-extrair avatar
  const handleRefreshAvatar = async (targetItem: ManagedItem) => {
    setRefreshingItemId(targetItem.id)
    try {
      const res = await fetch("/api/refresh-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: targetItem._format,
          id: targetItem.id,
          langKey: targetItem._langKey,
          url: targetItem.url,
        }),
      })

      if (!res.ok) throw new Error("Falha ao atualizar ícone")

      const data = await res.json()
      if (data.avatar) {
        setDataStore((prev) => {
          const next = { ...prev }
          const lk = targetItem._langKey
          const fmt = targetItem._format
          if (next[lk] && next[lk][fmt]) {
            next[lk][fmt] = next[lk][fmt].map((x) =>
              x.id === targetItem.id ? { ...x, avatar: data.avatar } : x
            )
          }
          return next
        })

        if (sheetItem?.id === targetItem.id) {
          setAvatar(data.avatar)
        }

        setToast({
          id: targetItem.id,
          name: targetItem.name,
          format: targetItem._format,
          langKey: targetItem._langKey,
          item: { ...targetItem, avatar: data.avatar },
          type: "update",
        })
      }
    } catch {
      // Trata erro
    } finally {
      setRefreshingItemId(null)
    }
  }

  // --- AÇÕES EM LOTE (BULK) ---
  const toggleSelectAllPage = () => {
    const pageKeys = paginatedItems.map(
      (item) => `${item._langKey}:${item._format}:${item.id}`
    )
    const allSelected = pageKeys.every((k) => selectedItemKeys.has(k))

    setSelectedItemKeys((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        pageKeys.forEach((k) => next.delete(k))
      } else {
        pageKeys.forEach((k) => next.add(k))
      }
      return next
    })
  }

  const toggleSelectItem = (item: ManagedItem) => {
    const key = `${item._langKey}:${item._format}:${item.id}`
    setSelectedItemKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const selectedItemsList: ManagedItem[] = React.useMemo(() => {
    return allManagedItems.filter((i) =>
      selectedItemKeys.has(`${i._langKey}:${i._format}:${i.id}`)
    )
  }, [allManagedItems, selectedItemKeys])

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedItemsList.length === 0) return
    setIsBulkDeleting(true)

    try {
      const payload = selectedItemsList.map((i) => ({
        id: i.id,
        format: i._format,
        langKey: i._langKey,
      }))

      const res = await fetch("/api/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      })

      if (!res.ok) throw new Error("Erro na exclusão em lote")

      const deletedItems = [...selectedItemsList]
      setDataStore((prev) => {
        const next = { ...prev }
        payload.forEach(({ id, format: fmt, langKey: lk }) => {
          if (next[lk] && next[lk][fmt]) {
            next[lk][fmt] = next[lk][fmt].filter((x) => x.id !== id)
          }
        })
        return next
      })

      setSelectedItemKeys(new Set())
      setBulkDeleteConfirmOpen(false)

      setToast({
        id: "bulk-delete",
        name: `${deletedItems.length} canais`,
        format: "",
        langKey: "",
        items: deletedItems,
        type: "bulk-delete",
      })
    } catch {
      // Trata erro
    } finally {
      setIsBulkDeleting(false)
    }
  }

  // Bulk Move (Idioma / Formato)
  const handleBulkMove = async (targetLangKey: string, targetFormat: string) => {
    if (selectedItemsList.length === 0) return
    try {
      const payload = selectedItemsList.map((i) => ({
        id: i.id,
        format: i._format,
        langKey: i._langKey,
      }))

      const res = await fetch("/api/bulk-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: payload,
          targetLangKey,
          targetFormat,
        }),
      })

      if (!res.ok) throw new Error("Erro ao mover canais")

      setDataStore((prev) => {
        const next = { ...prev }
        payload.forEach(({ id, format: origFmt, langKey: origLang }) => {
          if (next[origLang] && next[origLang][origFmt]) {
            const itemIdx = next[origLang][origFmt].findIndex((x) => x.id === id)
            if (itemIdx >= 0) {
              const [item] = next[origLang][origFmt].splice(itemIdx, 1)
              if (!next[targetLangKey]) next[targetLangKey] = {}
              if (!next[targetLangKey][targetFormat]) next[targetLangKey][targetFormat] = []
              next[targetLangKey][targetFormat].unshift(item)
            }
          }
        })
        return next
      })

      setSelectedItemKeys(new Set())
      setBulkMovePopoverOpen(false)

      setToast({
        id: "bulk-move",
        name: `${selectedItemsList.length} canais`,
        format: targetFormat,
        langKey: targetLangKey,
        type: "bulk-move",
      })
    } catch {
      // Trata erro
    }
  }

  // Bulk Refresh Icons
  const handleBulkRefreshAvatars = async () => {
    if (selectedItemsList.length === 0) return
    setIsBulkRefreshing(true)
    try {
      for (const item of selectedItemsList) {
        await handleRefreshAvatar(item)
      }
    } finally {
      setIsBulkRefreshing(false)
    }
  }

  // Desfazer (Undo)
  const handleUndo = async () => {
    if (!toast) return
    const { item, format: fmt, langKey: lk, type, items } = toast

    try {
      if (type === "delete" && item) {
        await fetch("/api/save-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ format: fmt, item, isUpdate: false, langKey: lk }),
        })
        setDataStore((prev) => {
          const next = { ...prev }
          if (!next[lk]) next[lk] = {}
          if (!next[lk][fmt]) next[lk][fmt] = []
          next[lk][fmt].unshift(item)
          return next
        })
      } else if (type === "bulk-delete" && items) {
        for (const it of items) {
          await fetch("/api/save-content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ format: it._format, item: it, isUpdate: false, langKey: it._langKey }),
          })
        }
        setDataStore((prev) => {
          const next = { ...prev }
          items.forEach((it) => {
            if (!next[it._langKey]) next[it._langKey] = {}
            if (!next[it._langKey][it._format]) next[it._langKey][it._format] = []
            next[it._langKey][it._format].unshift(it)
          })
          return next
        })
      } else if ((type === "add" || type === "update") && item) {
        await fetch("/api/delete-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ format: fmt, id: item.id, langKey: lk }),
        })
        setDataStore((prev) => {
          const next = { ...prev }
          if (next[lk] && next[lk][fmt]) {
            next[lk][fmt] = next[lk][fmt].filter((x) => x.id !== item.id)
          }
          return next
        })
      }
      setToast(null)
    } catch {
      // Trata erro
    }
  }

  React.useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 8000)
    return () => clearTimeout(timer)
  }, [toast])

  // --- REVISÃO RÁPIDA: Handlers e Estatísticas ---
  const unreviewedCount = React.useMemo(() => {
    let count = 0
    for (const lk of Object.keys(dataStore)) {
      for (const fmt of FORMAT_TABS) {
        const list = dataStore[lk]?.[fmt] || []
        for (const item of list) {
          if (!item.reviewed) count++
        }
      }
    }
    return count
  }, [dataStore])

  const handleReviewUpdate = async (item: ContentItem, fmt: string, lk: string) => {
    setDataStore((prev) => {
      const next = { ...prev }
      if (next[lk] && next[lk][fmt]) {
        const idx = next[lk][fmt].findIndex((x) => x.id === item.id)
        if (idx >= 0) {
          next[lk][fmt] = [
            ...next[lk][fmt].slice(0, idx),
            item,
            ...next[lk][fmt].slice(idx + 1),
          ]
        } else {
          next[lk][fmt] = [item, ...next[lk][fmt]]
        }
      }
      return next
    })

    await fetch("/api/save-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item,
        format: fmt,
        langKey: lk,
        isUpdate: true,
      }),
    })
  }

  const handleReviewDelete = async (id: string, fmt: string, lk: string) => {
    setDataStore((prev) => {
      const next = { ...prev }
      if (next[lk] && next[lk][fmt]) {
        next[lk][fmt] = next[lk][fmt].filter((x) => x.id !== id)
      }
      return next
    })

    await fetch("/api/delete-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        format: fmt,
        langKey: lk,
      }),
    })
  }

  const handleReviewMove = async (
    id: string,
    fromFmt: string,
    toFmt: string,
    fromLk: string,
    toLk: string
  ) => {
    setDataStore((prev) => {
      const next = { ...prev }
      if (next[fromLk] && next[fromLk][fromFmt]) {
        const idx = next[fromLk][fromFmt].findIndex((x) => x.id === id)
        if (idx >= 0) {
          const [moved] = next[fromLk][fromFmt].splice(idx, 1)
          if (!next[toLk]) next[toLk] = {}
          if (!next[toLk][toFmt]) next[toLk][toFmt] = []
          next[toLk][toFmt].unshift(moved)
        }
      }
      return next
    })

    await fetch("/api/bulk-move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ id, format: fromFmt, langKey: fromLk }],
        targetLangKey: toLk,
        targetFormat: toFmt,
      }),
    })
  }

  // Card para live preview
  const previewItem: ContentItem = {
    id: id || "preview",
    name: name || "Nome do Conteúdo",
    url: url || "#",
    tags: selectedTags.length > 0 ? selectedTags : ["Tag"],
    ...(difficulty !== "normal" && { difficulty }),
    avatar:
      avatar ||
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    desc: desc || "Descrição que aparecerá nos cards da Biblioteca Infinita...",
    ...((format === "YouTube" || format === "Professores" || format === "Pronúncia") && { subtitleTag }),
    ...(format === "Podcasts" && { transcriptTag, creator: creator || "Criador" }),
    ...(format === "Séries" && { platformTag }),
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-purple-900 selection:text-white pb-24">
      {/* ================= TOPNAV DO PAINEL ADMIN ================= */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-[#09090b]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Lado Esquerdo: Identificação */}
          <div className="flex items-center gap-2 select-none">
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              Biblioteca Infinita
            </span>
            <span className="text-zinc-600 font-light text-sm">/</span>
            <span className="text-xs font-medium text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/50">
              Curadoria
            </span>
          </div>

          {/* TopNav: 3 Abas Alinhadas */}
          <nav className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800/80 text-sm font-medium">
            {/* Aba 1: Revisão Rápida */}
            <button
              type="button"
              onClick={() => {
                setActiveAdminTab("review")
                setIsSheetOpen(false)
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2 text-sm",
                activeAdminTab === "review"
                  ? "bg-zinc-800 text-white font-medium shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <span>Revisão Rápida</span>
              {unreviewedCount > 0 && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold">
                  {unreviewedCount}
                </span>
              )}
            </button>

            {/* Aba 2: Novo Conteúdo */}
            <button
              type="button"
              onClick={() => {
                setActiveAdminTab("add")
                setIsSheetOpen(false)
                resetFormFields()
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2 text-sm",
                activeAdminTab === "add"
                  ? "bg-zinc-800 text-white font-medium shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <span>Novo Conteúdo</span>
            </button>

            {/* Aba 3: Acervo Completo */}
            <button
              type="button"
              onClick={() => {
                setActiveAdminTab("manage")
                setIsSheetOpen(false)
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2 text-sm",
                activeAdminTab === "manage"
                  ? "bg-zinc-800 text-white font-medium shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <span>Acervo Geral</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/40">
                {allManagedItems.length}
              </span>
            </button>
          </nav>

          {/* Lado Direito: Sair do Admin */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={onBackToCatalog}
              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <span>Voltar ao catálogo</span>
              <span className="text-zinc-500 text-xs">↗</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= TOAST GLOBAL DISMISSABLE COM UNDO ================= */}
      {toast && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3">
          <div className="bg-emerald-950/80 border border-emerald-800/80 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-200 shadow-lg animate-in fade-in-0 duration-200">
            <span className="truncate mr-2">
              ✓ <strong className="font-semibold text-white">{toast.name}</strong>{" "}
              {toast.type === "delete" || toast.type === "bulk-delete"
                ? "removido(s) do acervo."
                : toast.type === "bulk-move"
                ? "movido(s) com sucesso."
                : toast.type === "update"
                ? "atualizado com sucesso."
                : "adicionado ao acervo."}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {(toast.type === "delete" || toast.type === "bulk-delete" || toast.type === "add") && (
                <button
                  type="button"
                  onClick={handleUndo}
                  className="inline-flex items-center gap-1 font-semibold text-emerald-300 hover:text-white underline underline-offset-2 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Desfazer</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-emerald-400 hover:text-emerald-100 p-0.5 cursor-pointer ml-1"
                aria-label="Fechar aviso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ABA 2: GERENCIAMENTO EM LOTE (TABELA DENSA COM SELEÇÃO MÚLTIPLA) ================= */}
      {activeAdminTab === "manage" && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-4">
          {/* Barra de Filtros da Tabela */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#121215] border border-zinc-800 rounded-xl p-3 shadow-md">
            {/* Input de Busca */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTableQuery}
                onChange={(e) => {
                  setSearchTableQuery(e.target.value)
                  setTablePage(1)
                }}
                placeholder="Filtrar por nome, tag ou link..."
                className="w-full bg-[#18181b] border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 rounded-lg pl-9 pr-3 h-9 outline-none focus:border-purple-600"
              />
            </div>

            {/* Filtros de Idioma, Formato e Ordenação */}
            <div className="flex items-center gap-2 shrink-0 text-xs flex-wrap">
              <select
                value={selectedFilterLang}
                onChange={(e) => {
                  setSelectedFilterLang(e.target.value)
                  setTablePage(1)
                }}
                className="bg-[#18181b] border border-zinc-800 text-zinc-300 rounded-lg px-2.5 h-9 outline-none cursor-pointer hover:border-zinc-700"
              >
                <option value="all">Todos os Idiomas</option>
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedFilterFormat}
                onChange={(e) => {
                  setSelectedFilterFormat(e.target.value)
                  setTablePage(1)
                }}
                className="bg-[#18181b] border border-zinc-800 text-zinc-300 rounded-lg px-2.5 h-9 outline-none cursor-pointer hover:border-zinc-700"
              >
                <option value="all">Todos os Formatos</option>
                {FORMAT_TABS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              {/* Ordenação */}
              <Popover open={sortPopoverOpen} onOpenChange={setSortPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-[#18181b] border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white cursor-pointer transition-colors"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{SORT_OPTIONS.find((o) => o.id === sortBy)?.label || "Ordenar"}</span>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-44 p-1 bg-[#121215] border-zinc-800 rounded-xl shadow-xl" align="end">
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = sortBy === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.id)
                          setSortPopoverOpen(false)
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer",
                          isSelected
                            ? "bg-[#1e1528] text-purple-200 font-semibold"
                            : "text-zinc-300 hover:bg-zinc-800/60"
                        )}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 font-semibold" />}
                      </button>
                    )
                  })}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tabela de Conteúdos com Checkbox de Seleção em Lote */}
          <div className="border border-zinc-800 rounded-xl bg-[#121215] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-[#16161a] text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3 w-10 text-center">
                      <button
                        type="button"
                        onClick={toggleSelectAllPage}
                        className="text-zinc-400 hover:text-white cursor-pointer"
                        title="Selecionar todos desta página"
                      >
                        {paginatedItems.length > 0 &&
                        paginatedItems.every((i) =>
                          selectedItemKeys.has(`${i._langKey}:${i._format}:${i.id}`)
                        ) ? (
                          <CheckSquare className="w-4 h-4 text-purple-400" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-600" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-4">Canal / Conteúdo</th>
                    <th className="py-3 px-3">Idioma</th>
                    <th className="py-3 px-3">Formato</th>
                    <th className="py-3 px-3">Suporte & Nível</th>
                    <th className="py-3 px-3">Tags</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {paginatedItems.map((item) => {
                    const langInfo = LANGUAGES.find((l) => l.id === item._langKey)
                    const itemKey = `${item._langKey}:${item._format}:${item.id}`
                    const isSelected = selectedItemKeys.has(itemKey)

                    return (
                      <tr
                        key={itemKey}
                        className={cn(
                          "transition-colors group",
                          isSelected
                            ? "bg-purple-950/20 hover:bg-purple-950/30"
                            : "hover:bg-zinc-800/30"
                        )}
                      >
                        {/* Checkbox de Linha */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleSelectItem(item)}
                            className="cursor-pointer text-zinc-500 hover:text-zinc-200"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-purple-400" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                            )}
                          </button>
                        </td>

                        {/* Nome + Avatar */}
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.avatar}
                              alt={item.name}
                              className="w-8 h-8 rounded-full object-cover border border-zinc-800 shrink-0 bg-zinc-900"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).src =
                                  "https://www.google.com/s2/favicons?domain=youtube.com&sz=128"
                              }}
                            />
                            <div className="min-w-0 max-w-[220px]">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-zinc-100 hover:text-purple-300 transition-colors truncate block flex items-center gap-1"
                              >
                                <span className="truncate">{item.name}</span>
                                <ExternalLink className="w-3 h-3 text-zinc-500 shrink-0" />
                              </a>
                              <span className="text-[11px] text-zinc-500 truncate block">
                                {item.desc || "Sem descrição"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Idioma */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-zinc-300">
                          <span className="inline-flex items-center gap-1.5">
                            <span>{langInfo?.flag || "🌐"}</span>
                            <span>{langInfo?.name || item._langKey}</span>
                          </span>
                        </td>

                        {/* Formato */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#18181b] border border-zinc-800 text-zinc-400">
                            {item._format}
                          </span>
                        </td>

                        {/* Suporte & Nível */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-zinc-400">
                          <div className="space-y-1">
                            <div>{item.subtitleTag || item.transcriptTag || "—"}</div>
                            {item.difficulty === "iniciante" && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-medium px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-800/50">
                                <span>🌱</span>
                                <span>Iniciante</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Tags */}
                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-[240px]">
                            {item.tags?.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.2 rounded text-[10px] bg-[#1e1528] text-purple-300 border border-purple-900/40"
                              >
                                {t}
                              </span>
                            ))}
                            {(item.tags?.length || 0) > 3 && (
                              <span className="text-[10px] text-zinc-500">
                                +{(item.tags?.length || 0) - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Ações */}
                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleRefreshAvatar(item)}
                              disabled={refreshingItemId === item.id}
                              className={cn(
                                "p-1.5 rounded-lg transition-colors cursor-pointer",
                                refreshingItemId === item.id
                                  ? "text-purple-400 bg-purple-950/40"
                                  : "text-zinc-400 hover:text-purple-300 hover:bg-zinc-800"
                              )}
                              title="Atualizar ícone (avatar)"
                            >
                              <RefreshCw
                                className={cn(
                                  "w-3.5 h-3.5",
                                  refreshingItemId === item.id && "animate-spin"
                                )}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => openSheetForEdit(item, item._langKey, item._format)}
                              className="p-1.5 text-zinc-400 hover:text-purple-300 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                              title="Editar este canal no painel lateral"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemToDelete(item)}
                              className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                              title="Excluir este canal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {paginatedItems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">
                        Nenhum canal encontrado com os filtros atuais.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="px-4 py-3 border-t border-zinc-800 bg-[#16161a] flex items-center justify-between text-xs text-zinc-400">
              <span>
                Mostrando{" "}
                <strong>
                  {Math.min((tablePage - 1) * PAGE_SIZE + 1, filteredTableItems.length)}
                </strong>{" "}
                a{" "}
                <strong>
                  {Math.min(tablePage * PAGE_SIZE, filteredTableItems.length)}
                </strong>{" "}
                de <strong>{filteredTableItems.length}</strong> canais
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={tablePage <= 1}
                  onClick={() => setTablePage((p) => Math.max(p - 1, 1))}
                  className="p-1 rounded-lg border border-zinc-800 bg-[#18181b] disabled:opacity-30 hover:border-zinc-700 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 text-zinc-300">
                  {tablePage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={tablePage >= totalPages}
                  onClick={() => setTablePage((p) => Math.min(p + 1, totalPages))}
                  className="p-1 rounded-lg border border-zinc-800 bg-[#18181b] disabled:opacity-30 hover:border-zinc-700 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* BARRA FLUTUANTE DE AÇÕES EM LOTE (QUANDO HOUVER SELEÇÃO) */}
          {selectedItemsList.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#141418] border border-purple-500/50 rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 text-xs animate-in fade-in-0 slide-in-from-bottom-4 duration-200">
              <div className="flex items-center gap-2 pr-2 border-r border-zinc-700">
                <span className="font-bold text-purple-300">
                  {selectedItemsList.length}
                </span>
                <span className="text-zinc-300">selecionados</span>
              </div>

              {/* Ação 1: Atualizar Ícones em Lote */}
              <button
                type="button"
                onClick={handleBulkRefreshAvatars}
                disabled={isBulkRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isBulkRefreshing && "animate-spin")} />
                <span>Atualizar Ícones</span>
              </button>

              {/* Ação 2: Mover Idioma / Formato */}
              <Popover open={bulkMovePopoverOpen} onOpenChange={setBulkMovePopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                  >
                    <MoveRight className="w-3.5 h-3.5 text-purple-400" />
                    <span>Mover para...</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3 bg-[#121215] border-zinc-800 rounded-xl shadow-2xl space-y-3">
                  <div className="text-xs font-semibold text-zinc-200">
                    Mover {selectedItemsList.length} canais
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-zinc-400">Novo Idioma</label>
                    <select
                      value={bulkMoveTargetLang}
                      onChange={(e) => setBulkMoveTargetLang(e.target.value)}
                      className="w-full bg-[#18181b] border border-zinc-800 text-xs rounded-lg p-2 text-zinc-200 outline-none"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.flag} {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-zinc-400">Novo Formato</label>
                    <select
                      value={bulkMoveTargetFormat}
                      onChange={(e) => setBulkMoveTargetFormat(e.target.value)}
                      className="w-full bg-[#18181b] border border-zinc-800 text-xs rounded-lg p-2 text-zinc-200 outline-none"
                    >
                      {FORMAT_TABS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBulkMove(bulkMoveTargetLang, bulkMoveTargetFormat)}
                    className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Confirmar Mudança
                  </button>
                </PopoverContent>
              </Popover>

              {/* Ação 3: Excluir em Lote */}
              <button
                type="button"
                onClick={() => setBulkDeleteConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/50 border border-rose-900/60 hover:bg-rose-900/60 text-rose-300 transition-colors cursor-pointer font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir selecionados</span>
              </button>

              {/* Cancelar Seleção */}
              <button
                type="button"
                onClick={() => setSelectedItemKeys(new Set())}
                className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                title="Limpar seleção"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      )}

      {/* ================= ABA 3: NOVO CONTEÚDO (PALETA DE ADIÇÃO POR URL) ================= */}
      {activeAdminTab === "add" && (
        <main className="max-w-xl mx-auto px-4 sm:px-6 pt-6">
          <div className="w-full bg-[#121215] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Aviso de Duplicata no Topo (se houver) */}
            {existingDuplicate && !toast && !sheetItem && (
              <div className="bg-[#181512] border-b border-amber-900/60 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200/90 animate-in fade-in-0 duration-150">
                <div className="flex items-center gap-2 truncate mr-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate text-zinc-300">
                    Canal já cadastrado como{" "}
                    <strong className="text-zinc-100 font-semibold">
                      {existingDuplicate.name}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  className="text-amber-400 hover:text-amber-200 font-medium underline underline-offset-2 shrink-0 cursor-pointer text-xs"
                >
                  Atualizar canal
                </button>
              </div>
            )}

            {/* Header / Input da URL */}
            <div className="relative flex items-center px-4 border-b border-zinc-800/80 bg-[#141418]">
              <input
                autoFocus
                type="text"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                onPaste={handleUrlPaste}
                placeholder="Cole o link do canal ou conteúdo..."
                className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 h-13 outline-none font-medium pr-16"
              />

              <div className="absolute right-4 flex items-center gap-2">
                {isLoading && (
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                )}
                <kbd
                  onClick={onBackToCatalog}
                  className="text-[10px] font-mono text-zinc-500 bg-zinc-800/60 px-1.5 py-0.5 rounded cursor-pointer hover:text-zinc-300"
                >
                  esc
                </kbd>
              </div>
            </div>

            {/* Metadados Automáticos (Zona Superior) */}
            {hasExtracted && (
              <div className="px-4 py-2.5 bg-[#131317] border-b border-zinc-800/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative group/avatar shrink-0">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        className="w-7 h-7 rounded-full object-cover border border-zinc-800 bg-zinc-900"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-zinc-800" />
                    )}
                    {url && (
                      <button
                        type="button"
                        onClick={() => {
                          if (url) {
                            handleRefreshAvatar({
                              id: id || "temp",
                              name: name || "Canal",
                              url,
                              avatar,
                              desc,
                              difficulty: difficulty !== "normal" ? difficulty : undefined,
                              tags: selectedTags,
                              _format: format,
                              _langKey: language.id,
                            })
                          }
                        }}
                        disabled={refreshingItemId === (id || "temp")}
                        title="Reextrair ícone da URL"
                        className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#1e1528] border border-purple-800/80 text-purple-300 hover:text-white shadow cursor-pointer transition-transform hover:scale-110"
                      >
                        <RefreshCw
                          className={cn(
                            "w-2.5 h-2.5",
                            refreshingItemId === (id || "temp") && "animate-spin"
                          )}
                        />
                      </button>
                    )}
                  </div>
                  <span className="font-semibold text-zinc-200 truncate">
                    {name || "Conteúdo identificado"}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Seletor de Idioma */}
                  <Popover open={langOpen} onOpenChange={setLangOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#18181b] border border-zinc-800 text-zinc-300 hover:border-zinc-700 cursor-pointer"
                      >
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                        <ChevronDown className="w-3 h-3 text-zinc-500" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-44 p-1 bg-[#121215] border-zinc-800 rounded-xl shadow-xl">
                      {LANGUAGES.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => {
                            setLanguage(l)
                            setLangOpen(false)
                          }}
                          className={cn(
                            "w-full px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between cursor-pointer",
                            language.id === l.id
                              ? "bg-[#1e1528] text-purple-200 font-semibold"
                              : "text-zinc-300 hover:bg-zinc-800/60"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <span>{l.flag}</span>
                            <span>{l.name}</span>
                          </span>
                          {language.id === l.id && (
                            <Check className="w-3 h-3 text-purple-400" />
                          )}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>

                  {/* Formato */}
                  <Popover open={formatOpen} onOpenChange={setFormatOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18181b] border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-medium cursor-pointer transition-colors"
                      >
                        <span>{format}</span>
                        <ChevronDown className="w-3 h-3 text-zinc-500" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-36 p-1 bg-[#121215] border-zinc-800 rounded-xl shadow-xl">
                      {FORMAT_TABS.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => {
                            setFormat(f)
                            setFormatOpen(false)
                          }}
                          className={cn(
                            "w-full px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between cursor-pointer",
                            format === f
                              ? "bg-[#1e1528] text-purple-200 font-semibold"
                              : "text-zinc-300 hover:bg-zinc-800/60"
                          )}
                        >
                          <span>{f}</span>
                          {format === f && (
                            <Check className="w-3 h-3 text-purple-400" />
                          )}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {/* Curadoria Manual (Zona Inferior) */}
            <div className="px-4 py-3 bg-[#121215] border-b border-zinc-800/60 space-y-3">
              {/* Nível e Legendas */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setDifficulty((prev) => (prev === "iniciante" ? "normal" : "iniciante"))}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all",
                    difficulty === "iniciante"
                      ? "bg-emerald-950/70 border-emerald-700/80 text-emerald-300 shadow-sm"
                      : "bg-[#18181b] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  )}
                >
                  <span>🌱</span>
                  <span>Para Iniciantes</span>
                </button>

                <Popover open={supportOpen} onOpenChange={setSupportOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18181b] border border-zinc-800 text-zinc-300 hover:border-zinc-700 cursor-pointer text-xs"
                    >
                      <span>{format === "Podcasts" ? transcriptTag : subtitleTag}</span>
                      <ChevronDown className="w-3 h-3 text-zinc-500" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-1 bg-[#121215] border-zinc-800 rounded-xl shadow-xl">
                    {(format === "Podcasts" ? TRANSCRIPT_OPTIONS : SUBTITLE_OPTIONS).map(
                      (s) => {
                        const isSelected =
                          format === "Podcasts" ? transcriptTag === s : subtitleTag === s
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              if (format === "Podcasts") setTranscriptTag(s)
                              else setSubtitleTag(s)
                              setSupportOpen(false)
                            }}
                            className={cn(
                              "w-full px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between cursor-pointer",
                              isSelected
                                ? "bg-[#1e1528] text-purple-200 font-semibold"
                                : "text-zinc-300 hover:bg-zinc-800/60"
                            )}
                          >
                            <span>{s}</span>
                            {isSelected && <Check className="w-3 h-3 text-purple-400" />}
                          </button>
                        )
                      }
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-wrap text-[14px]">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-[#1e1528] text-purple-200 border border-purple-800/70 text-[14px] font-medium"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-purple-300/60 hover:text-purple-200 cursor-pointer p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <Popover open={tagPickerOpen} onOpenChange={setTagPickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="h-6 px-2 rounded-md border border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tag</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-1.5 bg-[#121215] border-zinc-800 rounded-xl shadow-2xl">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Buscar ou criar tag..."
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      onKeyDown={handleCreateCustomTag}
                      className="w-full bg-[#18181b] border border-zinc-800 text-[14px] placeholder:text-[14px] text-zinc-200 px-2.5 py-1.5 rounded-lg mb-1.5 outline-none focus:border-purple-600"
                    />
                    <div className="max-h-44 overflow-y-auto space-y-0.5">
                      {filteredTags.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleAddTag(t)}
                          className="w-full px-2.5 py-1 text-xs text-left text-zinc-300 hover:bg-[#1e1528] hover:text-purple-200 rounded-md transition-colors cursor-pointer"
                        >
                          {t}
                        </button>
                      ))}
                      {tagSearch.trim() && (
                        <button
                          type="button"
                          onClick={() => handleAddTag(tagSearch.trim())}
                          className="w-full px-2.5 py-1.5 text-xs text-left text-purple-300 hover:bg-[#1e1528] rounded-md cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="w-3 h-3" />
                          <span>
                            Criar "{normalizeTag(tagSearch.trim(), allAvailableTags)}"
                          </span>
                        </button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Descrição do Conteúdo */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                  <span>Descrição / Resumo</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {desc.length}/200
                  </span>
                </div>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Escreva ou edite a descrição do canal ou conteúdo..."
                  rows={2}
                  maxLength={250}
                  className="w-full bg-[#18181b] border border-zinc-800 focus:border-purple-600 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none resize-none leading-relaxed transition-colors"
                />
              </div>
            </div>

            {/* Live Card Preview */}
            <div className="p-4 bg-[#09090b]/40">
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#121215]">
                <ContentCard
                  item={previewItem}
                  format={format}
                  isFavorite={false}
                  onToggleFavorite={() => {}}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-[#141418] border-t border-zinc-800 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={onBackToCatalog}
                className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200 cursor-pointer rounded-lg hover:bg-zinc-800/40 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => handleSave(Boolean(existingDuplicate))}
                disabled={isSaving || !url.trim() || !name.trim()}
                className={cn(
                  "px-4 py-1.5 font-medium rounded-lg cursor-pointer transition-colors shadow-sm",
                  existingDuplicate
                    ? "bg-[#251d33] text-purple-200 border border-purple-700/80 hover:bg-[#322547] hover:text-white"
                    : "bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40"
                )}
              >
                {isSaving
                  ? "Salvando..."
                  : existingDuplicate
                  ? "Atualizar canal"
                  : "Adicionar ao catálogo"}
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ================= ABA 4: REVISÃO RÁPIDA ================= */}
      {activeAdminTab === "review" && (
        <main className="pt-2">
          <ReviewQueue
            dataStore={dataStore}
            onUpdateItem={handleReviewUpdate}
            onDeleteItem={handleReviewDelete}
            onMoveItem={handleReviewMove}
          />
        </main>
      )}

      {/* ================= DRAWER / SHEET LATERAL DIREITO DE EDIÇÃO RÁPIDA ================= */}
      {isSheetOpen && sheetItem && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop escuro com blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in-0 duration-200"
            onClick={() => setIsSheetOpen(false)}
          />

          {/* Drawer Lateral Direito */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#121215] border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
              {/* Header do Drawer */}
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#141418]">
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-sm text-zinc-100">
                    Ajustar Conteúdo
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSheetOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Corpo com scroll do formulário */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                {/* Nome do Conteúdo */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Nome / Título</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#18181b] border border-zinc-800 focus:border-purple-600 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                  />
                </div>

                {/* URL */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Link Original</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full bg-[#18181b] border border-zinc-800 focus:border-purple-600 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                    />
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        title="Testar link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Idioma e Formato */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-400">Idioma</label>
                    <select
                      value={language.id}
                      onChange={(e) => {
                        const l = LANGUAGES.find((x) => x.id === e.target.value) || LANGUAGES[0]
                        setLanguage(l)
                      }}
                      className="w-full bg-[#18181b] border border-zinc-800 text-xs rounded-lg p-2 text-zinc-200 outline-none"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.flag} {l.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-400">Formato</label>
                    <select
                      value={format}
                      onChange={(e) => {
                        const newFmt = e.target.value
                        setFormat(newFmt)
                        if (!sheetItem?.subtitleTag) {
                          setSubtitleTag(newFmt === "YouTube" ? "Sem legendas" : SUBTITLE_OPTIONS[0])
                        }
                      }}
                      className="w-full bg-[#18181b] border border-zinc-800 text-xs rounded-lg p-2 text-zinc-200 outline-none"
                    >
                      {FORMAT_TABS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Avatar / Ícone */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-zinc-400">Ícone (URL)</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (sheetItem) handleRefreshAvatar(sheetItem)
                      }}
                      disabled={refreshingItemId === sheetItem?.id}
                      className="text-[11px] text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={cn("w-3 h-3", refreshingItemId === sheetItem?.id && "animate-spin")} />
                      <span>Reextrair avatar</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-8 h-8 rounded-full object-cover border border-zinc-800 bg-zinc-900 shrink-0"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          "https://www.google.com/s2/favicons?domain=youtube.com&sz=128"
                      }}
                    />
                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="w-full bg-[#18181b] border border-zinc-800 focus:border-purple-600 rounded-lg px-3 py-1.5 text-xs text-zinc-100 outline-none"
                    />
                  </div>
                </div>

                {/* Nível e Suporte */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-400">Nível / Dificuldade</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as DifficultyId)}
                      className="w-full bg-[#18181b] border border-zinc-800 text-xs rounded-lg p-2 text-zinc-200 outline-none"
                    >
                      {DIFFICULTY_OPTIONS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-400">
                      {format === "Podcasts" ? "Transcrição" : "Legendas"}
                    </label>
                    <select
                      value={format === "Podcasts" ? transcriptTag : subtitleTag}
                      onChange={(e) => {
                        if (format === "Podcasts") setTranscriptTag(e.target.value)
                        else setSubtitleTag(e.target.value)
                      }}
                      className="w-full bg-[#18181b] border border-zinc-800 text-xs rounded-lg p-2 text-zinc-200 outline-none"
                    >
                      {(format === "Podcasts" ? TRANSCRIPT_OPTIONS : SUBTITLE_OPTIONS).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Tags / Categorias</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-[#1e1528] text-purple-200 border border-purple-800/70 text-[14px] font-medium"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-purple-300/60 hover:text-purple-200 cursor-pointer p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    <Popover open={tagPickerOpen} onOpenChange={setTagPickerOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="h-6 px-2 rounded-md border border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Adicionar Tag</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-1.5 bg-[#121215] border-zinc-800 rounded-xl shadow-2xl">
                        <input
                          autoFocus
                          type="text"
                          placeholder="Buscar ou criar tag..."
                          value={tagSearch}
                          onChange={(e) => setTagSearch(e.target.value)}
                          onKeyDown={handleCreateCustomTag}
                          className="w-full bg-[#18181b] border border-zinc-800 text-[14px] placeholder:text-[14px] text-zinc-200 px-2.5 py-1.5 rounded-lg mb-1.5 outline-none focus:border-purple-600"
                        />
                        <div className="max-h-44 overflow-y-auto space-y-0.5">
                          {filteredTags.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => handleAddTag(t)}
                              className="w-full px-2.5 py-1 text-xs text-left text-zinc-300 hover:bg-[#1e1528] hover:text-purple-200 rounded-md transition-colors cursor-pointer"
                            >
                              {t}
                            </button>
                          ))}
                          {tagSearch.trim() && (
                            <button
                              type="button"
                              onClick={() => handleAddTag(tagSearch.trim())}
                              className="w-full px-2.5 py-1.5 text-xs text-left text-purple-300 hover:bg-[#1e1528] rounded-md cursor-pointer flex items-center gap-1.5"
                            >
                              <Plus className="w-3 h-3" />
                              <span>
                                Criar "{normalizeTag(tagSearch.trim(), allAvailableTags)}"
                              </span>
                            </button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Descrição */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="font-semibold">Descrição</span>
                    <span className="font-mono text-zinc-500">{desc.length}/250</span>
                  </div>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    rows={3}
                    maxLength={250}
                    className="w-full bg-[#18181b] border border-zinc-800 focus:border-purple-600 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Live Card Preview */}
                <div className="pt-2">
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-2">
                    Pré-visualização do Card
                  </label>
                  <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#09090b]">
                    <ContentCard
                      item={previewItem}
                      format={format}
                      isFavorite={false}
                      onToggleFavorite={() => {}}
                    />
                  </div>
                </div>
              </div>

              {/* Footer do Drawer com Ações */}
              <div className="p-4 border-t border-zinc-800 bg-[#141418] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const target = sheetItem
                    setIsSheetOpen(false)
                    setItemToDelete(target)
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSheetOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    disabled={isSaving || !name.trim()}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer shadow-sm disabled:opacity-40"
                  >
                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DE CONFIRMAÇÃO DE EXCLUSÃO INDIVIDUAL ================= */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setItemToDelete(null)} />
          <div className="relative w-full max-w-sm bg-[#121215] border border-zinc-800 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-100">
                  Excluir canal?
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Tem certeza que deseja remover{" "}
                  <strong className="text-zinc-200 font-medium">{itemToDelete.name}</strong>{" "}
                  do acervo?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = itemToDelete
                  setItemToDelete(null)
                  await handleDeleteItem(target)
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-sm"
              >
                Excluir canal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DE CONFIRMAÇÃO DE EXCLUSÃO EM LOTE ================= */}
      {bulkDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setBulkDeleteConfirmOpen(false)} />
          <div className="relative w-full max-w-sm bg-[#121215] border border-zinc-800 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-100">
                  Excluir {selectedItemsList.length} canais?
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Esta ação removerá todos os {selectedItemsList.length} itens selecionados do acervo.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setBulkDeleteConfirmOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={handleBulkDelete}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isBulkDeleting ? "Excluindo..." : "Confirmar Exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
