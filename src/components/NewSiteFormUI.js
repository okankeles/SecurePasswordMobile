// src/components/NewSiteFormUI.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { PASSWORD_TYPE_OPTIONS, getPasswordTypeLabelById } from '../utils/templateUtils';

const NewSiteFormUI = ({ onGenerate, isLoading, currentUrl, setCurrentUrl }) => {
    const [profileName, setProfileName] = useState('');
    const [username, setUsername] = useState('');
    const [selectedPasswordType, setSelectedPasswordType] = useState(''); // Başlangıçta boş

    const handleSubmit = () => {
        if (!currentUrl || currentUrl.trim() === "") {
            Alert.alert("Uyarı", "URL/Site Adı girilmelidir.");
            onGenerate(null, null, null, null, true); return;
        }
        if (!selectedPasswordType) {
            Alert.alert("Uyarı", "Lütfen bir parola tipi seçin."); return;
        }
        const typeLabelFull = getPasswordTypeLabelById(selectedPasswordType) || selectedPasswordType;
        const typeLabelShort = typeLabelFull.split(' (')[0];
        const defaultBaseName = username.trim() || currentUrl.split('.')[0] || "Profil";
        const finalProfileName = profileName.trim() || `${defaultBaseName} (${typeLabelShort})`;
        onGenerate(currentUrl.trim(), finalProfileName, username.trim(), selectedPasswordType, true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Yeni Site Profili Ekle</Text>
            <Text style={styles.label}>URL / Site Adı:</Text>
            <TextInput style={styles.input} value={currentUrl} placeholder="example.com" onChangeText={setCurrentUrl} editable={!isLoading} autoCapitalize="none" keyboardType="url" />
            <Text style={styles.label}>Profil Etiketi (Opsiyonel):</Text>
            <TextInput style={styles.input} value={profileName} placeholder="Örn: Kişisel Ev" onChangeText={setProfileName} editable={!isLoading} />
            <Text style={styles.label}>Kullanıcı Adı (Opsiyonel):</Text>
            <TextInput style={styles.input} value={username} placeholder="kullanici.adi" onChangeText={setUsername} editable={!isLoading} autoCapitalize="none" />
            <Text style={styles.label}>Parola Tipi:</Text>
            <View style={styles.pickerContainer}>
                <Picker selectedValue={selectedPasswordType} style={Platform.OS === 'ios' ? styles.pickerIOS : styles.pickerAndroid} itemStyle={Platform.OS === 'ios' ? styles.pickerItemIOS : {}} onValueChange={(itemValue) => setSelectedPasswordType(itemValue)} enabled={!isLoading} prompt="Parola Tipi Seçin">
                    <Picker.Item label="-- Parola Tipi Seçin --" value="" color="#999" />
                    {PASSWORD_TYPE_OPTIONS.map(opt => ( <Picker.Item key={opt.id} label={opt.label} value={opt.id} /> ))}
                </Picker>
            </View>
            <Button title="Üret ve Profili Kaydet" onPress={handleSubmit} disabled={isLoading || !currentUrl || currentUrl.trim() === "" || !selectedPasswordType} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { paddingHorizontal: 10, paddingTop: 15, paddingBottom: 10, backgroundColor: '#fff', borderWidth:1, borderColor:'#e0e0e0', borderRadius:8, marginVertical:10, marginHorizontal:5 },
    sectionTitle: { fontSize: 17, fontWeight: '600', textAlign: 'center', marginBottom: 15, color: '#333' },
    label: { fontSize: 15, marginBottom: 5, color: '#333' },
    input: { borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 12, borderRadius: 5, backgroundColor: 'white', fontSize: 15 },
    pickerContainer: { borderWidth: 1, borderColor: 'gray', borderRadius: 5, marginBottom: 15, backgroundColor: 'white' },
    pickerAndroid: { height: 50, width: '100%' },
    pickerIOS: { height: 180, width: '100%' },
    pickerItemIOS: { height: 180 },
});
export default NewSiteFormUI;