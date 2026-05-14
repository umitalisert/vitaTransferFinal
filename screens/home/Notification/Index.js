import React, { useEffect } from 'react'
import { View, Text, ScrollView } from 'react-native'
import Notification from '../../../services/vita/Notification';
import Color from '../../../components/Color';
import { useDispatch } from 'react-redux'
import useCultureStore from '../../../zustand/CultureStore'
import VText from '../../../components/VText';
import { useState } from 'react';
import { Octicons } from '@expo/vector-icons';
import moment from "moment";
import { StatusBar } from 'expo-status-bar';
import { AntDesign } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { setErrorMessage, setHasError, setLoading } from '../../../redux/slices/mainSlice';
import useAuthStore from '../../../zustand/AuthStore';
import useResponseStore from '../../../zustand/ResponseStore';

const Index = () => {
  const responseStore = useResponseStore((state) => state)
  const authStore = useAuthStore((state) => state)
  const dispatch = useDispatch();

  const cultureStore = useCultureStore((state) => state);
  const culture_en = {
    bildirim: 'Notification',
    nullNotification: 'No Notification to Display.',
  }
  const culture_tr = {
    bildirim: 'Bildirim',
    nullNotification: 'Gösterilecek Bildirim Bulunmamaktadır.',
  }
  const culture_de = {
    bildirim: 'Benachrichtigung',
    nullNotification: 'Keine Benachrichtigung zur Anzeige.',
  }
  const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);
  moment.locale(cultureStore.culture);
  const [notificationData, setNotificationData] = useState();
  function list() {
    dispatch(setLoading(true));
    Notification.Get(cultureStore.culture).then(response => {
      if (response.data.responseCode == 200) {
        setNotificationData(response.data.data)
        dispatch(setLoading(false));
      }
      else if (response.data.ResponseCode == 401) {
        responseStore.setRes401(true)
        responseStore.setResMessage(response.data.ResponseMessage)
        dispatch(setLoading(false));
      }
      else {
        dispatch(setLoading(false));
      }

    }).catch((error) => {
    })
  }
  useEffect(() => {
    list()
  }, [])

  return (
    <>
      <View style={{ flex: 1, paddingTop: Constants.statusBarHeight }}>
        <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center', paddingHorizontal: 20, backgroundColor: Color.white }}>
          <VText semibold style={{ fontSize: 20, marginLeft: 20 }}>{cultureResource.bildirim}</VText>
        </View>
        <ScrollView style={{ padding: 20, backgroundColor: Color.greyBorder }}>
          {notificationData != undefined && notificationData.length != 0 && (
            notificationData.map((item, key) => {
              return (
                <View key={key} style={{ borderWidth: 1, borderColor: Color.purple, borderRadius: 10, paddingTop: 10, paddingHorizontal: 15, paddingBottom: 15, marginBottom: 10, backgroundColor: Color.white }}>
                  <View style={{ flexDirection: 'row', paddingBottom: 5, borderBottomWidth: 1, borderColor: Color.greyBorder, marginBottom: 15, justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                      <Octicons name="dot-fill" size={12} color="lightgreen" />
                      <VText darkGrey bold style={{ fontSize: 15, textTransform: 'uppercase', marginLeft: 5 }}>{item.title}</VText>
                    </View>

                    <View style={{}}>
                      <VText darkGrey semibold style={{ fontSize: 12 }}>{moment(item.date).format('Do MMMM YYYY')} </VText>
                      <VText darkGrey semibold style={{ fontSize: 12, textAlign: 'right' }}>{moment(item.date).format('h:mm:ss')} </VText>
                    </View>
                  </View>
                  <View style={{}}>
                    <VText semibold darkGrey style={{ fontSize: 13 }}>{item.info}</VText>
                  </View>
                </View>
              )
            })
          )}
          {
            notificationData != undefined && notificationData.length == 0 && (
              <View style={{
                backgroundColor: Color.white, flex: 1, borderRadius: 10,
                shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, paddingHorizontal: 10,
                flex: 1, alignItems: 'center', paddingVertical: 15, borderRadius: 10, borderWidth: 1, borderColor: Color.primary, marginVertical: 20, marginHorizontal: 10, flexDirection: 'row', justifyContent: 'center'
              }}>
                <AntDesign name="warning" size={24} color="orange" />
                <VText bold purple style={{ fontSize: 15, marginLeft: 10, textAlign: 'center' }}>{cultureResource.nullNotification}</VText>
              </View>
            )
          }
        </ScrollView>
        <StatusBar backgroundColor={Color.white} barStyle='dark-content'></StatusBar>
      </View>
    </>
  )
}


export default Index

// import React, { useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, Button } from 'react-native';
// import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';

// const Index = () => {
//   const bottomSheetModalRef = useRef(null);

//   useEffect(() => {
//     setTimeout(() => {
//       if (bottomSheetModalRef.current) {
//         bottomSheetModalRef.current.present(); 
//       }
//     }, 500);
//   }, []);

//   return (
//     <BottomSheetModalProvider>
//       <View style={styles.container}>
//         <Text style={styles.headerText}>asdasdIndex</Text>
//         <Button title="BottomSheet Aç" onPress={() => bottomSheetModalRef.current?.present()} />
//         <BottomSheetModal
//           ref={bottomSheetModalRef}
//           index={0}
//           snapPoints={['25%', '50%', '75%']}
//         >
//           <View style={styles.contentContainer}>
//             <Text style={styles.text}>Bu bir BottomSheetModal</Text>
//           </View>
//         </BottomSheetModal>
//       </View>
//     </BottomSheetModalProvider>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   contentContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   text: {
//     fontSize: 16,
//   },
// });

// export default Index;