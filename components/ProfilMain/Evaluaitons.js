import React from 'react'
import VText from '../VText'
import { Image, View } from 'react-native'
import Color from '../Color'

const Evaluaitons = () => {
    return (
        <View style={{ backgroundColor: Color.white, borderRadius: 10, borderWidth: 1, borderColor: Color.greyBorder, paddingVertical: 16, paddingHorizontal: 15 }}>
            <View style={{ flexDirection: 'row', marginBottom: 15, justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' , justifyContent:'center' }}>
                    <Image style={{ height: 48, width: 48, borderRadius: 24 }} source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }} />
                    <View style={{ marginLeft: 10 }}>
                        <VText bold style={{ fontSize: 15, textTransform: 'uppercase', marginBottom: 2 }}>Emin Eren</VText>
                        <VText semibold greyText style={{ fontSize: 13, textTransform: 'capitalize', marginBottom: 2 }}>Mercedes Sprinter</VText>
                    </View>
                </View>
                <VText semibold style={{ fontSize: 12, }}>1 gün önce</VText>
            </View>
            <View style={{}}>
                <VText semibold style={{ fontSize: 13, }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</VText>
            </View>
        </View>
    )
}

export default Evaluaitons