import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView, Linking, Modal  , StyleSheet} from 'react-native'
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import VText from '../../../../components/VText';
import Color from '../../../../components/Color';
import { Ionicons } from '@expo/vector-icons';
import AppLoading from '../../../splash/AppLoading';
import useCultureStore from '../../../../zustand/CultureStore';
import Constants from 'expo-constants';
import UploadDocument_Async from './../../../../services/vita/UploadDocument_Async'
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { getAuth, signOut, getIdToken } from 'firebase/auth'
import { getApp } from 'firebase/app';
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../../../redux/slices/mainSlice';
import VButton from '../../../../components/VButton';
import useAuthStore from '../../../../zustand/AuthStore';
import useResponseStore from '../../../../zustand/ResponseStore';

const Index = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const responseStore= useResponseStore((state)=>state)
  const cultureStore = useCultureStore((state) => state)
  // // const [typeId, setTypeId] = useState()
  const [loadItem, setLoadItem] = useState()
  const documentList = route.params.data.user.documents
  const [belgeUri, setBelgeUri] = useState(null);
  const [visible , setVisible] = useState(false);
  const authStore = useAuthStore((state) => state);

  function phoneCall(phone) {
    const args = {
      number: phone,
      prompt: false,
      skipCanOpen: true,
    };
    call(args).catch(console.error);
  };
  const culture_en = {
    myDocument: 'My Document',
    documentShare: 'Document Share',
    uploadDocument: 'Upload Document',
    history: 'Datum des Inkrafttretens: Auf unbestimmte Zeit',
    history1: 'Datum des Inkrafttretens:',
    missingDocument: 'Missing Document',
    modal:'Transaction successful',
  }
  const culture_tr = {
    myDocument: 'Belgelerim',
    documentShare: 'Belge Paylaş',
    uploadDocument: 'Belge Yükle',
    history: 'Datum des Inkrafttretens: Auf unbestimmte Zeit',
    history1: 'Datum des Inkrafttretens:',
    missingDocument: 'Eksik Belge',
    modal:'işlem başarılı oldu.',
  }
  const culture_de = {
    myDocument: 'Fahrzeugdokumentation',
    documentShare: 'Dokument teilen',
    uploadDocument: 'Hochladen',
    history: 'Datum des Inkrafttretens: Auf unbestimmte Zeit',
    history1: 'Datum des Inkrafttretens:',
    missingDocument: 'fehlendes Dokument',
    modal:'Transaktion Erfolgreich',

  }
  const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);



  const imageCallback = async (load , typeId) => {
    const formData = new FormData();
    let localUri = load.uri
    let localName = load.name
    let type = load.mimeType
    formData.append("document", { uri: localUri, name: localName, type })
    formData.append("typeId", typeId)
    UploadDocument_Async.Put(formData, cultureStore.culture).then(response => {
      if (response.status == 200) {
        if (response.data.responseCode == 200) {
          dispatch(setLoading(false));
          setVisible(true)
        }
        else if (response.data.ResponseCode == 401) {
          responseStore.setRes401(true)
          responseStore.setResMessage(response.data.ResponseMessage)
          dispatch(setLoading(false));
        }
        else {
          dispatch(setHasError(true));
          dispatch(setErrorMessage(response.data.responseMessage));
          dispatch(setLoading(false));
        }
      }
      else {
        dispatch(setHasError(true));
        dispatch(setErrorMessage(cultureStore.culture == 'tr' ? 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.' : cultureStore.culture == 'en' ? 'An unexpected error occured. Please try again later.' : cultureStore.culture == 'de' ? 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' : 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.'));
        dispatch(setLoading(false));
      }
    }).catch((err) => {
    })
  }


  function showDocuments(index) {
    let document = documentList.filter((item, key) => key == index)
    if (document.url != null) {
      Linking.openURL(document.url)
    }
  }

  const loadDocument = async (typeId) => {
    try {
      const load = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (load.type === 'success') {
        setLoadItem(load.uri);

        // formData.append("Photo", { uri: localUri, name: filename, type });
        imageCallback(load , typeId );
        // convertAndSendFile(load.uri);
      }
    } catch (error) {
    }
  }

  function load(index) {
    let document = documentList.filter((item, key) => key == index)
    // setTypeId(document[0].typeId)
    loadDocument(document[0].typeId)
  }

  if (documentList.length == 0 || documentList == null) {
    return (
      <View style={{ flex: 1, backgroundColor: Color.white, paddingTop: Constants.statusBarHeight }}>
        <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center', paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => { navigation.goBack() }}>
            <AntDesign name="arrowleft" size={20} color="black" />
          </TouchableOpacity>
          <VText semibold style={{ fontSize: 19, marginLeft: 20 }}>{cultureResource.myDocument}</VText>
        </View>
        <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>
      </View>
    )
  }

  else {
    return (
      <View style={{ flex: 1, backgroundColor: Color.white, paddingTop: Constants.statusBarHeight, paddingBottom: 90 }}>
        <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center', paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => { navigation.goBack() }}>
            <AntDesign name="arrowleft" size={20} color="black" />
          </TouchableOpacity>
          <VText semibold style={{ fontSize: 19, marginLeft: 20 }}>{cultureResource.myDocument}</VText>
        </View>
        <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>
        <ScrollView>
          <View style={{}}>

            {documentList.map((item, key) => {
              return (
                <TouchableOpacity onPress={() => { showDocuments(key) }} key={key} style={{ padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomColor: Color.greyBorder, borderBottomWidth: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ backgroundColor: 'rgba(28, 201, 97, 0.1)', padding: 12, justifyContent: 'center', borderRadius: 5 }}>
                      <MaterialCommunityIcons style={{}} name="file-check" size={17} color="lightgreen" />
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <VText bold style={{ fontSize: 15, fontWeight: '600', marginBottom: 5 }}>{item.name}</VText>
                      {item.showUpload == true && (
                        <VText greyText semibold style={{ fontSize: 14, }}>{cultureResource.history1}: {item.History}</VText>
                      )}
                      {item.showUpload == false && (
                        <VText red semibold style={{ fontSize: 14, }}>{cultureResource.missingDocument}</VText>
                      )}
                    </View>
                  </View>
                  {item.showUpload == false && (

                    <TouchableOpacity onPress={() => { load(key) }} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Color.purple, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 15, justifyContent: 'center' }}>
                      <Ionicons name="cloud-upload-outline" size={17} color={Color.white} />
                      <VText white bold style={{ fontSize: 13, marginLeft: 5 }}>{cultureResource.uploadDocument}</VText>
                    </TouchableOpacity>
                  )}

                </TouchableOpacity>
              )
            })}

          </View>
        </ScrollView>
        <TouchableOpacity onPress={() => { navigation.navigate('MyDocumentShare', { data: { documentList: documentList } }) }} style={{ margin: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, backgroundColor: Color.purple, borderRadius: 30, }}>
          <SimpleLineIcons name="share-alt" size={17} color="white" />
          <VText semibold white style={{ fontSize: 15, marginLeft: 5 }}>{cultureResource.documentShare}</VText>
        </TouchableOpacity>
        {/* <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View> */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={visible}
          onRequestClose={() => { }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <MaterialCommunityIcons name='check' size={40} color={Color.green}></MaterialCommunityIcons>
              <VText medium style={{ marginTop: 20 }}>{cultureResource.modal}</VText>
              <VButton secondary style={{ paddingHorizontal: 40, paddingVertical: 10, marginTop: 25 }}
                onPress={() => { setVisible(false)}}>
                <VText white bold>{cultureStore.culture == 'tr' ? 'Tamam' : cultureStore.culture == 'en' ? 'OK' : cultureStore.culture == 'de' ? 'OK' : 'Tamam'}</VText>
              </VButton>
            </View>
          </View>
        </Modal>

      </View>
    )
  }
}

export default Index


const styles = StyleSheet.create({
  centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
  },
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
  button: {
      elevation: 2,
  },

});
