import React from 'react'
import { View, Text, TouchableOpacity, Image  , StyleSheet} from 'react-native'
import { AntDesign } from '@expo/vector-icons';
import CarChangeComponent from '../../../../../components/ProfilMain/CarChange/CarChangeComponent';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import VText from '../../../../../components/VText';
import Color from '../../../../../components/Color';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Foundation } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import CarDocumentShareComponent from '../../../../../components/ProfilMain/CarDocuments/CarDocumentsShareComponent';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import moment from "moment";
import Checkbox from 'expo-checkbox';
import useCultureStore from '../../../../../zustand/CultureStore';

const Index = ({ navigation, route }) => {
  // const data = route.params.data.data
  const [data, setData] = useState(route.params.data.data)
  const [control, setControl] = useState(-1)
  const [url, setUrl] = useState();

  const cultureStore = useCultureStore((state) => state)

  const culture_en = {
    history: 'Effective Date: Indefinitely',
    history1: 'Effective Date:',
    documentShare: 'Document Share',
  }
  const culture_tr = {
    history: 'Geçerlilik Tarihi: Süresiz',
    history1: 'Geçerlilik Tarihi:',
    documentShare: 'Belge Paylaş',


  }
  const culture_de = {
    history: 'Datum des Inkrafttretens: Auf unbestimmte Zeit',
    history1: 'Datum des Inkrafttretens:',
    documentShare: 'Dokument teilen',


  }
  const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);
  // function addElement(itemUrl) {
  //   if (checkArray.includes(itemUrl)) {
  //     const updatedArray = checkArray.filter(item => item !== itemUrl);
  //     setCheckArray(updatedArray);
  //   } else {
  //     setCheckArray(prevArray => [...prevArray, itemUrl]);
  //   }
  // }

  const shareDocuments = async () => {
    try {
      let str = url.split("/");
      const fileName = str.pop();
      const fileUri = FileSystem.cacheDirectory + fileName;
      await FileSystem.downloadAsync(url, fileUri);
      await Sharing.shareAsync(fileUri);
    }
    catch (error) {
    }
  };

  return (
    //  <View style={{flex:1 , justifyContent:'center' , alignItems:'center'}}>
    //   <VText style={{ }}>Araç belgeleri sayfası</VText>
    //  </View>
    <>

      <View style={{ flex: 1, backgroundColor: Color.white, paddingTop: Constants.statusBarHeight }}>
        <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center', paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => { navigation.goBack() }}>
            <AntDesign name="close" size={18} color="black" />
          </TouchableOpacity>
          <VText semibold style={{ fontSize: 19, marginLeft: 20 }}>{cultureResource.documentShare}</VText>
        </View>
        <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>
        {/* <View style={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderBottomColor: Color.greyBorder, borderBottomWidth: 1 }}>
        <CarChangeComponent navigation={navigation} />
      </View>
      <View style={{ margin: 20 }}>
        <View style={{ paddingVertical: 9, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: Color.greyLight, borderRadius: 8, borderWidth: 1, borderColor: Color.greyBorder }}>
          <Foundation name="info" size={15} color={Color.purple} />
          <VText purple semibold style={{ fontSize: 13, marginLeft: 8 }}>Paylaşmak istediğiniz belgeleri seçin.</VText>
        </View>
      </View>
      <View style={{}}>
        <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomColor: Color.greyBorder, borderBottomWidth: 1 }}>
          <Checkbox style={{ margin: 8 }} value={isChecked} onValueChange={setIsChecked} />
          <View style={{ marginLeft: 10 }}>
            <VText bold style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>Ruhsat</VText>
            <VText greyText semibold style={{ fontSize: 14, }}>Geçerlilik Tarihi: 01.02.2028</VText>
          </View>
        </View>
        <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomColor: Color.greyBorder, borderBottomWidth: 1 }}>
          <Checkbox style={{ margin: 8 }} value={isChecked} onValueChange={setIsChecked} />
          <View style={{ marginLeft: 10 }}>
            <VText bold style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>Sigorta Poliçesi</VText>
            <VText greyText semibold style={{ fontSize: 14, }}>Geçerlilik Tarihi: 01.02.2028</VText>
          </View>
        </View>
      </View> */}
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
              <TouchableOpacity key={key} onPress={() => { setControl(key), setUrl(item.url) }} style={{ padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomColor: Color.greyBorder, borderBottomWidth: 1 }}>
                {key == control && (
                  <Checkbox disabled={true} style={{ margin: 8 }} value={true} />
                )}
                {key != control && (
                  <Checkbox disabled={true} style={{ margin: 8 }} value={false} />
                )}
                <View style={{ marginLeft: 10 }}>
                  <VText bold style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>{item.name}</VText>
                  {item.isTerm && (
                    <VText greyText semibold style={{ fontSize: 14, }}>{cultureResource.history1}{moment(item.expireDate).format('LL')} </VText>
                  )}
                  {item.isTerm == false && (
                    <VText greyText semibold style={{ fontSize: 14, }}>{cultureResource.history}</VText>
                  )}
                </View>
              </TouchableOpacity>
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

        <TouchableOpacity onPress={() => { shareDocuments() }}  style={control == -1 ? styles.shareNoButton : styles.shareButton}>
          <SimpleLineIcons name="share-alt" size={18} color="white" />
          <VText semibold white style={{ fontSize: 15, marginLeft: 5 }}>{cultureResource.documentShare}</VText>
        </TouchableOpacity>
        <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>
      </View >
      <StatusBar barStyle='dark-content'></StatusBar>
    </>
  )
}

export default Index

const styles = StyleSheet.create({
  shareNoButton: {
    margin: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, backgroundColor: Color.greyText, borderRadius: 30,
  },
  shareButton: {
    margin: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, backgroundColor: Color.purple, borderRadius: 30,
  },
})