"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
       // console.log("Loaded user from localStorage:", parsedUser)
        return parsedUser
      } catch (error) {
        //console.error("Error parsing stored user data:", error)
        localStorage.removeItem("user")
        return null
      }
    }
    return null
  })

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("user"))

  const login = useCallback((userData) => {
    if (!userData?.id) {
      console.error("userData missing id:", userData)
      return
    }
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem("user", JSON.stringify(userData))
   // console.log("User logged in and stored:", userData)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
    localStorage.removeItem("tempUserId")
  }, [])

  const handleLoginSuccess = (userData) => {
    login(userData)
  }

  // Sync user state with localStorage changes (optional, for robustness)
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser && !user) {
      try {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Failed to sync user from localStorage:", error)
      }
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, handleLoginSuccess }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)