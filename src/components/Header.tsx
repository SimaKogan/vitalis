import { Link, NavLink, useLocation } from 'react-router-dom'
import { useShopping } from '../hooks/ShoppingContext'
import { useTheme } from '../hooks/useTheme'
import { LANGS, LANG_LABEL, useI18n, type Lang } from '../i18n'

function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#16473e" />
          <stop offset="1" stopColor="#0a211e" />
        </linearGradient>
        <linearGradient id="logo-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7fe0a8" />
          <stop offset="1" stopColor="#2f9e74" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#logo-bg)" />
      <path d="M32 54C14 46 10 26 12 11c17 1 36 6 40 24 1 8-6 17-20 19z" fill="url(#logo-leaf)" />
      <path d="M20 22l12 20 12-20" fill="none" stroke="#0e2b27" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="49" cy="14" r="5" fill="#f3b93b" />
    </svg>
  )
}

export function Header() {
  const [theme, toggleTheme] = useTheme()
  const { remaining } = useShopping()
  const { t, lang, setLang } = useI18n()
  const { pathname, search } = useLocation()
  const onGlutenFree = pathname === '/recipes' && new URLSearchParams(search).get('c') === 'gluten-free'
  const onRecipes = pathname.startsWith('/recipes') && !onGlutenFree

  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link to="/" className="brand" aria-label={t('nav.home')}>
          <Logo />
          <span>Vitalis</span>
        </Link>

        <nav className="nav" aria-label={t('nav.main')}>
          <Link to="/recipes" className={onRecipes ? 'active' : undefined} aria-current={onRecipes ? 'page' : undefined}>
            {t('nav.recipes')}
          </Link>
          <Link to="/recipes?c=gluten-free" className={onGlutenFree ? 'active' : undefined} aria-current={onGlutenFree ? 'page' : undefined}>
            {t('nav.glutenFree')}
          </Link>
          <NavLink to="/rules">{t('nav.rules')}</NavLink>
          <NavLink to="/fitness">{t('nav.fitness')}</NavLink>
          <NavLink to="/calculator">{t('nav.calculator')}</NavLink>
          <NavLink to="/menu">{t('nav.menu')}</NavLink>
          <NavLink to="/labs">{t('nav.labs')}</NavLink>
        </nav>

        <div className="header-actions">
          <label className="lang">
            <span className="sr-only">{t('nav.language')}</span>
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {LANG_LABEL[l]}
                </option>
              ))}
            </select>
          </label>
          <NavLink to="/shopping" className="icon-btn" aria-label={t('nav.shoppingAria', { n: remaining })}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 7h14l-1.5 9H8z" />
              <path d="M6 7 5 3H2" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="17" cy="20" r="1" />
            </svg>
            {remaining > 0 && <span className="count">{remaining}</span>}
          </NavLink>
          <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? t('nav.toLight') : t('nav.toDark')}>
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
