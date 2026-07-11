import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Sparkles } from 'lucide-react'

import { Button } from './ui/button'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'

interface InputPanelProps {
  diagramType: string
  prompt: string
  isGenerating: boolean
  onDiagramTypeChange: (type: string) => void
  onPromptChange: (value: string) => void
  onGenerate: () => void
  examples: string[]
}

const DIAGRAM_KEYS = ['architecture', 'workflow', 'sequence', 'dataflow', 'lifecycle'] as const

export default function InputPanel({
  diagramType,
  prompt,
  isGenerating,
  onDiagramTypeChange,
  onPromptChange,
  onGenerate,
  examples,
}: InputPanelProps) {
  const { t } = useTranslation()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 320) + 'px'
    }
  }, [prompt])

  return (
    <div className="input-panel group">
      {/* Diagram Type Tabs */}
      <Tabs value={diagramType} onValueChange={onDiagramTypeChange}>
        <TabsList className="w-full bg-white/5 border border-white/10 p-1 rounded-xl">
          {DIAGRAM_KEYS.map((key) => (
            <TabsTrigger
              key={key}
              value={key}
              className="flex-1 data-[state=active]:bg-accent/15 data-[state=active]:text-accent data-[state=active]:shadow-[0_0_16px_rgba(34,211,238,0.08)] rounded-lg py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground/80 hover:bg-white/5"
            >
              {t(`tab.${key}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Textarea */}
      <div className="relative mt-6">
        <textarea
          ref={textareaRef}
          className="input-textarea transition-all duration-300"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={t('input.placeholder')}
          rows={4}
          disabled={isGenerating}
        />
        {/* Focus indicator ring */}
        <div className="absolute inset-0 rounded-[10px] pointer-events-none transition-opacity duration-300 opacity-0 focus-within:opacity-100 ring-1 ring-accent/20" />
      </div>

      {/* Action Row */}
      <div className="flex items-center gap-3 mt-5">
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="relative overflow-hidden bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-display font-semibold px-8 py-6 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100 group/btn"
        >
          {/* Shimmer overlay on hover */}
          <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.08),transparent)] translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-700" />
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('btn.generating')}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {t('btn.generate')}
            </>
          )}
        </Button>
      </div>

      {/* Example Prompts */}
      <div className="mt-5 pt-4 border-t border-white/10">
        <div className="font-display text-xs text-muted-foreground uppercase tracking-widest mb-3">
          {t('examples.label')}
        </div>
        <div className="flex flex-wrap gap-2">
          {examples.map((example, index) => (
            <button
              key={index}
              className="group/btn px-4 py-1.5 rounded-lg border border-white/[0.08] bg-black/20 text-muted-foreground/80 text-xs transition-all duration-300 hover:border-accent/20 hover:text-accent hover:bg-accent/5 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              onClick={() => onPromptChange(example)}
              disabled={isGenerating}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="relative">
                {example.length > 40 ? example.slice(0, 40) + '...' : example}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
