import { StyleSheet, View, ActivityIndicator, Dimensions, TouchableOpacity, FlatList, ScrollView, Platform, Image } from 'react-native'
import React, { useCallback, useMemo, useRef } from 'react'
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop
} from '@gorhom/bottom-sheet';
import { SvgUri } from 'react-native-svg';
import { AntDesign } from '@expo/vector-icons';
import useCultureStore from '../../../zustand/CultureStore';
import Color from '../../../components/Color';
import VText from '../../../components/VText';
import { useDispatch, useSelector } from 'react-redux';
import moment from "moment";
import { MaterialIcons } from '@expo/vector-icons';
import 'moment/min/locales';
import { setErrorMessage, setHasError, setLoading } from '../../../redux/slices/mainSlice';
import Accrument from '../../../services/vita/Accrument';
import AppLoading from '../../splash/AppLoading';
import { FontAwesome5 } from '@expo/vector-icons';
import { set } from 'firebase/database';
import { useFocusEffect } from '@react-navigation/native';
import useAuthStore from '../../../zustand/AuthStore';
import useResponseStore from '../../../zustand/ResponseStore';
import { SafeAreaView } from 'react-native-safe-area-context';
const Index = ({ }) => {
  const responseStore = useResponseStore((state) => state)
  const cultureStore = useCultureStore((state) => state);
  const authStore = useAuthStore((state) => state);
  const culture_en = {
    hello: 'Hello',
    pastTransfer: 'Past Transfers',
    change: 'Change',
    startDate: 'Start Date',
    endDate: 'End Date',
    noContent: 'There is no past transfers to show. Get to work and earn right away!',
    transferType1: 'One Way Trip',
    transferType2: 'Round Trip',
    transferType3: 'Private Driver',
    transferType4: 'Shuttle',
    earnings: 'Earnings',
    transfers: 'Transfers',
    passenger: 'Passenger',
  }
  const culture_tr = {
    hello: 'Merhaba',
    pastTransfer: 'Geçmiş Transferleriniz',
    change: 'Değiştir',
    startDate: 'Başlangıç Tarihi',
    endDate: 'Bitiş Tarihi',
    noContent: 'Gösterilecek geçmiş transfer yok. Hemen işe koyulun ve kazanın!',
    transferType1: 'Tek Yön Transfer',
    transferType2: 'Çift Yön',
    transferType3: 'Tahsis',
    transferType4: 'Shuttle',
    earnings: 'Kazançlar',
    transfers: 'Transferler',
    passsenger: 'Yolcu',
  }
  const culture_de = {
    hello: 'Hallo',
    pastTransfer: 'Ihre vergangenen Überweisungen',
    change: 'ändern',
    startDate: 'Anfangsdatum',
    endDate: 'Enddatum',
    noContent: 'Es sind keine vergangenen Transfers vorhanden. Machen Sie sich sofort an die Arbeit und verdienen Sie Geld!',
    transferType1: 'Einwegtrip',
    transferType2: 'Rundfahrt',
    transferType3: 'Chauffeur',
    transferType4: 'Shuttlebus',
    earnings: 'Verdienste',
    transfers: 'Überweisungen',
    passenger: 'Passagier',
  }
  const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);
  moment.locale(cultureStore.culture);
  const [startDate, setStartDate] = useState(moment().startOf('month'));
  const [endDate, setEndDate] = useState(moment().endOf('month'));
  const [startVisible, setStartVisible] = useState(false);
  const [endVisible, setEndVisible] = useState(false);
  const showStart = () => {
    setStartVisible(true);
  };

  const hideStart = () => {
    setStartVisible(false);
  };

  const handleStart = (date) => {
    setStartDate(moment(date))
    setStartVisible(false);
  };

  const showEnd = () => {
    setEndVisible(true);
  };
  const hideEnd = () => {
    setEndVisible(false);
    setSelectedDate()
  };
  const handleEnd = (date) => {
    setEndDate(moment(date))
    setEndVisible(false);
  };

  // useEffect(() => {
  //   list();
  // }, [startDate, endDate])
  useFocusEffect(
    useCallback(() => {
      list();
      return () => {
      };
    }, [startDate, endDate])
  );

  const dispatch = useDispatch();
  const available = useSelector((state) => state.driver.available);
  const toggleSwitch = () => dispatch(setAvailable(!available));
  const [workOrderData, setWorkOrderData] = useState({ workOrderCalendar: [], workOrderList: [], workOrdersSummary: { completed: 0, total: 0, waitingApprovement: 0 } });
  // const [startDate, setStartDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(startDate);
  const [invoiceData, setInvoiceData] = useState(null);
  const [priceTotal, setPriceTotal] = useState();
  const [transferTotal, setTransferTotal] = useState();
  function list() {
    dispatch(setLoading(true));
    Accrument.Get(moment(startDate).format('YYYY MM DD'), moment(endDate).format('YYYY MM DD'), cultureStore.culture).then(response => {
      if (response.data.responseCode == 200) {
        setInvoiceData(response.data.data)
        dispatch(setLoading(false));
      } else if (response.data.ResponseCode == 401) {
        responseStore.setRes401(true)
        responseStore.setResMessage(response.data.ResponseMessage)
        dispatch(setLoading(false));
      }
      else {
        dispatch(setLoading(false));
      }
    })
  }
  const bottomSheetModalRef = useRef();
  const bottomSheetModalApproveRef = useRef();
  const snapPoints = useMemo(() => ['50%'], []);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index) => {
  }, []);
  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.6}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );
  {/* {workOrderData != null && tabStatus == 1 && (
            workOrderData.workOrderList.map((item, key) => (
              <WorkOrderCard item={item} key={key} itemKey={key} cultureResource={cultureResource}></WorkOrderCard>
            ))
          )} */}
  // if (invoiceData==null) {
  //   return (
  //     <AppLoading></AppLoading>
  //   )
  // } else {
  //   return (

  //   )
  // }
  // useEffect(() => {
  //   let priceTotal = 0

  //   if (invoiceData != null) {
  //     setTransferTotal(invoiceData.length)
  //     invoiceData.map((item => {
  //       priceTotal += parseInt(item.price)
  //     }))
  //     setPriceTotal(priceTotal)
  //   }
  // }, [invoiceData])
  return (
    <>
      <View style={[styles.container, { paddingTop: Constants.statusBarHeight }]}>
        <SafeAreaView style={styles.container}>
          <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center', paddingHorizontal: 20, backgroundColor: Color.white }}>
            <VText semibold style={{ fontSize: 20, marginLeft: 20 }}>{cultureResource.pastTransfer}</VText>
          </View>
          <ScrollView style={{ backgroundColor: Color.lightBg, }}>
            <View style={styles.dateRangePickerWrapper}>
              <TouchableOpacity style={[styles.pickerItem, { borderRightWidth: 1, borderRightColor: Color.greyBorder }]} onPress={() => { showStart() }}>
                <VText darkGrey semiBold>{cultureResource.startDate}</VText>
                <VText primary semiBold style={{ fontSize: 22 }}>{startDate.format('DD.MM.YYYY')}</VText>
                <VText darkGrey semiBold>{cultureResource.change}</VText>
                <DateTimePickerModal
                  isVisible={startVisible}
                  mode="date"
                  onConfirm={handleStart}
                  onCancel={hideStart}
                  date={startDate.toDate()}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickerItem} onPress={() => { showEnd() }}>
                <VText darkGrey semiBold>{cultureResource.endDate}</VText>
                <VText primary semiBold style={{ fontSize: 22 }}>{endDate.format('DD.MM.YYYY')}</VText>
                <VText darkGrey semiBold>{cultureResource.change}</VText>
                <DateTimePickerModal
                  isVisible={endVisible}
                  mode="date"
                  onConfirm={handleEnd}
                  onCancel={hideEnd}
                  date={endDate.toDate()}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity></TouchableOpacity>

            {invoiceData != null && (
              <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 20, backgroundColor: Color.white, }}>
                <View style={{ borderRadius: 10, backgroundColor: Color.greyLight, flex: 1, marginRight: 10, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, }}>
                  <View style={{ height: 30, width: 30, borderRadius: 60, backgroundColor: 'white', marginBottom: 10, justifyContent: 'center', alignItems: 'center' }}>
                    <FontAwesome5 name="pager" size={16} color="black" />
                  </View>
                  <VText bold darkGrey style={{ fontSize: 13, marginBottom: 25 }}>{cultureResource.earnings}</VText>
                  <View>
                    {(invoiceData != undefined && invoiceData != null && invoiceData?.items?.length != 0) && (
                      invoiceData?.totalPrices?.map((item, index) => {
                        return (
                          <VText key={index} darkGrey bold style={{ fontSize: 22, }}>{item.price} {item.currencySymbol}</VText>
                        )
                      })
                    )}
                  </View>
                  {/* <VText darkGrey bold style={{ fontSize: 25, }}>{priceTotal}</VText> */}
                </View>
                <View style={{ borderRadius: 10, backgroundColor: Color.greyLight, flex: 1, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, }}>
                  <View style={{ height: 30, width: 30, borderRadius: 60, backgroundColor: 'white', marginBottom: 10, justifyContent: 'center', alignItems: 'center' }}>
                    <SvgUri uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/distance.svg' />
                  </View>
                  <VText bold darkGrey style={{ fontSize: 13, marginBottom: 25 }}>{cultureResource.transfers}</VText>
                  <VText darkGrey bold style={{ fontSize: 25, }}>{invoiceData.totalCount}</VText>
                </View>
              </View>
            )}

            <View style={{ paddingBottom: 150, }}>
              {(invoiceData != undefined && invoiceData != null && invoiceData?.items?.length != 0) && (
                invoiceData?.items?.map((item, index) => {
                  return (
                    <View key={index} style={{ backgroundColor: Color.greyLight, flex: 1, padding: 20, marginBottom: 5, }}>
                      <View style={{ backgroundColor: Color.white, flex: 1, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image style={{ marginRight: 10, height: 40, width: 40, borderRadius: 20 }} source={{ uri: item.facilityImage }}></Image>
                            <VText bold style={{ fontSize: 16 }}>{item.facilityName}</VText>
                          </View>
                          {item.price != 0 && (
                            <VText bold purple style={{ fontSize: 19 }}>{item.price}{item.currencySymbol}</VText>

                          )}
                        </View>
                        <View style={{ flex: 1, marginLeft: 30, padding: 10 }}>
                          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                            <View style={styles.workOrderHeaderDetailsTypeContainer}>
                              {item.transferType == 1 && (
                                <SvgUri uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/transfertype1.svg' />
                              )}
                              {item.transferType == 2 && (
                                <SvgUri uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/transfertype2.svg' />
                              )}
                              {item.transferType == 3 && (
                                <SvgUri uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/transfertype3.svg' />
                              )}
                              {item.transferType == 4 && (
                                <SvgUri uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/transfertype4.svg' />
                              )}
                              <VText numberOfLines={1} bold darkGrey style={{ fontSize: 16, marginLeft: 5 }}>
                                {item.transferType == 1 ? cultureResource.transferType1 : item.transferType == 2 ? cultureResource.transferType2 : item.transferType == 3 ? cultureResource.transferType3 : item.transferType == 4 ? cultureResource.transferType4 : cultureResource.transferType1}
                              </VText>
                            </View>
                          </View>

                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <SvgUri uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/distance.svg' />
                            <VText darkGrey bold style={{ fontSize: 14, marginLeft: 5 }}>{moment(item.date).format('Do MM YYYY, hh:mm')} - {moment(item.endDate).format('Do MM YYYY, hh:mm')}</VText>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <SvgUri uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/passenger.svg' />
                            <VText darkGrey bold style={{ fontSize: 14, marginLeft: 5 }}>{item.peopleCount} {cultureResource.passenger}</VText>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                            <SvgUri uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/duration.svg' />
                            <VText darkGrey bold style={{ fontSize: 14, marginLeft: 5 }}>{item.durationText}</VText>
                          </View>
                        </View>
                        <View style={{ marginTop: 5, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                          <Image style={{ height: 150, width: '100%', resizeMode: 'cover', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }} source={{ uri: item.routeImage }} />
                        </View>
                      </View>


                    </View>
                  )
                })

              )}
              {(invoiceData != undefined && invoiceData?.items?.length == 0) && (
                <View style={{
                  backgroundColor: Color.white, flex: 1, borderRadius: 10,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, paddingHorizontal: 20,
                  alignItems: 'center', paddingVertical: 15, borderWidth: 1, borderColor: Color.primary, margin: 20, flexDirection: 'row', justifyContent: 'center',
                }}>
                  <AntDesign name="warning" size={24} color="orange" />
                  <VText bold purple style={{ fontSize: 15, marginLeft: 10 }}>{cultureResource.noContent}</VText>
                </View>
              )
              }
            </View>

          </ScrollView>
        </SafeAreaView>
      </View>
      <StatusBar backgroundColor={Color.white} barStyle='dark-content'></StatusBar>
    </>
  )
}

export default Index

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Color.greyLight },
  headerContainer: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: Color.white, borderBottomColor: Color.greyLight, borderBottomWidth: 8 },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTitle: {
    flex: 1,
  },
  headerImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 100,
  },
  workOrderHeaderDetailsTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: Color.greyLight,
    marginTop: 10,
  },
  itemContainer: {
    borderBottomWidth: 1,
    borderColor: Color.greyBorder,
    paddingVertical: 10,
    marginVertical: 5,
  },
  headerImage: {
    width: 60,
    height: 60
  },
  ratingContainer: {
    backgroundColor: Color.dark,
    paddingVertical: 3,
    flexDirection: 'row',
    borderRadius: 5,
    paddingLeft: 5,
    width: 55
  },
  tabsContainer: {
    backgroundColor: Color.white,
    flexDirection: 'row',
    borderBottomColor: Color.greyLight,
    borderBottomWidth: 1
  },
  activeTab: {
    borderBottomColor: Color.purple,
    borderBottomWidth: 1,
  },
  tabItem: {
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 10,
    flex: 1
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10
  },
  headerButton: {
    flex: 1,
    backgroundColor: Color.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: 72,
  },
  chartContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 20
  },
  dateRangePickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.white,
    borderBottomWidth: 1,
    borderBottomColor: Color.greyBorder
  },

  backdrop: {
    position: 'absolute',
    backgroundColor: Color.black,
    zIndex: 3,
    elevation: 3,
    right: 0,
    width: '100%',
    height: '100%',
  },
  body: {
    paddingHorizontal: 30
  },
  title: {
    lineHeight: 36
  },
  callActionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Color.borderGrey,
    borderRadius: 10,
    marginBottom: 10
  },
  pickerItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20
  },
  viewOptionItem: {
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
  },
  sortOptionItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Color.purple,
    backgroundColor: Color.greyLight,
    borderRadius: 10,
    marginBottom: 10
  },
  filterHeader: {
    padding: 80,
    width: '100%',
    flexDirection: 'row',
  }
})

