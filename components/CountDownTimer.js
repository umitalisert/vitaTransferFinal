import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, StatusBar, TouchableOpacity, Dimensions, SafeAreaView, Platform } from "react-native";
import Color from "./Color";
import Constants from 'expo-constants';
import AntDesign from '@expo/vector-icons/AntDesign';

const CountdownTimer = ({ targetDate, setTimer, closeBottomSheet, breakTime, cultureResource }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            const targetTime = new Date(targetDate).getTime();
            const difference = targetTime - now;
            setTimeLeft(difference > 0 ? difference : 0);
            if (difference == 0 || difference <= 0) {
                breakTime()
                clearInterval(timer);
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    // const formatTime = (ms) => {
    //     const minutes = Math.floor((ms / 1000 / 60) % 60);
    //     const seconds = Math.floor((ms / 1000) % 60);

    //     return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    // };
    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        } else {
            return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        }
    };
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => { closeBottomSheet(), setTimer(false) }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 30 }}>
                <AntDesign name="close" size={24} color={Color.greyText} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 2, borderBottomColor: Color.greyBorder }}>
                <View style={{ flex: 1.2 }}>
                    <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 25, paddingVertical: 12 }}>{cultureResource.useBreakTime}</Text>
                    <Text style={{ fontFamily: 'Nunito_400Regular', fontSize: 15, color: Color.greyText }}>{cultureResource.optionsText}</Text>
                </View>
                <View style={{ flex: 0.8, alignItems: 'flex-end' }}>
                    <Image source={require('../assets/breakTime.png')} style={{ height: 120, width: 120 }} />
                </View>
            </View>
            <View style={styles.overlay} />
            <View style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
            }}>
                <Text style={((timeLeft / 1000) <= 300) ? styles.timerTextTimeYellow : styles.timerTextTime}>{formatTime(timeLeft)}</Text>
                <TouchableOpacity style={{ paddingHorizontal: 16, borderWidth: 1, borderRadius: 40, borderColor: Color.greyText }} onPress={() => { breakTime() }}>
                    <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 18, paddingVertical: 12, color: Color.greyText }}>{cultureResource.finishBreakTime}</Text>
                </TouchableOpacity>
            </View>
            <StatusBar backgroundColor={Color.white} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: Platform.OS === 'ios' ? 0 : Platform.OS === 'android' ? 20 : 0,
        left: 0,
        right: 0,
        bottom: 0,
        // paddingTop:Constants.statusBarHeight,
        // justifyContent: "center",
        // alignItems: "center",
        backgroundColor: Color.white
    },
    overlay: {
        // ...StyleSheet.absoluteFillObject,
        // backgroundColor: "rgba(0, 0, 0, 0.5)", // Soluk arka plan
        // backgroundColor: Color.white
    },
    timerTextTime: {
        fontSize: 100,
        color: Color.darkGrey,
        fontWeight: "bold",
    },
    timerTextTimeYellow: {
        fontSize: 100,
        color: Color.red,
        fontWeight: "bold",
    },
    timerText: {
        fontSize: 27,
        color: Color.greyText,
        fontWeight: "bold",
    },
});

export default CountdownTimer;
