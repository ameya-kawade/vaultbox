"use client"

import { useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function OTPVerification({ onVerifyOTP, error, loading }) {
  // Controlled value: a string containing the OTP.
  const [otp, setOtp] = useState("")

  const handleChange = (newValue) => {
    setOtp(newValue)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await onVerifyOTP(otp)
    } catch (error) {
      console.error("OTP verification error:", error)
    }
  }

  return (
    <Card className="w-[380px] backdrop-blur-sm bg-background/80">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Verify Your Identity</CardTitle>
        <CardDescription>
          Enter the verification code sent to your email
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center py-4">
            <InputOTP maxLength={6} value={otp} onChange={handleChange}>
              <InputOTPGroup className="flex items-center gap-2">
                <InputOTPSlot index={0} className="w-9 h-12 text-center border rounded-md" />
                <InputOTPSlot index={1} className="w-9 h-12 text-center border rounded-md" />
                <InputOTPSlot index={2} className="w-9 h-12 text-center border rounded-md" />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className="flex items-center gap-2">
                <InputOTPSlot index={3} className="w-9 h-12 text-center border rounded-md" />
                <InputOTPSlot index={4} className="w-9 h-12 text-center border rounded-md" />
                <InputOTPSlot index={5} className="w-9 h-12 text-center border rounded-md" />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button className="w-full" disabled={loading || otp.length !== 6}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
