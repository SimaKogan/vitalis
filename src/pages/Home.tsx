import { Link } from 'react-router-dom'
import { Plate } from '../components/Plate'
import { RecipeCard } from '../components/RecipeCard'
import { getRecipe } from '../data/recipes'
import { RULES } from '../data/rules'
import { useI18n, type Key } from '../i18n'

const FEATURED = ['garden-shakshuka', 'lemon-cod-with-potatoes', 'chicken-quinoa-salad']

const SECTIONS: { to: string; title: Key; text: Key }[] = [
  { to: '/recipes', title: 'home.s.recipes.title', text: 'home.s.recipes.text' },
  { to: '/recipes?c=gluten-free', title: 'home.s.gf.title', text: 'home.s.gf.text' },
  { to: '/calculator', title: 'home.s.calc.title', text: 'home.s.calc.text' },
  { to: '/menu', title: 'home.s.menu.title', text: 'home.s.menu.text' },
  { to: '/labs', title: 'home.s.labs.title', text: 'home.s.labs.text' },
  { to: '/rules', title: 'home.s.rules.title', text: 'home.s.rules.text' },
  { to: '/fitness', title: 'home.s.fitness.title', text: 'home.s.fitness.text' },
]

export function Home() {
  const { t, content } = useI18n()
  const day = Math.floor(Date.now() / 86_400_000)
  const rule = RULES[day % RULES.length]
  const ruleText = content.rules[rule.id] ?? rule
  const featured = FEATURED.map((s) => getRecipe(s)!).filter(Boolean)

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1>{t('home.h1')}</h1>
            <p className="lead">{t('home.lead')}</p>
            <div className="hero-actions">
              <Link to="/recipes" className="btn primary">
                {t('home.cta.recipes')}
              </Link>
              <Link to="/recipes?c=gluten-free" className="btn outline-light">
                {t('home.cta.gf')}
              </Link>
            </div>
          </div>
          <Plate />
        </div>
      </section>

      <section className="wrap section">
        <h2>{t('home.start')}</h2>
        <ul className="section-list">
          {SECTIONS.map((s) => (
            <li key={s.to}>
              <Link to={s.to}>
                <span className="sl-title">{t(s.title)}</span>
                <span className="sl-text">{t(s.text)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>{t('home.cook')}</h2>
          <Link to="/recipes" className="text-link">
            {t('home.allRecipes')}
          </Link>
        </div>
        <div className="grid">
          {featured.map((r) => (
            <RecipeCard key={r.slug} recipe={r} />
          ))}
        </div>
      </section>

      <section className="wrap section">
        <aside className="rule-today">
          <p className="rule-label">{t('home.ruleToday')}</p>
          <h2>{ruleText.title}</h2>
          <p>{ruleText.text}</p>
          <Link to="/rules" className="text-link">
            {t('home.allRules')}
          </Link>
        </aside>
      </section>
    </>
  )
}
