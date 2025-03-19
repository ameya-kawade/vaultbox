import { useTheme } from "@/components/Theme/ThemeProvider"
import logoDark from "@/assets/logo-dark.svg";
import logoLight from "@/assets/logo-light.svg";

export function Logo({ className }) {
  const { theme } = useTheme()

  return (
    <div className={className}>
     <img src={theme === "dark" ? logoDark : logoLight} alt="Vaultbox" className="h-8 w-auto" />
    </div>
  )
}

