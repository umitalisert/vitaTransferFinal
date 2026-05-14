import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import Color from './Color'
import VText from './VText'
import VButton from './VButton'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SvgUri } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../redux/slices/mainSlice'
import WorkOrder from '../services/vita/WorkOrder'
import { useNavigation } from '@react-navigation/native'
import useCultureStore from '../zustand/CultureStore';
import { MaterialIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import useProfileStore from '../zustand/ProfileStore'
import useAuthStore from '../zustand/AuthStore'
import ModalComponent from './modalComponent'
import useResponseStore from '../zustand/ResponseStore'

const WorkOrderCard = ({ item, itemKey, cultureResource }) => {
  const responseStore= useResponseStore((state)=>state)
  
  const dispatch = useDispatch();
  const cultureStore = useCultureStore((state) => state);
  const [isAccepted, setIsAccepted] = useState(item.isAccepted);
  const navigation = useNavigation();
  const profileStore = useProfileStore((state) => state);
  const authStore = useAuthStore((state) => state);
  function updateWorkOrderOfferStatus(id, status) {
    dispatch(setLoading(true));
    const data = {
      id: id,
      status: status
    }
    WorkOrder.UpdateWorkOrderOfferStatus(data, cultureStore.culture).then(response => {
      if (response.status == 200) {
        if (response.data.responseCode == 200) {
          dispatch(setLoading(false));
          setIsAccepted(data.status ? 1 : -1);
        }
        else if (response.data.ResponseCode == 401) {
          responseStore.setResMessage(response.data.ResponseMessage)
          responseStore.setRes401(true)
          dispatch(setLoading(false));
        }

        else {
          dispatch(setHasError(true));
          dispatch(setErrorMessage(response.data.responseMessage));
          dispatch(setLoading(false));
        }
      }
      else {
        dispatch(setHasError(true));
        dispatch(setErrorMessage(cultureStore.culture == 'tr' ? 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.' : cultureStore.culture == 'en' ? 'An unexpected error occured. Please try again later.' : cultureStore.culture == 'de' ? 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' : 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.'));
        dispatch(setLoading(false));
      }
    });
  }

  return (
    <>
      <View key={'workOrder' + itemKey} style={styles.workOrder}>
        <View key={'workOrderHeaderContainer' + itemKey} style={styles.workOrderHeaderContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View key={'workOrderHeader' + itemKey} style={styles.workOrderHeader}>
              <View key={'workOrderHeaderTitleContainer' + itemKey} style={styles.workOrderHeaderTitleContainer}>
                <View key={'workOrderHeaderImage' + itemKey} style={styles.workOrderHeaderImageContainer}>
                  <Image key={'facilityImage' + itemKey} style={styles.workOrderHeaderImage} source={{ uri: item.facilityImage }}></Image>
                </View>
                <View key={'workOrderHeaderTitle' + itemKey} style={styles.workOrderHeaderTitle}>
                  <VText numberOfLines={1} key={'facilityName' + itemKey} bold style={{ fontSize: 16 }}>{item.facilityName}</VText>
                </View>
              </View>
              {/* <View key={'workOrderPriceContainer' + itemKey}>
            <VText bold style={{ fontSize: 24 }} numberOfLines={1}>{item.priceText == '0,00 TL' ? '' : item.priceText}</VText>
          </View> */}
            </View>
            <View key={'workOrderHeaderDetailsContainer' + itemKey} style={styles.workOrderHeaderDetailsContainer}>
              {item.status == -2 && isAccepted == 1 && (
                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={[styles.workOrderHeaderDetailsTimeContainer, { backgroundColor: Color.white, borderWidth: 1, borderColor: Color.red }]}>
                  <MaterialCommunityIcons key={'workOrderHeaderDetailsTimeIconContainer' + itemKey} name='account-alert-outline' size={22} color={Color.red}></MaterialCommunityIcons>
                  <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold red style={{ fontSize: 16, marginLeft: 5 }}>{cultureResource.noshow}</VText>
                </View>
              )}
              {item.status == -3 && isAccepted == 1 && (
                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={[styles.workOrderHeaderDetailsTimeContainer, { backgroundColor: Color.red }]}>
                  <MaterialCommunityIcons key={'workOrderHeaderDetailsTimeIconContainer' + itemKey} name='alert' size={22} color={Color.white}></MaterialCommunityIcons>
                  <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold white style={{ fontSize: 16, marginLeft: 5 }}>{cultureResource.canceled}</VText>
                </View>
              )}
              {item.status == 0 && isAccepted == 1 && (
                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={[styles.workOrderHeaderDetailsTimeContainer, { backgroundColor: Color.primary }]}>
                  <MaterialCommunityIcons key={'workOrderHeaderDetailsTimeIconContainer' + itemKey} name='progress-clock' size={22} color={Color.white}></MaterialCommunityIcons>
                  <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold white style={{ fontSize: 16, marginLeft: 5 }}>{cultureResource.willBegin}</VText>
                </View>
              )}
              {item.status == 1 && isAccepted == 1 && (
                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={[styles.workOrderHeaderDetailsTimeContainer, { backgroundColor: Color.green }]}>
                  <MaterialCommunityIcons key={'workOrderHeaderDetailsTimeIconContainer' + itemKey} name='check' size={22} color={Color.white}></MaterialCommunityIcons>
                  <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold white style={{ fontSize: 16, marginLeft: 5 }}>{cultureResource.hasCompleted}</VText>
                </View>
              )}
              {item.status == 2 && isAccepted == 1 && (
                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={[styles.workOrderHeaderDetailsTimeContainer, { backgroundColor: Color.white, borderWidth: 1, borderColor: Color.yellow }]}>
                  <MaterialCommunityIcons key={'workOrderHeaderDetailsTimeIconContainer' + itemKey} name='clock-alert-outline' size={22} color={Color.yellow}></MaterialCommunityIcons>
                  <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold black style={{ fontSize: 16, marginLeft: 5 }}>{cultureResource.late}</VText>
                </View>
              )}
              {item.status == 3 && isAccepted == 1 && (
                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={[styles.workOrderHeaderDetailsTimeContainer, { backgroundColor: Color.primary }]}>
                  <MaterialCommunityIcons key={'workOrderHeaderDetailsTimeIconContainer' + itemKey} name='clock-check-outline' size={22} color={Color.white}></MaterialCommunityIcons>
                  <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold white style={{ fontSize: 16, marginLeft: 5 }}>{cultureResource.started} </VText>
                </View>
              )}
              {item.status == 4 && isAccepted == 1 && (
                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={[styles.workOrderHeaderDetailsTimeContainer, { backgroundColor: Color.primary }]}>
                  <MaterialCommunityIcons key={'workOrderHeaderDetailsTimeIconContainer' + itemKey} name='account-check-outline' size={22} color={Color.white}></MaterialCommunityIcons>
                  <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold white style={{ fontSize: 16, marginLeft: 5 }}>{cultureResource.passengerRecieved} </VText>
                </View>
              )}
              {item.status == 5 && isAccepted == 1 && (
                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={[styles.workOrderHeaderDetailsTimeContainer, { backgroundColor: Color.white, borderWidth: 1, borderColor: Color.red }]}>
                  <MaterialCommunityIcons key={'workOrderHeaderDetailsTimeIconContainer' + itemKey} name='close' size={22} color={Color.red}></MaterialCommunityIcons>
                  <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold red style={{ fontSize: 16, marginLeft: 5 }}>{cultureResource.notCompleted}</VText>
                </View>
              )}
              {item.status > 5 || item.status < -2 || isAccepted == 0 && (
                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={styles.workOrderHeaderDetailsTimeContainer}>
                  <MaterialIcons name="pending" size={16} color="white" />
                  <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold white style={{ fontSize: 16, marginLeft: 5 }}>{item.statusText}</VText>
                </View>
              )}

            </View>
          </View>
          <View key={'transferSummaryHeader' + itemKey} style={styles.transferSummaryHeader}>
            <View key={'timeContainer' + itemKey} style={styles.timeContainer}>
              <View key={'begining' + itemKey} style={[styles.begining, { marginRight: 3 }]}>
                <VText key={'begin' + itemKey} bold greyText style={{ fontSize: 12, marginBottom: 6 }}>{cultureResource.start1}</VText>
                <VText key={'beginTime' + itemKey} bold style={{ fontSize: 19 }}>{item.from.time}</VText>
              </View>
              <View style={{ overflow: 'hidden', flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 6, marginLeft: 3 }}>
                <VText numberOfLines={1} darkGrey style={{}}>..........................</VText>
              </View>
              <View key={'timeContainerIcon' + itemKey} style={[styles.timeContainerIcon, { margin: 3 }]}>
                <MaterialIcons name="watch-later" size={16} color="black" />
              </View>
              <View style={{ overflow: 'hidden', flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 6, marginRight: 3 }}>
                <VText numberOfLines={1} darkGrey style={{}}>.................................</VText>
              </View>
              <View key={'finish' + itemKey} style={[styles.finish, { marginLeft: 3 }]}>
                <VText key={'finishing' + itemKey} bold greyText style={{ marginBottom: 6, fontSize: 11 }}>{cultureResource.finish}</VText>
                <VText key={'finishTime' + itemKey} bold style={{ fontSize: 18 }}>{item.to.time}</VText>
              </View>
            </View>
            {item.priceText != '0,00' && (
              <View key={'progressPayment' + itemKey} style={styles.progressPayment}>
                <View key={'progressPaymentIcon' + itemKey} style={styles.progressPaymentIcon}>
                  {/* <FontAwesome5 name="money-bill-alt" size={12} color="black" /> */}
                  <VText bold style={{ fontSize: 18 }}>{item.currencySymbol}</VText>
                </View>
                <View key={'paymentPaymentContainer' + itemKey} style={styles.paymentPaymentContainer}>
                  <VText key={'proressPayment' + itemKey} bold greyText style={{ fontSize: 12, marginBottom: 6 }}>{cultureResource.amount}</VText>
                  <VText key={'proressPaymentText' + itemKey} bold numberOfLines={1} style={{ fontSize: 17, }}>{item.priceText}</VText>
                </View>
              </View>
            )}
          </View>

        </View>
        <View key={'workOrderWaypointsContainer' + itemKey} style={styles.workOrderWaypointsContainer}>
          <View key={'startContainer' + itemKey} style={styles.startContainer}>
            <View key={'startIconContainer' + itemKey} style={styles.startIconContainer}>
              <MaterialCommunityIcons key={'startIcon' + itemKey} name='triangle' size={12} color={Color.black}></MaterialCommunityIcons>
            </View>
            <View key={'startTitleContainer' + itemKey} style={styles.startTitleContainer}>
              <View style={styles.startTitleRowContainer}>
                <VText key={'startTitle' + itemKey} bold greyText style={{ fontSize: 12, marginBottom: 8 }}>{cultureResource.startLocation}</VText>
                <VText key={'from' + itemKey} numberOfLines={1} semiBold style={{ fontSize: 14 }}>{item.from.name}</VText>
              </View>
              <View>
                <VText key={'time' + itemKey} numberOfLines={1} bold style={{ fontSize: 14 }}>{item.from.time}</VText>
              </View>
            </View>
          </View>
          {item.wayPointCount == 1 && (
            <View key={'waypointContainer' + itemKey} style={styles.startContainer}>
              <View style={{ height: 42, width: 1, borderWidth: .5, borderStyle: 'dashed', borderColor: Color.greyBorder, position: 'absolute', bottom: 30, left: 5 }}></View>
              <View key={'waypointIconContainer' + itemKey} style={styles.startIconContainer}>
                <MaterialCommunityIcons key={'waypointIcon' + itemKey} name='circle' size={12} color={Color.black}></MaterialCommunityIcons>
              </View>
              <View key={'waypointTitleContainer' + itemKey} style={styles.waypointTitleContainer}>
                <MaterialCommunityIcons key={'waypointInnerIcon' + itemKey} name='timeline-clock-outline' size={14} color={Color.white}></MaterialCommunityIcons>
                <VText key={'waypointTitle' + itemKey} bold white style={{ fontSize: 14, marginLeft: 5 }}>{item.wayPointCount} {cultureResource.waypointSingle}</VText>
              </View>
            </View>
          )}
          {item.wayPointCount > 1 && (
            <View key={'waypointContainer' + itemKey} style={styles.startContainer}>
              <View style={{ height: 42, width: 1, borderWidth: .5, borderStyle: 'dashed', borderColor: Color.greyBorder, position: 'absolute', bottom: 30, left: 5 }}></View>
              <View key={'waypointIconContainer' + itemKey} style={styles.startIconContainer}>
                <MaterialCommunityIcons key={'waypointIcon' + itemKey} name='circle' size={12} color={Color.black}></MaterialCommunityIcons>
              </View>
              <View key={'waypointTitleContainer' + itemKey} style={styles.waypointTitleContainer}>
                <MaterialCommunityIcons key={'waypointInnerIcon' + itemKey} name='timeline-clock-outline' size={14} color={Color.white}></MaterialCommunityIcons>
                <VText key={'waypointTitle' + itemKey} bold white style={{ fontSize: 14, marginLeft: 5 }}>{item.wayPointCount} {cultureResource.waypointMulti}</VText>
              </View>
            </View>
          )}
          <View key={'endContainer' + itemKey} style={styles.startContainer}>
            <View style={{ height: 42, width: 1, borderWidth: .5, borderStyle: 'dashed', borderColor: Color.greyBorder, position: 'absolute', bottom: 30, left: 5 }}></View>
            <View key={'endIconContainer' + itemKey} style={styles.startIconContainer}>
              <MaterialCommunityIcons key={'endIcon' + itemKey} name='square' size={12} color={Color.black}></MaterialCommunityIcons>
            </View>
            <View key={'endTitleContainer' + itemKey} style={styles.startTitleContainer}>
              <View style={styles.startTitleRowContainer}>
                <VText key={'endTitle' + itemKey} bold greyText style={{ fontSize: 12, marginBottom: 8 }}>{cultureResource.endLocation}</VText>
                <VText key={'to' + itemKey} numberOfLines={1} semiBold style={{ fontSize: 14 }}>{item.to.name}</VText>
              </View>
              <View>
                <VText key={'time' + itemKey} numberOfLines={1} bold style={{ fontSize: 14 }}>{item.to.time}</VText>
              </View>
            </View>
          </View>
        </View>

        <View key={'workOrderDetailSummaryContainer' + itemKey} style={styles.workOrderDetailSummaryContainer}>
          <View key={'workOrderSummaryItemContainer' + itemKey} style={styles.workOrderSummaryItemContainer}>
            <View key={'summaryDistance' + itemKey} style={styles.summaryDistance}>
              <SvgUri key={'summaryDistanceSvg' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/distance.svg' />
              <VText key={'summaryDistanceText' + itemKey} numberOfLines={1} bold style={{ fontSize: 16, marginLeft: 8 }}>{item.distanceText}</VText>
              {/* <View key={'summaryDistanceLabel' + itemKey} style={styles.summaryDistanceLabel}>
              <SvgUri key={'summaryDistanceSvg' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/distance.svg' />
              <VText numberOfLines={1} key={'summaryDistanceLabelText' + itemKey} bold greyText style={{ fontSize: 12, marginLeft: 8 }}>{cultureResource.distance}</VText>
            </View>
            <View key={'summaryDistanceTextContainer' + itemKey} style={styles.summaryDistanceTextContainer}>
              <VText key={'summaryDistanceText' + itemKey} numberOfLines={1} bold style={{ fontSize: 16 }}>{item.distanceText}</VText>
            </View> */}
            </View>
            <View key={'summaryDuration' + itemKey} style={styles.summaryDuration}>
              <SvgUri key={'summaryDurationSvg' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/duration.svg' />
              <VText key={'summaryDurationText' + itemKey} numberOfLines={1} bold style={{ fontSize: 16, marginLeft: 8 }}>{item.durationText}</VText>
              {/* <View key={'summaryDurationLabel' + itemKey} style={styles.summaryDurationLabel}>
              <SvgUri key={'summaryDurationSvg' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/duration.svg' />
              <VText key={'summaryDurationLabelText' + itemKey} bold greyText style={{ fontSize: 12, marginLeft: 8 }}>{cultureResource.duration}</VText>
            </View>
            <View key={'summaryDurationTextContainer' + itemKey} style={styles.summaryDurationTextContainer}>
              <VText key={'summaryDurationText' + itemKey} numberOfLines={1} bold style={{ fontSize: 16 }}>{item.durationText}</VText>
            </View> */}
            </View>
            <View key={'summaryPassenger' + itemKey} style={styles.summaryPassenger}>
              <SvgUri key={'summaryPassengerSvg' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/passenger.svg' />
              <VText key={'summaryPassengerText' + itemKey} bold style={{ fontSize: 16, marginLeft: 8 , }}>{item.peopleCount} {cultureResource.passenger}</VText>
              {/* <View key={'summaryPassengerLabel' + itemKey} style={styles.summaryPassengerLabel}>
              <SvgUri key={'summaryPassengerSvg' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/passenger.svg' />
              <VText key={'summaryPassengerLabelText' + itemKey} bold greyText style={{ fontSize: 12, marginLeft: 8 }}>{cultureResource.passenger}</VText>
            </View>
            <View key={'summaryPassengerTextContainer' + itemKey} style={styles.summaryPassengerTextContainer}>
              <VText key={'summaryPassengerText' + itemKey} bold style={{ fontSize: 16 }}>{item.peopleCount}</VText>
            </View> */}
            </View>
          </View>
          {/* <View key={'workOrderSummaryItemContainer2' + itemKey} style={styles.workOrderSummaryItemContainer2}>
          <View key={'summaryPassenger' + itemKey} style={styles.summaryPassenger}>
            <View key={'summaryPassengerLabel' + itemKey} style={styles.summaryPassengerLabel}>
              <SvgUri key={'summaryPassengerSvg' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/passenger.svg' />
              <VText key={'summaryPassengerLabelText' + itemKey} bold greyText style={{ fontSize: 12, marginLeft: 8 }}>{cultureResource.passenger}</VText>
            </View>
            <View key={'summaryPassengerTextContainer' + itemKey} style={styles.summaryPassengerTextContainer}>
              <VText key={'summaryPassengerText' + itemKey} bold style={{ fontSize: 16 }}>{item.peopleCount}</VText>
            </View>
          </View>
          <View key={'summaryPayment' + itemKey} style={styles.summaryPayment}>
            <View key={'summaryPaymentLabel' + itemKey} style={styles.summaryPaymentLabel}>
              <SvgUri key={'summaryPaymentSvg' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/payment.svg' />
              <VText key={'summaryPaymentLabelText' + itemKey} bold greyText style={{ fontSize: 12, marginLeft: 8 }}>{cultureResource.payment}</VText>
            </View>
            <View key={'summaryPaymentTextContainer' + itemKey} style={styles.summaryPaymentTextContainer}>
              <VText numberOfLines={1} key={'summaryPaymentText' + itemKey} bold style={{ fontSize: 16 }}>{item.payment}</VText>
            </View>
          </View>
        </View> */}
        </View>

        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <View key={'workOrderHeaderDetailsTypeContainer' + itemKey} style={styles.workOrderHeaderDetailsTypeContainer}>
            {item.transferType == 1 && (
              <SvgUri key={'workOrderHeaderDetailsTypeSvgContainer' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/transfertype1.svg' />
            )}
            {item.transferType == 2 && (
              <SvgUri key={'workOrderHeaderDetailsTypeSvgContainer' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/transfertype2.svg' />
            )}
            {item.transferType == 3 && (
              <SvgUri key={'workOrderHeaderDetailsTypeSvgContainer' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/transfertype3.svg' />
            )}
            {item.transferType == 4 && (
              <SvgUri key={'workOrderHeaderDetailsTypeSvgContainer' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/transfertype4.svg' />
            )}
            <VText numberOfLines={1} key={'workOrderHeaderDetailsTypeTextContainer' + itemKey} bold darkGrey style={{ fontSize: 16, marginLeft: 5 }}>
              {item.transferType == 1 ? cultureResource.transferType1 : item.transferType == 2 ? cultureResource.transferType2 : item.transferType == 3 ? cultureResource.transferType3 : item.transferType == 4 ? cultureResource.transferType4 : cultureResource.transferType1}
            </VText>
          </View>
        </View>
        {
          item.status != -3 && item.status != 1 && item.status != -2 && item.status != 5 && (
            <View key={'actions' + itemKey} style={styles.actions}>
              {isAccepted == 0 && (
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  <View style={{ flex: 1, marginRight: 3 }}>
                    <VButton onPress={() => { updateWorkOrderOfferStatus(item.id, false), profileStore.setRefresh(true) }} secondaryOutline style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialCommunityIcons name='close' size={22} color={Color.red}></MaterialCommunityIcons>
                      <VText bold red style={{ marginLeft: 5, fontSize: 18 }}>{cultureResource.deny}</VText>
                    </VButton>
                  </View>
                  <View style={{ flex: 1, marginLeft: 3 }}>
                    <VButton onPress={() => { updateWorkOrderOfferStatus(item.id, true), profileStore.setRefresh(true) }} success style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialCommunityIcons name='check' size={22} color={Color.white}></MaterialCommunityIcons>
                      <VText bold white style={{ marginLeft: 5, fontSize: 18 }}>{cultureResource.approve}</VText></VButton>
                  </View>
                </View>
              )}
              {/* {isAccepted == 1 && item.status >= 0 && item.status != 1 && (
              <View>
                <VButton onPress={() => { }} primary style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name="link-2" size={24} color="white" />
                  <VText bold white style={{ marginLeft: 5, fontSize: 14 }}>{cultureResource.sendFollowLink}</VText>
                </VButton>
              </View>
            )} */}
              {isAccepted == 1 && item.status >= 0 && item.status != 1 && (
                <View>
                  <View>
                    <VButton onPress={() => { navigation.navigate('Detail', { data: { item: item, itemKey: itemKey, cultureResource: cultureResource } }) }} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Color.white, borderWidth: 1, borderColor: Color.purple, }}>
                      {/* <VText bold white style={{ marginRight: 5, fontSize: 18 }}>{item.status == 0 || item.status == 2 ? cultureResource.start : cultureResource.continue}</VText> */}
                      <Entypo name="dots-three-horizontal" size={13} color="#7162EC" />
                      <VText bold purple style={{ marginLeft: 5, fontSize: 14 }}>{cultureResource.more}</VText>
                      {/* <MaterialCommunityIcons name='arrow-right' size={22} color={Color.white}></MaterialCommunityIcons> */}
                    </VButton>
                  </View>
                  {/* <View style={{ marginTop: 10 }}>
                  <VButton primaryOutline style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name='dots-horizontal' size={22} color={Color.primary}></MaterialCommunityIcons>
                    <VText bold primary style={{ marginLeft: 5, fontSize: 18 }}>{cultureResource.more}</VText></VButton>
                </View> */}
                </View>
              )}
            </View>
          )
        }
      </View>
    </>
  )
}

export default WorkOrderCard


const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%'
  },
  body: { flex: 1, height: '100%', backgroundColor: Color.greyLight },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  summaryPassengerTextContainer: { width: 60, },
  summaryPaymentTextContainer: { width: 60, },
  summaryDurationTextContainer: { width: 60, },
  summaryDistanceTextContainer: { width: 60, },
  datePickerContainerTop: {
    position: 'absolute',
    zIndex: 3,
    top: 68,
    height: 0,
    overflow: 'hidden',
    elevation: 3,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  workOrderSummaryContainer: {
    backgroundColor: Color.white,
    paddingHorizontal: 15
  },
  workOrderDetailSummaryContainer: {
    paddingTop: 20
  },
  workOrderSummaryItemContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  workOrderSummaryItemContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  summaryDistance: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 8,
    flex: 1,
    borderColor: Color.greyBorder,
    alignItems: 'center',
    // justifyContent: 'space-between',
    marginRight: 8
  },
  summaryDistanceLabel: {
    flexDirection: 'row',
    flex: 1,
  },
  summaryDuration: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 8,
    flex: 1,
    borderColor: Color.greyBorder,
    alignItems: 'center',
    // justifyContent: 'space-between',
    marginRight: 8
  },
  summaryDurationLabel: {
    flexDirection: 'row',
    flex: 1
  },
  summaryPassenger: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 8,
    flex: 1,
    borderColor: Color.greyBorder,
    alignItems: 'center',
    // justifyContent: 'space-between',
    // marginRight: 5
  },
  summaryPassengerLabel: {
    flexDirection: 'row',
    flex: 1
  },
  summaryPayment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 8,
    flex: 1,
    borderColor: Color.greyBorder,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 5
  },
  summaryPaymentLabel: {
    flexDirection: 'row',
    flex: 1
  },
  workOrderSummary: {
    flexDirection: 'row',
  },
  completed: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20
  },
  total: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workOrderProgressContainer: {
    height: 8,
    backgroundColor: Color.greyBorder,
    borderRadius: 100,
    marginBottom: 20,
    marginTop: 10,
  },
  workOrderProgress: {
    backgroundColor: Color.green,
    height: 8,
    borderRadius: 100,
  },
  tabContainer: {
    backgroundColor: Color.greyLight,
    padding: 15,
    justifyContent: 'center'
  },
  tabButton: {
    borderRadius: 1000,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Color.white,
    borderWidth: 1.5,
    borderColor: Color.darkGrey,
    marginRight: 8,
    justifyContent: 'center',
    flexDirection: 'row'
  },
  badge: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: 20,
    height: 20,
    backgroundColor: Color.purple,
    borderRadius: 100
  },
  workOrderContainer: {
    backgroundColor: Color.greyLight,
  },
  workOrder: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: Color.white,
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 5,
    borderColor: Color.greyBorder
  },
  workOrderHeaderContainer: {
    // paddingBottom: 25,
    // borderBottomWidth: 1,
    // borderBottomColor: Color.greyBorder
  },
  workOrderHeader: {
    // flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  workOrderHeaderImage: {
    width: 40,
    height: undefined,
    aspectRatio: 1,
    borderRadius: 1000,
    resizeMode: 'contain'
  },
  workOrderHeaderTitle: {
    marginLeft: 8
  },
  workOrderHeaderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2
  },
  workOrderHeaderImageContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 1000,
    borderColor: Color.greyBorder,
  },
  workOrderHeaderDetailsContainer: {
    // paddingTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,

  },
  workOrderHeaderDetailsTimeContainer: {
    backgroundColor: Color.darkGrey,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
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
  workOrderWaypointsContainer: {
    borderWidth: 1,
    borderColor: Color.greyBorder,
    borderRadius: 5,
    paddingHorizontal: 18,
    marginTop: 20
  },
  startContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10
  },
  startIconContainer: {
    width: 30
  },
  startTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  startTitleRowContainer: {
    flex: 1,
  },
  waypointTitleContainer: {
    backgroundColor: Color.darkGrey,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 100
  },
  actions: {
    borderTopColor: Color.greyBorder,
    borderTopWidth: 1,
    marginTop: 20,
    paddingTop: 20
  },
  container: {
    flex: 1,

  },
  headerContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 10
  },
  headerTitle: {
    flex: 3,
    justifyContent: 'center',
    marginRight: 16,
    marginVertical: 9.5
  },
  headerTitleText: {
    fontSize: 24,
    marginBottom: 10,
    marginRight: 15
  },
  headerBodyText: {
    fontSize: 14,
    paddingRight: 10

  },
  bodyContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 10,
    padding: 15,
    borderColor: Color.greyBorder

  },
  topContainer: {

    borderBottomWidth: 1,
    borderBottomColor: Color.greyBorder,
    paddingBottom: 15
  },
  transferSummaryHeader: {
    flexDirection: 'row',
    marginTop: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    flex: 2,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Color.greyBorder,
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10
  },
  timeContainerIcon: {
    paddingHorizontal: 13,
    justifyContent: 'center'
  },
  progressPayment: {
    flexDirection: 'row',
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Color.greyBorder,
    padding: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    maxWidth: '100%',
    overflow: 'hidden',
    marginLeft: 8
  },
  progressPaymentIcon: {
    justifyContent: 'center',
    marginRight: 12,

  },
  midContainer: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: Color.greyBorder,
    paddingBottom: 21
  },
  bottomContainer: {
    marginTop: 15,
  },
  transferSummaryBody: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 15,
    alignItems: 'center'
  },
  kmContainer: {
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 8,
    borderColor: Color.greyBorder,
    flex: 1,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginRight: 8,
  },
  minuteContainer: {
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 8,
    borderColor: Color.greyBorder,
    flex: 1,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginRight: 8,
  },
  passengerContainer: {
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 8,
    borderColor: Color.greyBorder,
    flex: 1,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',

  },
  buttonContainer: {
    flexDirection: 'row',

  },
  paymentPaymentContainer: {
    maxWidth: '100%',
    overflow: 'hidden'
  }

})