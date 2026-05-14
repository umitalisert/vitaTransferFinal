import { Modal, StyleSheet, Text, Pressable, View } from 'react-native';

import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useDispatch, useSelector } from 'react-redux';
import LottieView from 'lottie-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LoginPassword from './loginPassword/Index'
import AppIntro from './appintro/Index'
import CultureSelection from './appintro/CultureSelection';
import Login from './login/Index';
import Otp from './otp/Index';
import Contract from './contract/Index';
import { setErrorMessage, setHasError } from '../../redux/slices/mainSlice';
import VText from '../../components/VText';
import VButton from '../../components/VButton';
import Color from '../../components/Color';
import useCultureStore from '../../zustand/CultureStore';

const Stack = createNativeStackNavigator();

const Index = () => {
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.main.loading);
    const errorMessage = useSelector((state) => state.main.errorMessage);
    const hasError = useSelector((state) => state.main.hasError);
    const cultureStore = useCultureStore((state) => state);

    return (
        <>
            {loading == true && (
                <LottieView
                    autoPlay
                    style={{
                        position: 'absolute',
                        zIndex: 3,
                        elevation: 5,
                        height: 150,
                        alignSelf: 'center',
                        top: '50%',
                        marginTop: -75,
                        aspectRatio: 1
                    }}
                    source={require('../../assets/loading.json')}
                />
            )}

            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="AppIntro" component={AppIntro} options={{ headerShown: false }} />
                    <Stack.Screen name="CultureSelection" component={CultureSelection} options={{ headerShown: false }} />
                    <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                    <Stack.Screen name="LoginPassword" component={LoginPassword} options={{ headerShown: false }} />
                    <Stack.Screen name="Otp" component={Otp} options={{ headerShown: false }} />
                    <Stack.Screen name="Contract" component={Contract} options={{ headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>

            <Modal
                animationType="slide"
                transparent={true}
                visible={hasError}
                onRequestClose={() => { dispatch(setHasError(false)); dispatch(setErrorMessage('')) }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={40} color={Color.red} />
                        <VText medium style={{ marginTop: 20 }}>{errorMessage}</VText>
                        <VButton secondary style={{ paddingHorizontal: 40, paddingVertical: 10, marginTop: 25 }}
                            onPress={() => { dispatch(setHasError(false)); dispatch(setErrorMessage('')) }}>
                            <VText white bold>{cultureStore.culture == 'tr' ? 'Tamam' : cultureStore.culture == 'en' ? 'OK' : cultureStore.culture == 'de' ? 'OK' : 'Tamam'}</VText>
                        </VButton>
                    </View>
                </View>
            </Modal>
        </>
    )
}

export default Index


const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        elevation: 2,
    },

});
