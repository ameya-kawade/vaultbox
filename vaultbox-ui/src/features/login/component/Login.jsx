// // frontend -> src/login/Login.jsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { AlertCircle, EyeIcon, EyeOffIcon, LoaderIcon } from "lucide-react";
// import { login, verifyOTP } from "@/services/autheService"; // remove getUserById call here
// import { Loading } from "@/components/ui/loading";
// import { useAuth } from "@/features/login/context/auth";
// import { Logo } from "@/components/ui/logo"; 

// export default function Login() {
//   const { handleLoginSuccess } = useAuth();
  
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [otp, setOTP] = useState("");
//   const [error, setError] = useState("");
//   const [step, setStep] = useState("login"); // 'login' or 'otp'
//   const [loading, setLoading] = useState(false);
//   // Store temporary userId here:
//   const [tempUserId, setTempUserId] = useState(null);
//   const navigate = useNavigate();

//   // Handle the login submission and store the temporary userId.
//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       const result = await login(email, password);
//       // Assuming the login API returns { userId } on successful login:
//       setTempUserId(result.userId);
//       // Store the temporary userId in localStorage:
//       localStorage.setItem("tempUserId", result.userId);
//       setStep("otp");
//     } catch (err) {
//       setError(err.message || "Invalid email or password");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle OTP verification.
//   const handleOTPSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       setError("");

//       if (!tempUserId) {
//         throw new Error("User ID missing—please login again");
//       }

//       // Call verifyOTP with the stored OTP value.
//       const response = await verifyOTP(otp);
//       // Assume response returns an object with token and complete user info.
//       if (!response || !response.user) {
//         throw new Error("OTP verification failed—no user data returned");
//       }
      
//       // Save full user data in localStorage.
//       localStorage.setItem("user", JSON.stringify(response.user));
//       // Optionally, store the token as well.
//       // localStorage.setItem("authToken", response.token);

//       // Remove the temporary userId (now that full user data is available).
//       localStorage.removeItem("tempUserId");
      
//       handleLoginSuccess(response.user);
//       navigate("/dashboard");
//     } catch (error) {
//       console.error("Error during OTP verification:", error.message);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOTPChange = (e) => {
//     // Remove any non-alphanumeric characters (if needed) and limit to 6 characters.
//     const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
//     if (value.length <= 6) {
//       setOTP(value);
//     }
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   return (
//     <div className="w-full h-screen bg-white text-gray-900 flex flex-col lg:flex-row">
//       <div className="flex-1 flex items-center justify-center">
//         <div className="w-[350px] max-w-[90%] space-y-6">
//           <div className="flex justify-center">
//             <Logo className="h-12 w-auto" />
//           </div>
//           <div className="text-center">
//             <h1 className="text-2xl font-bold text-gray-900 mb-2">
//               {step === "login" ? "Login to access" : "Verify It's You"}
//             </h1>
//             <p className="text-sm text-gray-500">
//               {step === "login"
//                 ? "Enter your email and password to login to your account"
//                 : "We've sent a 6-digit code to your email. Please enter it below to verify your identity."}
//             </p>
//           </div>
//           {error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>Error</AlertTitle>
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}
//           {step === "login" ? (
//             <form onSubmit={handleLoginSubmit} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="email" className="font-thin text-xs">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={email}
//                   placeholder="yourname@gmail.com"
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="password" className="font-thin text-xs">Password</Label>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     placeholder="pass1234"
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                   />
//                   <button type="button" onClick={togglePasswordVisibility} className="absolute right-2 top-2">
//                     {showPassword ? (
//                       <EyeOffIcon className="text-gray-600" />
//                     ) : (
//                       <EyeIcon className="text-gray-600" />
//                     )}
//                   </button>
//                 </div>
//               </div>
//               <Button className="rounded-lg w-full" type="submit" disabled={loading}>
//                 {loading ? <LoaderIcon className="animate-spin mr-2" /> : "Verify"}
//               </Button>
//             </form>
//           ) : (
//             <form onSubmit={handleOTPSubmit} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="otp">Enter OTP</Label>
//                 <Input
//                   id="otp"
//                   type="text"
//                   maxLength={6}
//                   value={otp}
//                   onChange={handleOTPChange}
//                   required
//                 />
//               </div>
//               <Button className="rounded-lg w-full" type="submit" disabled={loading}>
//                 {loading ? <LoaderIcon className="animate-spin mr-2" /> : "Verify"}
//               </Button>
//             </form>
//           )}
//         </div>
//       </div>
//       <div className="hidden lg:block flex-1 h-screen">
//         <img
//           src="src/assets/img3.jpg"
//           alt="Decorative background"
//           className="h-full w-full object-cover"
//         />
//       </div>
//     </div>
//   );
// }
