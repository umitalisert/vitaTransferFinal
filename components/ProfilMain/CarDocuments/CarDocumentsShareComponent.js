import React, { useCallback, useMemo, useReducer, useRef, useState, } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet, Modal, Linking } from 'react-native';
import VText from '../../VText';
import Color from '../../Color';
import moment from "moment";
import VButton from '../../VButton';
import useCultureStore from '../../../zustand/CultureStore';
import Checkbox from 'expo-checkbox';

const CarDocumentShareComponent = ({ item, keyItem,  isChecked , checked , navigation }) => {
    const x = true;
    const cultureStore = useCultureStore((state) => state);
    const [change, setChange] = useState(false);

    return (
        <>
            <TouchableOpacity key={keyItem} onPress={() => { checked(keyItem , item.url)}} style={{ padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomColor: Color.greyBorder, borderBottomWidth: 1 }}>
                {/* <View style={{ backgroundColor: 'rgba(28, 201, 97, 0.1)', padding: 12, justifyContent: 'center', borderRadius: 5 }}>
                    <MaterialCommunityIcons style={{}} name="file-check" size={17} color="lightgreen" />
                </View> */}
                <Checkbox disabled={true} style={{ margin: 8 }} value={isChecked}/>
                <View style={{ marginLeft: 10 }}>
                    <VText bold style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>{item.name}</VText>
                    {item.isTerm && (
                        <VText greyText semibold style={{ fontSize: 14, }}>Geçerlilik Tarihi:{moment(item.expireDate).format('LL')} </VText>
                    )}
                    {item.isTerm == false && (
                        <VText greyText semibold style={{ fontSize: 14, }}>Geçerlilik Tarihi: Süresiz</VText>
                    )}
                </View>
            </TouchableOpacity>
            {/* <BottomSheetModalProvider style={{ flex: 1, zIndex: 10 }}>
                <BottomSheetModal
                    enableDismissOnClose={true}
                    ref={bottomSheetModalRef}
                    index={0}
                    snapPoints={snapPoints}
                    backdropComponent={renderBackdrop}
                    onChange={handleSheetChanges}
                >
                    <WebView source={{ uri: 'https://www.africau.edu/images/default/sample.pdf' }} style={{ width: '100%' }} />
                </BottomSheetModal>
            </BottomSheetModalProvider> */}
        </>
    )
}

export default CarDocumentShareComponent

const styles = StyleSheet.create({
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
})