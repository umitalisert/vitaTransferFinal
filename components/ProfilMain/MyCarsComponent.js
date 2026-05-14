import React from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import VText from '../VText'
import Color from '../Color'
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
const MyCarsComponent = ({ navigation  , item  , keyItem , cultureResource}) => {
    const windowWidth = Dimensions.get('window').width;
    // const windowHeight = Dimensions.get('window').height;
    return (
        <View key={keyItem}  style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: Color.white, borderRadius: 10, borderWidth: 1, borderColor: Color.greyBorder, paddingVertical: 16, paddingHorizontal: 15,  shadowColor: '#000',shadowOffset: { width: 0,height: 2, },shadowOpacity: 0.25,shadowRadius: 4,elevation: 5, width: (windowWidth / 10) * 8,marginRight:10 }}>
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
                <View style={{ borderBottomWidth: 1, borderBottomColor: Color.greyBorder, marginVertical: 15 }}></View>
                <TouchableOpacity onPress={() => { navigation.navigate('CarDocuments' ,  { data: {item } }) }} style={{ borderRadius: 30, flexDirection: 'row', borderWidth: 1, borderColor: Color.purple, paddingVertical: 15, justifyContent: 'center' }}>
                    <MaterialCommunityIcons name="file-document-multiple" size={18} color={Color.purple} />
                    <VText bold style={{ color: Color.purple, fontSize: 13, textTransform: 'capitalize', marginLeft: 5 }}>{cultureResource.document}</VText>
                </TouchableOpacity>
            </View>
            
           
        </View>


    )
}

export default MyCarsComponent