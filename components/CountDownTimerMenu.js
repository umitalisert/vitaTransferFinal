import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Color from "./Color";
import VText from "./VText";

const CountdownTimerMenu = ({ workOrderData }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!workOrderData) return;
        const updateTimer = () => {
            const now = new Date().getTime();
            const targetTime = new Date(workOrderData).getTime();
            const difference = targetTime - now;
            setTimeLeft(difference > 0 ? difference : 0);
            if (difference <= 0 && typeof onExpire === 'function') {
                onExpire()
            }
        };
        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [workOrderData]);

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
        <View style={{ paddingLeft:5 }}>
            <VText bold style={[{ fontSize: 14, color: Color.white }]}>
                {formatTime(timeLeft)}
            </VText>
        </View>
    );
};

export default CountdownTimerMenu;