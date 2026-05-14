import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Color from '../../components/Color'

const Index = () => {
  return (
    <View style={{ flex: 1, backgroundColor: Color.white, justifyContent: 'center', alignItems: 'center' }}>
      <Image source={require('../../assets/splash.png')} style={{resizeMode:'center', width:'100%', aspectRatio:1, height:undefined}} />
    </View>
  )
}

export default Index

const styles = StyleSheet.create({})