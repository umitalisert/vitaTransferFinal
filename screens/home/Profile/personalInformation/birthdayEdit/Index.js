import React from 'react'
import { View, Text, TouchableOpacity, Image, Modal, StyleSheet } from 'react-native'
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
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import { MaterialIcons } from '@expo/vector-icons';
import 'moment/min/locales';
import VButton from '../../../../../components/VButton';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import useAuthStore from '../../../../../zustand/AuthStore';
import useResponseStore from '../../../../../zustand/ResponseStore';

const Index = ({ navigation, route }) => {
  const [birthDate, setBirthDate] = useState(route.params.data.birthday)
  const cultureStore = useCultureStore((state) => state)
  const [responseMessage, setResponseMessage] = useState();
  const authStore = useAuthStore((state) => state);
  const responseStore= useResponseStore((state)=>state)

  const culture_en = {
    edit: 'Edit',
    save: 'Save',
    birthday: 'Date of Birth',
    ok: 'OK',
    failed: 'Failed!',
    successful: 'Successful',
  }
  const culture_tr = {
    edit: 'Düzenle',
    save: 'Kaydet',
    birthday: 'Doğum Tarihi',
    ok: 'Tamam',
    failed: 'Başarısız!',
    successful: 'Başarılı',
  }
  const culture_de = {
    edit: 'Bearbeiten',
    save: 'Speichern',
    birthday: 'Geburtsdatum',
    ok: 'OK',
    failed: 'Fehlgeschlagen!',
    successful: 'Erfolgreich',
  }
  const [status, setStatus] = useState(0);
  const [change, setChange] = useState(false);
  const [startVisible, setStartVisible] = useState(false);
  const profileStore = useProfileStore((state) => state);
  const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);
  moment.locale(cultureStore.culture);
  function update() {
    let request = {
      "birthDate": birthDate
    }
    UpdateProfile.Put(request, cultureStore.culture).then((response) => {
      if (response.data.responseCode == 200) {
        setStatus(0)
        setResponseMessage(response.data.responseMessage)
        setChange(!change)
        profileStore.setChange(!profileStore.change)
      } else if (response.data.ResponseCode == 401) {
        responseStore.setResMessage(response.data.ResponseMessage)
        responseStore.setRes401(true)
      } else {
        setStatus(1)
        setResponseMessage(response.data.responseMessage)
        setChange(!change)
      }

    })
  }

  const handleStart = (date) => {
    setBirthDate(date)
    setStartVisible(false);
  };
  const hideStart = () => {
    setStartVisible(false);
  };
  return (
    <>
      <View style={{ flex: 1, backgroundColor: Color.white, paddingTop: Constants.statusBarHeight }}>
        <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center', paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => { navigation.goBack() }}>
            <AntDesign name="arrowleft" size={20} color="black" />
          </TouchableOpacity>
          <VText semibold style={{ fontSize: 19, marginLeft: 20 }}>{cultureResource.edit}</VText>
        </View>
        <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>
        <View style={{ margin: 20 }}>
          <VText bold style={{ fontSize: 15, marginLeft: 10 }}>{cultureResource.birthday}</VText>
          <TouchableOpacity onPress={() => { setStartVisible(!startVisible) }} style={{ marginTop: 10, padding: 20, borderWidth: 1, borderRadius: 10, borderColor: Color.purple, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <VText bold darkGrey style={{ fontSize: 18 }} >{moment(birthDate).format('LL')}</VText>
            <MaterialIcons name="date-range" size={24} color={Color.darkGrey} />
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={startVisible}
            mode="date"
            onConfirm={handleStart}
            onCancel={hideStart}
          />
        </View>
        <TouchableOpacity onPress={() => { update() }} style={{ paddingVertical: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 30, backgroundColor: Color.purple, position: 'absolute', bottom: 100, right: 20, left: 20 }}>
          <VText white bold style={{ fontSize: 18 }}>{cultureResource.save}</VText>
        </TouchableOpacity>
      </View>
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






// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
// import { AntDesign } from '@expo/vector-icons';
// import VText from '../../../../../components/VText';
// import Color from '../../../../../components/Color';
// import VInput from '../../../../../components/VInput';
// import UpdateProfile from '../../../../../services/vita/UpdateProfile';
// import useCultureStore from '../../../../../zustand/CultureStore';
// import useProfileStore from '../../../../../zustand/ProfileStore';
// import DateTimePickerModal from "react-native-modal-datetime-picker";
// import moment from "moment";
// import 'moment/min/locales';
// import { MaterialIcons } from '@expo/vector-icons';
// const Index = ({ navigation }) => {
//   const cultureStore = useCultureStore((state) => state);
//   const culture_en = {};
//   const culture_tr = {};
//   const culture_de = {};

//   const [nameText, setNameText] = useState('');
//   const [lastNameText, setLastNameText] = useState('');
//   const [change, setChange] = useState(false);
//   const [startVisible, setStartVisible] = useState(false);
//   const profileStore = useProfileStore((state) => state);
//   const [startDate, setStartDate] = useState(moment().startOf('year'));
//   const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);
//   moment.locale(cultureStore.culture);

//   function update() {
//     const request = {
//       birdhDate: startDate.format("YYYY-MM-DD")
//     };

//     UpdateProfile.Put(request, cultureStore.culture).then((response) => {
//
//       profileStore.setChange(!profileStore.change);
//     });
//   }

//   const handleStart = (date) => {
//     setStartDate(moment(date));
//     setStartVisible(false);
//   };

//   const hideStart = () => {
//     setStartVisible(false);
//   };

//   return (
//     <>
//       <View style={{ flex: 1, backgroundColor: Color.white }}>
//         <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center', paddingHorizontal: 20 }}>
//           <TouchableOpacity onPress={() => { navigation.goBack() }}>
//             <AntDesign name="arrowleft" size={20} color="black" />
//           </TouchableOpacity>
//           <VText semibold style={{ fontSize: 19, marginLeft: 20 }}>Düzenle</VText>
//         </View>
//         <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1 }}></View>
//         <View style={{ margin: 20 }}>

//           <VText bold style={{ fontSize: 15, marginLeft: 10 }}>Doğum Tarihi</VText>

//           <VText bold style={{ fontSize: 15, marginLeft: 10 }}>{cultureResource.birthDate}</VText>
//           <TouchableOpacity style={{ padding: 20, borderWidth: 1, borderRadius: 10, borderColor: Color.purple, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
//             <VText bold darkGrey style={{ fontSize: 18 }} >21.01.2912</VText>
//             <MaterialIcons name="date-range" size={24} color={Color.darkGrey} />
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => { setStartVisible(!startVisible) }}>
//             <VText>{cultureResource.chooseDate}</VText>
//           </TouchableOpacity>
//           <DateTimePickerModal
//             isVisible={startVisible}
//             mode="date"
//             onConfirm={handleStart}
//             onCancel={hideStart}
//             date={startDate.toDate()}
//           />
//         </View>
//         <TouchableOpacity onPress={update} style={{ paddingVertical: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 30, backgroundColor: Color.purple, position: 'absolute', bottom: 100, right: 20, left: 20 }}>
//           <VText white bold style={{ fontSize: 18 }}>Kaydet</VText>
//         </TouchableOpacity>
//       </View>
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={change}
//         onRequestClose={() => { }}>
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//           <View style={{ borderRadius: 10, borderWidth: 1, backgroundColor: Color.greyLight, width: '50%', height: 200 }}>
//             <Text>{cultureResource.errorMessage}</Text>
//             <TouchableOpacity onPress={() => { setChange(!change) }}>
//               <Text>{cultureResource.close}</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// };

// export default Index;

// const styles = StyleSheet.create({
//   modalView: {
//     margin: 20,
//     backgroundColor: 'white',
//     borderRadius: 20,
//     padding: 35,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
// });