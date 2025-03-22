/**
 * Encryption utility functions for the cipher mode feature
 */

// Encrypt text using a substitution cipher with a seed-based key
export function encryptText(text, seed = "default-key") {
  if (!text) return '';
  
  // Generate a consistent key from the seed
  const key = generateKeyFromSeed(seed);
  
  // Encrypt the text
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    // Only encrypt letters and numbers, leave special chars as is
    if (/[a-zA-Z0-9]/.test(char)) {
      const charCode = char.charCodeAt(0);
      const keyChar = key[i % key.length];
      const keyCode = keyChar.charCodeAt(0);
      
      // XOR operation for encryption
      const encryptedCode = charCode ^ keyCode;
      
      // Convert back to ASCII range for readable output
      let displayChar;
      if (/[a-z]/.test(char)) {
        displayChar = String.fromCharCode(97 + (encryptedCode % 26));
      } else if (/[A-Z]/.test(char)) {
        displayChar = String.fromCharCode(65 + (encryptedCode % 26));
      } else if (/[0-9]/.test(char)) {
        displayChar = String.fromCharCode(48 + (encryptedCode % 10));
      } else {
        displayChar = char;
      }
      
      result += displayChar;
    } else {
      // Keep spaces, punctuation, etc. unchanged
      result += char;
    }
  }
  
  return result;
}

// Generate a deterministic key from a seed value
function generateKeyFromSeed(seed) {
  // Simple hash function to generate a string key from the seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert hash to a string key with good distribution
  const key = [];
  const keyLength = 16; // Reasonable key length
  for (let i = 0; i < keyLength; i++) {
    // Create a character based on position and hash
    const value = Math.abs((hash + i * 1723) & 0xFF); // 1723 is a prime number for better distribution
    key.push(String.fromCharCode(65 + (value % 26)));
  }
  
  return key.join('');
} 