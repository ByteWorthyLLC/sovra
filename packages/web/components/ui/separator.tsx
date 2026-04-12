interface SeparatorProps {
  text?: string
}

export function Separator({ text }: SeparatorProps) {
  if (text) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">{text}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    )
  }

  return <div className="h-px bg-border w-full" />
}
