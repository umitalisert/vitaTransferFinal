import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Color from '../../../components/Color';
import VText from '../../../components/VText';
import { useDispatch } from 'react-redux';
import VInput from '../../../components/VInput';
import VButton from '../../../components/VButton';
import VKeyboardView from '../../../components/VKeyboardView';
import { setLoading, setHasError, setErrorMessage } from '../../../redux/slices/mainSlice';
import Auth from '../../../services/vita/Auth';
import useCultureStore from '../../../zustand/CultureStore';
import useAuthStore from '../../../zustand/AuthStore'
const Index = ({ navigation }) => {
    const dispatch = useDispatch();
    const [buttonActive, setButtonActive] = useState(false);
    const cultureStore = useCultureStore((state) => state);
    const [countryCode, setCountryCode] = useState('+90');
    const [phoneNumber, setPhoneNumber] = useState('');
    useEffect(() => {
        dispatch(setLoading(false));
    }, [])

    useEffect(() => {
        if (phoneNumber.length > 0 && countryCode.length > 0) {
            setButtonActive(true)
        }
        else {
            setButtonActive(false);
        }
    }, [phoneNumber, countryCode])

    function otp() {
        dispatch(setLoading(true));
        let request = {
            dialCode: countryCode.replace('+', ''),
            phoneNumber: phoneNumber
        };
        Auth.Otp(request, cultureStore.culture).then(response => {
            if (response.status == 200) {
                if (response.data.responseCode == 200) {
                    navigation.navigate('Otp', { data: { countryCode: countryCode, phoneNumber: phoneNumber } });
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
                dispatch(setErrorMessage(
                    cultureStore.culture == 'tr' ? 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.' :
                        cultureStore.culture == 'en' ? 'An unexpected error occured. Please try again later.' :
                            cultureStore.culture == 'de' ? 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' : 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.'));
                dispatch(setLoading(false));
            }
        });
    }
    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container}>
                <VKeyboardView>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => { navigation.goBack() }}>
                            <MaterialCommunityIcons name='arrow-left' size={34} color={Color.black}></MaterialCommunityIcons>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.body}>
                        <VText bold style={styles.title}>{
                            cultureStore.culture == 'tr' ? 'Telefon Numaranızı Girin' :
                                cultureStore.culture == 'en' ? 'Enter your phone number' :
                                    cultureStore.culture == 'de' ? 'Trage deine Telefonnummer ein' : 'Telefon numaranızı girin'}
                        </VText>
                        <VText medium style={styles.text}>{
                            cultureStore.culture == 'tr' ? 'Telefon numaranıza 6 haneli kod içeren bir SMS göndereceğiz' :
                                cultureStore.culture == 'en' ? 'We will send an SMS with a 6-digit code to your phone number' :
                                    cultureStore.culture == 'de' ? 'Wir senden eine SMS mit einem 6-stelligen Code an Ihre Telefonnummer' : 'Telefon numaranıza 6 haneli kod içeren bir SMS göndereceğiz'}
                        </VText>
                        <View style={styles.formContainer}>
                            <View style={styles.countryCodeContainer}>
                                <VInput placeholder='+90' maxLength={4} keyboardType='number-pad' value={countryCode} onChangeText={(text) => { setCountryCode('+' + text.replace('+', '')); }} />
                            </View>
                            <View style={styles.phoneNumberContainer}>
                                <VInput placeholder='5301112233' maxLength={11} keyboardType='number-pad' value={phoneNumber} onChangeText={(text) => { setPhoneNumber(text) }} />
                            </View>
                        </View>
                    </View>
                    <View style={styles.bottomContainer}>
                        {buttonActive && (
                            <VButton primary onPress={() => { otp() }}>
                                <VText white bold style={{ fontSize: 17 }}>{
                                    cultureStore.culture == 'tr' ? 'Devam Et' :
                                        cultureStore.culture == 'en' ? 'Continue' :
                                            cultureStore.culture == 'de' ? 'Fortsetzen' : 'Devam Et'}
                                </VText>
                            </VButton>
                        )}
                        {!buttonActive && (
                            <VButton secondary>
                                <VText white bold style={{ fontSize: 17 }}>{
                                    cultureStore.culture == 'tr' ? 'Devam Et' :
                                        cultureStore.culture == 'en' ? 'Continue' :
                                            cultureStore.culture == 'de' ? 'Fortsetzen' : 'Devam Et'}
                                </VText>
                            </VButton>
                        )}
                    </View>
                </VKeyboardView>

            </SafeAreaView>
        </View>
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
        marginTop: 30,
        flexDirection: 'row'
    },
    countryCodeContainer: {
        flex: 1,
        marginRight: 8
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