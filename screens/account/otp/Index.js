import { Image, StyleSheet, TouchableOpacity, View, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Color from '../../../components/Color';
import VText from '../../../components/VText';
import { useDispatch, useSelector } from 'react-redux';
import VButton from '../../../components/VButton';
import { getAuth, signInWithCustomToken } from "firebase/auth";
import VKeyboardView from '../../../components/VKeyboardView';
import { setErrorMessage, setHasError, setLoading } from '../../../redux/slices/mainSlice';
import Auth from '../../../services/vita/Auth';
import useMainStore from '../../../zustand/MainStore';
import useCultureStore from '../../../zustand/CultureStore';
import * as Device from 'expo-device';
import useAuthStore from '../../../zustand/AuthStore';
const Index = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const mainStore = useMainStore((state) => state);
    const cultureStore = useCultureStore((state) => state);
    const authStore = useAuthStore((state) => state);
    const ref1 = useRef();
    const ref2 = useRef();
    const ref3 = useRef();
    const ref4 = useRef();
    const ref5 = useRef();
    const ref6 = useRef();
    const [ref1Value, setRef1Value] = useState([styles.input, styles.secondary]);
    const [ref2Value, setRef2Value] = useState([styles.input, styles.secondary]);
    const [ref3Value, setRef3Value] = useState([styles.input, styles.secondary]);
    const [ref4Value, setRef4Value] = useState([styles.input, styles.secondary]);
    const [ref5Value, setRef5Value] = useState([styles.input, styles.secondary]);
    const [ref6Value, setRef6Value] = useState([styles.input, styles.secondary]);
    const [ref1Style, setRef1Style] = useState([styles.input, styles.secondary]);
    const [ref2Style, setRef2Style] = useState([styles.input, styles.secondary]);
    const [ref3Style, setRef3Style] = useState([styles.input, styles.secondary]);
    const [ref4Style, setRef4Style] = useState([styles.input, styles.secondary]);
    const [ref5Style, setRef5Style] = useState([styles.input, styles.secondary]);
    const [ref6Style, setRef6Style] = useState([styles.input, styles.secondary]);

    useEffect(() => {
        dispatch(setLoading(false));
    }, [])

    useEffect(() => {
        if (ref1Value.length == 1 && ref2Value.length == 1 && ref3Value.length == 1 && ref4Value.length == 1 && ref5Value.length == 1 && ref6Value.length == 1) {
            check();
        }
    }, [ref1Value, ref2Value, ref3Value, ref4Value, ref5Value, ref6Value])


    function check() {
        let request = {
            dialCode: route.params.data.countryCode.replace('+', ''),
            phoneNumber: route.params.data.phoneNumber,
            otp: ref1Value + ref2Value + ref3Value + ref4Value + ref5Value + ref6Value,
            brandName: Device.brand,
            modelName: Device.modelName,
            osVersion: Device.osVersion,
            osInternalBuildId: Device.osInternalBuildId,
            deviceName: Device.deviceName
        };
        // useAuthStore.login(request , cultureStore.culture)
        Auth.Token(request, cultureStore.culture).then(response => {
            if (response.status == 200) {
                if (response.data.responseCode == 200) {
                    authStore.setLoginUser(response.data.data)
                    navigation.navigate('Contract', { token: response.data.data.token })

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
                        <VText bold style={styles.title}>{cultureStore.culture == 'tr' ? 'Doğrulama Kodunu Girin' : cultureStore.culture == 'en' ? 'Enter verification code' : cultureStore.culture == 'de' ? 'Bestätigungscode eingeben' : 'Doğrulama Kodunu Girin'}</VText>
                        <VText medium style={styles.text}>{cultureStore.culture == 'tr' ? route.params.data.countryCode + route.params.data.phoneNumber + ' numaralı telefona gönderilen doğrulama kodunu girin.' : cultureStore.culture == 'en' ? 'Please enter the verification code sent to ' + route.params.data.countryCode + route.params.data.phoneNumber : cultureStore.culture == 'de' ? 'Bitte geben Sie den Bestätigungscode ein, der an ' + route.params.data.countryCode + route.params.data.phoneNumber + ' gesendet wurde' : route.params.data.countryCode + route.params.data.phoneNumber + ' numaralı telefona gönderilen doğrulama kodunu girin.'}</VText>
                        <View style={styles.formContainer}>
                            <TextInput ref={ref1} onKeyPress={(keyPress) => {
                                if (keyPress.nativeEvent.key == 'Backspace')
                                    ref1.current.clear()
                            }} onChangeText={(text) => {
                                setRef1Value(text);
                                if (text.length == 1) {
                                    ref2.current.focus()
                                }
                                else {
                                    ref1.current.focus();
                                }
                            }} keyboardType='phone-pad' maxLength={1}
                                onBlur={() => setRef1Style([styles.input, styles.secondary])} onFocus={() => setRef1Style([styles.input, styles.primary])} style={ref1Style}
                            ></TextInput>

                            <TextInput ref={ref2} onKeyPress={(keyPress) => {
                                if (keyPress.nativeEvent.key == 'Backspace') {
                                    ref2.current.clear();
                                    ref1.current.focus();
                                }
                            }} onChangeText={(text) => {
                                setRef2Value(text);
                                if (text.length == 1) {
                                    ref3.current.focus();
                                }
                                else {
                                    ref1.current.focus();
                                }
                            }} keyboardType='phone-pad' maxLength={1}
                                onBlur={() => setRef2Style([styles.input, styles.secondary])} onFocus={() => setRef2Style([styles.input, styles.primary])} style={ref2Style}
                            ></TextInput>

                            <TextInput ref={ref3} onKeyPress={(keyPress) => {
                                if (keyPress.nativeEvent.key == 'Backspace') {
                                    ref3.current.clear();
                                    ref2.current.focus();
                                }
                            }} onChangeText={(text) => {
                                setRef3Value(text);
                                if (text.length == 1) {
                                    ref4.current.focus()
                                }
                                else {
                                    ref2.current.focus();
                                }
                            }} keyboardType='phone-pad' maxLength={1}
                                onBlur={() => setRef3Style([styles.input, styles.secondary])} onFocus={() => setRef3Style([styles.input, styles.primary])} style={ref3Style}
                            ></TextInput>

                            <TextInput ref={ref4} onKeyPress={(keyPress) => {
                                if (keyPress.nativeEvent.key == 'Backspace') {
                                    ref4.current.clear();
                                    ref3.current.focus();
                                }
                            }} onChangeText={(text) => {
                                setRef4Value(text);
                                if (text.length == 1) {
                                    ref5.current.focus()
                                }
                                else {
                                    ref3.current.focus();
                                }
                            }} keyboardType='phone-pad' maxLength={1}
                                onBlur={() => setRef4Style([styles.input, styles.secondary])} onFocus={() => setRef4Style([styles.input, styles.primary])} style={ref4Style}
                            ></TextInput>

                            <TextInput ref={ref5} onKeyPress={(keyPress) => {
                                if (keyPress.nativeEvent.key == 'Backspace') {
                                    ref5.current.clear();
                                    ref4.current.focus();
                                }
                            }} onChangeText={(text) => {
                                setRef5Value(text);
                                if (text.length == 1) {
                                    ref6.current.focus()
                                }
                                else {
                                    ref4.current.focus();
                                }
                            }} keyboardType='phone-pad' maxLength={1}
                                onBlur={() => setRef5Style([styles.input, styles.secondary])} onFocus={() => setRef5Style([styles.input, styles.primary])} style={ref5Style}
                            ></TextInput>

                            <TextInput ref={ref6} onKeyPress={(keyPress) => {
                                if (keyPress.nativeEvent.key == 'Backspace') {
                                    ref6.current.clear();
                                    ref5.current.focus();
                                }
                            }} onChangeText={(text) => {
                                setRef6Value(text);
                                if (text.length == 1) {
                                }
                                else {
                                    ref5.current.focus();
                                }
                            }} keyboardType='phone-pad' maxLength={1}
                                onBlur={() => setRef6Style([styles.input, styles.secondary])} onFocus={() => setRef6Style([styles.input, styles.primary])} style={ref6Style}
                            ></TextInput>

                        </View>
                    </View>
                    <View style={styles.bottomContainer}>
                        <VButton secondary onPress={() => { check() }}>
                            <VText white bold style={{ fontSize: 17 }}>{cultureStore.culture == 'tr' ? 'Devam Et' : cultureStore.culture == 'en' ? 'Continue' : cultureStore.culture == 'de' ? 'Fortsetzen' : 'Devam Et'}</VText>
                        </VButton>
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
    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 22,
        paddingHorizontal: 10,
        color: Color.black,
        fontSize: 16,
        flex: 1,
        marginRight: 3,
        marginLeft: 3,
        borderColor: Color.greyBorder,
        lineHeight: 22,
        fontFamily: 'Nunito_500Medium',
        fontWeight: '500'
    },
    primary: {
        borderColor: Color.primary,
    },
    secondary: {
        borderColor: Color.greyBorder,
    },
})