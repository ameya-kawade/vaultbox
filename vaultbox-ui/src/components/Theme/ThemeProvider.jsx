  "use client"

  import { createContext, useContext, useEffect, useState } from "react"

  const ThemeContext = createContext({
    theme: "light",
    setTheme: () => null,
  })

  export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
      // Check localStorage and system preference
      if (typeof window !== "undefined") {
        return (
          localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        )
      }
      return "light"
    })

    useEffect(() => {
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(theme)
      localStorage.setItem("theme", theme)
    }, [theme])

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
  }

  export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) throw new Error("useTheme must be used within a ThemeProvider")
    return context
  }

