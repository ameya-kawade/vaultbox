"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/components/Theme/ThemeProvider"
import { useAuth } from "@/features/login/context/auth"

const APP_VERSION = "1.0.0"

const Settings = () => {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [darkMode, setDarkMode] = useState(theme === "dark")

  const [enableEmail, setEnableEmail] = useState(true)
  const [enableSMS, setEnableSMS] = useState(false)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)

  const handleDarkModeToggle = (checked) => {
    setDarkMode(checked)
    setTheme(checked ? "dark" : "light")
  }

  const handleRegenerateKeys = () => {
    // Implement your key regeneration logic here
    alert("Keys regenerated!")
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Profile Settings */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Profile Settings</h2>
        <p className="text-sm text-muted-foreground">
          View or update your profile details here.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="user-name">Name</Label>
            <Input id="user-name" value={user?.name || ""} readOnly />
          </div>
          <div>
            <Label htmlFor="user-email">Email</Label>
            <Input id="user-email" value={user?.email || ""} readOnly />
          </div>
        </div>
      </section>

      <Separator />

      {/* App Settings */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">App Settings</h2>
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode-toggle">Dark Mode</Label>
          <Switch
            id="dark-mode-toggle"
            checked={darkMode}
            onCheckedChange={handleDarkModeToggle}
          />
        </div>
      </section>

      <Separator />

      {/* Notifications Settings */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Notifications Settings</h2>
        <div className="flex items-center justify-between">
          <Label htmlFor="email-notifications">Email Notifications</Label>
          <Switch
            id="email-notifications"
            checked={enableEmail}
            onCheckedChange={setEnableEmail}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="sms-notifications">SMS Notifications</Label>
          <Switch
            id="sms-notifications"
            checked={enableSMS}
            onCheckedChange={setEnableSMS}
          />
        </div>
      </section>

      <Separator />

      {/* Security Settings */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Security Settings</h2>
        <div className="flex items-center justify-between">
          <Label htmlFor="two-factor-auth">Two-Factor Authentication</Label>
          <Switch
            id="two-factor-auth"
            checked={twoFactorAuth}
            onCheckedChange={setTwoFactorAuth}
          />
        </div>
        <Button variant="outline" onClick={handleRegenerateKeys}>
          Regenerate Keys
        </Button>
      </section>

      <Separator />

      {/* About */}
      <section>
        <h2 className="text-xl font-semibold mb-2">About</h2>
        <p className="text-sm text-muted-foreground">App Version: {APP_VERSION}</p>
      </section>
    </div>
  )
}

export default Settings
