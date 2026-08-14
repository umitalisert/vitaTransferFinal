import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Color from '../../../components/Color';
import VText from '../../../components/VText';
import useCultureStore from '../../../zustand/CultureStore';

const CultureSelection = ({ navigation }) => {
    const cultureStore = useCultureStore((state) => state);
    function selectCulture(culture) {
        cultureStore.setCulture(culture);
        navigation.goBack();
    }
    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => { navigation.goBack() }}>
                        <MaterialCommunityIcons name='arrow-left' size={34} color={Color.black}></MaterialCommunityIcons>
                    </TouchableOpacity>
                </View>
                <View style={styles.body}>
                    <VText bold style={styles.title}>{
                        cultureStore.culture == 'tr' ? 'Dil Seçimi'
                            : cultureStore.culture == 'en' ? 'Language Preferences'
                                : cultureStore.culture == 'de' ? 'Spracheinstellungen'
                                    : 'Dil Seçimi'}
                    </VText>
                    <View style={{ marginTop: 25 }}>
                        <TouchableOpacity onPress={() => { selectCulture('tr') }} style={styles.cultureContainer}>
                            <Image style={{ marginRight: 10 }} source={require('../../../assets/screens/account/appintro/tr.png')}></Image>
                            <VText bold style={{ fontSize: 14 }}>Türkçe</VText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { selectCulture('en') }} style={styles.cultureContainer}>
                            <Image style={{ marginRight: 10 }} source={require('../../../assets/screens/account/appintro/en.png')}></Image>
                            <VText bold style={{ fontSize: 14 }}>English</VText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { selectCulture('de') }} style={styles.cultureContainer}>
                            <Image style={{ marginRight: 10 }} source={require('../../../assets/screens/account/appintro/de.png')}></Image>
                            <VText bold style={{ fontSize: 14 }}>Deutsch</VText>
                        </TouchableOpacity>
                    </View>
                </View>

            </SafeAreaView>
        </View>
    )
}

export default CultureSelection

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.base
    },
    header: {
        paddingHorizontal: 25,
        paddingVertical: 30,
        flexDirection: 'row'
    },
    title: { fontSize: 22 },
    body: {
        paddingHorizontal: 30
    },
    cultureContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Color.purple,
        backgroundColor: Color.greyLight,
        borderRadius: 10,
        marginBottom: 10
    }
})