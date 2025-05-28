// src/crypto/cryptoHandler.js
import { Argon2, Argon2Mode } from '@sphereon/isomorphic-argon2';
import { Buffer } from 'buffer'; // react-native-quick-crypto genellikle Buffer ile çalışır
import quickCrypto from 'react-native-quick-crypto'; // HMAC için

// isomorphic-argon2'nin React Native'de çalışması için polyfill gerekebilir
// global.Buffer = Buffer; // Eğer isomorphic-argon2 Buffer'a ihtiyaç duyuyorsa

export async function deriveKeyFromMasterPassword(masterPassword, salt) {
    const options = {
        hashLength: 32,
        memory: 65536,
        parallelism: 4,
        iterations: 3,
        mode: Argon2Mode.Argon2d,
    };
    try {
        // @sphereon/isomorphic-argon2 doğrudan Uint8Array döndürebilir veya hex string
        const result = await Argon2.hash(masterPassword, salt, options);

        if (result.rawHash && result.rawHash instanceof Uint8Array) {
            return result.rawHash;
        } else if (result.hex) {
            // Hex'i Uint8Array'e çevir (Buffer.from ile daha kolay olabilir)
            return Uint8Array.from(Buffer.from(result.hex, 'hex'));
        }
        throw new Error("Could not get raw hash from isomorphic-argon2 result");
    } catch (error) {
        console.error("Argon2 key derivation error:", error);
        throw error;
    }
}

export async function generateSiteKey(derivedKey, siteName, counter, salt = "site_specific_salt_mobile") {
    const siteIdentifier = `${siteName.length}${siteName}${counter}${salt}`;
    try {
        // derivedKey'in Uint8Array veya Buffer olduğundan emin olun
        const keyBuffer = Buffer.isBuffer(derivedKey) ? derivedKey : Buffer.from(derivedKey);
        const dataBuffer = Buffer.from(siteIdentifier, 'utf8');

        const hmac = quickCrypto.createHmac('sha256', keyBuffer);
        hmac.update(dataBuffer);
        const signatureBuffer = hmac.digest();

        return new Uint8Array(signatureBuffer); // Veya doğrudan Buffer döndürün
    } catch (error) {
        console.error("HMAC-SHA256 site key generation error:", error);
        throw error;
    }
}