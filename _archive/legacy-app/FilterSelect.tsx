import * as React from "react"
import { ChevronDown, Check, X, Search } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface FilterSelectProps {
  label: string
  selectedValue: string | null
  options: string[]
  onSelect: (value: string | null) => void
  isMobile: boolean
  onOpenMobileSheet: () => void
  prefix?: string
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  selectedValue,
  options,
  onSelect,
  isMobile,
  onOpenMobileSheet,
  prefix,
}) => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options
    const query = search.toLowerCase().trim()
    return options.filter((opt) => opt.toLowerCase().includes(query))
  }, [options, search])

  // Foco no input ao abrir se tiver busca
  React.useEffect(() => {
    if (open) {
      setSearch("")
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [open])

  if (options.length === 0) return null

  const displayText = selectedValue
    ? prefix
      ? `${prefix}: ${selectedValue}`
      : selectedValue
    : label

  const renderTriggerContent = (onClick?: () => void) => (
    <div
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-xl border transition-colors cursor-pointer select-none",
        selectedValue
          ? "bg-[#1a1625] text-purple-200 border-purple-800/60"
          : "bg-[#141417] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60"
      )}
    >
      <span className="whitespace-nowrap">{displayText}</span>
      {selectedValue ? (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(null)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation()
              onSelect(null)
            }
          }}
          className="p-0.5 -mr-1 rounded-md text-purple-400/80 hover:text-purple-200 hover:bg-purple-900/40 transition-colors"
          title="Limpar este filtro"
        >
          <X className="w-3.5 h-3.5" />
        </span>
      ) : (
        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
      )}
    </div>
  )

  if (isMobile) {
    return (
      <div className="relative flex-shrink-0">
        {renderTriggerContent(onOpenMobileSheet)}
      </div>
    )
  }

  const showSearch = options.length > 7

  return (
    <div className="relative flex-shrink-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {renderTriggerContent()}
        </PopoverTrigger>
        <PopoverContent
          className="w-56 p-1.5 space-y-1 max-h-[340px] flex flex-col"
          align="start"
        >
          {showSearch && (
            <div className="relative px-1 pt-1 pb-1">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar opções..."
                className="w-full bg-[#18181b] border border-zinc-800 rounded-lg pl-7 pr-7 py-1.5 text-[14px] text-zinc-200 placeholder:text-[14px] placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          <div className="overflow-y-auto space-y-0.5 max-h-[260px] pr-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selectedValue === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onSelect(isSelected ? null : option)
                      setOpen(false)
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded-xl flex items-center justify-between transition-colors cursor-pointer",
                      isSelected
                        ? "bg-purple-950/40 text-purple-200 font-medium"
                        : "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                    )}
                  >
                    <span className="truncate pr-2">{option}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-purple-400 font-semibold flex-shrink-0" />
                    )}
                  </button>
                )
              })
            ) : (
              <div className="py-4 text-center text-xs text-zinc-500">
                Nenhuma opção encontrada
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
