import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Color from "./Color";
import VText from "./VText";

const CountUp = ({ time }) => {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        if (!time) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const startTime = new Date(time).getTime();
            const difference = now - startTime;
            setElapsedTime(difference > 0 ? difference : 0);
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [time]);

    const formatTime = (ms) => {
        const minutes = Math.floor((ms / 1000 / 60) % 60);
        const seconds = Math.floor((ms / 1000) % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    return (
        <View style={{ paddingHorizontal: 10 }}>
            <VText bold style={[{ fontSize: 18, color: Color.white }]}>
                {formatTime(elapsedTime)}
            </VText>
        </View>
    );
};

export default CountUp;