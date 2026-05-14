import React from 'react';
import {
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import Color from './Color';

export default function VButton(props) {
    return (
        <TouchableOpacity onPress={props.onPress} style={[(props.primary ? styles.primary : props.secondary ? styles.secondary : props.secondaryOutline ? styles.secondaryOutline : props.success ? styles.success : props.primaryOutline ? styles.primaryOutline : styles.primary), (props.disabled ? styles.disabled : {}), styles.default, props.style]}>
            {props.children}
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    default: {
        width: '100%',
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 1000
    },
    primary: {
        backgroundColor: Color.primary,
    },
    disabled: {
        opacity: 0.4
    },
    secondary: {
        backgroundColor: Color.secondary,
    },
    primaryOutline: {
        borderColor: Color.primary,
        borderWidth: 1,
    },
    secondaryOutline: {
        borderColor: Color.greyBorder,
        borderWidth: 1,
    },
    success: {
        backgroundColor: Color.green,
    },
});

