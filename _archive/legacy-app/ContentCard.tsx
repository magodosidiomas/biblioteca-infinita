import * as React from "react"
import { ExternalLink, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface ContentItem {
  id: string
  name: string
  url: string
  language?: string
  tags: string[]
  subtitleTag?: string
  transcriptTag?: string
  platformTag?: string
  difficulty?: "iniciante" | "normal" | string
  avatar: string
  desc: string
  creator?: string
  originalLanguage?: string
  reviewed?: boolean
  needsAttention?: boolean
}

interface ContentCardProps {
  item: ContentItem
  format: string
  isFavorite: boolean
  onToggleFavorite: (id: string, e: React.MouseEvent) => void
  onCardClick?: (item: ContentItem) => void
  editMode?: boolean
}

export const ContentCard = React.memo(function ContentCard({
  item,
  format,
  isFavorite,
  onToggleFavorite,
  onCardClick,
  editMode = false,
}: ContentCardProps) {
  const [imgSrc, setImgSrc] = React.useState(item.avatar)

  React.useEffect(() => {
    setImgSrc(item.avatar)
  }, [item.avatar])

  return (
    <article
      onClick={() => {
        if (onCardClick) onCardClick(item)
      }}
      className={cn(
        "channel-card group relative p-6 sm:p-7 hover:bg-zinc-900/40 transition-colors flex flex-col justify-between border-b border-zinc-800 last:border-b-0 md:last:border-b lg:border-b lg:border-zinc-800 lg:border-r lg:border-zinc-800 md:max-lg:border-r md:max-lg:border-zinc-800 md:max-lg:border-b md:max-lg:border-zinc-800",
        editMode && "cursor-pointer hover:border-purple-500/40 hover:bg-purple-950/10"
      )}
    >
      {/* Link de cobertura em todo o card se NÃO estiver em editMode */}
      {!editMode ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-0"
          aria-label={`Abrir ${item.name}`}
        />
      ) : null}

      <div className="space-y-4 relative z-10 pointer-events-none">
        {/* Topo do Card com Avatar circular e ações */}
        <div className="flex items-start justify-between gap-4">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
            <img
              src={imgSrc}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={() => {
                setImgSrc("https://www.google.com/s2/favicons?domain=youtube.com&sz=128")
              }}
            />
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {editMode && item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-lg border border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 flex items-center justify-center transition-all duration-200"
                title="Abrir link original em nova guia"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : null}

            <button
              type="button"
              onClick={(e) => onToggleFavorite(item.id, e)}
              className={cn(
                "heart-btn w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-200 active:scale-90",
                isFavorite
                  ? "border-rose-900/40 bg-rose-950/25 text-rose-500"
                  : "border-zinc-800/80 bg-zinc-900/40 text-zinc-500 hover:text-zinc-200 hover:border-zinc-700"
              )}
              title={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
            >
              <Heart
                className={cn(
                  "w-3.5 h-3.5 transition-transform duration-200",
                  isFavorite && "fill-rose-500 scale-110"
                )}
              />
            </button>
          </div>
        </div>

        {/* Título & Descrição */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-base text-zinc-100 group-hover:text-purple-300 transition-colors leading-snug line-clamp-1">
              {item.name}
            </h3>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
          </div>

          <p className="text-[13px] sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed">
            {item.desc}
          </p>
        </div>
      </div>

      {/* Tags / Badges */}
      <div className="pt-5 space-y-2 relative z-10 pointer-events-none">
        {/* Linha 1 de Tags (Temas / Categorias) */}
        <div className="flex flex-wrap items-center gap-1.5">
          {Array.isArray(item.tags) && item.tags.map((tag) => (
            <Badge
              key={tag}
              variant="theme"
              className="text-xs font-medium"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Linha 2 de Tags (Suporte Técnico: Legenda/Transcrição/Plataforma + Ritmo) */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(format === "YouTube" || format === "Professores" || format === "Pronúncia") && item.subtitleTag && (
            <Badge variant="default" className="text-xs font-medium text-zinc-400">
              {item.subtitleTag}
            </Badge>
          )}

          {format === "Podcasts" && item.transcriptTag && (
            <Badge variant="default" className="text-xs font-medium text-zinc-400">
              {item.transcriptTag}
            </Badge>
          )}

          {item.platformTag && (
            <Badge variant="default" className="text-xs font-medium text-zinc-400">
              {item.platformTag}
            </Badge>
          )}

          {/* Dificuldade / Recomendação de Entrada */}
          {item.difficulty === "iniciante" && (
            <Badge
              variant="default"
              className="text-xs font-medium text-emerald-300 border-emerald-900/60 bg-emerald-950/40 inline-flex items-center gap-1"
            >
              <span>🌱</span>
              <span>Iniciante</span>
            </Badge>
          )}
        </div>
      </div>
    </article>
  )
})
