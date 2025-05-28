// src/navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MasterPasswordScreen from '../screens/MasterPasswordScreen';
import MainAppScreen from '../screens/MainAppScreen';
// LoadingScreen App.js'te yönetildiği için buradan kaldırılabilir veya kalabilir, zararı yok.
// import LoadingScreen from '../screens/LoadingScreen';

const Stack = createNativeStackNavigator();

// handleLogoutApp prop'unu ekle
const AppNavigator = ({ isSessionActive, masterPassword, setMasterPasswordGlobally, handleLogoutApp }) => {
    console.log("AppNavigator: Rendered. Props - isSessionActive:", isSessionActive, "masterPassword:", masterPassword ? '******' : null);

    const showMainApp = isSessionActive && masterPassword && masterPassword.length > 0;
    console.log("AppNavigator: Condition to show MainApp is:", showMainApp);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {showMainApp ? (
                <Stack.Screen name="MainApp">
                    {(props) => {
                        console.log("AppNavigator: Rendering MainAppScreen");
                        return <MainAppScreen
                                    {...props}
                                    masterPasswordFromApp={masterPassword}
                                    handleLogout={handleLogoutApp} // App.js'teki logout fonksiyonunu iletiyoruz
                                />;
                    }}
                </Stack.Screen>
            ) : (
                <Stack.Screen name="MasterPassword">
                    {(props) => {
                        console.log("AppNavigator: Rendering MasterPasswordScreen");
                        return <MasterPasswordScreen {...props} setMasterPasswordGlobally={setMasterPasswordGlobally} />;
                    }}
                </Stack.Screen>
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;