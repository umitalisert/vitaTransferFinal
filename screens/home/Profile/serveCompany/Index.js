import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import { AntDesign } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';
import VText from '../../../../components/VText';
import Color from '../../../../components/Color';
import { FontAwesome5 } from '@expo/vector-icons';
import call from 'react-native-phone-call'
import useCultureStore from '../../../../zustand/CultureStore';
import Constants from 'expo-constants';
const Index = ({ navigation, route }) => {
  const cultureStore = useCultureStore((state) => state);

  const culture_en = {
    headerTitle: 'Institutions I Serve',
    noPhoneNumber: 'Phone Number Not Added',
    noCompanyInfo: 'No address information available for the institution.',

  }
  const culture_tr = {
    headerTitle: 'Hizmet Verdiğim Kurumlar',
    noPhoneNumber: 'Telefon Numarası Eklenmedi',
    noCompanyInfo: 'Kurumun adres bilgisi bulunamadı.',
  }
  const culture_de = {
    headerTitle: 'Die Institutionen, für die ich arbeite',
    noPhoneNumber: 'Telefonnummer nicht hinzugefügt',
    noCompanyInfo: 'Keine Adressinformationen für die Institution verfügbar.',
  }
  const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);

  const data = route.params.data.companies
  function phoneCall(phone) {
    const args = {
      number: phone,
      prompt: false,
      skipCanOpen: true,
    };
    call(args).catch(console.error);
  };
  return (
    <>
      <View style={{ flex: 1, backgroundColor: Color.white, paddingTop: Constants.statusBarHeight, }}>
        <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center', paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => { navigation.goBack() }}>
            <AntDesign name="close" size={18} color="black" />
          </TouchableOpacity>
          <VText semibold style={{ fontSize: 19, marginLeft: 20 }}>{cultureResource.headerTitle}</VText>
        </View>
        <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>
        <ScrollView contentContainerStyle={{ paddingBottom: 150, }} style={{}} bounces={false}>
          {data != null && (
            data.map((item, key) => {
              return (
                <View key={key} style={{ paddingHorizontal: 20, paddingVertical: 20, borderBottomColor: Color.greyBorder, borderBottomWidth: 1 }}>
                  <View style={{ backgroundColor: Color.white, borderRadius: 10, borderWidth: 1, borderColor: Color.greyBorder, paddingVertical: 16, paddingHorizontal: 15 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row' }}>
                        <View style={{ borderRadius: 100 }}>
                          <Image style={{ height: 48, width: 48, resizeMode: 'contain' }} source={{ uri: item.companyImage }} />
                        </View>
                        <View style={{ marginLeft: 10 }}>
                          <VText bold style={{ fontSize: 15, textTransform: 'uppercase', marginBottom: 2 }}>{item.companyName}</VText>
                          {item.phone == '' && (
                            <VText semibold greyText style={{ fontSize: 13, textTransform: 'capitalize', marginBottom: 2 }}>{cultureResource.noPhoneNumber}</VText>
                          )}
                          {item.phone != '' && (
                            <VText semibold greyText style={{ fontSize: 13, textTransform: 'capitalize', marginBottom: 2 }}>{item.phone}</VText>
                          )}

                        </View>
                      </View>
                      {item.phone != '' && (
                        <TouchableOpacity onPress={() => { phoneCall(item.phone) }} style={{ alignItems: 'center', backgroundColor: Color.purple, height: 40, width: 40, borderRadius: 20, justifyContent: 'center', backgroundColor: Color.purple }}>
                          <View styyle={{}}>
                            <FontAwesome5 name="phone-alt" size={18} color="white" />
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={{ marginTop: 15, borderColor: Color.greyBorder, padding: 10, borderWidth: 1, borderRadius: 10 }}>
                      {item.companyAddress != '' && (
                        <VText semibold greyText style={{ fontSize: 13 }} >{item.companyAddress}</VText>
                      )}
                      {item.companyAddress == '' && (
                        <VText semibold greyText style={{ fontSize: 13 }} >{cultureResource.noCompanyInfo}</VText>
                      )}
                    </View>
                  </View>
                </View>
              )
            })
          )}
          {/* <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View> */}
        </ScrollView>
      </View>
    </>
  )
}

export default Index