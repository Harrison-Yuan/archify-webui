import { useTranslation } from 'react-i18next'

interface DiagramPreviewProps {
  html: string | null
  isLoading: boolean
  error: string | null
}

export default function DiagramPreview({ html, isLoading, error }: DiagramPreviewProps) {
  const { t } = useTranslation()

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="preview-area">
        <div className="preview-loading">
          <div className="spinner-large" />
          <span className="preview-loading-text">{t('preview.loading')}</span>
          <div className="w-48 h-1.5 rounded-full bg-white/5 overflow-hidden mt-2">
            <div className="h-full w-1/3 rounded-full bg-accent/30 animate-[shimmer_1.5s_ease-in-out_infinite]"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.3), transparent)',
                backgroundSize: '200% 100%',
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    const isNetwork = error.includes('网络连接') || error.includes('Network error')
    const isTimeout = error.includes('超时') || error.includes('timeout')
    const errorClass = isNetwork ? 'preview-error-network' : isTimeout ? 'preview-error-timeout' : ''

    return (
      <div className="preview-area">
        <div className="preview-error">
          <div className={`preview-error-box ${errorClass} animate-[slideUp_0.4s_ease-out]`}>
            {error}
          </div>
        </div>
      </div>
    )
  }

  // Rendered result with fade-in
  if (html) {
    return (
      <div className="preview-area animate-[slideUp_0.5s_ease-out]">
        <iframe
          className="preview-frame"
          srcDoc={html}
          title="Architecture Diagram Preview"
          sandbox="allow-scripts allow-same-origin allow-downloads allow-popups"
        />
      </div>
    )
  }

  // Empty placeholder
  return (
    <div className="preview-area">
      <div className="preview-placeholder">
        <div className="preview-placeholder-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <p className="preview-placeholder-text">{t('preview.placeholder')}</p>
      </div>
    </div>
  )
}
