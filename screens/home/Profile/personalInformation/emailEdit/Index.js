// import React from 'react'
// import { View, Text, TouchableOpacity, Image } from 'react-native'
// import { AntDesign } from '@expo/vector-icons';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { SimpleLineIcons } from '@expo/vector-icons';
// import call from 'react-native-phone-call'
// import Checkbox from 'expo-checkbox';
// import { useState } from 'react';
// import { Foundation } from '@expo/vector-icons';
// import { FontAwesome5 } from '@expo/vector-icons';
// import VText from '../../../../../components/VText';
// import Color from '../../../../../components/Color';
// import VInput from '../../../../../components/VInput';

// const Index = ({ navigation }) => {
//   const [phoneNumber, setPhoneNumber] = useState('');
//   return (

//     <View style={{ flex: 1, backgroundColor: Color.white }}>

//       <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center', paddingHorizontal: 20 }}>
//         <TouchableOpacity onPress={() => { navigation.goBack() }}>
//           <AntDesign name="arrowleft" size={20} color="black" />
//         </TouchableOpacity>
//         <VText semibold style={{ fontSize: 19, marginLeft: 20 }}>Düzenle</VText>
//       </View>
//       <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>
//       <View style={{ margin: 20 }}>
//         <VText bold style={{ fontSize: 14 }}>E-mail Adresi</VText>
//         <View style={{ marginTop: 10 }}>
//           <VInput placeholder='engin.ayna@vitarnd.com' maxLength={11} keyboardType='number-pad' value={phoneNumber} onChangeText={(text) => { setPhoneNumber(text) }} />
//         </View>
//       </View>
//       <TouchableOpacity style={{ paddingVertical: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 30, backgroundColor: Color.purple, position: 'absolute', bottom: 100, right: 20, left: 20 }}>
//         <VText white bold style={{ fontSize: 18 }}>Kaydet</VText>
//       </TouchableOpacity>

//     </View>
//   )

// };

// export default Index



import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, Image, Modal, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native'
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
import useCultureStore from '../../../../../zustand/CultureStore';
import useProfileStore from '../../../../../zustand/ProfileStore';
import VButton from '../../../../../components/VButton';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import useAuthStore from '../../../../../zustand/AuthStore';
import useResponseStore from '../../../../../zustand/ResponseStore';

const Index = ({ navigation, route }) => {
  const cultureStore = useCultureStore((state) => state)
  const [emailText, setEmailText] = useState('');
  const [status, setStatus] = useState(0);
  const [change, setChange] = useState(false);
  const profileStore = useProfileStore((state) => state);
  const [responseMessage, setResponseMessage] = useState();
  const authStore = useAuthStore((state) => state);
  const responseStore = useResponseStore((state) => state)

  useEffect(() => {
    setEmailText(route.params.data)
  }, [])
  const culture_en = {
    save: 'Save',
    eMail: 'E-mail',
    edit: 'Edit',
    ok: 'Ok',
    failed: 'Failed!',
    successful: 'Successful',
  }
  const culture_tr = {
    eMail: 'E-mail',
    edit: 'Düzenle',
    save: 'Kaydet',
    ok: 'Tamam',
    failed: 'Başarısız!',
    successful: 'Başarılı',
  }
  const culture_de = {
    eMail: 'E-Mail',
    edit: 'bearbeiten',
    save: 'Speichern',
    ok: 'OK',
    failed: 'Fehlgeschlagen!',
    successful: 'Erfolgreich',

  }
  const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);

  function update(mail) {
    let request = {
      "email": mail
    }
    UpdateProfile.Put(request, cultureStore.culture).then((response) => {
      if (response.data.responseCode == 200) {
        setStatus(0)
        setResponseMessage(response.data.responseMessage)
        setChange(!change)
        profileStore.setChange(!profileStore.change)
      }
      else if (response.data.ResponseCode == 401) {
        responseStore.setRes401(true)
        responseStore.setResMessage(response.data.ResponseMessage)
      }
      else {
        setStatus(1)
        setResponseMessage(response.data.responseMessage)
        setChange(!change)
      }
    })
  }

  function hide() {
    Keyboard.dismiss();
    update(emailText)
  }
  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1, backgroundColor: Color.white, paddingTop: Constants.statusBarHeight }}>
          <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center', paddingHorizontal: 20 }}>
            <TouchableOpacity onPress={() => { navigation.goBack() }}>
              <AntDesign name="arrowleft" size={20} color="black" />
            </TouchableOpacity>
            <VText semibold style={{ fontSize: 19, marginLeft: 20 }}>{cultureResource.edit}</VText>
          </View>
          <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>
          <View style={{ margin: 20 }}>
            <VText bold style={{ fontSize: 15, marginLeft: 10 }}>{cultureResource.eMail}</VText>
            <View style={{ marginTop: 10, marginBottom: 10 }}>
              <VInput placeholder={'ornek@gmail.com'} keyboardType='default' value={emailText} onChangeText={(text) => { setEmailText(text) }} />
            </View>
          </View>
          <TouchableOpacity onPress={() => { emailText != '' && emailText != null ? hide() : {} }} style={{ paddingVertical: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 30, backgroundColor: Color.purple, position: 'absolute', bottom: 100, right: 20, left: 20 }}>
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