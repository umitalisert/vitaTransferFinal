import React from 'react'
import { View, Text, TouchableOpacity, Image, Modal, StyleSheet, Keyboard, TouchableWithoutFeedback, } from 'react-native'
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import call from 'react-native-phone-call'
import Checkbox from 'expo-checkbox';
import { useState } from 'react';
import { Foundation } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import VText from '../../../../../components/VText';
import Color from '../../../../../components/Color';
import VInput from '../../../../../components/VInput';
import UpdatePassword from '../../../../../services/vita/UpdatePassword';
import useCultureStore from '../../../../../zustand/CultureStore';
import useProfileStore from '../../../../../zustand/ProfileStore';
import VButton from '../../../../../components/VButton';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import useAuthStore from '../../../../../zustand/AuthStore';
import useResponseStore from '../../../../../zustand/ResponseStore';

const Index = ({ navigation, route }) => {
    const cultureStore = useCultureStore((state) => state)
    const responseStore = useResponseStore((state) => state)
    const [status, setStatus] = useState(0);
    const [pass, setPass] = useState('');
    const [pass1, setPass1] = useState('');
    const [change, setChange] = useState(false);
    const profileStore = useProfileStore((state) => state);
    const [responseMessage, setResponseMessage] = useState();
    const authStore = useAuthStore((state) => state);
    function update(pass, passCorfirmation) {

        let request = {
            "password": pass,
            "passwordConfirmation": passCorfirmation,
        }
        UpdatePassword.Put(request, cultureStore.culture).then((response) => {
            if (response.data.responseCode == 200) {
                setPass('')
                setPass1('')
                setStatus(0)
                setResponseMessage(response.data.responseMessage)
                setChange(!change)
            } else if (response.data.ResponseCode == 401) {
                responseStore.setRes401(true)
                responseStore.setResMessage(response.data.ResponseMessage)
            }
            else {
                setPass1('')
                setPass('')
                setStatus(1)
                setResponseMessage(response.data.responseMessage)
                setChange(!change)
            }
        })
    }
    const culture_en = {
        save: 'Save',
        ok: 'Ok',
        changePassword: 'ChangePassword',
        password: 'Password',
        passwordAgain: 'Password Again',
        failed: 'Failed!',
        successful: 'Successful',
        newPasswordAgain: 'Enter your new password again',
        newPassword: 'Enter your new password',
    }
    const culture_tr = {
        save: 'Kaydet',
        ok: 'Tamam',
        changePassword: 'Şifre Değiştir',
        password: 'Şifre',
        passwordAgain: 'Şifre Tekrar',
        failed: 'Başarısız!',
        successful: 'Başarılı',
        newPasswordAgain: 'Yeni şifrenizi tekrar giriniz',
        newPassword: 'Yeni şifrenizi giriniz',
    }
    const culture_de = {
        save: 'Speichern',
        ok: 'OK',
        changePassword: 'Kennwort ändern',
        password: 'Passwort',
        passwordAgain: 'Passwort erneut',
        failed: 'Fehlgeschlagen!',
        successful: 'Erfolgreich',
        newPasswordAgain: 'Geben Sie Ihr neues Passwort erneut ein',
        newPassword: 'Geben Sie Ihr neues Passwort ein',
    }
    const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);

    return (
        <>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1, backgroundColor: Color.white, paddingTop: Constants.statusBarHeight }}>
                    <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center', paddingHorizontal: 20 }}>
                        <TouchableOpacity onPress={() => { navigation.goBack() }}>
                            <AntDesign name="arrowleft" size={20} color="black" />
                        </TouchableOpacity>
                        <VText semibold style={{ fontSize: 19, marginLeft: 20 }}>{cultureResource.changePassword}</VText>
                    </View>
                    <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>
                    <View style={{ margin: 20 }}>
                        <VText bold style={{ fontSize: 15, marginLeft: 10 }}>{cultureResource.password}</VText>
                        <View style={{ marginTop: 10, marginBottom: 10 }}>
                            <VInput placeholder={cultureResource.newPassword} maxLength={11} keyboardType='default' secureTextEntry={true} value={pass} onChangeText={(text) => { setPass(text) }} />
                        </View>
                        <VText bold style={{ fontSize: 15, marginLeft: 10 }}>{cultureResource.passwordAgain}</VText>
                        <View style={{ marginTop: 10 }}>
                            <VInput placeholder={cultureResource.newPasswordAgain} maxLength={11} keyboardType='default' secureTextEntry={true} value={pass1} onChangeText={(text) => { setPass1(text) }} />
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => { (pass != null && pass != '' && pass1 != null && pass1 != '') ? update(pass, pass1) : {} }} style={{ paddingVertical: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 30, backgroundColor: Color.purple, position: 'absolute', bottom: 100, right: 20, left: 20 }}>
                        <VText white bold style={{ fontSize: 18 }}>{cultureResource.save}</VText>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
            <Modal
                animationType="slide"
                transparent={true}
                visible={change}
                onRequestClose={() => { }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                    <View style={styles.modalView}>
                        {status == 0 ? <AntDesign name="check" size={60} color="green" /> : <AntDesign name="close" size={60} color="red" />}
                        <VText bold style={{ marginTop: 20, fontSize: 20 }}>
                            {status == 0 ? cultureResource.successful : cultureResource.failed}
                        </VText>
                        <VText regular style={{ marginTop: 20 }}>
                            {responseMessage}
                        </VText>
                        <VButton primary style={{ paddingHorizontal: 40, paddingVertical: 10, marginTop: 25 }}
                            onPress={() => { setChange(!change) }}>
                            <VText white bold>{cultureResource.ok}</VText>
                        </VButton>
                    </View>
                </View>
            </Modal>
            <StatusBar barStyle='dark-content'></StatusBar>
        </>
    )


};

export default Index

const styles = StyleSheet.create({
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
})