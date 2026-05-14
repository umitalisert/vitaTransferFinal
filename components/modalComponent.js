import React from 'react'
import { Text, TouchableOpacity, Modal, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Color from './Color';

const ModalComponent = ({ text, alertClose , cultureResource }) => {
    return (
        <Modal animationType="slide" transparent={true} visible={true}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(0, 0, 0, 0.5)',  }}>
                <View style={{ width: '80%', backgroundColor: '#FFFFFF', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, }}>
                    <View style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, alignItems: 'center', paddingTop: 12 }}>
                        <Ionicons name="alert-circle-outline" size={120} color="red" />
                    </View>
                    <View style={{ paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' }}>
                        <Text style={{ fontSize: 24,  marginBottom: 10 , fontWeight:'500' , color:Color.red }}>{cultureResource.warning}</Text>
                        <Text style={{ fontSize: 16,  textAlign: 'center' , fontWeight:'400' }}>{text}</Text>
                    </View>
                    <View style={{ marginVertical:16, marginHorizontal: 8, alignItems: 'center' }}>
                        <TouchableOpacity style={{ borderRadius: 5, backgroundColor: Color.primary, paddingVertical: 10, width: '50%' }} onPress={() => { alertClose() }}>
                            <Text style={{ fontSize: 16, color: '#FFFFFF', textAlign: 'center', textTransform: 'capitalize' }}>{cultureResource.ok}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default ModalComponent
