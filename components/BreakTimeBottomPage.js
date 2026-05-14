import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import Color from './Color'
import AntDesign from '@expo/vector-icons/AntDesign';
import CountDownTimerMenu from './CountDownTimerMenu';
import Ionicons from '@expo/vector-icons/Ionicons';
import moment from 'moment';

const BreakTimeBottomPage = ({ item, cultureResource, changeDriverStatus, breakEnd, breakSheetRefAnd, currentStatusText, cancelBreakStatus }) => {
    console.log(breakEnd)
    const date = moment()
    // breakEnd = item.title == currentStatusText ? breakEnd : null;

    function start() {
        changeDriverStatus(item.id)
    }
    function stop() {
        if (item.title == currentStatusText) {
            cancelBreakStatus(item.id)
        }
    }

    //Seçenek 1 Yemek molası 
    //Kullanıldı => item.maxCount==item.usedCount ve breakEnd == null ve 
    //Sayaç => item.maxCount!=item.usedCount ve breakEnd !=null ve item.title==currentStatusText
    //Başla => item.maxCount != item.usedCount ve breakEnd ==null  
    //Bitir => item.maxCount != item.usedCount ve breakEnd ==null 
    // item.maxCount==item.usedCount ve breakEnd == null ve breakEnd
    //1 yemek molası =>>> 

    return (
        <View style={{ backgroundColor: Color.white }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: Color.greyBorder, paddingHorizontal: 16, paddingVertical: 8, }}>
                <View style={{ flex: 1.2 }}>
                    <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 20, paddingVertical: 8 }}>{item.title}</Text>
                    <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: Color.greyText }}>{item.description}</Text>
                </View>
                {(item.maxCount == item.usedCount && breakEnd == null) && (
                    <TouchableOpacity disabled={true} onPress={() => { }} style={{ flex: 0.4, alignItems: 'center', padding: 8, borderRadius: 30, backgroundColor: Color.greyText, flexDirection: 'row', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: Color.white }}>Kullanıldı</Text>
                    </TouchableOpacity>
                )}
                {(item.maxCount == item.usedCount && breakEnd != null && item.title == currentStatusText) && (
                    moment(breakEnd).isAfter(moment()) && (

                        <TouchableOpacity onPress={() => { stop() }} style={{ flex: 0.5, alignItems: 'center', paddingVertical: 8, borderRadius: 30, backgroundColor: Color.green, flexDirection: 'row', justifyContent: 'center' }}>
                            <Ionicons name="stop-circle-outline" size={18} color="white" />
                            <CountDownTimerMenu onExpire={() => { stop() }} workOrderData={breakEnd} />
                        </TouchableOpacity>
                    )
                )}
                {(item.maxCount != item.usedCount) && (
                    <>
                        {(moment(breakEnd).isAfter(moment()) && item.title == currentStatusText) && (
                            <TouchableOpacity onPress={() => { stop() }} style={{ flex: 0.5, alignItems: 'center', paddingVertical: 8, borderRadius: 30, backgroundColor: Color.green, flexDirection: 'row', justifyContent: 'center' }}>
                                <Ionicons name="stop-circle-outline" size={14} color="white" />
                                <CountDownTimerMenu onExpire={() => { stop() }} workOrderData={breakEnd} />
                            </TouchableOpacity>
                        )}
                        {breakEnd == null && (
                            <TouchableOpacity onPress={() => { start() }} style={{ flex: 0.5, alignItems: 'center', paddingVertical: 8, borderRadius: 30, backgroundColor: Color.green, flexDirection: 'row', justifyContent: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Image source={require('../assets/play-button.png')} style={{ width: 12, height: 12, marginRight: 3 }} />
                                    <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: Color.white }}>{cultureResource.startBreakTime}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </View>
        </View>
    )
}

export default BreakTimeBottomPage;