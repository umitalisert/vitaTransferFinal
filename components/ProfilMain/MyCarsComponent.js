import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import MyCarComponent from './MyCarComponent';

const MyCarsComponent = ({ style, ...props }) => {
    const { width } = useWindowDimensions();
    const cardWidth = Math.min(Math.max(width - 64, 0), 320);

    return (
        <MyCarComponent
            {...props}
            style={[styles.carouselCard, { width: cardWidth }, style]}
        />
    );
};

export default MyCarsComponent;

const styles = StyleSheet.create({
    carouselCard: {
        marginHorizontal: 0,
        marginRight: 12,
    },
});
