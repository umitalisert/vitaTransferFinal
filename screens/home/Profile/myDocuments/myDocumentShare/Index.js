import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView , StyleSheet } from 'react-native'
import VText from '../../../../../components/VText'
import Color from '../../../../../components/Color'
import { AntDesign } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';
import Constants from 'expo-constants'
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import moment from "moment";
import useCultureStore from '../../../../../zustand/CultureStore';

const Index = ({ navigation, route }) => {
  const [documentList, setDocumentList] = useState(route.params.data.documentList)
  const [isChecked, setIsChecked] = useState(false)
  const [control, setControl] = useState(-1)
  const [url, setUrl] = useState();

  const cultureStore = useCultureStore((state) => state);
  const culture_en = {
    myDocument: 'My Document',
    documentShare: 'Document Share',
    uploadDocument:'Upload Document',
    history: 'Effective Date: Indefinitely',
    history1: 'Effective Date:',
    missingDocument:'Missing Document',
    share:'Share',
    select : 'Select the documents you want to share'
  }
  const culture_tr = {
    myDocument: 'Belgelerim',
    documentShare: 'Belge Paylaş',
    uploadDocument:'Belge Yükle',
    history: 'Geçerlilik Tarihi: Süresiz',
    history1: 'Geçerlilik Tarihi:',
    missingDocument:'Eksik Belge',
    share:'Paylaş',
    select : 'Paylaşmak istediğiniz belgeleri seçin'
  }
  const culture_de = {
    myDocument: 'Meine Dokumente',
    documentShare: 'Dokument teilen',
    uploadDocument:'Hochladen',
    history: 'Datum des Inkrafttretens: Auf unbestimmte Zeit',
    history1: 'Datum des Inkrafttretens:',
    missingDocument:'fehlendes Dokument',
    share:'Teilen',
    select : 'Wählen Sie die Dokumente aus, die Sie teilen möchten',
  }
  const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);

  const shareDocuments = async (url) => {
    try {
      if (!url) return;
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

    <View style={{ flex: 1, backgroundColor: Color.white, paddingBottom: 90, paddingTop: Constants.statusBarHeight }}>
      <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center', paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => { navigation.goBack() }}>
          <AntDesign name="close" size={18} color="black" />
        </TouchableOpacity>
        <VText semibold style={{ fontSize: 19, marginLeft: 20 }}>{cultureResource.documentShare}</VText>
      </View>
      <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>
      <View style={{ margin: 20 }}>
        <View style={{ paddingVertical: 9, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: Color.greyLight, borderRadius: 8, borderWidth: 1, borderColor: Color.greyBorder }}>
          <Foundation name="info" size={15} color={Color.purple} />
          <VText purple semibold style={{ fontSize: 13, marginLeft: 8 }}>{cultureResource.select}</VText>
        </View>
      </View>
      <ScrollView>

        {documentList != null && (
          documentList.map((item, key) => {
            return (
              <TouchableOpacity key={key} onPress={() => { setControl(key), setUrl(item.url) }} style={{}}>
                <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomColor: Color.greyBorder, borderBottomWidth: 1 }}>
                  {key == control && (
                    <Checkbox disabled={true} style={{ margin: 8 }} value={true} />
                  )}
                  {key != control && (
                    <Checkbox disabled={true} style={{ margin: 8 }} value={false} />
                  )}
                  {/* <Checkbox style={{ margin: 8 }} value={isChecked} onValueChange={setIsChecked} /> */}
                  <View style={{ marginLeft: 10 }}>
                    <VText bold style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>{item.name}</VText>
                    {/* <VText greyText semibold style={{ fontSize: 14, }}>Geçerlilik Tarihi: 01.02.2028</VText> */}
                    {item.isTerm && (
                      <VText greyText semibold style={{ fontSize: 14, }}>{cultureResource.history1}:{moment(item.expireDate).format('LL')} </VText>
                    )}
                    {item.isTerm == false && (
                      <VText greyText semibold style={{ fontSize: 14, }}>{cultureResource.history}</VText>
                    )}
                  </View>
                </View>
                {/* <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomColor: Color.greyBorder, borderBottomWidth: 1 }}>
                <Checkbox style={{ margin: 8 }} value={isChecked} onValueChange={setIsChecked} />
                <View style={{ marginLeft: 10 }}>
                  <VText bold style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>Sabıka Kaydı</VText>
                  <VText greyText semibold style={{ fontSize: 14, }}>Geçerlilik Tarihi: 01.02.2028</VText>
                </View>
              </View>
              <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomColor: Color.greyBorder, borderBottomWidth: 1 }}>
                <Checkbox style={{ margin: 8 }} value={isChecked} onValueChange={setIsChecked} />
                <View style={{ marginLeft: 10 }}>
                  <VText bold style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>Kimlik Kartı</VText>
                  <VText greyText semibold style={{ fontSize: 14, }}>Geçerlilik Tarihi: 01.02.2028</VText>
                </View>
              </View> */}
              </TouchableOpacity>
            )
          })
        )}

      </ScrollView>
      <TouchableOpacity disabled={control == -1} onPress={() => { shareDocuments(url) }} style={control == -1 ? styles.shareNoButton : styles.shareButton}>
        <SimpleLineIcons name="share-alt" size={18} color="white" />
        <VText semibold white style={{ fontSize: 15, marginLeft: 5 }}>{cultureResource.share}</VText>
      </TouchableOpacity>
    </View>



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