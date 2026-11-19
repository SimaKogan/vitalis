import { useEffect } from 'react'
import { HashRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { ShoppingProvider } from './hooks/ShoppingContext'
import { I18nProvider, useI18n } from './i18n'
import { Calculator } from './pages/Calculator'
import { Fitness } from './pages/Fitness'
import { Home } from './pages/Home'
import { Labs } from './pages/Labs'
import { Menu } from './pages/Menu'
import { RecipeDetail } from './pages/RecipeDetail'
import { Recipes } from './pages/Recipes'
import { Rules } from './pages/Rules'
import { Shopping } from './pages/Shopping'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function NotFound() {
  const { t } = useI18n()
  return (
    <div className="wrap section empty">
      <h1 className="page-title">{t('notfound.title')}</h1>
      <p>{t('notfound.text')}</p>
      <Link to="/" className="btn primary">{t('notfound.home')}</Link>
    </div>
  )
}

function Shell() {
  const { t } = useI18n()
  return (
    <>
      <ScrollToTop />
      <a href="#main" className="skip">{t('nav.skip')}</a>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:slug" element={<RecipeDetail />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/fitness" element={<Fitness />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/shopping" element={<Shopping />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="wrap">
          <p>{t('footer.text')}</p>
        </div>
      </footer>
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <I18nProvider>
        <ShoppingProvider>
          <Shell />
        </ShoppingProvider>
      </I18nProvider>
    </HashRouter>
  )
}
