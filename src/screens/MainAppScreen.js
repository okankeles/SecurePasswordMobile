// src/screens/MainAppScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ScrollView, Button, Text, StyleSheet, ActivityIndicator, Alert, Platform, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import NewSiteFormUI from '../components/NewSiteFormUI';
import SavedSitesListUI from '../components/SavedSitesListUI';
import PasswordOutputUI from '../components/PasswordOutputUI';

import { deriveKeyFromMasterPassword, generateSiteKey } from '../crypto/cryptoHandler';
import { selectTemplateBySiteKey, getPasswordTypeLabelById } from '../utils/templateUtils';
import { generatePasswordFromSiteKeyWithPaperTemplate } from '../utils/passwordGenerationCore';
import { DEFAULT_COUNTER, PROTOTYPE_SALT_FOR_MASTER_KEY } from '../utils/constants';
import { useAppStorage } from '../hooks/useAppStorage';

const appLogo = require('../assets/ontheflylogo.png');

const MainAppScreen = ({ navigation, masterPasswordFromApp, handleLogout: appHandleLogout }) => {
    const sessionMasterPassword = masterPasswordFromApp;
    const { sites, addOrUpdateSiteProfile, removeSiteProfile, lastUsedUrl, updateLastUsedUrl, storageLoading } = useAppStorage();

    const [currentUrl, setCurrentUrlState] = useState('');
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [generatedProfileData, setGeneratedProfileData] = useState(null);
    const [isLoading, setIsLoadingState] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('new');
    const [newSiteFormKey, setNewSiteFormKey] = useState(Date.now());

    const messageTimeoutRef = useRef(null);
    const errorTimeoutRef = useRef(null);

    useEffect(() => { return () => { if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current); if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current); }; }, []);
    const clearPreviousMessagesAndErrors = useCallback(() => { if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current); if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current); setMessage(''); setError(''); }, []);
    useEffect(() => { if (!storageLoading && lastUsedUrl && !currentUrl && activeTab === 'new') setCurrentUrlState(lastUsedUrl); }, [storageLoading, lastUsedUrl, currentUrl, activeTab]);
    useEffect(() => { if (!sessionMasterPassword && navigation.isFocused()) { Alert.alert("Oturum Hatası", "Ana parola bulunamadı."); if (appHandleLogout) appHandleLogout(); } }, [sessionMasterPassword, navigation, appHandleLogout]);

    const handleGenerateAndSaveProfile = async (url, profileName, username, passwordType, isNewSite) => {
        if (!sessionMasterPassword) { setError('Ana Parola oturumu aktif değil.'); if (appHandleLogout) appHandleLogout(); return; }
        if (!url || url.trim() === "") { Alert.alert("Uyarı", "URL/Site Adı girilmelidir."); setError('URL/Site Adı girilmelidir.'); return; }
        if (!passwordType && isNewSite) { Alert.alert("Uyarı", "Parola tipi seçilmelidir."); setError('Parola tipi seçilmelidir.'); return; }

        const trimmedUrl = url.trim();
        const existingProfilesForUrl = sites[trimmedUrl] || [];
        const profileExists = existingProfilesForUrl.find(p => p.profileName === profileName && p.preferredPasswordType === passwordType);
        if (isNewSite && profileExists) {
            Alert.alert("Hata", `'${trimmedUrl}' için '${profileName}' adlı ve '${getPasswordTypeLabelById(passwordType)}' tipli bir profil zaten mevcut.`);
            return;
        }

        setIsLoadingState(true); clearPreviousMessagesAndErrors(); setGeneratedPassword(''); setGeneratedProfileData(null);
        try {
            const actualCounter = DEFAULT_COUNTER;
            const derivedKey = await deriveKeyFromMasterPassword(sessionMasterPassword, PROTOTYPE_SALT_FOR_MASTER_KEY);
            const siteKeyForPassword = await generateSiteKey(derivedKey, trimmedUrl, actualCounter);
            const chosenTemplateString = selectTemplateBySiteKey(siteKeyForPassword, passwordType);
            if (!chosenTemplateString) throw new Error(`Şablon seçilemedi (Tip: ${passwordType}).`);
            const newPassword = generatePasswordFromSiteKeyWithPaperTemplate(siteKeyForPassword, chosenTemplateString);
            const profileToSave = { profileName, username: username || undefined, preferredPasswordType: passwordType };
            const savedProfile = await addOrUpdateSiteProfile(trimmedUrl, profileToSave);
            setGeneratedPassword(newPassword);
            setGeneratedProfileData({ ...savedProfile, url: trimmedUrl });
            const successMsg = `'${trimmedUrl}' (${profileName}) için parola üretildi ve profil kaydedildi.`;
            setMessage(successMsg);
            if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
            messageTimeoutRef.current = setTimeout(() => setMessage(prev => prev === successMsg ? '' : prev), 3500);
            await updateLastUsedUrl(trimmedUrl);
            if (isNewSite && activeTab === 'new') { setCurrentUrlState(''); setNewSiteFormKey(Date.now()); }
        } catch (err) {
            const errorMsg = `Hata: ${err.message}`; setError(errorMsg);
            if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
            errorTimeoutRef.current = setTimeout(() => setError(prev => prev === errorMsg ? '' : prev), 5000);
        } finally { setIsLoadingState(false); }
    };

    const handleGenerateFromSavedProfile = async (url, profileId) => {
        if (!sessionMasterPassword) { setError('Ana Parola oturumu aktif değil.'); if (appHandleLogout) appHandleLogout(); return; }
        if (!url || !profileId || !sites[url]) { Alert.alert("Hata", "Geçersiz site veya profil."); setError("Geçersiz site veya profil."); return; }
        const profile = sites[url].find(p => p.id === profileId);
        if (!profile) { Alert.alert("Hata", "Profil bulunamadı."); setError("Profil bulunamadı."); return; }
        setIsLoadingState(true); clearPreviousMessagesAndErrors(); setGeneratedPassword(''); setGeneratedProfileData(null);
        setActiveTab('new'); setCurrentUrlState(url); setNewSiteFormKey(Date.now());
        try {
            const actualCounter = DEFAULT_COUNTER;
            const derivedKey = await deriveKeyFromMasterPassword(sessionMasterPassword, PROTOTYPE_SALT_FOR_MASTER_KEY);
            const siteKeyForPassword = await generateSiteKey(derivedKey, url, actualCounter);
            const chosenTemplateString = selectTemplateBySiteKey(siteKeyForPassword, profile.preferredPasswordType);
            if (!chosenTemplateString) throw new Error(`Şablon seçilemedi.`);
            const newPassword = generatePasswordFromSiteKeyWithPaperTemplate(siteKeyForPassword, chosenTemplateString);
            setGeneratedPassword(newPassword);
            setGeneratedProfileData({ ...profile, url: url });
            const successMsg = `'${url}' (${profile.profileName}) için parola üretildi.`;
            setMessage(successMsg);
            if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
            messageTimeoutRef.current = setTimeout(() => setMessage(prev => prev === successMsg ? '' : prev), 3500);
            await addOrUpdateSiteProfile(url, { ...profile });
            await updateLastUsedUrl(url);
        } catch (err) {
            const errorMsg = `Hata: ${err.message}`; setError(errorMsg);
            if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
            errorTimeoutRef.current = setTimeout(() => setError(prev => prev === errorMsg ? '' : prev), 5000);
        } finally { setIsLoadingState(false); }
    };

    const handleCopyToClipboard = () => { if (generatedPassword) { Clipboard.setString(generatedPassword); const msg = "Parola panoya kopyalandı!"; clearPreviousMessagesAndErrors(); setMessage(msg); if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current); messageTimeoutRef.current = setTimeout(() => setMessage(prev => prev === msg ? '' : prev), 2500); } };
    const handleRemoveProfileCallback = (url, profileId) => {
        const profileToRemove = sites[url]?.find(p => p.id === profileId);
        const profileNameToDelete = profileToRemove?.profileName || "Bu profil";
        Alert.alert( "Profili Sil", `'${url}' sitesindeki "${profileNameToDelete}" profilini silmek istediğinizden emin misiniz?`,
            [ { text: "İptal", style: "cancel" }, { text: "Sil", onPress: async () => {
                setIsLoadingState(true); const success = await removeSiteProfile(url, profileId); setIsLoadingState(false);
                if (success) { const msg = "Profil başarıyla silindi."; setMessage(msg); if (generatedProfileData && generatedProfileData.url === url && generatedProfileData.id === profileId) { setGeneratedPassword(''); setGeneratedProfileData(null); } if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current); messageTimeoutRef.current = setTimeout(() => setMessage(prev => prev === msg ? '' : prev), 3000);
                } else { const err = "Profil silinirken bir hata oluştu."; setError(err); if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current); errorTimeoutRef.current = setTimeout(() => setError(prev => prev === err ? '' : prev), 3000); }
            }, style: "destructive" } ] );
    };
    const handleAutofillFromListRequest = async (url, profileToFill) => { Alert.alert("Oto-Doldur (Mobil)", `'${url}' (${profileToFill.profileName}) için parola üretilip panoya kopyalanabilir.`); };

    const handleTabChange = (newTab) => {
        clearPreviousMessagesAndErrors(); setGeneratedPassword(''); setGeneratedProfileData(null); setActiveTab(newTab);
        if (newTab === 'new') { if (!currentUrl && lastUsedUrl) setCurrentUrlState(lastUsedUrl); setNewSiteFormKey(Date.now()); }
    };

    if (storageLoading) { return ( <View style={styles.loadingContainer}><ActivityIndicator size="large" /><Text>Yükleniyor...</Text></View> ); }

    return (
        <SafeAreaView style={styles.fullScreen}>
            <View style={styles.fixedTopNavbar}>
                <View style={styles.navbarLeft}><Image source={appLogo} style={styles.navbarLogo} /></View>
                <View style={styles.navbarCenter}><Text style={styles.navbarTitle}>FLYPASS</Text></View>
                <View style={styles.navbarRight}><TouchableOpacity onPress={appHandleLogout} style={styles.logoutButtonTop}><Icon name="logout" size={22} color="white" /></TouchableOpacity></View>
            </View>

            <ScrollView style={styles.mainContentArea} contentContainerStyle={styles.contentScrollViewContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.tabs}>
                    <TouchableOpacity style={[styles.tabButton, activeTab === 'new' && styles.tabActive]} onPress={() => handleTabChange('new')} disabled={isLoading}><Text style={[styles.tabButtonText, activeTab === 'new' && styles.tabTextActive]}>Yeni Profil</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.tabButton, activeTab === 'saved' && styles.tabActive]} onPress={() => handleTabChange('saved')} disabled={isLoading}><Text style={[styles.tabButtonText, activeTab === 'saved' && styles.tabTextActive]}>Kayıtlılar</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.tabButton, activeTab === 'settings' && styles.tabActive]} onPress={() => handleTabChange('settings')} disabled={isLoading}><Text style={[styles.tabButtonText, activeTab === 'settings' && styles.tabTextActive]}>Ayarlar</Text></TouchableOpacity>
                </View>

                {error ? <Text style={styles.messageError}>{error}</Text> : null}
                {message && !error && !message.includes("kopyalandı") ? <Text style={styles.messageSuccess}>{message}</Text> : null}

                {activeTab === 'new' && (
                    <NewSiteFormUI key={newSiteFormKey} onGenerate={handleGenerateAndSaveProfile} isLoading={isLoading} currentUrl={currentUrl} setCurrentUrl={setCurrentUrlState}/>
                )}
                {activeTab === 'saved' && (
                    // SavedSitesListUI kendi ScrollView/SectionList'ini yönetmeli.
                    // Eğer iç içe ScrollView sorunu olursa, SavedSitesListUI'ın yüksekliği kısıtlanmalı
                    // veya MainAppScreen'deki bu ScrollView kaldırılmalı.
                    <SavedSitesListUI sites={sites} onGenerateFromSaved={handleGenerateFromSavedProfile} onRemoveProfile={handleRemoveProfileCallback} isLoading={isLoading} onAutofillFromList={handleAutofillFromListRequest} />
                )}
                {activeTab === 'settings' && (
                    <View style={styles.settingsContent}><Text style={styles.settingsTitle}>Ayarlar</Text><Text>Dil, Veri Yedekleme/Geri Yükleme ayarları burada olacak.</Text></View>
                )}

                {activeTab === 'new' && generatedPassword && generatedProfileData && (
                    <PasswordOutputUI generatedPassword={generatedPassword} onCopy={handleCopyToClipboard} copyMessage={message.includes("kopyalandı") ? message : ""} />
                )}
                {isLoading && (generatedPassword || error || (message && !message.includes("kopyalandı"))) && (<View style={styles.inlineLoading}><ActivityIndicator size="small" color="#007AFF" /></View>)}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
    fullScreen: { flex: 1, backgroundColor: '#f0f2f5' },
    fixedTopNavbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: Platform.OS === 'ios' ? 90 : 60, paddingTop: Platform.OS === 'ios' ? 40 : 0, paddingHorizontal: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#dee2e6' },
    navbarLeft: { minWidth: 40, justifyContent: 'center', alignItems: 'flex-start'},
    navbarLogo: { height: 30, width: 30, resizeMode: 'contain' },
    navbarCenter: { flex: 1, alignItems: 'center' },
    navbarTitle: { fontSize: 18, fontWeight: 'bold', color: '#212529' },
    navbarRight: { minWidth: 40, alignItems: 'flex-end' },
    logoutButtonTop: { backgroundColor: '#dc3545', padding: 7, borderRadius: 20 },
    mainContentArea: { flex: 1 }, // Ana ScrollView alanı
    contentScrollViewContainer: { paddingHorizontal: 5, paddingVertical:10, paddingBottom: 20 },
    tabs: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15, backgroundColor: '#fff', borderBottomWidth:1, borderColor:'#e0e0e0', paddingTop:5},
    tabButton: { flex:1, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent', alignItems:'center' },
    tabActive: { borderBottomColor: '#007AFF' },
    tabButtonText: { fontSize: 15, color: 'grey' },
    tabTextActive: { color: '#007AFF', fontWeight:'600' },
    messageError: { backgroundColor: '#f8d7da', color: '#842029', borderColor: '#f5c2c7', borderWidth: 1, padding: 10, borderRadius: 6, textAlign: 'center', fontWeight: '500', fontSize: 14, marginHorizontal:10, marginBottom:10 },
    messageSuccess: { backgroundColor: '#d1e7dd', color: '#0f5132', borderColor: '#badbcc', borderWidth: 1, padding: 10, borderRadius: 6, textAlign: 'center', fontWeight: '500', fontSize: 14, marginHorizontal:10, marginBottom:10 },
    // listContainer: { minHeight: 300, }, // SavedSitesListUI için, artık SavedSitesListUI kendi flex:1'ini yönetiyor
    settingsContent: { backgroundColor: '#fff', padding: 15, borderRadius: 8, borderWidth:1, borderColor: '#e0e5e9', marginHorizontal:5 },
    settingsTitle: { fontSize: 17, fontWeight: '600', color: '#0d6efd', marginBottom: 15, textAlign: 'center'},
    inlineLoading: { alignItems: 'center', marginTop: 10, paddingBottom: 10 },
});
export default MainAppScreen;