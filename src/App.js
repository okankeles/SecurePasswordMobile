// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Alert, LogBox, Platform } from 'react-native'; // Platform eklendi
import AppNavigator from './navigation/AppNavigator';
import { useAppStorage } from './hooks/useAppStorage';
import LoadingScreen from './screens/LoadingScreen';
//import './i18n';

// Buffer polyfill (eğer kripto kütüphaneleri için gerekiyorsa)
if (typeof global.Buffer === 'undefined') {
    global.Buffer = require('buffer').Buffer;
}

// Geliştirme sırasında belirli uyarıları gizlemek için (opsiyonel)
// LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
// LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']); // Eğer state'te fonksiyon vb. varsa

const App = () => {
    const {
        isSessionActive: initialIsSessionActive,
        storageLoading,
        updateIsSessionActive,
        clearSessionData, // Logout için
        // clearAllAppData, // Ana şifre değişirse veya fabrika ayarlarına dönmek için (opsiyonel)
    } = useAppStorage();

    const [appIsReady, setAppIsReady] = useState(false);
    const [isUserSessionActive, setIsUserSessionActive] = useState(false);
    const [masterPassword, setMasterPassword] = useState(null); // Ana parolayı bellekte tut

    useEffect(() => {
        // console.log('App.js: storageLoading useEffect | storageLoading:', storageLoading, 'initialIsSessionActive:', initialIsSessionActive);
        if (!storageLoading) {
            setIsUserSessionActive(initialIsSessionActive);
            // Ana parola, uygulama her açıldığında MasterPasswordScreen üzerinden set edilmeli.
            // Oturum aktif olsa bile, güvenlik için ana parolayı bellekte tutmuyoruz (sadece sessionMasterPassword).
            // Bu yüzden `masterPassword` state'i burada initialIsSessionActive'e göre set edilmiyor.
            // AppNavigator, masterPassword null ise ve session aktif olsa bile MasterPasswordScreen'e yönlendirecek.
            setAppIsReady(true);
            // console.log('App.js: App is ready. isUserSessionActive set to:', initialIsSessionActive);
        }
    }, [storageLoading, initialIsSessionActive]);

    const handleSetMasterPassword = useCallback(
        (mp) => {
            // console.log("App.js: handleSetMasterPassword called with master password:", mp ? '******' : 'EMPTY');
            if (mp && mp.length > 0) { // Temel bir geçerlilik kontrolü
                // ÖNEMLİ: Farklı bir ana parola girilirse eski verilerin durumu ne olacak?
                // Güvenlik açısından, eğer mevcut bir `masterPassword` state'i varsa ve
                // gelen `mp` farklıysa, kullanıcıya tüm kayıtlı verilerin silineceği uyarısı verilebilir
                // ve onay alınabilir. Ya da bu senaryo için `clearAllAppData` kullanılabilir.
                // Şimdilik bu karmaşık senaryoyu dışarıda bırakıyoruz.

                setMasterPassword(mp); // Ana parolayı state'e kaydet
                setIsUserSessionActive(true); // Oturumu aktif et
                updateIsSessionActive(true); // AsyncStorage'ye de kaydet
                // console.log("App.js: Master password set and session activated.");
            } else {
                Alert.alert("Hata", "Geçerli bir ana parola girilmedi.");
                // console.log("App.js: Invalid master password received.");
                // Hatalı parola durumunda oturumu aktif etme ve ana parolayı null bırak
                setMasterPassword(null);
                setIsUserSessionActive(false);
                updateIsSessionActive(false);
            }
        },
        [updateIsSessionActive] // Bağımlılık listesi
    );

    const handleLogout = useCallback(async () => {
        // console.log("App.js: handleLogout called");
        setMasterPassword(null); // Bellekteki ana parolayı sil
        setIsUserSessionActive(false); // Kullanıcı oturumunu pasif yap
        await updateIsSessionActive(false); // AsyncStorage'de oturum durumunu güncelle
        await clearSessionData(); // Oturumla ilgili diğer verileri temizle (lastUrl vb.)
        // Not: clearSessionData SITES_STORAGE_KEY'i silmemeli, o kullanıcıya aittir.
        // Farklı ana parola senaryosu için clearAllAppData düşünülmeli.
        // console.log("App.js: Logout completed.");
        // AppNavigator, isUserSessionActive ve masterPassword state'lerine göre
        // otomatik olarak MasterPasswordScreen'e yönlendirecektir.
    }, [updateIsSessionActive, clearSessionData]);

    // console.log("App.js: Rendering. appIsReady:", appIsReady, "isUserSessionActive:", isUserSessionActive, "masterPassword:", masterPassword ? 'PRESENT' : 'NULL');

    if (!appIsReady) {
        // console.log("App.js: App not ready, returning LoadingScreen.");
        return <LoadingScreen />; // Uygulama hazır olana kadar yükleme ekranı göster
    }

    return (
        <NavigationContainer>
            <AppNavigator
                isSessionActive={isUserSessionActive}
                masterPassword={masterPassword} // MainAppScreen ve yönlendirme mantığı için
                setMasterPasswordGlobally={handleSetMasterPassword} // MasterPasswordScreen'e
                handleLogoutApp={handleLogout} // MainAppScreen'e
            />
        </NavigationContainer>
    );
};

export default App;