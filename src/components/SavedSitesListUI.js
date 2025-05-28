// src/components/SavedSitesListUI.js
import React from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, Button as NativeButton } from 'react-native';
import { getPasswordTypeLabelById } from '../utils/templateUtils';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SavedSitesListUI = ({ sites, onGenerateFromSaved, onRemoveProfile, isLoading, onAutofillFromList }) => {
    const getSections = () => {
        if (!sites || typeof sites !== 'object' || Object.keys(sites).length === 0) return [];
        try {
            return Object.entries(sites)
                .filter(([url, profiles]) => Array.isArray(profiles) && profiles.length > 0)
                .map(([url, profiles]) => ({
                    title: url,
                    data: profiles.map(p => ({ ...p, typeLabel: getPasswordTypeLabelById(p.preferredPasswordType) }))
                                 .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
                }))
                .sort((a, b) => {
                    const aLastUsed = Math.max(0, ...a.data.map(p => p.lastUsed || 0));
                    const bLastUsed = Math.max(0, ...b.data.map(p => p.lastUsed || 0));
                    return bLastUsed - aLastUsed;
                });
        } catch (error) { console.error("Error preparing sections for SavedSitesListUI:", error); return []; }
    };
    const sections = getSections();

    const renderProfileItem = ({ item: profile, section }) => (
        <View style={styles.profileItem}>
            <View style={styles.profileInfo}>
                <Text style={styles.profileNameText}>{profile.profileName}</Text>
                {profile.username && <Text style={styles.usernameText}>K.Adı: {profile.username}</Text>}
                <Text style={styles.typeText}>Tip: {profile.typeLabel}</Text>
            </View>
            <View style={styles.profileActions}>
                {/* Oto-doldur butonu (Mobil için farklı işlevsellik) */}
                {/* <NativeButton title="Doldur" onPress={() => onAutofillFromList(section.title, profile)} disabled={isLoading} color="#0dcaf0" />
                <View style={{ width: 8 }} /> */}
                <NativeButton title="Üret" onPress={() => onGenerateFromSaved(section.title, profile.id)} disabled={isLoading} color="#28a745" />
                <View style={{ width: 8 }} />
                <NativeButton title="Sil" onPress={() => onRemoveProfile(section.title, profile.id)} disabled={isLoading} color="#dc3545" />
            </View>
        </View>
    );

    const renderSectionHeader = ({ section: { title, data } }) => (
        <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>{title}</Text>
            <Text style={styles.profileCountText}>({data.length} profil)</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.listTitle}>Kayıtlı Profiller</Text>
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderProfileItem}
                renderSectionHeader={renderSectionHeader}
                ListEmptyComponent={ <View style={styles.emptyListContainer}><Text style={styles.emptyListText}>Henüz kayıtlı profil yok.</Text></View> }
                stickySectionHeadersEnabled={false}
                style={styles.sectionList} // SectionList'e stil ver
                // nestedScrollEnabled={true} // Eğer ana ScrollView içinde kalacaksa bu gerekli
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 5, paddingTop: 10, backgroundColor: '#fff', borderWidth:1, borderColor:'#e0e0e0', borderRadius:8, marginHorizontal:10, marginTop:0, padding:15 },
    listTitle: { fontSize: 17, fontWeight: '600', textAlign: 'center', marginBottom: 15, color: '#333' },
    sectionList: { flex: 1 }, // SectionList'in container içinde esnemesi için
    sectionHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0f0f0', paddingVertical: 8, paddingHorizontal: 10, marginTop: 10, borderRadius:4 },
    sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#444' },
    profileCountText: { fontSize: 13, color: '#555' },
    profileItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    profileInfo: { flex: 1, marginRight: 10 },
    profileNameText: { fontSize: 15, fontWeight: '500', color: '#333' },
    usernameText: { fontSize: 13, color: '#555', marginTop: 2 },
    typeText: { fontSize: 13, color: '#555', marginTop: 2 },
    profileActions: { flexDirection: 'row', alignItems: 'center' },
    emptyListContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 30, minHeight: 100 }, // minHeight eklendi
    emptyListText: { fontSize: 15, color: '#777', textAlign: 'center' }
});
export default SavedSitesListUI;