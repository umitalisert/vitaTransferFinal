import React from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import VText from '../VText'
import Color from '../Color'
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import call from 'react-native-phone-call'
const MyDriversComponents = ({ navigation }) => {
    function phoneCall(phone) {
        const args = {
            number: phone,
            prompt: false,
            skipCanOpen: true,
        };
        call(args).catch(console.error);
    };
    return (

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
            <View style={{ borderBottomWidth: 1, borderBottomColor: Color.greyBorder, marginVertical: 15 }}></View>
            <TouchableOpacity onPress={() => { navigation.navigate('DriverDocuments') }} style={{ borderRadius: 30, flexDirection: 'row', borderWidth: 1, borderColor: Color.purple, paddingVertical: 15, justifyContent: 'center' }}>
                <MaterialCommunityIcons name="file-document-multiple" size={18} color={Color.purple} />
                <VText bold style={{ color: Color.purple, fontSize: 13, textTransform: 'capitalize', marginLeft: 5 }}>Belgeler</VText>
            </TouchableOpacity>
        </View>
    )
}

export default MyDriversComponents