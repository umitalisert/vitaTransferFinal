import React, { useState } from 'react';
import {
    TextInput,
    StyleSheet
} from 'react-native';
import Color from './Color';

export default function VInput(props) {
    const [style, setStyle] = useState([styles.default, styles.secondary])
    return (
        <TextInput maxLength={props.maxLength} keyboardType={props.keyboardType} defaultValue={props.defaultValue} secureTextEntry={props.secureTextEntry} value={props.value} onChangeText={props.onChangeText} placeholder={props.placeholder} placeholderTextColor={Color.greyText} onBlur={() => setStyle([styles.default, styles.secondary])} onFocus={() => setStyle([styles.default, styles.primary])} style={style}>
            {props.children}
        </TextInput>
    );
}


const styles = StyleSheet.create({
    default: {
        borderWidth: 1,
        borderRadius: 10,
        width:'100%',
        paddingVertical:18,
        paddingHorizontal:10,
        color:Color.black,
        fontSize:16,
        lineHeight:22,
        fontFamily: 'Nunito_500Medium',
        fontWeight: '500'
    },
    primary: {
        borderColor: Color.primary,
    },
    secondary: {
        borderColor: Color.greyBorder,
    },
});

