"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Copy, Info, RefreshCw, Shield } from "lucide-react"
import { useTheme } from "@/components/Theme/ThemeProvider"
import { useAuth } from "@/features/login/context/auth"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

const APP_VERSION = "1.0.0"

// Function to access IndexedDB
const getKeysFromIndexedDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("vaultbox-keys", 1);
    
    request.onerror = (event) => {
      reject("Error opening IndexedDB");
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys", { keyPath: "id" });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["keys"], "readonly");
      const store = transaction.objectStore("keys");
      const getRequest = store.get("user-keys");
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result || { publicKey: "", privateKey: "" });
      };
      
      getRequest.onerror = () => {
        reject("Error fetching keys");
      };
    };
  });
};

// Function to update IndexedDB
const updateKeysInIndexedDB = async (keys) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("vaultbox-keys", 1);
    
    request.onerror = (event) => {
      reject("Error opening IndexedDB");
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys", { keyPath: "id" });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["keys"], "readwrite");
      const store = transaction.objectStore("keys");
      
      const updateRequest = store.put({
        id: "user-keys",
        ...keys
      });
      
      updateRequest.onsuccess = () => {
        resolve();
      };
      
      updateRequest.onerror = () => {
        reject("Error updating keys");
      };
    };
  });
};

// Function to generate new key pair
const generateKeyPair = async () => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
  
  const publicKeyExport = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );
  
  const privateKeyExport = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );
  
  // Convert to base64
  const publicKeyB64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyExport)));
  const privateKeyB64 = btoa(String.fromCharCode(...new Uint8Array(privateKeyExport)));
  
  return {
    publicKey: publicKeyB64,
    privateKey: privateKeyB64
  };
};

// Function to update keys on the server
const updateKeysOnServer = async (userId, publicKey) => {
  try {
    const response = await fetch(`/api/user/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        publicKey
      }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to update keys on server");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating keys:", error);
    throw error;
  }
};

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [darkMode, setDarkMode] = useState(theme === "dark");
  const [enableEmail, setEnableEmail] = useState(true);
  const [enableSMS, setEnableSMS] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [keys, setKeys] = useState({ publicKey: "", privateKey: "" });
  const [regeneratingKeys, setRegeneratingKeys] = useState(false);

  useEffect(() => {
    const loadKeys = async () => {
      try {
        const storedKeys = await getKeysFromIndexedDB();
        setKeys(storedKeys);
      } catch (error) {
        console.error("Error loading keys:", error);
        toast.error("Could not load encryption keys");
      }
    };
    
    loadKeys();
  }, []);

  const handleDarkModeToggle = (checked) => {
    setDarkMode(checked);
    setTheme(checked ? "dark" : "light");
  };

  const handleRegenerateKeys = async () => {
    try {
      setRegeneratingKeys(true);
      
      // Generate new key pair
      const newKeys = await generateKeyPair();
      
      // Update IndexedDB
      await updateKeysInIndexedDB(newKeys);
      
      // Update on server
      if (user?.id) {
        await updateKeysOnServer(user.id, newKeys.publicKey);
      }
      
      // Update state
      setKeys(newKeys);
      
      toast.success("Encryption keys regenerated successfully");
    } catch (error) {
      console.error("Error regenerating keys:", error);
      toast.error("Failed to regenerate encryption keys");
    } finally {
      setRegeneratingKeys(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${label} copied to clipboard`))
      .catch(() => toast.error(`Failed to copy ${label}`));
  };

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
        <h2 className="text-xl font-semibold flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Security Settings
        </h2>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Label htmlFor="two-factor-auth">Two-Factor Authentication</Label>
            <Badge variant="outline" className="ml-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
              Coming Soon
            </Badge>
          </div>
          <Switch
            id="two-factor-auth"
            checked={twoFactorAuth}
            onCheckedChange={setTwoFactorAuth}
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-keys" className="font-medium">Encryption Keys</Label>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowKeys(!showKeys)}
                className="text-sm"
              >
                {showKeys ? "Hide Keys" : "Show Keys"}
              </Button>
              <Button 
                onClick={handleRegenerateKeys}
                disabled={regeneratingKeys}
                className="text-sm"
              >
                {regeneratingKeys ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate Keys
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {showKeys && (
            <div className="space-y-4">
              <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  These keys are extremely sensitive. Never share your private key with anyone.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="public-key" className="flex items-center">
                  <span>Public Key</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 ml-auto"
                    onClick={() => copyToClipboard(keys.publicKey, "Public key")}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Copy</span>
                  </Button>
                </Label>
                <Textarea
                  id="public-key"
                  value={keys?.publicKey || "No public key available. Generate keys to create one."}
                  readOnly
                  className="font-mono text-xs h-24"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="private-key" className="flex items-center text-destructive font-semibold">
                  <span>Private Key</span>
                  <Info className="h-3.5 w-3.5 ml-1" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 ml-auto"
                    onClick={() => copyToClipboard(keys.privateKey, "Private key")}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Copy</span>
                  </Button>
                </Label>
                <Textarea
                  id="private-key"
                  value={keys.privateKey}
                  readOnly
                  className="font-mono text-xs h-24 border-destructive/50 focus-visible:ring-destructive/30"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <Separator />

      {/* About */}
      <section>
        <h2 className="text-xl font-semibold mb-2">About</h2>
        <p className="text-sm text-muted-foreground">App Version: {APP_VERSION}</p>
      </section>
    </div>
  );
};

export default Settings;
