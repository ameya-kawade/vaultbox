

> **Note:** The "Create Account" functionality is currently on hold. Only login and messaging features are enabled.

---

## Table of Contents
- [Todos](#todos)
- [Backend Package Management](#backend-package-management)

---


- **Frontend:** React with Socket.IO for realtime messaging. Authentication is managed via an Auth Context.
- **Backend:** Node.js with Express and MongoDB, integrated with Socket.IO to handle realtime events.  
- **Encryption (In Progress):** Functions for key generation, message encryption/decryption, and storage of private keys in IndexedDB are being implemented. 

---

## Todos

Below is the current list of tasks to be implemented:

1. **Key Generation Functions:**  
   - Write functions for generating cryptographic keys.
   - Organize these functions in a separate module for easy reuse.

2. **Encryption & Decryption Functions:**  
   - Write functions to encrypt and decrypt messages using the generated keys.
   - Ensure that encryption/decryption is integrated into the chat pages.

3. **Private Key Storage:**  
   - Store the private key securely in IndexedDB.
   - Create a separate file or function dedicated to managing private key storage and retrieval.

4. **Integrate Encryption/Decryption in Chat Pages:**  
   - Update Messages.jsx & Channels.jsx to use the encryption and decryption features so that messages are stored and displayed in their decrypted form only on the client.

5. **Key Generation After OTP Verification:**  
   - Use the key generation functions after OTP verification in the file `features/login/components/otp-verification.jsx`.

6. **Backend Integration for Public Keys:**  
   - Create a new backend route to receive and store the user's public key.
   - Modify the user schema in MongoDB to add a field for the public key.

7. **User Schema Updates in Authentication:**  
   - Update the user schema and integrate it inside the authentication service (file: `authServices.js`).

8. **Create Account Flow:**  
   - Implement password hashing.
   - Create a route to add users by taking `username`, `email`, and `password` from the user request.
   - Use OTP verification (already implemented in `authController.js`) to verify the user.
   - Organize controllers by moving related functions into a separate file and remove any unnecessary routes (e.g., `validateSession`) from the controller.

---

## Backend Package Management

To add new libraries/packages in the backend:

1. Open the `package.json` file located in the backend folder.
2. In the `"dependencies"` section, add your package as follows:

   ```json
   "dependencies": {
     "package-name": "^version",
     "another-package": "^version"
   }
