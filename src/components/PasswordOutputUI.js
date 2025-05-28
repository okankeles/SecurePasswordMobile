// src/components/PasswordOutputUI.js
import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const PasswordOutputUI = ({ generatedPassword, onCopy, copyMessage }) => {
    if (!generatedPassword) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Üretilen Parola:</Text>
            <View style={styles.displayRow}>
                <TextInput style={styles.passwordInput} value={generatedPassword} editable={false} />
                <Button title="Kopyala" onPress={onCopy} />
            </View>
            {copyMessage ? <Text style={styles.copyMessage}>{copyMessage}</Text> : null}
        </View>
    );
};
const styles = StyleSheet.create({
    container: { padding: 10, marginTop: 15 },
    label: { fontSize: 16, marginBottom: 5 },
    displayRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    passwordInput: { flex: 1, borderWidth: 1, borderColor: 'lightgray', padding: 10, marginRight: 10, borderRadius: 5, color: '#333' },
    copyMessage: { color: 'green', fontSize: 12, textAlign: 'center' },
});
export default PasswordOutputUI;