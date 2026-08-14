import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import call from 'react-native-phone-call'
import Checkbox from 'expo-checkbox';
import { useState } from 'react';
import { Foundation } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import VText from '../../../../components/VText';
import Color from '../../../../components/Color';
import useProfileStore from '../../../../zustand/ProfileStore';
import moment from "moment";
import useCultureStore from '../../../../zustand/CultureStore';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
const Index = ({ navigation, route }) => {
  const data = route.params.data.user
  const profileStore = useProfileStore((state) => state);
  const cultureStore = useCultureStore((state) => state);

  const culture_en = {
    myPersonalInformations:'My Personal İnformations',
    nameSurname :'Name Surname',
    phoneNumber:'Phone Number',
    eMailAddress:'E-mail Adress',
    dateOfBirth:'Date of Birth',
    changePassword:'Change password',
    edit:'Edit',
  }
  const culture_tr = {
    myPersonalInformations:'Kişisel Bilgilerim',
    nameSurname :'Ad Soyad',
    phoneNumber:'Telefon Numarası',
    eMailAddress:'E-mail Adresi',
    dateOfBirth:'Doğum Tarihi',
    changePassword:'Şifre Değiştir',
    edit:'Düzenle',
  }
  const culture_de = {
    myPersonalInformations:' Meine persönlichen Daten',
    nameSurname :'Vorname Familienname',
    phoneNumber:'Telefonnummer',
    eMailAddress:'E-Mail-Addresse',
    dateOfBirth:'Geburtsdatum',
    changePassword:'Kennwort ändern',
    edit:'bearbeiten',
    
  }
  const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);

  return (
    <>
      <View style={{ flex: 1, backgroundColor: Color.white, paddingTop: Constants.statusBarHeight }}>

        <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center', paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => { navigation.goBack() }}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="black" />
          </TouchableOpacity>
          <VText semibold style={{ fontSize: 19, marginLeft: 20 }}>{cultureResource.myPersonalInformations}</VText>
        </View>

        <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>

        <View style={{}}>

          {/* <View style={{ margin: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
            <Image style={{ height: 60, width: 60, borderRadius: 30 }} source={{ uri: data.imagePath }} />
            <TouchableOpacity onPress={() => { }}>
              <VText bold purple style={{ fontSize: 12, textTransform: 'uppercase' }}>fotoğrafı değiştir</VText>
            </TouchableOpacity>
          </View> */}
          <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>

          <TouchableOpacity onPress={() => { navigation.navigate('NameEdit', { data: { name: data.firstName, lastName: data.lastName } }) }} style={{ margin: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
            <View style={{}}>
              <VText greyText bold style={{ fontSize: 13, marginBottom: 5 }}>{cultureResource.nameSurname}</VText>
              <VText bold style={{ fontSize: 15, }}>{data.firstName} {data.lastName}</VText>
            </View>
            <View>
              <VText bold purple style={{ fontSize: 12, textTransform: 'uppercase' }}>{cultureResource.edit}</VText>
            </View>
          </TouchableOpacity>
          <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>


          <View style={{ margin: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
            <View style={{}}>
              <VText greyText bold style={{ fontSize: 13, marginBottom: 5 }}>{cultureResource.phoneNumber}</VText>
              <VText bold style={{ fontSize: 15, }}>{data.phoneNumber}</VText>
            </View>
            {/* <TouchableOpacity onPress={() => {navigation.navigate('PhoneEdit' , {data:{phoneNumber:data.phoneNumber , dialCode:data.dialCode}}) }}>
            <VText bold purple style={{ fontSize: 12, textTransform: 'uppercase' }}>düzenle</VText>
          </TouchableOpacity> */}
          </View>
          <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>

          <TouchableOpacity onPress={() => { navigation.navigate('EmailEdit' , {data:data.email}) }} style={{ margin: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
            <View style={{}}>
              <VText greyText bold style={{ fontSize: 13, marginBottom: 5 }}>{cultureResource.eMailAddress}</VText>
              <VText bold style={{ fontSize: 15, }}>{data.email}</VText>
            </View>
            <View >
              <VText bold purple style={{ fontSize: 12, textTransform: 'uppercase' }}>{cultureResource.edit}</VText>
            </View>
          </TouchableOpacity>
          <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>

          <TouchableOpacity onPress={() => { navigation.navigate('BirthdayEdit', { data: { birthday: data.birthDate } }) }} style={{ margin: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
            <View style={{}}>
              <VText greyText bold style={{ fontSize: 13, marginBottom: 5 }}>{cultureResource.dateOfBirth}</VText>
              <VText bold style={{ fontSize: 15, }}>{moment(data.birthDate).format('LL')}</VText>
            </View>
            <View >
              <VText bold purple style={{ fontSize: 12, textTransform: 'uppercase' }}>{cultureResource.edit}</VText>
            </View>
          </TouchableOpacity>
          <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>
          <TouchableOpacity onPress={() => { navigation.navigate('ChangePassword') }} style={{ margin: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
            <View style={{}}>
              <VText  bold style={{ fontSize: 16, marginBottom: 5 }}>{cultureResource.changePassword}</VText>
              {/* <VText bold style={{ fontSize: 15, }}>................</VText> */}
            </View>
            <View >
              <VText bold purple style={{ fontSize: 12, textTransform: 'uppercase' }}>{cultureResource.edit}</VText>
            </View>
          </TouchableOpacity>
          <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>



        </View>

      </View>
      <StatusBar barStyle='dark-content'></StatusBar>
    </>
  )


};

export default Index