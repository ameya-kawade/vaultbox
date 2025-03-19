import * as kyber from 'crystals-kyber-js';  // Fix import issue


// Generate Kyber-768 Key Pair
function generateKyber768KeyPair() {
    const keyPair = kyber.KeyGen(kyber.KYBER_768);
    return {
        publicKey: Buffer.from(keyPair.publicKey).toString('base64'),
        privateKey: Buffer.from(keyPair.privateKey).toString('base64')
    };
}

// Establish a Shared Secret using Kyber
function generateSharedSecret(publicKey, privateKey) {
    const { sharedSecret } = kyber.Decrypt(
        Buffer.from(publicKey, 'base64'),
        Buffer.from(privateKey, 'base64'),
        kyber.KYBER_768
    );
    return Buffer.from(sharedSecret).toString('base64'); // Shared Secret
}

export { generateKyber768KeyPair, generateSharedSecret };
