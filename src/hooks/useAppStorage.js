// src/hooks/useAppStorage.js
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SITES_STORAGE_KEY, SESSION_ACTIVE_KEY, LAST_URL_KEY } from '../utils/constants';

export function useAppStorage() {
    const [sites, setSites] = useState({});
    const [isSessionActive, setIsSessionActiveState] = useState(false);
    const [lastUsedUrl, setLastUsedUrlState] = useState('');
    const [storageLoading, setStorageLoading] = useState(true);

    useEffect(() => {
        async function loadInitialData() {
            setStorageLoading(true);
            try {
                const storedSites = await AsyncStorage.getItem(SITES_STORAGE_KEY);
                const storedSession = await AsyncStorage.getItem(SESSION_ACTIVE_KEY);
                const storedLastUrl = await AsyncStorage.getItem(LAST_URL_KEY);
                if (storedSites) setSites(JSON.parse(storedSites)); else setSites({});
                setIsSessionActiveState(storedSession === 'true');
                if (storedLastUrl) setLastUsedUrlState(storedLastUrl);
            } catch (e) { console.error("Failed to load data:", e); setSites({}); }
            finally { setStorageLoading(false); }
        }
        loadInitialData();
    }, []);

    const _saveSitesToStorage = async (newSitesData) => {
        try { await AsyncStorage.setItem(SITES_STORAGE_KEY, JSON.stringify(newSitesData)); }
        catch (e) { console.error("Error saving sites:", e); }
    };

    const addOrUpdateSiteProfile = useCallback(async (url, profileData) => {
        let finalProfileDataWithId;
        const newSites = { ...sites };
        const profilesForUrl = newSites[url] ? [...newSites[url]] : [];
        const existingProfileIndex = profileData.id ? profilesForUrl.findIndex(p => p.id === profileData.id) : -1;

        if (profileData.id && existingProfileIndex > -1) { // Güncelleme
            finalProfileDataWithId = { ...profilesForUrl[existingProfileIndex], ...profileData, lastUsed: Date.now() };
            profilesForUrl[existingProfileIndex] = finalProfileDataWithId;
        } else { // Ekleme (yeni ID ile veya ID'si olmayan ama listede bulunamayan)
            finalProfileDataWithId = { ...profileData, id: profileData.id || (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)), lastUsed: Date.now() };
            if (existingProfileIndex === -1 && profileData.id) { // ID var ama listede yoksa da ekle
                 profilesForUrl.push(finalProfileDataWithId);
            } else if (!profileData.id) { // ID yoksa zaten yeni ekleme
                 profilesForUrl.push(finalProfileDataWithId);
            }
        }
        newSites[url] = profilesForUrl;
        setSites(newSites);
        await _saveSitesToStorage(newSites);
        return finalProfileDataWithId;
    }, [sites]);

    const removeSiteProfile = useCallback(async (url, profileId) => {
        if (!sites[url]) return false;
        const updatedProfilesForUrl = sites[url].filter(p => p.id !== profileId);
        const newSites = { ...sites };
        if (updatedProfilesForUrl.length === 0) delete newSites[url];
        else newSites[url] = updatedProfilesForUrl;
        setSites(newSites);
        await _saveSitesToStorage(newSites);
        return true;
    }, [sites]);

    const updateSites = useCallback(async (newSitesData) => { setSites(newSitesData); await _saveSitesToStorage(newSitesData); }, []);
    const updateIsSessionActive = useCallback(async (isActive) => { setIsSessionActiveState(isActive); try { await AsyncStorage.setItem(SESSION_ACTIVE_KEY, String(isActive)); } catch (e) { console.error("Error saving session state:", e); } }, []);
    const updateLastUsedUrl = useCallback(async (url) => { setLastUsedUrlState(url); try { await AsyncStorage.setItem(LAST_URL_KEY, url || ''); } catch (e) { console.error("Error saving last URL:", e); } }, []);
    const clearSessionData = useCallback(async () => { setIsSessionActiveState(false); setLastUsedUrlState(''); try { await AsyncStorage.multiRemove([SESSION_ACTIVE_KEY, LAST_URL_KEY]); } catch (e) { console.error("Error clearing session data:", e); } }, []);
    const clearAllAppData = useCallback(async () => { try { await AsyncStorage.multiRemove([SITES_STORAGE_KEY, SESSION_ACTIVE_KEY, LAST_URL_KEY]); setSites({}); setIsSessionActiveState(false); setLastUsedUrlState(''); } catch (e) { console.error("Error clearing all data:", e); } }, []);

    return {
        sites, addOrUpdateSiteProfile, removeSiteProfile, updateSites,
        isSessionActive, updateIsSessionActive,
        lastUsedUrl, updateLastUsedUrl,
        storageLoading, clearSessionData, clearAllAppData,
    };
}