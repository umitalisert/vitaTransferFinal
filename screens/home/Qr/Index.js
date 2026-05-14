import { SafeAreaView, StyleSheet, Text, View, Button, Dimensions , TouchableOpacity } from 'react-native'
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { CameraView, Camera, useCameraPermissions } from "expo-camera";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
const Index = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [flashMode, setFlashMode] = useState(true);

  useEffect(() => {
    (async () => {
      if (!permission) {

      }
      if (permission?.status == "granted") {
        setHasPermission(true)
      }
    })();
  }, [permission])

  // if (hasPermission === null) {
  //   return <Text>dsadsa</Text>;
  // }
  // if (hasPermission === false) {
  //   return <Text>dadsadsa</Text>;
  // }
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setFlashMode(false)
    alert(`Tipi ${type} ve verisi ${data} olan barkod tarandı!`);
  };
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons style={{ position: 'absolute', elevation: 5, zIndex: 5, alignSelf: 'center', top: '50%', marginTop: -1 * Dimensions.get("window").width / 4 }} name="square-rounded-outline" size={Dimensions.get("window").width / 2} color="white" />
      {/* <Camera ratio='16:9'
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      /> */}
        <View style={{
            top: 40,
            right: 0,
            marginHorizontal: 20,
            position: "absolute",
            zIndex: 100,
          }}>
            <TouchableOpacity
              style={{ alignItems: "center",
                marginBottom: 25,}}
              onPress={() =>
                setFlashMode(
                  !flashMode
                )
              }
            >
              <MaterialCommunityIcons
                name={
                  flashMode === false
                    ? "flashlight-off"
                    : "flashlight"
                }
                size={34}
                color={"white"}
              />
            </TouchableOpacity>
          </View>
      {hasPermission && (
        <>
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "pdf417"],
            }}
            enableTorch={flashMode}
            style={StyleSheet.absoluteFillObject}
          />
        </>
      )}

    </View>
  );
}

export default Index

const styles = StyleSheet.create({
  container: { flex: 1 }
})