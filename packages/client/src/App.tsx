import { useTranslation } from 'react-i18next'
import HomePage from './pages/HomePage'

function App() {
  const { t, i18n } = useTranslation()

  const toggleLang = () => {
    const next = i18n.language.startsWith('zh') ? 'en' : 'zh'
    i18n.changeLanguage(next)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-header-left">
            <h1 className="app-title">Archify AI</h1>
            <p className="app-description">{t('app.desc')}</p>
          </div>
          <button
            className="lang-toggle"
            onClick={toggleLang}
          >
            <span className={`lang-option ${i18n.language.startsWith('zh') ? 'active' : ''}`}>{t('lang.zh')}</span>
            <span className="lang-divider">/</span>
            <span className={`lang-option ${i18n.language.startsWith('en') ? 'active' : ''}`}>{t('lang.en')}</span>
          </button>
        </div>
      </header>
      <main className="app-main">
        <HomePage />
      </main>
    </div>
  )
}

export default App
