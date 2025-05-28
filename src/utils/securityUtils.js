// src/utils/securityUtils.js
import { sha1 } from 'react-native-quick-crypto'; // react-native-quick-crypto'dan sha1
import { Buffer } from 'buffer'; // Buffer polyfill'i (App.js'te eklenmiş olmalı)

export async function checkPasswordPwned(password) {
    if (!password) {
        return false;
    }
    try {
        // React Native'de TextEncoder yerine Buffer kullanabiliriz
        const data = Buffer.from(password, 'utf-8');
        const hashBuffer = sha1(data); // Bu, Buffer döndürür

        // Buffer'ı hex string'e çevir
        const hexHash = hashBuffer.toString('hex').toUpperCase();
        const prefix = hexHash.substring(0, 5);
        const suffixToMatch = hexHash.substring(5);

        const apiUrl = `https://api.pwnedpasswords.com/range/${prefix}`;
        console.log("Checking Pwned API:", apiUrl);
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                // 'User-Agent': 'FlyPassMobileApp/1.0.0' // Opsiyonel
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                console.log("Pwned API: Prefix not found (good).");
                return false; // Sızdırılmamış
            }
            console.warn(`Pwned Passwords API request failed with status: ${response.status}`);
            return false; // Hata durumunda sızdırılmamış kabul et
        }

        const textData = await response.text();
        const hashes = textData.split(/\r\n|\n|\r/); // Farklı satır sonlarını işle

        for (const line of hashes) {
            const [pwnedSuffix] = line.split(':');
            if (pwnedSuffix === suffixToMatch) {
                console.warn("Master Password IS PWNED!");
                return true; // Sızdırılmış!
            }
        }
        console.log("Pwned API: Password not found in breaches (good).");
        return false; // Sızdırılmamış
    } catch (error) {
        console.error("Error checking pwned password:", error);
        // Network hatası vb. durumlarda kullanıcıyı gereksiz yere engellememek için false dönebiliriz
        // ya da bir hata mesajı gösterip kullanıcıya tekrar denemesini söyleyebiliriz.
        return false;
    }
}