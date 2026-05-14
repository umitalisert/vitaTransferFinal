import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, Button, SafeAreaView, Alert, } from 'react-native';
import Color from '../../../components/Color';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Checkbox from 'expo-checkbox';
import VButton from '../../../components/VButton';
import VText from '../../../components/VText';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import useMainStore from '../../../zustand/MainStore';
import { useDispatch } from 'react-redux';
import Auth from '../../../services/vita/Auth';
import useCultureStore from '../../../zustand/CultureStore';
import { setErrorMessage, setHasError, setLoading } from '../../../redux/slices/mainSlice';
import useAuthStore from '../../../zustand/AuthStore';
import moment from "moment";
export const Index = ({ navigation, route }) => {

    const [isUserChecked, setUserChecked] = useState(false);
    const [isKvkkChecked, setKvkkChecked] = useState(false);
    const [buttonActive, setButtonActive] = useState(false);
    const mainStore = useMainStore((state) => state);
    const cultureStore = useCultureStore((state) => state);
    const authStore = useAuthStore((state) => state);

    const dispatch = useDispatch();
    function send() {
        // const token = route.params.token;
        Auth.UpdateExpoToken_Async({ token: mainStore.pushToken }).then(response => {
        })
        authStore.setIsAuthenticated(true)
        // const auth = getAuth();
        // signInWithCustomToken(auth, token)
        //     .then((userCredential) => {
        //         dispatch(setLoading(false));
        //         Auth.UpdateExpoToken_Async({ token: mainStore.pushToken });
        //     })
        //     .catch((error) => {
        //         dispatch(setHasError(true));
        //         dispatch(setErrorMessage(cultureStore.culture == 'tr' ? 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.' : cultureStore.culture == 'en' ? 'An unexpected error occured. Please try again later.' : cultureStore.culture == 'de' ? 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' : 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.'));
        //         dispatch(setLoading(false));
        //     });
    }

    const culture_en = {

        vitaCompany: 'vita RnD Technology Inc. (“vita RnD")',
        serveVita: 'The "vita Drive-Transfer" application, which features the X product, provides job tracking and planning services to drivers and vehicle owners.',
        text3: 'In relation to the product we offer as vita RnD,',
        usersPage: 'Terms of Service',
        text4: 'I acknowledge, declare, and commit that I accept the "User Agreement" related to the product offered by vita RnD.',
        text5: 'I acknowledge and declare that I have read the "vita RnD Privacy and Personal Data Protection Policy" regarding the processing of my personal data, and I understand the information regarding the processing and transfer of my personal data.',
        goOn: 'Continue',
    }
    const culture_tr = {
        vitaCompany: 'vita RnD Teknoloji Anonim Şirketi (“vita RnD")',
        serveVita: ', ürünü olan "vita Drive- Transfer” uygulaması ile sürücü ve araç sahiplerine iş takibi ve planlama hizmeti sunmaktadır.',
        text3: ' vita RnD olarak sunduğumuz ürünle ilişkili olarak',
        usersPage: 'Kullanıcı Sözleşmesi”ne',
        text4: 'vita RnD olarak sunduğumuz ürünle ilişkili olarak "Kullanıcı Sözleşmesi”ni kabul ettiğimi kabul, beyan ve taahhüt ederim.',
        text5: 'Kişisel verilerimin işlenmesine ilişkin, "vita RnD Gizlilik ve Kişisel Verilerin Korunması Politikası"nı okuduğumu, kişisel verilerimin işlenmesine ve aktarılmasına ilişkin bilgilendirmeyi anladığımı kabul ve beyan ederim.',
        goOn: 'Devam Et',
    }
    const culture_de = {
        vitaCompany: 'vita RnD Technologie AG (“vita RnD")',
        serveVita: 'Die Anwendung "vita Drive-Transfer", die das Produkt X enthält, bietet Fahrern und Fahrzeughaltern Dienstleistungen für die Arbeitsverfolgung und Planung an.',
        text3: 'Das Produkt, das wir als vita RnD anbieten,',
        usersPage: 'Nutzungsbedingungen',
        text4: 'Ich erkenne an, erkläre und verpflichte mich, dass ich die "Nutzungsbedingungen" im Zusammenhang mit dem von vita RnD angebotenen Produkt akzeptiere',
        text5: 'Ich erkenne an und erkläre, dass ich die "vita RnD-Datenschutz- und Datenschutzrichtlinie" in Bezug auf die Verarbeitung meiner persönlichen Daten gelesen habe und die Informationen über die Verarbeitung und Übertragung meiner persönlichen Daten verstehe.',
        goOn: 'Fortsetzen',
    }
    const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);
    moment.locale(cultureStore.culture);

    useEffect(() => {
        if (isKvkkChecked && isUserChecked) {
            setButtonActive(true)
        }
        else {
            setButtonActive(false)
        }
    }, [isKvkkChecked, isUserChecked])

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => { navigation.goBack() }}>
                        <MaterialCommunityIcons name='arrow-left' size={34} color={Color.black}></MaterialCommunityIcons>
                    </TouchableOpacity>
                </View>
                <View style={{ paddingHorizontal: 25, paddingTop: 10 }}>
                    <VText style={{ fontSize: 16 }}>
                        <VText style={{ fontWeight: '600' }}>{cultureResource.vitaCompany}</VText>{cultureResource.serveVita}</VText>
                    {cultureStore.culture == 'tr' && (
                        <VText style={{ fontSize: 16, marginTop: 20 }}>{cultureResource.text3}
                            <VText style={{ fontWeight: '600', fontSize: 16 }}>{cultureResource.usersPage}</VText>
                            <TouchableOpacity style={{ justifyContent: 'flex-end', marginBottom: -3 }}>
                                <VText style={{ fontSize: 16, fontWeight: '600', color: 'purple' }}> buradan</VText>
                            </TouchableOpacity>
                            <VText style={{ fontWeight: '600' }}>ve 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca hazırlamış olduğumuz "Gizlilik ve Kişisel Verilerin Korunması Politikası"</VText>
                            ile ilgili kişilere yapmış olduğumuz bildirime
                            <TouchableOpacity style={{ justifyContent: 'flex-end', marginBottom: -3 }}>
                                <VText style={{ fontSize: 16, fontWeight: '600', color: 'purple' }}> buradan</VText>
                            </TouchableOpacity>
                            <VText style={{ fontWeight: '600' }}>ulaşabilirsiniz.</VText>
                        </VText>
                    )}
                    {cultureStore.culture == 'en' && (
                        <VText style={{ fontSize: 16, marginTop: 20 }}>
                            {cultureResource.text3}
                            <VText style={{ fontWeight: '600', fontSize: 16 }}>{cultureResource.usersPage}</VText>
                            <TouchableOpacity style={{ justifyContent: 'flex-end', marginBottom: -3 }}>
                                <VText style={{ fontSize: 16, fontWeight: '600', color: 'purple' }}> here</VText>
                            </TouchableOpacity>
                            <VText style={{ fontWeight: '600' }}>
                                and our "Privacy and Personal Data Protection Policy" prepared in accordance with the Law No. 6698 on the Protection of Personal Data (KVKK)
                            </VText>
                            with our notification to individuals can be accessed
                            <TouchableOpacity style={{ justifyContent: 'flex-end', marginBottom: -3 }}>
                                <VText style={{ fontSize: 16, fontWeight: '600', color: 'purple' }}> here</VText>
                            </TouchableOpacity>
                            <VText style={{ fontWeight: '600' }}>here.</VText>
                        </VText>
                    )}
                    {cultureStore.culture == 'de' && (
                        <VText style={{ fontSize: 16, marginTop: 20 }}>
                            {cultureResource.text3}
                            <VText style={{ fontWeight: '600', fontSize: 16 }}>{cultureResource.usersPage}</VText>
                            <TouchableOpacity style={{ justifyContent: 'flex-end', marginBottom: -3 }}>
                                <VText style={{ fontSize: 16, fontWeight: '600', color: 'purple' }}> hier</VText>
                            </TouchableOpacity>
                            <VText style={{ fontWeight: '600' }}>
                                und unsere "Datenschutz- und Datenschutzrichtlinie", die gemäß dem Gesetz Nr. 6698 zum Schutz personenbezogener Daten (KVKK) erstellt wurde
                            </VText>
                            im Zusammenhang mit unserer Benachrichtigung an Einzelpersonen können Sie erreichen
                            <TouchableOpacity style={{ justifyContent: 'flex-end', marginBottom: -3 }}>
                                <VText style={{ fontSize: 16, fontWeight: '600', color: 'purple' }}> hier</VText>
                            </TouchableOpacity>
                            <VText style={{ fontWeight: '600' }}>hier.</VText>
                        </VText>
                    )}

                    <TouchableOpacity onPress={() => { setUserChecked(!isUserChecked) }} style={styles.section}>
                        <Checkbox style={styles.checkbox} value={isUserChecked} onValueChange={setUserChecked} />
                        <VText style={styles.paragraph}>{cultureResource.text4}
                        </VText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setKvkkChecked(!isKvkkChecked) }} style={styles.section}>
                        <Checkbox style={styles.checkbox} value={isKvkkChecked} onValueChange={setKvkkChecked} />
                        <VText style={styles.paragraph}>{cultureResource.text5}                        </VText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <View style={styles.bottomContainer}>
                {buttonActive && (
                    <VButton primary onPress={() => { send() }}>
                        <VText white bold style={{ fontSize: 17 }}>{cultureResource.goOn}</VText>
                    </VButton>
                )}
                {!buttonActive && (
                    <VButton secondary>
                        <VText white bold style={{ fontSize: 17 }}>{cultureResource.goOn}</VText>
                    </VButton>
                )}
            </View>
        </SafeAreaView>
    )
}

export default Index


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.white
    },
    header: {
        paddingHorizontal: 15,
        paddingTop: 25,
        flexDirection: 'row'
    },
    title: { fontSize: 22 },
    text: { fontSize: 14, color: Color.greyText, marginTop: 10 },
    body: {
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        paddingHorizontal: 25
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
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginTop: 20
    },
    paragraph: {
        fontSize: 14,
        width: '90%',
        fontWeight: '600'
    },
    checkbox: {
        margin: 8,
    },
})
