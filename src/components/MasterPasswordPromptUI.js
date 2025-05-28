// src/components/MasterPasswordPromptUI.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform, ActivityIndicator } from 'react-native';

const MasterPasswordPromptUI = ({ onSetMasterPassword, initialMessage, existingError }) => {
    const [tempMasterPassword, setTempMasterPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setError(existingError || '');
    }, [existingError]);

    const handleSubmit = () => {
        if (!tempMasterPassword) {
            setError('Lütfen Ana Parolanızı girin.');
            return;
        }
        setIsLoading(true);
        setError('');
        // Simüle edilmiş bir bekleme veya doğrudan çağırma
        // await new Promise(r => setTimeout(r, 300)); // Test için
        onSetMasterPassword(tempMasterPassword);
        // setIsLoading(false); // Parent component unmount edebilir
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{initialMessage || "Ana Parolanızı Girin"}</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TextInput
                style={styles.input}
                placeholder="Ana Parola"
                secureTextEntry
                value={tempMasterPassword}
                onChangeText={(text) => {
                    setTempMasterPassword(text);
                    if (error) setError('');
                }}
                onSubmitEditing={!isLoading ? handleSubmit : undefined}
                autoFocus
                editable={!isLoading}
            />
            {isLoading ? (
                <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            ) : (
                <Button
                    title={initialMessage && initialMessage.includes("Doğrula") ? "Doğrula ve Devam Et" : "Ana Parolayı Ayarla"}
                    onPress={handleSubmit}
                    disabled={!tempMasterPassword || isLoading}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, justifyContent: 'center', flex: 1, backgroundColor: '#f5f5f5' },
    title: { fontSize: 20, fontWeight: '600', marginBottom: 15, textAlign: 'center', color: '#333' },
    input: {
        borderWidth: 1, borderColor: 'gray', paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 12 : 10,
        marginBottom: 20, borderRadius: 5, fontSize: 16, backgroundColor: 'white',
    },
    errorText: { color: 'red', marginBottom: 12, textAlign: 'center', fontSize: 14 },
    loader: { marginTop: 10 },
});

export default MasterPasswordPromptUI;