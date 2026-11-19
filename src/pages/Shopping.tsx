import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useShopping } from '../hooks/ShoppingContext'
import { useI18n } from '../i18n'

export function Shopping() {
  const { t, ing, amount } = useI18n()
  const { items, toggle, remove, addCustom, clearChecked, clearAll } = useShopping()
  const [name, setName] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    addCustom(name)
    setName('')
  }

  const checked = items.filter((i) => i.checked).length

  return (
    <div className="wrap section narrow">
      <h1 className="page-title">{t('shop.title')}</h1>
      <p className="page-lead">{t('shop.lead')}</p>

      <form className="add-item" onSubmit={submit}>
        <label className="sr-only" htmlFor="new-item">{t('shop.addLabel')}</label>
        <input id="new-item" type="text" placeholder={t('shop.placeholder')} value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" className="btn primary">{t('shop.add')}</button>
      </form>

      {items.length === 0 ? (
        <div className="empty">
          <p>{t('shop.empty')}</p>
          <Link to="/recipes" className="btn primary">{t('shop.browse')}</Link>
        </div>
      ) : (
        <>
          <ul className="shopping">
            {items.map((i) => {
              const label = i.ingredientId ? ing(i.ingredientId) : i.name
              return (
                <li key={i.id} className={i.checked ? 'done' : undefined}>
                  <label>
                    <input type="checkbox" checked={i.checked} onChange={() => toggle(i.id)} />
                    <span className="s-name">{label}</span>
                    {i.ingredientId && i.grams != null && <span className="s-amt">{amount(i.ingredientId, i.grams)}</span>}
                  </label>
                  <button type="button" className="text-btn" onClick={() => remove(i.id)} aria-label={t('shop.removeAria', { name: label })}>
                    {t('shop.remove')}
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="list-actions">
            <button type="button" className="btn ghost" onClick={clearChecked} disabled={checked === 0}>
              {t('shop.clearChecked', { n: checked })}
            </button>
            <button type="button" className="btn ghost" onClick={clearAll}>
              {t('shop.clearAll')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
