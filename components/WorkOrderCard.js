import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import VText from './VText'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Feather } from '@expo/vector-icons';
import { useDispatch } from 'react-redux'
import { setLoading, setHasError, setErrorMessage } from '../redux/slices/mainSlice'
import WorkOrder from '../services/vita/WorkOrder'
import { useNavigation } from '@react-navigation/native'
import useCultureStore from '../zustand/CultureStore';
import useProfileStore from '../zustand/ProfileStore'
import useResponseStore from '../zustand/ResponseStore'

// ── TASARIM SABITLERI (yerel; components/Color.js degistirilmez) ────────────────
const T = {
  canvas: '#FFFFFF',
  hairline: '#ECEEF2',
  border: '#DCE0EA',
  ink900: '#0B0F19',
  ink700: '#404C5B',
  ink500: '#6B7280',
  ink300: '#9AA1AE',
  accent: '#7162EC',
  accentSoft: 'rgba(113,98,236,0.08)',
  surface: '#F8F9FC',
  success: '#1CC961',
  danger: '#E03024',
};

// Durum paleti: LED seridi ve rozet ayni kaynaktan beslenir.
// uyari tonunda metin rengi ayri tutuldu; #FFAA1D sari tint uzerinde okunmuyor (WCAG AA alti).
const DURUM_RENK = {
  iptal: { cizgi: '#E03024', zemin: 'rgba(224,48,36,0.10)', yazi: '#E03024' },
  uyari: { cizgi: '#FFAA1D', zemin: 'rgba(255,170,29,0.14)', yazi: '#9A6200' },
  tamam: { cizgi: '#1CC961', zemin: 'rgba(28,201,97,0.12)', yazi: '#0F8B44' },
  aktif: { cizgi: '#7162EC', zemin: 'rgba(113,98,236,0.10)', yazi: '#7162EC' },
  notr: { cizgi: '#9AA1AE', zemin: 'rgba(107,114,128,0.10)', yazi: '#6B7280' },
};

// DIKKAT: isAccepted API'den boolean true / sayi 0 olarak gelebiliyor -> daima gevsek karsilastirma.
// Kati === kullanilirsa kabul edilmis tum kartlar "bekliyor" gorunumune duser.
function durumBilgisi(status, isAccepted, ck, statusText) {
  if (isAccepted == -1) return { ...DURUM_RENK.notr, etiket: ck.denied, ikon: 'close-circle-outline', soluk: 0.55 };
  if (isAccepted == 0) return { ...DURUM_RENK.aktif, etiket: ck.awaiting, ikon: 'progress-question' };
  switch (Number(status)) {
    case -3: return { ...DURUM_RENK.iptal, etiket: ck.canceled, ikon: 'alert-circle-outline', soluk: 0.62 };
    case -2: return { ...DURUM_RENK.iptal, etiket: ck.noshow, ikon: 'account-alert-outline', soluk: 0.62 };
    case 0: return { ...DURUM_RENK.aktif, etiket: ck.willBegin, ikon: 'progress-clock' };
    case 1: return { ...DURUM_RENK.tamam, etiket: ck.hasCompleted, ikon: 'check-circle-outline', soluk: 0.72 };
    case 2: return { ...DURUM_RENK.uyari, etiket: ck.late, ikon: 'clock-alert-outline' };
    case 3: return { ...DURUM_RENK.aktif, etiket: ck.started, ikon: 'play-circle-outline' };
    case 4: return { ...DURUM_RENK.aktif, etiket: ck.passengerRecieved, ikon: 'account-check-outline' };
    case 5: return { ...DURUM_RENK.iptal, etiket: ck.notCompleted, ikon: 'close-circle-outline', soluk: 0.62 };
    // status 6 ve tanimsiz degerler. Eski kodda satir 130'daki && / || onceligi yuzunden
    // bu dalda hic rozet basilmiyordu; switch ile kokten kapatildi.
    default: return { ...DURUM_RENK.notr, etiket: statusText || '', ikon: 'information-outline' };
  }
}

// Transfer tipi -> yerel glif (eski uzak SvgUri istekleri kaldirildi).
function tipIkonu(transferType) {
  switch (Number(transferType)) {
    case 2: return 'swap-horizontal';
    case 3: return 'steering';
    case 4: return 'bus';
    default: return 'ray-start-arrow';
  }
}

function tipMetni(transferType, ck) {
  switch (Number(transferType)) {
    case 2: return ck.transferType2;
    case 3: return ck.transferType3;
    case 4: return ck.transferType4;
    default: return ck.transferType1;
  }
}

const WorkOrderCard = ({ item, itemKey, cultureResource }) => {
  const responseStore = useResponseStore((state) => state)
  const dispatch = useDispatch();
  const cultureStore = useCultureStore((state) => state);
  const [isAccepted, setIsAccepted] = useState(item.isAccepted);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const navigation = useNavigation();
  const profileStore = useProfileStore((state) => state);

  // Liste yenilendiginde ayni indekste farkli bir is emri gelirse lokal durum bayatlamasin.
  useEffect(() => {
    setIsAccepted(item.isAccepted);
  }, [item.id, item.isAccepted]);

  function updateWorkOrderOfferStatus(id, status) {
    if (gonderiliyor) return;            // cift dokunma -> cift istek korumasi
    setGonderiliyor(true);
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
      setGonderiliyor(false);
    }).catch(() => {
      setGonderiliyor(false);
    });
  }

  const durum = durumBilgisi(item.status, isAccepted, cultureResource, item.statusText);
  // Basilabilirlik kosulu eski "Daha fazla" butonuyla BIREBIR ayni (eski satir 333).
  const gidilebilir = isAccepted == 1 && item.status >= 0 && item.status != 1;
  const bekliyor = isAccepted == 0;
  const ucretVar = item.priceText && item.priceText != '0,00' && item.priceText != '0,00 TL' && item.priceText != '0';
  const odemeVar = !!(item.payment && `${item.payment}`.trim().length > 0);
  const Kap = gidilebilir ? TouchableOpacity : View;

  return (
    <View key={'workOrder' + itemKey} style={styles.kartGolge}>
      {/* Golge disarida, kirpma iceride: ayni View'a hem shadow hem overflow verilirse iOS golgeyi yutar. */}
      <Kap
        activeOpacity={0.75}
        onPress={gidilebilir ? () => { navigation.navigate('Detail', { data: { item: item, itemKey: itemKey, cultureResource: cultureResource } }) } : undefined}
        style={[styles.kartGovde, bekliyor && styles.kartGovdeBekleyen]}>

        <View style={[styles.ledSerit, { backgroundColor: durum.cizgi }]} />

        <View style={styles.icerik}>
          {/* Rozet / tesis / rota: iptal-tamamlandi gibi pasif hallerde soluklastirilir. */}
          <View style={durum.soluk ? { opacity: durum.soluk } : null}>

            {/* 1 — DURUM */}
            {durum.etiket ? (
              <View style={styles.satirDurum}>
                <View style={[styles.rozet, { backgroundColor: durum.zemin }]}>
                  <MaterialCommunityIcons name={durum.ikon} size={15} color={durum.yazi} />
                  <VText semiBold numberOfLines={1} style={[styles.rozetMetin, { color: durum.yazi }]}>{durum.etiket}</VText>
                </View>
              </View>
            ) : null}

            {/* 2 — TESIS KIMLIGI */}
            <View style={styles.satirTesis}>
              <View style={styles.logoKap}>
                <Image source={{ uri: item.facilityImage }} style={styles.logo} />
              </View>
              <View style={styles.tesisMetinKap}>
                <VText semiBold numberOfLines={1} ellipsizeMode='tail' style={styles.tesisAdi}>{item.facilityName}</VText>
                <View style={styles.tesisAltSatir}>
                  <MaterialCommunityIcons name={tipIkonu(item.transferType)} size={14} color={T.ink300} style={{ marginRight: 5 }} />
                  <VText regular numberOfLines={1} style={styles.tesisAltMetin}>{tipMetni(item.transferType, cultureResource)}</VText>
                </View>
              </View>
              {gidilebilir && (
                <View style={styles.chevronKap}>
                  <Feather name='chevron-right' size={20} color={T.ink300} />
                </View>
              )}
            </View>

            <View style={styles.ayirici} />

            {/* 3 — ROTA: saat sutunu + dikey zaman cizgisi + etiketli durak adi.
                Durak adlari etiketlendigi icin hangisinin kalkis hangisinin varis oldugu
                renk/sira sezgisine birakilmiyor. */}
            <View style={styles.rota}>
              <View style={styles.rotaSatir}>
                <VText bold numberOfLines={1} style={styles.rotaSaat}>{item.from?.time ?? ''}</VText>
                <View style={styles.rotaIsaretKap}>
                  <View style={styles.noktaKalkis} />
                  <View style={styles.rotaCizgi} />
                </View>
                <View style={styles.rotaMetinKap}>
                  <VText semiBold numberOfLines={1} style={styles.rotaEtiket}>{cultureResource.startLocation}</VText>
                  <VText semiBold numberOfLines={2} ellipsizeMode='tail' style={styles.rotaAd}>{item.from?.name ?? ''}</VText>
                </View>
              </View>
              <View style={[styles.rotaSatir, styles.rotaSatirSon]}>
                <VText bold numberOfLines={1} style={styles.rotaSaat}>{item.to?.time ?? ''}</VText>
                <View style={styles.rotaIsaretKap}>
                  <View style={styles.noktaVaris} />
                </View>
                <View style={styles.rotaMetinKap}>
                  <VText semiBold numberOfLines={1} style={styles.rotaEtiket}>{cultureResource.endLocation}</VText>
                  <VText semiBold numberOfLines={2} ellipsizeMode='tail' style={styles.rotaAd}>{item.to?.name ?? ''}</VText>
                </View>
              </View>
            </View>

            {/* 4 — KUNYE: sure / mesafe / yolcu. Etiket + deger cifti, dikey ayraclarla. */}
            <View style={styles.kunye}>
              <View style={styles.kunyeHucre}>
                <VText semiBold numberOfLines={1} style={styles.kunyeEtiket}>{cultureResource.duration}</VText>
                <VText bold numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.kunyeDeger}>{item.durationText || '—'}</VText>
              </View>
              <View style={styles.kunyeAyrac} />
              <View style={styles.kunyeHucre}>
                <VText semiBold numberOfLines={1} style={styles.kunyeEtiket}>{cultureResource.distance}</VText>
                <VText bold numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.kunyeDeger}>{item.distanceText || '—'}</VText>
              </View>
              <View style={styles.kunyeAyrac} />
              <View style={styles.kunyeHucre}>
                <VText semiBold numberOfLines={1} style={styles.kunyeEtiket}>{cultureResource.passenger}</VText>
                <VText bold numberOfLines={1} style={styles.kunyeDeger}>{item.peopleCount ?? '—'}</VText>
              </View>
              {item.wayPointCount > 0 && (
                <>
                  <View style={styles.kunyeAyrac} />
                  <View style={styles.kunyeHucre}>
                    <VText semiBold numberOfLines={1} style={styles.kunyeEtiket}>
                      {item.wayPointCount > 1 ? cultureResource.waypointMulti : cultureResource.waypointSingle}
                    </VText>
                    <VText bold numberOfLines={1} style={[styles.kunyeDeger, { color: T.accent }]}>{item.wayPointCount}</VText>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* 5 — ODEME + UCRET.
              Ucret soluk sarmalayicinin DISINDA: surucu tamamlanan iste de kazancini net gormeli. */}
          {(odemeVar || ucretVar) && (
            <>
              <View style={styles.ayirici} />
              <View style={styles.satirOdeme}>
                {odemeVar ? (
                  <View style={[styles.odemeGrup, durum.soluk ? { opacity: durum.soluk } : null]}>
                    <MaterialCommunityIcons name='credit-card-outline' size={16} color={T.ink300} style={{ marginRight: 7 }} />
                    <VText regular numberOfLines={1} style={styles.odemeMetin}>{item.payment}</VText>
                  </View>
                ) : <View style={styles.odemeGrup} />}
                {ucretVar ? (
                  <View style={styles.ucretKap}>
                    <VText semiBold numberOfLines={1} style={styles.ucretEtiket}>{cultureResource.amount}</VText>
                    <VText bold numberOfLines={1} style={styles.ucret}>{item.currencySymbol} {item.priceText}</VText>
                  </View>
                ) : null}
              </View>
            </>
          )}

          {/* 6 — TEKLIF BEKLIYOR: kabul / ret */}
          {bekliyor && (
            <View style={styles.teklifSatir}>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={gonderiliyor}
                onPress={() => { updateWorkOrderOfferStatus(item.id, false), profileStore.setRefresh(true) }}
                style={[styles.btnRed, gonderiliyor && styles.btnPasif]}>
                <MaterialCommunityIcons name='close' size={19} color={T.danger} />
                <VText semiBold style={styles.btnRedMetin}>{cultureResource.deny}</VText>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={gonderiliyor}
                onPress={() => { updateWorkOrderOfferStatus(item.id, true), profileStore.setRefresh(true) }}
                style={[styles.btnKabul, gonderiliyor && styles.btnPasif]}>
                <MaterialCommunityIcons name='check' size={19} color={T.canvas} />
                <VText semiBold style={styles.btnKabulMetin}>{cultureResource.approve}</VText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Kap>
    </View>
  )
}

export default WorkOrderCard

const SAAT_SUTUN = 52;   // saat sutunu sabit genisligi — tum kartlarda durak adlari hizali baslar
const ISARET_SUTUN = 24; // nokta/cizgi sutunu

const styles = StyleSheet.create({
  // Dis kabuk: golgeyi tasir, overflow YOK.
  kartGolge: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 20,
    backgroundColor: T.canvas,
    shadowColor: T.ink900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  // Ic kabuk: kirpmayi yapar, LED seridini kose yaricapina oturtur.
  kartGovde: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: T.hairline,
    backgroundColor: T.canvas,
  },
  kartGovdeBekleyen: { borderColor: 'rgba(113,98,236,0.35)' },
  ledSerit: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  icerik: { paddingLeft: 20, paddingRight: 18, paddingTop: 16, paddingBottom: 16 },

  ayirici: { height: StyleSheet.hairlineWidth, backgroundColor: T.hairline, marginVertical: 14 },

  // 1 — durum
  satirDurum: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  rozet: {
    flexDirection: 'row', alignItems: 'center', height: 28, borderRadius: 10,
    paddingLeft: 9, paddingRight: 12, flexShrink: 1,
  },
  rozetMetin: { fontSize: 12.5, lineHeight: 16, letterSpacing: 0.1, marginLeft: 6, flexShrink: 1 },

  // 2 — tesis
  satirTesis: { flexDirection: 'row', alignItems: 'center' },
  logoKap: {
    width: 44, height: 44, borderRadius: 14, borderWidth: 1, borderColor: T.hairline,
    backgroundColor: T.canvas, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', marginRight: 12,
  },
  logo: { width: 30, height: 30, resizeMode: 'contain' },
  tesisMetinKap: { flex: 1, minWidth: 0 },
  tesisAdi: { fontSize: 18, lineHeight: 24, letterSpacing: -0.4, color: T.ink900 },
  tesisAltSatir: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  tesisAltMetin: { flexShrink: 1, fontSize: 13, lineHeight: 17, color: T.ink500 },
  chevronKap: { width: 24, alignItems: 'flex-end', marginLeft: 6 },

  // 3 — rota
  rota: {},
  rotaSatir: { flexDirection: 'row', alignItems: 'flex-start', paddingBottom: 14 },
  rotaSatirSon: { paddingBottom: 0 },
  rotaSaat: {
    width: SAAT_SUTUN, fontSize: 17, lineHeight: 22, letterSpacing: -0.3,
    color: T.ink900, textAlign: 'left', paddingTop: 12,
  },
  // alignSelf:'stretch' -> durak adi 2 satira tasarsa cizgi de birlikte uzar.
  rotaIsaretKap: { width: ISARET_SUTUN, alignSelf: 'stretch', alignItems: 'center', paddingTop: 15 },
  noktaKalkis: {
    width: 13, height: 13, borderRadius: 7, borderWidth: 3.5,
    borderColor: T.accent, backgroundColor: T.canvas,
  },
  rotaCizgi: { flex: 1, width: 2, minHeight: 12, marginTop: 4, backgroundColor: T.border },
  noktaVaris: { width: 13, height: 13, borderRadius: 3.5, backgroundColor: T.ink900 },
  rotaMetinKap: { flex: 1, minWidth: 0, paddingLeft: 2 },
  // Etiketler ListCulture'da zaten BUYUK HARF; textTransform kullanilmaz (Turkce I sorunu).
  rotaEtiket: { fontSize: 10.5, lineHeight: 14, letterSpacing: 0.7, color: T.ink300 },
  rotaAd: { marginTop: 2, fontSize: 16, lineHeight: 21, letterSpacing: -0.2, color: T.ink900 },

  // 4 — kunye seridi
  kunye: {
    flexDirection: 'row', alignItems: 'stretch', marginTop: 16,
    backgroundColor: T.surface, borderRadius: 14, paddingVertical: 11, paddingHorizontal: 4,
  },
  kunyeHucre: { flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 4 },
  kunyeAyrac: { width: StyleSheet.hairlineWidth, backgroundColor: T.border, marginVertical: 2 },
  kunyeEtiket: { fontSize: 10.5, lineHeight: 14, letterSpacing: 0.6, color: T.ink300 },
  kunyeDeger: { marginTop: 3, fontSize: 16, lineHeight: 21, letterSpacing: -0.3, color: T.ink900 },

  // 5 — odeme + ucret
  satirOdeme: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  odemeGrup: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, paddingRight: 12, paddingBottom: 2 },
  odemeMetin: { flexShrink: 1, fontSize: 14, lineHeight: 19, color: T.ink500 },
  ucretKap: { alignItems: 'flex-end', flexShrink: 0, maxWidth: 150 },
  ucretEtiket: { fontSize: 10.5, lineHeight: 14, letterSpacing: 0.6, color: T.ink300 },
  ucret: { marginTop: 2, fontSize: 20, lineHeight: 26, letterSpacing: -0.5, color: T.ink900 },

  // 6 — teklif aksiyonlari (VButton kullanilmaz: padding 20 varsayilani 44pt hedefi bozuyor)
  teklifSatir: { flexDirection: 'row', marginTop: 16 },
  btnRed: {
    flex: 1, height: 50, borderRadius: 14, borderWidth: 1, borderColor: T.border,
    backgroundColor: T.canvas, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginRight: 10,
  },
  btnRedMetin: { fontSize: 15, lineHeight: 20, color: T.danger, marginLeft: 7 },
  btnKabul: {
    flex: 1.4, height: 50, borderRadius: 14, backgroundColor: T.success,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  btnKabulMetin: { fontSize: 15, lineHeight: 20, color: T.canvas, marginLeft: 7 },
  btnPasif: { opacity: 0.5 },
})
