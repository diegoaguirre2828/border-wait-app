'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { translations, type Lang, type T } from './lang'

interface LangCtx { lang: Lang; t: T; toggle: () => void }

const Ctx = createContext<LangCtx>({ lang: 'en', t: translations.en, toggle: () => {} })

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('cruza_lang') as Lang | null
    if (saved === 'es' || saved === 'en') setLang(saved)
  }, [])

  function toggle() {
    const next: Lang = lang === 'en' ? 'es' : 'en'
    setLang(next)
    localStorage.setItem('cruza_lang', next)
  }

  return <Ctx.Provider value={{ lang, t: translations[lang], toggle }}>{children}</Ctx.Provider>
}

export function useLang() {
  return useContext(Ctx)
}
