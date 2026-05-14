import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import VText from '../../../../components/VText'
import { AntDesign } from '@expo/vector-icons';
import Color from '../../../../components/Color';
import CarChangeComponent from './../../../../components/ProfilMain/CarChange/CarChangeComponent'
import ChangeCurrentVehicle from '../../../../services/vita/ChangeCurrentVehicle';
import useCultureStore from '../../../../zustand/CultureStore';
import useProfileStore from '../../../../zustand/ProfileStore';
import Profile from '../../../../services/vita/Profile';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import useResponseStore from '../../../../zustand/ResponseStore';

const Index = ({ navigation, route }) => {
  const x = route.params.data.vehicles
  const profileStore = useProfileStore((state) => state);
  const [vehicles, setVehicles] = useState(x);
  const [pick, setPick] = useState();
  const cultureStore = useCultureStore((state) => state);
  const [itemId, setItemId] = useState();
  const responseStore = useResponseStore((state) => state)

  const culture_en = {
    changeCar: 'Change vehicle',
    changePick: 'Confirm after selecting the vehicle you want to change',
    confirm: 'Confirm',
  }
  const culture_tr = {
    changeCar: 'Araç Değiştir',
    changePick: 'Değiştirmek istediğiniz aracı seçtikten sonra onaylayın',
    confirm: 'Onayla'
  }
  const culture_de = {
    changeCar: 'Fahrzeug wechseln',
    changePick: 'Bestätigen Sie, nachdem Sie das Fahrzeug ausgewählt haben, das Sie ändern möchten',
    confirm: 'Bestätigen',
  }
  const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);

  function postCarId(id) {
    let request = {
      "id": parseInt(itemId)
    }
    ChangeCurrentVehicle.Post(request, cultureStore.culture).then((response) => {
      if (response.data.responseCode == 200) {
        profileStore.setChange(!profileStore.change)
        navigation.goBack()
      } else if (response.data.ResponseCode == 401) {
        responseStore.setResMessage(response.data.ResponseMessage)
        responseStore.setRes401(true)
      } else {

      }
    })
  }
  function pickItem(index) {
    setPick(index)
  }
  function pickItemId(index) {
    setItemId(index)
  }
  return (
    <>
      {vehicles == null && (
        <AppLoading></AppLoading>
      )}
      <ScrollView style={{ paddingTop: Constants.statusBarHeight, }}>
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <View>
            <TouchableOpacity onPress={() => { navigation.goBack() }}>
              <AntDesign style={{ marginTop: 25 }} name="arrowleft" size={26} color="black" />
            </TouchableOpacity>
            <VText semibold style={{ fontSize: 24, marginTop: 30, paddingHorizontal: 2, fontWeight: '600' }}>{cultureResource.changeCar}</VText>
            <VText regular style={{ fontSize: 15, marginTop: 10, color: Color.greyText, paddingHorizontal: 2 }}>{cultureResource.changePick}</VText>
            <View style={{ marginTop: 20, marginBottom: 50 }}>
              {
                vehicles != null && (
                  vehicles.map((item, key) => (
                    <CarChangeComponent navigation={navigation} key={key} itemKey={key} item={item} pickItem={pickItem} isChecked={key == pick} postCarId={postCarId} pickItemId={pickItemId} />
                  ))
                )}
            </View>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity onPress={() => { postCarId(itemId) }} style={{ marginHorizontal: 20, backgroundColor: Color.purple, borderRadius: 40, justifyContent: 'center', paddingVertical: 15, alignItems: 'center', marginTop: 15, marginBottom: 100 }}>
        <VText bold white style={{ fontSize: 18 }}>{cultureResource.confirm}</VText>
      </TouchableOpacity>
      <StatusBar barStyle='dark-content'></StatusBar>
    </>
  )
}

export default Index

