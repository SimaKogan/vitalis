import { Link } from 'react-router-dom'
import { Plate } from '../components/Plate'
import { MINERAL_NOTES, RULES } from '../data/rules'
import { useI18n } from '../i18n'

export function Rules() {
  const { t, content } = useI18n()
  return (
    <div className="wrap section">
      <h1 className="page-title">{t('rules.title')}</h1>
      <p className="page-lead">{t('rules.lead')}</p>

      <div className="rules-top">
        <div className="plate-panel">
          <Plate />
        </div>
        <ol className="rules">
          {RULES.map((r) => {
            const text = content.rules[r.id] ?? r
            return (
              <li key={r.id}>
                <h2>{text.title}</h2>
                <p>{text.text}</p>
              </li>
            )
          })}
        </ol>
      </div>

      <section className="minerals" aria-labelledby="min-h">
        <h2 id="min-h">{t('rules.minerals.title')}</h2>
        <p className="page-lead">{t('rules.minerals.lead')}</p>
        <Link to="/recipes?c=gluten-free" className="text-link">
          {t('rules.minerals.cta')}
        </Link>
        <dl className="notes-grid">
          {MINERAL_NOTES.map((n) => (
            <div key={n.id}>
              <dt>{content.minerals[n.id]?.heading ?? n.heading}</dt>
              <dd>{content.minerals[n.id]?.text ?? n.text}</dd>
            </div>
          ))}
        </dl>
        <p className="fineprint">{t('rules.fine')}</p>
      </section>
    </div>
  )
}
