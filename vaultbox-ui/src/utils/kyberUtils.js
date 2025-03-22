import { Buffer } from 'buffer';
import * as kyber from 'crystals-kyber-js';

// Function to convert Uint8Array to base64
function uint8ArrayToBase64(uint8Array) {
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

// Generates a Kyber768 key pair
async function generateKyber768KeyPair() {
  try {
    // Access the MlKem768 module
    const MlKem768 = kyber.MlKem768;

    if (!MlKem768) {
      throw new Error("MlKem768 module not found in the library");
    }

    // Instantiate the MlKem768 class
    const kyber768Instance = new MlKem768();

    // Generate the key pair
    const keyPair = await kyber768Instance.generateKeyPair();

    // Extract keys from the array
    const pk = keyPair[0]; // Public key as Uint8Array
    const sk = keyPair[1]; // Private key as Uint8Array

    // Convert Uint8Array to base64
    const publicKey = uint8ArrayToBase64(pk);
    const privateKey = uint8ArrayToBase64(sk);

    return { publicKey, privateKey };

  } catch (error) {
    console.error("Error generating Kyber keys:", error);
    throw error;
  }
}

export { generateKyber768KeyPair };
