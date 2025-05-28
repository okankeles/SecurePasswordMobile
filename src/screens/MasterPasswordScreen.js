// src/screens/MasterPasswordScreen.js
import React from 'react';
import MasterPasswordPromptUI from '../components/MasterPasswordPromptUI';

const MasterPasswordScreen = ({ navigation, setMasterPasswordGlobally }) => {
    console.log('MasterPasswordScreen: Rendered. setMasterPasswordGlobally prop:', typeof setMasterPasswordGlobally); // EKLENDİ

    const handleSetMasterPasswordInternal = (mp) => {
        console.log("MasterPasswordScreen: handleSetMasterPasswordInternal called with master password:", mp); // EKLENDİ
        if (setMasterPasswordGlobally) {
            console.log("MasterPasswordScreen: Calling setMasterPasswordGlobally..."); // EKLENDİ
            setMasterPasswordGlobally(mp);
        } else {
            console.error("MasterPasswordScreen: setMasterPasswordGlobally prop is not defined!"); // EKLENDİ
            Alert.alert("Hata", "Sistem hatası: Parola ayarlama fonksiyonu bulunamadı."); // Kullanıcıya bilgi
        }
    };

    return (
        <MasterPasswordPromptUI
            onSetMasterPassword={handleSetMasterPasswordInternal}
            initialMessage="Ana Parolanızı Girin veya Belirleyin"
        />
    );
};

export default MasterPasswordScreen;