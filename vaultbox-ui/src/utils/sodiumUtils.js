import sodium from 'libsodium-wrappers';

// Initialize Libsodium
await sodium.ready;

// Encrypt a Message using the Shared Secret
function encryptMessage(message, sharedSecret) {
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const cipherText = sodium.crypto_secretbox_easy(
        sodium.from_string(message),
        nonce,
        sodium.from_base64(sharedSecret)
    );

    return {
        nonce: sodium.to_base64(nonce),
        cipherText: sodium.to_base64(cipherText)
    };
}

// Decrypt a Message using the Shared Secret
function decryptMessage(cipherText, nonce, sharedSecret) {
    const decryptedMessage = sodium.crypto_secretbox_open_easy(
        sodium.from_base64(cipherText),
        sodium.from_base64(nonce),
        sodium.from_base64(sharedSecret)
    );

    return sodium.to_string(decryptedMessage);
}

export { encryptMessage, decryptMessage };
