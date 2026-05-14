// import {
//     BottomSheetModal,
//     BottomSheetModalProvider,
//     BottomSheetBackdrop
// } from '@gorhom/bottom-sheet';
// import { SvgUri } from 'react-native-svg';
// import { MaterialIcons } from '@expo/vector-icons';
// import { useMemo } from 'react';
// import { useCallback } from 'react';
// import React, { useEffect, useRef, useState } from 'react'
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { Image, TouchableOpacity, View, StyleSheet, Text } from 'react-native';
// import VText from '../../../components/VText';
// import VButton from '../../../components/VButton';
// import Color from '../../../components/Color';
// import { Fontisto } from '@expo/vector-icons';
// import { Ionicons } from '@expo/vector-icons';
// import { FontAwesome } from '@expo/vector-icons';
// import { AntDesign } from '@expo/vector-icons';
// import { Entypo } from '@expo/vector-icons';
// const NewJobOffer = () => {
//     const bottomSheetModalRef = useRef();
//     const snapPoints = useMemo(() => ['100%'], []);
//     const handleSheetChanges = useCallback((index) => {
//     }, []);
//     const x = true;
//     const renderBackdrop = useCallback(
//         props => (
//             <BottomSheetBackdrop
//                 {...props}
//                 opacity={0.6}
//                 disappearsOnIndex={-1}
//                 appearsOnIndex={0}
//             />
//         ),
//         []
//     );
//     return (
//         <>

//             <View>
//                 <TouchableOpacity onPress={() => { bottomSheetModalRef.current?.present() }}><Text>aşlskjdşlaskdşal</Text></TouchableOpacity>
//             </View>
//             <BottomSheetModalProvider style={{ flex: 1, zIndex: 10 }}>
//                 <BottomSheetModal
//                     enableDismissOnClose={true}
//                     ref={bottomSheetModalRef}
//                     index={0}
//                     snapPoints={snapPoints}
//                     backdropComponent={renderBackdrop}
//                     onChange={handleSheetChanges}
//                 >
//                     <View style={styles.container}>
//                         <View style={styles.headerContainer}>
//                             <View style={styles.headerTitle}>
//                                 <VText bold style={styles.headerTitleText}>Yeni bir iş teklifi!</VText>
//                                 <VText medium greyText style={styles.headerBodyText}>Lütfen iş teklifi detaylarını inceledikten sonra cevap verin.</VText>
//                             </View>
//                             <View style={{ borderWidth: 1, flex: 1 }}>
//                                 {/*icon gelecek */}
//                             </View>
//                         </View>
//                         <View style={styles.bodyContainer}>
//                             <View style={styles.topContainer}>
//                                 <View style={styles.transferSummaryHeader}>
//                                     <View style={styles.timeContainer}>
//                                         <View style={styles.begining}>
//                                             <VText bold greyText style={{ fontSize: 12, marginBottom: 6 }}>BAŞLANGIÇ</VText>
//                                             <VText bold style={{ fontSize: 19 }}>13.30</VText>
//                                         </View>
//                                         <View style={styles.timeContainerIcon}>
//                                             <MaterialIcons name="watch-later" size={16} color="black" />
//                                         </View>
//                                         <View style={styles.finish}>
//                                             <VText bold greyText style={{ marginBottom: 6, fontSize: 11 }}>BİTİŞ</VText>
//                                             <VText bold style={{ fontSize: 18 }}>14:20</VText>
//                                         </View>
//                                     </View>
//                                     <View style={styles.progressPayment}>
//                                         <View style={styles.progressPaymentIcon}>
//                                             <MaterialIcons name="watch-later" size={16} color="black" />
//                                         </View>
//                                         <View style={styles.paymentPaymentContainer}>
//                                             <VText bold greyText style={{ fontSize: 12, marginBottom: 6 }}>HAKEDİŞ</VText>
//                                             <VText bold style={{ fontSize: 19 }}>125TL</VText>
//                                         </View>
//                                     </View>
//                                 </View>
//                                 <View style={styles.transferSummaryBody}>
//                                     <Image source={{ uri: '' }} style={{ height: 32, width: 32, backgroundColor: Color.black, resizeMode: 'contain', borderRadius: 16 }} />
//                                     <VText bold style={{ fontSize: 15, marginLeft: 8 }}>Beymen Kanyon AVM</VText>
//                                 </View>
//                                 <View style={{ flexDirection: 'row', }}>
//                                     <View style={{ flexDirection: 'row', borderRadius: 16, backgroundColor: Color.greyLight, paddingHorizontal: 8, alignItems: 'center', paddingVertical: 4 }}>
//                                         <MaterialIcons name="arrow-right-alt" size={18} color="#404C5B" />
//                                         <VText darkGrey semibold style={{ marginLeft: 5, fontSize: 13, }}>Tek Yön Transfer</VText>
//                                     </View>
//                                     <View style={{ flexDirection: 'row', borderRadius: 16, backgroundColor: Color.greyLight, paddingHorizontal: 8, marginLeft: 8, alignItems: 'center', paddingVertical: 4 }}>
//                                         <MaterialCommunityIcons name="card-bulleted-outline" size={18} color="#404C5B" />
//                                         <VText semibold darkGrey style={{ marginLeft: 5 }}>Araçta Kartla Ödeme</VText>
//                                     </View>
//                                 </View>
//                                 {/* <View style={styles.transferSummaryFooter}>
//                   <View style={styles.transfer}>
//                     <MaterialIcons name="arrow-right-alt" size={18} color="#404C5B" />
//                     <Text style={styles.transferText}></Text>
//                   </View>
//                   <View style={styles.paymentPick}>
//                     <MaterialIcons name="arrow-right-alt" size={18} color="#404C5B" />
//                     <Text style={styles.paymentPickText}></Text>
//                   </View>
//                 </View> */}
//                             </View>
//                             <View style={styles.midContainer}>
//                                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, }}>
//                                     <View style={styles.kmContainer}>
//                                         <MaterialIcons name="arrow-right-alt" size={16} color={Color.greyText} />
//                                         <VText style={{ fontSize: 12, marginLeft: 8 }}>1.2KM</VText>
//                                     </View>
//                                     <View style={styles.minuteContainer}>
//                                         <Fontisto name="stopwatch" size={16} color={Color.greyText} />
//                                         <VText bold style={{ fontSize: 12, marginLeft: 8 }}>30DK</VText>
//                                     </View>
//                                     <View style={styles.passengerContainer}>
//                                         <Ionicons name="person" size={16} color={Color.greyText} />
//                                         <VText bold style={{ fontSize: 12, marginLeft: 8 }}>2 Yolcu</VText>
//                                     </View>
//                                 </View>
//                                 <View style={{ borderWidth: 1, borderColor: Color.greyBorder, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 16, }}>
//                                     <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'space-between' }}>
//                                         <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
//                                             <Ionicons name="triangle-sharp" size={11} color="black" />
//                                             <View style={{ marginLeft: 10 }}>
//                                                 <VText bold greyText style={{ fontSize: 12, marginBottom: 7 }}>ALINIŞ NOKTASI</VText>
//                                                 <VText bold style={{ fontSize: 13, }}>Dereboyu kavaklar açsın yeşil yapraklar</VText>
//                                             </View>
//                                         </View>
//                                         <View style={{ marginLeft: 20 }}>
//                                             <VText bold style={{ fontSize: 13 }}>13.35</VText>
//                                         </View>
//                                     </View>
//                                     <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
//                                         <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
//                                             <FontAwesome name="stop" size={11} color="black" />
//                                             <View style={{ marginLeft: 10 }}>
//                                                 <VText bold greyText style={{ fontSize: 12, marginBottom: 7 }}>BIRAKILIŞ SAATİ</VText>
//                                                 <VText bold style={{ fontSize: 13 }}>Palanga caddesi Emirhan sokak</VText>
//                                             </View>
//                                         </View>
//                                         <View style={{ marginLeft: 20 }}>
//                                             <VText bold style={{ fontSize: 13 }}>14:20</VText>
//                                         </View>
//                                     </View>
//                                 </View>
//                             </View>
//                             <View style={styles.bottomContainer}>
//                                 <View style={styles.buttonContainer}>
//                                     <TouchableOpacity style={{ flexDirection: 'row', borderWidth: 1, borderRadius: 30, borderColor: Color.greyBorder, flex: 1, marginRight: 10, justifyContent: 'center', paddingVertical: 14, alignItems: 'center' }} onPress={() => { }}>
//                                         <AntDesign name="close" size={15} color="red" />
//                                         <VText semibold red style={{ fontSize: 13, marginLeft: 5 }}>Reddet</VText>
//                                     </TouchableOpacity>
//                                     <TouchableOpacity style={{ flexDirection: 'row', borderRadius: 25, flex: 1, backgroundColor: Color.green, justifyContent: 'center', paddingVertical: 14, alignItems: 'center' }} onPress={() => { }}>
//                                         <AntDesign name="check" size={15} color="white" />
//                                         <VText semibold white style={{ fontSize: 13, marginLeft: 5 }}>Kabul Et</VText>
//                                     </TouchableOpacity>
//                                 </View>
//                                 <TouchableOpacity style={{ flexDirection: 'row', borderWidth: 1, borderRadius: 30, borderColor: Color.greyBorder, justifyContent: 'center', paddingVertical: 14, marginTop: 10, alignItems: 'center', }} onPress={() => { }}>
//                                     <Entypo name="dots-three-horizontal" size={13} color="#7162EC" />
//                                     <VText bold purple style={{ fontSize: 13, marginLeft: 5 }}>Detaylar</VText>
//                                 </TouchableOpacity>
//                             </View>
//                         </View>
//                     </View>
//                     <SvgUri uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/uedts.svg'></SvgUri>
//                 </BottomSheetModal>
//             </BottomSheetModalProvider>
//         </>
//     )
// }


// export default NewJobOffer


// const styles = StyleSheet.create({
//     container: {
//         flex: 1,

//     },
//     headerContainer: {
//         flexDirection: 'row',
//         marginHorizontal: 20,
//         marginVertical: 10
//     },
//     headerTitle: {
//         flex: 3,
//         justifyContent: 'center',
//         marginRight: 16,
//         marginVertical: 9.5
//     },
//     headerTitleText: {
//         fontSize: 24,
//         marginBottom: 10,
//         marginRight: 15
//     },
//     headerBodyText: {
//         fontSize: 14,
//         paddingRight: 10

//     },
//     bodyContainer: {
//         flex: 1,
//         borderWidth: 1,
//         borderRadius: 10,
//         marginVertical: 10,
//         marginHorizontal: 10,
//         padding: 15,
//         borderColor: Color.greyBorder

//     },
//     topContainer: {

//         borderBottomWidth: 1,
//         borderBottomColor: Color.greyBorder,
//         paddingBottom: 15
//     },
//     transferSummaryHeader: {
//         flexDirection: 'row',
//     },
//     timeContainer: {
//         flexDirection: 'row',
//         flex: 2,
//         borderWidth: 1,
//         borderRadius: 10,
//         borderColor: Color.greyBorder,
//         marginRight: 8,
//         justifyContent: 'space-between',
//         paddingVertical: 12,
//         paddingHorizontal: 10
//     },
//     timeContainerIcon: {
//         paddingHorizontal: 13,
//         justifyContent: 'center'
//     },
//     progressPayment: {
//         flexDirection: 'row',
//         flex: 1,
//         borderWidth: 1,
//         borderRadius: 10,
//         borderColor: Color.greyBorder,
//         padding: 10,
//         paddingVertical: 12,
//         paddingHorizontal: 10
//     },
//     progressPaymentIcon: {
//         justifyContent: 'center',
//         marginRight: 12,

//     },
//     midContainer: {
//         marginTop: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: Color.greyBorder,
//         paddingBottom: 21
//     },
//     bottomContainer: {
//         marginTop: 15,
//     },
//     transferSummaryBody: {
//         flexDirection: 'row',
//         marginTop: 20,
//         marginBottom: 15,
//         alignItems: 'center'
//     },
//     kmContainer: {
//         borderWidth: 1,
//         borderRadius: 5,
//         paddingVertical: 8,
//         borderColor: Color.greyBorder,
//         flex: 1,
//         paddingHorizontal: 8,
//         flexDirection: 'row',
//         justifyContent: 'flex-start',
//         alignItems: 'center',
//         marginRight: 8,
//     },
//     minuteContainer: {
//         borderWidth: 1,
//         borderRadius: 5,
//         paddingVertical: 8,
//         borderColor: Color.greyBorder,
//         flex: 1,
//         paddingHorizontal: 8,
//         flexDirection: 'row',
//         justifyContent: 'flex-start',
//         alignItems: 'center',
//         marginRight: 8,
//     },
//     passengerContainer: {
//         borderWidth: 1,
//         borderRadius: 5,
//         paddingVertical: 8,
//         borderColor: Color.greyBorder,
//         flex: 1,
//         paddingHorizontal: 8,
//         flexDirection: 'row',
//         justifyContent: 'flex-start',
//         alignItems: 'center',

//     },
//     buttonContainer: {
//         flexDirection: 'row',

//     },

// }
// )