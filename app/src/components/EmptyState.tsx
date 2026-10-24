import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nenhum canal encontrado',
  description = 'Tente ajustar o termo pesquisado ou limpe os filtros ativos.',
  onReset,
}) => {
  return (
    <div className="py-24 text-center max-w-sm mx-auto">
      <h3 className="text-base font-bold text-zinc-100 mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 mb-5 leading-relaxed">{description}</p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 bg-[#18181b] hover:bg-[#27272a] border border-zinc-700/60 text-zinc-200 text-xs font-medium rounded-lg transition-colors"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
};
