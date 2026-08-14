import React, { useCallback, useMemo, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, Image, Modal, StyleSheet, Linking, } from 'react-native'
import VText from '../../../../components/VText'
import { AntDesign } from '@expo/vector-icons';
import Color from '../../../../components/Color';
import CarChangeComponent from '../../../../components/ProfilMain/CarChange/CarChangeComponent';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

import CarDocumentsComponents from '../../../../components/ProfilMain/CarDocuments/CarDocumentsComponents';
import useCultureStore from '../../../../zustand/CultureStore';

const Index = ({ navigation, route }) => {
  const data = route.params.data.item;
  const [url, setUrl] = useState();
  const cultureStore = useCultureStore((state) => state)
  const x = true;

  const culture_en = {
    carDocument: 'Vehicle Documentation',
    documentShare: 'Document Share',
    expirationDate:'Expiration Date :',
    unlimited:'Unlimited',
  }
  const culture_tr = {
    carDocument: 'Araç Belgeleri',
    documentShare: 'Belge Paylaş',
    expirationDate:'Geçerlilik Tarihi :',
    unlimited:'Süresiz',


  }
  const culture_de = {
    carDocument: 'Fahrzeugdokumentation',
    documentShare: 'Dokument teilen',
    expirationDate:'Ablaufdatum :',
    unlimited:'unbegrenzt',


  }
  const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);


  return (
    //  <View style={{flex:1 , justifyContent:'center' , alignItems:'center'}}>
    //   <VText style={{ }}>Araç belgeleri sayfası</VText>
    //  </View>
    <>
      <View style={{ flex: 1, backgroundColor: Color.white, paddingTop: Constants.statusBarHeight }}>
        <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center', paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => { navigation.goBack() }}>
            <MaterialCommunityIcons name="arrow-left" size={18} color="black" />
          </TouchableOpacity>
          <VText semibold style={{ fontSize: 19, marginLeft: 20 }}>{cultureResource.carDocument}</VText>
        </View>

        <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderBottomColor: Color.greyBorder, borderBottomWidth: 1 }}>
          {/* <CarChangeComponent navigation={navigation} /> */}
          <View style={{ backgroundColor: Color.white, borderRadius: 10, borderWidth: 1, borderColor: Color.greyBorder, paddingVertical: 20, paddingHorizontal: 15, marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, }}>
            <View style={{ flexDirection: 'row', marginBottom: 15 }}>
              <Image style={{ height: 48, width: 48, }} source={{ uri: data.brandLogo }} />
              <View style={{ marginLeft: 10 }}>
                <VText bold style={{ fontSize: 19, textTransform: 'uppercase', marginBottom: 2 }}>{data.plate}</VText>
                <VText semibold greyText style={{ fontSize: 13, textTransform: 'capitalize', marginBottom: 2 }}>{data.brand}</VText>
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginRight: 13 }}>
              <View style={{ flexDirection: 'row', backgroundColor: Color.greyLight, borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8, marginRight: 5 }}>
                <MaterialIcons name="date-range" size={15} color="black" />
                <VText semibold style={{ fontSize: 12, color: Color.darkGrey, marginLeft: 4 }}>{data.modelYear}</VText>
              </View>
              <View style={{ flexDirection: 'row', backgroundColor: Color.greyLight, marginRight: 5, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10 }}>
                <Ionicons name="person" size={15} color="black" />
                <VText semibold style={{ fontSize: 12, color: Color.darkGrey, marginLeft: 4 }}>{data.capacity}</VText>
              </View>
              {/* <View style={{ flexDirection: 'row', backgroundColor: Color.greyLight, marginRight: 5, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10 }}>
              <MaterialCommunityIcons name="fuel" size={15} color="black" />
              <VText semibold style={{ fontSize: 12, color: Color.darkGrey, textTransform: 'capitalize', marginLeft: 4 }}>Dizel</VText>
            </View> */}
            </View>
          </View>
        </View>

        <View style={{}}>
          {data.documents.map((item, key) => {
            return (
              <CarDocumentsComponents navigation={navigation} item={item} key={key} keyItem={key} data={data} cultureResource={cultureResource}/>
            )
          })}
          {/* <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomColor: Color.greyBorder, borderBottomWidth: 1 }}>
            <View style={{ backgroundColor: 'rgba(28, 201, 97, 0.1)', padding: 12, justifyContent: 'center', borderRadius: 5 }}>
              <MaterialCommunityIcons style={{}} name="file-check" size={17} color="lightgreen" />
            </View>
            <View style={{ marginLeft: 10 }}>
              <VText bold style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>Sigorta Poliçesi</VText>
              <VText greyText semibold style={{ fontSize: 14, }}>Geçerlilik Tarihi: </VText>
            </View>
          </View> */}
        </View>
        <TouchableOpacity onPress={() => { navigation.navigate('CarDocumentShare', { data: { data: data } }) }} style={{ margin: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, backgroundColor: Color.purple, borderRadius: 30, }}>
          <SimpleLineIcons name="share-alt" size={20} color="white" />
          <VText bold white style={{ fontSize: 16, marginLeft: 5 }}>{cultureResource.documentShare}</VText>
        </TouchableOpacity>
        <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>
      </View >

      <StatusBar barStyle='dark-content'></StatusBar>
    </>
  )
}

export default Index
