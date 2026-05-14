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
import Color from '../../../../components/Color';
import VText from '../../../../components/VText';

const Index = ({ navigation }) => {

  return (

    <View style={{ flex: 1, backgroundColor: Color.white }}>
      <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center', paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => { navigation.goBack() }}>
          <AntDesign name="arrowleft" size={20} color="black" />
        </TouchableOpacity>
        <VText semibold style={{ fontSize: 19, marginLeft: 20 }}>Yakıt Kartı</VText>
      </View>
      <View style={{ borderBottomColor: Color.greyBorder, borderBottomWidth: 1, }}></View>
     <View style={{backgroundColor:Color.greyLight , padding:20}}>
        <View style={{backgroundColor:Color.purple , padding:15}}>

        </View>
     </View>
    </View>
  )


};

export default Index