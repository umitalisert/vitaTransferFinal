import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { AntDesign } from '@expo/vector-icons';
import CarChangeComponent from '../../../../../components/ProfilMain/CarChange/CarChangeComponent';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import VText from '../../../../../components/VText';
import call from 'react-native-phone-call'
import Color from '../../../../../components/Color';
import Checkbox from 'expo-checkbox';
import { useState } from 'react';
import { Foundation } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
const Index = ({ navigation }) => {
  const [isChecked, setIsChecked] = useState();
  function phoneCall(phone) {
    const args = {
      number: phone,
      prompt: false,
      skipCanOpen: true,
    };
    call(args).catch(console.error);
  };
  return (

    <View style={{ flex: 1, backgroundColor: Color.white }}>
      <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center', paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => { navigation.goBack() }}>
          <AntDesign name="close" size={18} color="black" />
        </TouchableOpacity>
        <VText semibold style={{ fontSize: 19, marginLeft: 20 }}>Belge Paylaş</VText>
      </View>
      <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>
      <View style={{ paddingHorizontal: 20, paddingVertical: 20, borderBottomColor: Color.greyBorder, borderBottomWidth: 1 }}>
        <View style={{ backgroundColor: Color.white, borderRadius: 10, borderWidth: 1, borderColor: Color.greyBorder, paddingVertical: 16, paddingHorizontal: 15 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row' }}>
              <Image style={{ height: 48, width: 48, borderRadius: 24 }} source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }} />
              <View style={{ marginLeft: 10 }}>
                <VText bold style={{ fontSize: 18, textTransform: 'uppercase', marginBottom: 2 }}>Tarkan Yıldırım</VText>
                <VText semibold greyText style={{ fontSize: 13, textTransform: 'capitalize', marginBottom: 2 }}>+90 530 962 66 82</VText>
              </View>
            </View>
            <TouchableOpacity onPress={() => { phoneCall('05530580957') }} style={{ alignItems: 'center', backgroundColor: Color.purple, height: 40, width: 40, borderRadius: 20, justifyContent: 'center', backgroundColor: Color.purple }}>
              <View styyle={{}}>
                <FontAwesome5 name="phone-alt" size={18} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={{}}>
        <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomColor: Color.greyBorder, borderBottomWidth: 1 }}>
          <Checkbox style={{ margin: 8 }} value={isChecked} onValueChange={setIsChecked} />
          <View style={{ marginLeft: 10 }}>
            <VText bold style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>Ehliyet</VText>
            <VText greyText semibold style={{ fontSize: 14, }}>Geçerlilik Tarihi: 01.02.2028</VText>
          </View>
        </View>
        <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomColor: Color.greyBorder, borderBottomWidth: 1 }}>
          <Checkbox style={{ margin: 8 }} value={isChecked} onValueChange={setIsChecked} />
          <View style={{ marginLeft: 10 }}>
            <VText bold style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>Sabıka Kaydı</VText>
            <VText greyText semibold style={{ fontSize: 14, }}>Geçerlilik Tarihi: 01.02.2028</VText>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={() => { navigation.navigate('DriverDocumentShare') }} style={{ margin: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, backgroundColor: Color.purple, borderRadius: 30, }}>
        <SimpleLineIcons name="share-alt" size={18} color="white" />
        <VText semibold white style={{ fontSize: 15, marginLeft: 5 }}>Belge Paylaş</VText>
      </TouchableOpacity>
      <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>
    </View>
  )
}

export default Index