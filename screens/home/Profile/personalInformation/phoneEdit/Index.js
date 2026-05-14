import React from 'react'
import { View, Text, TouchableOpacity, Image  ,Modal , Keyboard , TouchableWithoutFeedback} from 'react-native'
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
import UpdateProfile from '../../../../../services/vita/UpdateProfile';
import useProfileStore from '../../../../../zustand/ProfileStore';
import useCultureStore from '../../../../../zustand/CultureStore';
import moment from "moment";
const Index = ({ navigation }) => {
    const [countryCode, setCountryCode] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const profileStore = useProfileStore((state)=>state);
    const [change, setChange] = useState(false);
    const cultureStore = useCultureStore((state)=>state);
    const culture_en = {
        edit: 'Edit',
        save: 'Save',
        ok: 'OK',
        failed:'Failed!',
        successful:'Successful',
        phoneNumber:'Phone number',
      }
      const culture_tr = {
        edit:'Düzenle',
        save:'Kaydet',
        ok:'Tamam',
        failed:'Başarısız!',
        successful:'Başarılı',
        phoneNumber:'Telefon Numarası',
      }
      const culture_de = {
        edit: 'Bearbeiten',
        save: 'Speichern',
        ok: 'OK',
        failed:'Fehlgeschlagen!',
        successful:'Erfolgreich',
        phoneNumber:'Telefonnummer',
      }
      const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);
      moment.locale(cultureStore.culture);
    function update(x, y) {
        let request = {
            "dialCode" : x,
            "phoneNumber": y,
        }
        UpdateProfile.Put(request, cultureStore.culture).then((response) => {
            profileStore.setChange(!profileStore.change)
        })
    }
    return (
        <>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}></TouchableWithoutFeedback>
            <View style={{ flex: 1, backgroundColor: Color.white }}>
                <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center', paddingHorizontal: 20 }}>
                    <TouchableOpacity onPress={() => { navigation.goBack() }}>
                        <AntDesign name="arrowleft" size={20} color="black" />
                    </TouchableOpacity>
                    <VText semibold style={{ fontSize: 19, marginLeft: 20 }}>{cultureResource.edit}</VText>
                </View>
                <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>
                <View style={{ margin: 20 }}>
                    <VText bold style={{ fontSize: 14 }}></VText>
                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <VInput placeholder='+90' maxLength={4} keyboardType='number-pad' value={countryCode} onChangeText={(text) => { setCountryCode('+' + text.replace('+', '')); }} />
                        </View>
                        <View style={{ flex: 3 }}>
                            <VInput placeholder='5301112233' maxLength={11} keyboardType='number-pad' value={phoneNumber} onChangeText={(text) => { setPhoneNumber(text) }} />
                        </View>
                    </View>
                </View>
                <TouchableOpacity onPress={() => {  countryCode != '' || null && phoneNumber != '' || null ? update(countryCode, phoneNumber) : setChange(true) }} style={{ paddingVertical: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 30, backgroundColor: Color.purple, position: 'absolute', bottom: 100, right: 20, left: 20 }}>
                    <VText white bold style={{ fontSize: 18 }}>{cultureResource.save}</VText>
                </TouchableOpacity>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={change}
                onRequestClose={() => { }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                    <View style={{ borderRadius: 10, borderWidth: 1, backgroundColor: Color.greyLight, width: '50%', height: 200 }}>
                        <Text>alsdkjşlaksdşlajsdşlasd</Text>
                        <TouchableOpacity onPress={() => { setChange(!change) }}>
                            <Text>kapat</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    )


};

export default Index