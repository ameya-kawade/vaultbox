"use client"

import { createContext, useContext, useState, useEffect } from "react"

const FontContext = createContext(undefined)

export function FontProvider({ children }) {
  const [font, setFont] = useState("sans")

  useEffect(() => {
    const savedFont = localStorage.getItem("app-font")
    if (savedFont) {
      setFont(savedFont)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("app-font", font)
    document.documentElement.style.setProperty("--font-family", getFontFamily(font))
  }, [font])

  return <FontContext.Provider value={{ font, setFont }}>{children}</FontContext.Provider>
}

export const useFont = () => {
  const context = useContext(FontContext)
  if (context === undefined) {
    throw new Error("useFont must be used within a FontProvider")
  }
  return context
}
function getFontFamily(font) {
  switch (font) {
    case "sans":
      return '"Inter", Arial, sans-serif'; // Change default sans-serif
    case "serif":
      return 'Georgia, "Times New Roman", Times, serif';
    case "mono":
      return '"Fira Code", "Courier New", monospace';
    default:
      return '"Inter", Arial, sans-serif';
  }
}
