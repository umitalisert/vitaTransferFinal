import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useRef } from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Color from '../../../components/Color';
import VText from '../../../components/VText';
import { useDispatch } from 'react-redux';
import VInput from '../../../components/VInput';
import VButton from '../../../components/VButton';
import VKeyboardView from '../../../components/VKeyboardView';
import { setLoading, setHasError, setErrorMessage } from '../../../redux/slices/mainSlice';
import AuthPassword from '../../../services/vita/AuthPassword';
import useCultureStore from '../../../zustand/CultureStore';
import * as Device from 'expo-device';
import useAuthStore from '../../../zustand/AuthStore';

const Index = ({ navigation }) => {
    const scrollRef = useRef(null);
    const dispatch = useDispatch();
    const [buttonActive, setButtonActive] = useState(false);
    const cultureStore = useCultureStore((state) => state);
    const authStore = useAuthStore((state) => state);
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [countryCode, setCountryCode] = useState('+90');
    const [phoneNumber, setPhoneNumber] = useState('');
    useEffect(() => {
        dispatch(setLoading(false));
    }, [])

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            scrollRef.current?.scrollToEnd({ animated: true });
        });

        return () => {
            showSubscription.remove();
        };
    }, []);

    useEffect(() => {
        if (phoneNumber.length > 0 && password.length > 0) {
            setButtonActive(true)
        }
        else {
            setButtonActive(false);
        }
    }, [userName, password])

    function otp() {
        // dispatch(setLoading(true));
        let request = {
            phoneNumber: phoneNumber,
            dialCode: countryCode.replace('+', ''),
            password: password,
            brandName: Device.brand,
            modelName: Device.modelName,
            osVersion: Device.osVersion,
            osInternalBuildId: Device.osInternalBuildId,
            deviceName: Device.deviceName
        };
        AuthPassword.Token(request, cultureStore.culture).then(response => {
            if (response.status == 200) {
                if (response.data.responseCode == 200) {
                    authStore.setLoginUser(response.data.data)
                    navigation.navigate('Contract', { token: response.data.data.token })
                    dispatch(setLoading(false));
                }
                else {
                    dispatch(setHasError(true));
                    dispatch(setErrorMessage(response.data.responseMessage));
                    dispatch(setLoading(false));
                }
            }
            else {
                dispatch(setHasError(true));
                dispatch(setErrorMessage(cultureStore.culture == 'tr' ? 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.' : cultureStore.culture == 'en' ? 'An unexpected error occured. Please try again later.' : cultureStore.culture == 'de' ? 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' : 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.'));
                dispatch(setLoading(false));
            }
        }).catch((err) => {
        })
    }
    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container}>
                <VKeyboardView>
                    <ScrollView   ref={scrollRef}   keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingBottom:100}}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => { navigation.goBack() }}>
                                <MaterialCommunityIcons name='arrow-left' size={34} color={Color.black}></MaterialCommunityIcons>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.body}>
                            <VText bold style={styles.title}>{
                                cultureStore.culture == 'tr' ? 'Kullanıcı Adı ve Şifre Girin' :
                                    cultureStore.culture == 'en' ? 'Enter your phone number' :
                                        cultureStore.culture == 'de' ? 'Trage deine Telefonnummer ein' : 'Telefon numaranızı girin'}
                            </VText>
                            <VText medium style={styles.text}>{
                                cultureStore.culture == 'tr' ? 'Kullanıcı adı ve şifrenizle beraber giriş yapın . Şifrenizi profil sekmesinin kişisel bilgiler bölümünden değiştirebilirsiniz.' :
                                    cultureStore.culture == 'en' ? 'We will send an SMS with a 6-digit code to your phone number' :
                                        cultureStore.culture == 'de' ? 'Wir senden eine SMS mit einem 6-stelligen Code an Ihre Telefonnummer' : 'Telefon numaranıza 6 haneli kod içeren bir SMS göndereceğiz'}
                            </VText>
                            <View style={{ marginTop: 20 }}>
                                <VText semibold greyText style={{ fontSize: 15, marginLeft: 5, marginBottom: 10 }}>{
                                    cultureStore.culture == 'tr' ? 'Kullanıcı adı' :
                                        cultureStore.culture == 'en' ? 'Username' :
                                            cultureStore.culture == 'de' ? 'Benutzername' : 'Kullanıcı adı'}
                                </VText>
                                <View style={styles.formContainer}>
                                    <View style={styles.countryCodeContainer}>
                                        <VInput style={{}} placeholder='+90' maxLength={4} keyboardType='number-pad' value={countryCode} onChangeText={(text) => { setCountryCode('+' + text.replace('+', '')); }} />
                                    </View>
                                    <View style={styles.phoneNumberContainer}>
                                        <VInput placeholder='5301112233' maxLength={11} keyboardType='number-pad' value={phoneNumber} onChangeText={(text) => { setPhoneNumber(text) }} />
                                    </View>
                                </View>
                                {/* <VInput placeholder='Kullanıcı Adınızı Girin' maxLength={10} keyboardType='number-pad' value={userName} onChangeText={(text) => { setUserName(text) }}></VInput> */}
                            </View>

                            <View style={{ marginTop: 10 }}>
                                <VText semibold greyText style={{ fontSize: 15, marginBottom: 10, marginLeft: 5 }}>{
                                    cultureStore.culture == 'tr' ? 'Şifre' :
                                        cultureStore.culture == 'en' ? 'Password' :
                                            cultureStore.culture == 'de' ? 'Passwort' : 'Şifrenizi Girin'}</VText>
                                <VInput placeholder={
                                    cultureStore.culture == 'tr' ? 'Şifrenizi Girin' :
                                        cultureStore.culture == 'en' ? 'Enter Your Password' :
                                            cultureStore.culture == 'de' ? 'Geben Sie Ihr Passwort ein' : 'Şifrenizi Girin'}
                                    maxLength={10}
                                    keyboardType='number-pad'
                                    value={password}
                                    onChangeText={(text) => { setPassword(text) }}>

                                </VInput>
                            </View>
                        </View>
                    </ScrollView>
                    <View style={styles.bottomContainer}>
                        {buttonActive && (
                            <VButton primary onPress={() => { otp() }}>
                                <VText white bold style={{ fontSize: 17 }}>{cultureStore.culture == 'tr' ? 'Devam Et' : cultureStore.culture == 'en' ? 'Continue' : cultureStore.culture == 'de' ? 'Fortsetzen' : 'Devam Et'}</VText>
                            </VButton>
                        )}
                        {!buttonActive && (
                            <VButton secondary>
                                <VText white bold style={{ fontSize: 17 }}>{cultureStore.culture == 'tr' ? 'Devam Et' : cultureStore.culture == 'en' ? 'Continue' : cultureStore.culture == 'de' ? 'Fortsetzen' : 'Devam Et'}</VText>
                            </VButton>
                        )}
                    </View>
                </VKeyboardView>

            </SafeAreaView>
        </View >
    )
}

export default Index

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.base
    },
    header: {
        paddingHorizontal: 25,
        paddingVertical: 30,
        flexDirection: 'row'
    },
    title: { fontSize: 22 },
    text: { fontSize: 14, color: Color.greyText, marginTop: 10 },
    body: {
        paddingHorizontal: 30
    },
    cultureContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Color.purple,
        backgroundColor: Color.greyLight,
        borderRadius: 10,
        marginBottom: 10
    },
    formContainer: {
        marginTop: 5,
        flexDirection: 'row'
    },
    countryCodeContainer: {
        flex: 1,
        marginRight: 8,

    },
    phoneNumberContainer: {
        flex: 3
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        paddingHorizontal: 25
    },
})