import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import List from './List'
import Detail from './Detail'

const Stack = createNativeStackNavigator();

const Index = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="List" component={List} options={{ headerShown: false }} />
      <Stack.Screen name="Detail" component={Detail} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

export default Index

const styles = StyleSheet.create({})