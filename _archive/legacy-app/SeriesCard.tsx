import * as React from "react"
import { Heart } from "lucide-react"
import { type ContentItem } from "@/components/ContentCard"
import { LANGUAGES } from "@/constants/content"
import { cn } from "@/lib/utils"

interface SeriesCardProps {
  item: ContentItem
  isFavorite: boolean
  onToggleFavorite: (id: string, e: React.MouseEvent) => void
  onCardClick?: (item: ContentItem) => void
  editMode?: boolean
}

export const SeriesCard = React.memo(function SeriesCard({
  item,
  isFavorite,
  onToggleFavorite,
  onCardClick,
  editMode = false,
}: SeriesCardProps) {
  const [imgSrc, setImgSrc] = React.useState(item.avatar)

  React.useEffect(() => {
    setImgSrc(item.avatar)
  }, [item.avatar])

  const origLangObj = item.originalLanguage
    ? LANGUAGES.find((l) => l.name.toLowerCase() === item.originalLanguage?.toLowerCase())
    : null

  return (
    <article
      onClick={() => {
        if (onCardClick) onCardClick(item)
      }}
      className={cn(
        "channel-card group relative rounded-xl overflow-hidden bg-[#111113] border border-zinc-800/80 hover:border-purple-500/60 transition-all duration-300 hover:scale-[1.02] shadow-lg flex flex-col justify-between cursor-pointer h-full",
        editMode && "hover:border-purple-500 hover:bg-purple-950/20"
      )}
    >
      {/* Link de cobertura em todo o card se NÃO estiver em editMode */}
      {!editMode ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10"
          aria-label={`Abrir ${item.name}`}
        />
      ) : null}

      {/* Pôster Vertical 2:3 Completo (100% da imagem cabe sem corte) */}
      <div className="relative aspect-[2/3] w-full bg-zinc-950 overflow-hidden border-b border-zinc-800/80 flex-shrink-0">
        <img
          src={imgSrc}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => {
            setImgSrc("https://www.google.com/s2/favicons?domain=netflix.com&sz=128")
          }}
        />

        {/* Selo de Áudio Original na Capa */}
        {item.originalLanguage && (
          <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-black/80 backdrop-blur-md border border-white/10 text-white shadow-md">
              {origLangObj?.flag && <span className="text-xs leading-none">{origLangObj.flag}</span>}
              <span>{item.originalLanguage}</span>
            </span>
          </div>
        )}

        {/* Botão de Favorito */}
        <div className="absolute top-2.5 right-2.5 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => onToggleFavorite(item.id, e)}
            className={cn(
              "w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-200 active:scale-90",
              isFavorite
                ? "bg-rose-950/80 border-rose-800 text-rose-500 opacity-100"
                : "bg-black/75 hover:bg-black border-white/15 text-white opacity-0 group-hover:opacity-100 hover:text-rose-400"
            )}
            title={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isFavorite && "fill-rose-500 scale-110"
              )}
            />
          </button>
        </div>
      </div>

      {/* Rodapé Sólido com Altura Uniforme */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-[#111113] gap-2.5">
        <div className="space-y-1.5">
          {/* Título sem truncar e ocupando toda a largura */}
          <h3 className="font-bold text-base text-zinc-100 group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
            {item.name}
          </h3>
          
          {item.desc && (
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
              {item.desc}
            </p>
          )}
        </div>

        {/* Tags com fonte 14px (text-sm), incluindo a tag da plataforma (Netflix) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 mt-auto">
          {item.platformTag && (
            <span className="text-sm font-medium px-2.5 py-0.5 rounded-md bg-zinc-800/90 text-zinc-300 border border-zinc-700/60">
              {item.platformTag}
            </span>
          )}
          {item.tags && item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-sm font-medium px-2.5 py-0.5 rounded-md bg-purple-950/60 border border-purple-900/50 text-purple-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
})
