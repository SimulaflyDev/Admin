import { Inbox } from "lucide-react"

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ 
  icon: Icon = Inbox, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-slate-200 border-dashed">
      <div className="bg-slate-50 p-4 rounded-full mb-4 border border-slate-100">
        <Icon className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-6 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
