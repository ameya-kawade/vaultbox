"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LoginForm } from "@/features/login/component/login-form"
import { OTPVerification } from "@/features/login/component/otp-verification"
import { MatrixBackground } from "@/features/login/component/matrix-background"
import { useAuth } from "@/features/login/context/auth"
import { login, verifyOTP } from "@/services/autheService"
import { generateKyber768KeyPair } from '@/utils/kyberUtils';
import { storePrivateKey } from '@/utils/indexedDBUtils';


export default function LoginPage() {
  const { handleLoginSuccess } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState("login")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [tempUserId, setTempUserId] = useState(null)

  const handleLogin = async (email, password) => {
    setError("")
    setLoading(true)
    try {
      const result = await login(email, password)
      setTempUserId(result.userId)
      localStorage.setItem("tempUserId", result.userId)
      setStep("otp")
    } catch (err) {
      setError(err.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerification = async (otp) => {
    try {
      setLoading(true)
      setError("")

      if (!tempUserId) {
        throw new Error("User ID missing—please login again")
      }

      const response = await verifyOTP(otp)
      if (!response || !response.user) {
        throw new Error("OTP verification failed—no user data returned")
      }

      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.removeItem("tempUserId")

      handleLoginSuccess(response.user)
      navigate("/dashboard")

      // 🔹 After navigating, generate and store keys
      setTimeout(async () => {
        // Generate Kyber keys
        const { privateKey, publicKey } = generateKyber768KeyPair();

        // Store private key in IndexedDB
        await storePrivateKey(privateKey);

        // Send public key to backend
        await fetch('/api/storePublicKey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicKey }),
        });

        console.log("Keys successfully generated and stored!");
    }, 1000); // Delay to ensure navigation completes

    } catch (error) {
      console.error("Error during OTP verification:", error.message)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full dark flex items-center justify-center p-4">
      <MatrixBackground />
      {step === "login" ? (
        <LoginForm onLoginSuccess={handleLogin} error={error} loading={loading} />
      ) : (
        <OTPVerification onVerifyOTP={handleOTPVerification} error={error} loading={loading} />
      )}
    </div>
  )
}

