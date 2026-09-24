import React from 'react';
import { Image, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import VText from '../VText';

const MyCarComponent = ({ navigation, item, keyItem, cultureResource, style }) => {
    if (!item) return null;

    const documentsLabel = cultureResource?.document || 'Araç Belgeleri';
    const isCurrent = item.isCurrent === true;
    const hasDetails = Boolean(item.modelYear || item.capacity || isCurrent);

    return (
        <View key={keyItem} style={[styles.card, style]}>
            <View style={styles.headerRow}>
                <View style={styles.logoBox}>
                    {item.brandLogo ? (
                        <Image
                            style={styles.brandLogo}
                            source={{ uri: item.brandLogo }}
                            resizeMode="contain"
                            accessible={false}
                        />
                    ) : (
                        <MaterialCommunityIcons name="car-outline" size={28} color="#7162EC" />
                    )}
                </View>
                <View style={styles.headerDetails}>
                    <VText bold style={styles.plateText} numberOfLines={1}>
                        {item.plate || '—'}
                    </VText>
                    {item.brand ? (
                        <VText regular style={styles.brandText} numberOfLines={2}>
                            {item.brand}
                        </VText>
                    ) : null}
                </View>
            </View>

            {hasDetails && (
                <View style={styles.detailsRow}>
                    {isCurrent && (
                        <View style={styles.activePill}>
                            <View style={styles.activeDot} />
                            <VText semiBold style={styles.activeText}>
                                {cultureResource?.useCar || 'Aktif'}
                            </VText>
                        </View>
                    )}
                    {item.modelYear ? (
                        <View style={styles.detailChip}>
                            <Ionicons name="calendar-outline" size={14} color="#6B778C" />
                            <VText semiBold style={styles.detailText}>{item.modelYear}</VText>
                        </View>
                    ) : null}
                    {item.capacity ? (
                        <View style={styles.detailChip}>
                            <Ionicons name="people-outline" size={14} color="#6B778C" />
                            <VText semiBold style={styles.detailText}>
                                {item.capacity}{cultureResource?.seats ? ` ${cultureResource.seats}` : ''}
                            </VText>
                        </View>
                    ) : null}
                </View>
            )}

            <TouchableOpacity
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`${documentsLabel}, ${item.plate || item.brand || ''}`}
                onPress={() => navigation.navigate('CarDocuments', { data: { item } })}
                style={styles.documentsButton}
            >
                <MaterialCommunityIcons name="file-document-outline" size={19} color="#7162EC" />
                <VText semiBold style={styles.documentsText}>{documentsLabel}</VText>
                <Feather name="chevron-right" size={18} color="#7162EC" />
            </TouchableOpacity>
        </View>
    );
};

export default MyCarComponent;

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E8EBF2',
        padding: 18,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoBox: {
        width: 54,
        height: 54,
        borderRadius: 16,
        backgroundColor: '#F5F6FA',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    brandLogo: {
        width: 38,
        height: 38,
    },
    headerDetails: {
        marginLeft: 14,
        flex: 1,
        minWidth: 0,
    },
    plateText: {
        fontSize: 19,
        lineHeight: 26,
        letterSpacing: 0.3,
        color: '#182230',
        textTransform: 'uppercase',
    },
    brandText: {
        fontSize: 13,
        lineHeight: 19,
        color: '#6B778C',
        marginTop: 3,
    },
    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
    },
    activePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EAF7F0',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        maxWidth: '100%',
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#24875E',
        marginRight: 6,
    },
    activeText: {
        fontSize: 12,
        lineHeight: 17,
        color: '#24875E',
        flexShrink: 1,
    },
    detailChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F6FA',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        maxWidth: '100%',
    },
    detailText: {
        fontSize: 12,
        lineHeight: 17,
        color: '#6B778C',
        marginLeft: 6,
        flexShrink: 1,
    },
    documentsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0EEFF',
        borderRadius: 12,
        marginTop: 18,
        minHeight: 48,
        paddingVertical: 12,
        paddingHorizontal: 13,
    },
    documentsText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 20,
        color: '#7162EC',
        marginHorizontal: 9,
    },
});
