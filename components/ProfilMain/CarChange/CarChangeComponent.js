import React, { useState } from 'react'
import { Image, TouchableOpacity, View, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import VText from '../../VText';
import Color from '../../Color';

const CarChangeComponent = ({ navigation, itemKey, item ,pickItem , isChecked  , pickItemId}) => {
    return (
        <TouchableOpacity onPress={() => {pickItem(itemKey)  , pickItemId(item.id)}}  style={isChecked==true ? styles.pickContainer : styles.container}>
            <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                <Image style={{ height: 48, width: 48, }} source={{ uri: item.brandLogo }} />
                <View style={{ marginLeft: 10 }}>
                    <VText bold style={{ fontSize: 19, textTransform: 'uppercase', marginBottom: 2 }}>{item.plate}</VText>
                    <VText semibold greyText style={{ fontSize: 13, textTransform: 'capitalize', marginBottom: 2 }}>{item.brand}</VText>
                </View>
            </View>
            <View style={{ flexDirection: 'row', marginRight: 13 }}>
                <View style={{ flexDirection: 'row', backgroundColor: Color.greyLight, borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8, marginRight: 5 }}>
                    <MaterialIcons name="date-range" size={15} color="black" />
                    <VText semibold style={{ fontSize: 12, color: Color.darkGrey, marginLeft: 4 }}>{item.modelYear}</VText>
                </View>
                <View style={{ flexDirection: 'row', backgroundColor: Color.greyLight, marginRight: 5, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10 }}>
                    <Ionicons name="person" size={15} color="black" />
                    <VText semibold style={{ fontSize: 12, color: Color.darkGrey, marginLeft: 4 }}>{item.capacity}</VText>
                </View>
                {/* <View style={{ flexDirection: 'row', backgroundColor: Color.greyLight, marginRight: 5, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10 }}>
                    <MaterialCommunityIcons name="fuel" size={15} color="black" />
                    <VText semibold style={{ fontSize: 12, color: Color.darkGrey, textTransform: 'capitalize', marginLeft: 4 }}>Dizel</VText>
                </View> */}
            </View>
        </TouchableOpacity>
    )
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: Color.white, borderRadius: 10, borderWidth: 1, borderColor: Color.greyBorder, paddingVertical: 20, paddingHorizontal: 15, marginTop: 10 ,  shadowColor: '#000',shadowOffset: { width: 0,height: 2, },shadowOpacity: 0.25,shadowRadius: 4,elevation: 5,
    },
    pickContainer: {
        backgroundColor: Color.white, borderRadius: 10, borderWidth: 1, borderColor: Color.greyBorder, paddingVertical: 20, paddingHorizontal: 15, marginTop: 10, borderWidth: 1, borderColor: Color.purple ,  shadowColor: '#000',shadowOffset: { width: 0,height: 2, },shadowOpacity: 0.25,shadowRadius: 4,elevation: 5,
    }
})

export default CarChangeComponent