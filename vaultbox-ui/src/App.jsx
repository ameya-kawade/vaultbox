"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider, useAuth } from "@/features/login/context/auth"
import { ThemeProvider } from "./components/Theme/ThemeProvider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AuthWrapper } from "@/components/AuthWrapper"
import Layout from "@/components/Layout/Layout"
import Dashboard from "./features/dashboard/pages/Dashboard"
import Search from "./features/dashboard/components/Search"
import VideoMeeting from "./features/meeting/components/VideoMeeting"
import MeetingRoom from "./features/meeting/components/MeetingRoom"
import Channels from "./features/chat/pages/Channels"
import Messages from "./features/chat/pages/Messages"
import Settings from "./pages/Settings"
import NotFound from "./pages/NotFound"
import { Loading } from "@/components/ui/loading"
import LoginPage from "./features/login/pages/login-page.jsx"
import { NotificationsProvider } from "./features/notifications/NotificationContext"
import LandingPage from "./components/LandingPage"

const queryClient = new QueryClient()

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppContent() {
  // Access the auth context safely inside AuthProvider
  const { user, isLoading, isAuthenticated } = useAuth()
  const userId = user?.id

  // Optionally, add an initial loading state (for example, to display a loader during startup)
  const [initialLoading, setInitialLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading || initialLoading) {
    return <Loading />
  }

  // We'll pass isAuthenticated to the LandingPage component
  const landingPage = <LandingPage isAuthenticated={isAuthenticated} userId={userId} />

  return (
    // Wrap routes with NotificationsProvider now that we have a valid userId
    <NotificationsProvider userId={userId}>
      <Routes>
        {/* Public routes that are accessible to all users */}
        <Route path="/page" element={landingPage} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route element={<AuthWrapper />}>
          <Route element={<Layout />}>
            {/* Redirect /dashboard to / for logged in users who manually enter /dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              }
            />
            <Route
              path="/video"
              element={
                <ProtectedRoute>
                  <VideoMeeting />
                </ProtectedRoute>
              }
            />
            <Route
              path="/video/:roomId"
              element={
                <ProtectedRoute>
                  <MeetingRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/channels"
              element={
                <ProtectedRoute>
                  <Channels />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>

        {/* Catch-all Route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </NotificationsProvider>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <SidebarProvider>
              <AppContent />
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App
