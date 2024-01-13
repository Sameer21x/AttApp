import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, Image, Button } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Modal from 'react-native-modal';
import DeviceInfo from 'react-native-device-info';

const AttendanceScreen = ({ navigation }) => {
  const [scannedLink, setScannedLink] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [checkInOutStatus, setCheckInOutStatus] = useState('Mark Your Attendance'); // Initial status

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        const unique = await DeviceInfo.getUniqueId();
        console.log('Fetched Unique ID:', unique);

        // Ensure the uniqueId is treated as a string
        setUniqueId(unique.toString());
      } catch (error) {
        console.error('Error fetching device data:', error);
      }
    };

    fetchDeviceData();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    console.log('Scanned QR Code:', data);
    setScannedLink(data);
    checkAndRegisterDevice(data, uniqueId);
    console.log(data,uniqueId,"both things are printed")
  };
  

  const checkAndRegisterDevice = async (scannedLink, uniqueId) => {
    // Compare scanned link with the expected link
    const expectedLink = 'https://me-qr.com/IuU006HM';
    if (scannedLink === expectedLink) {
      // Check if the device ID is already stored
      if (!uniqueId) {
        // If not, navigate to the 'VerifyDevice' screen
        navigation.navigate('VerifyDevice');
        // Reset the uniqueId state
        setUniqueId('');
      } else {
        // Hit the API and show the response in a modal
        const response = await hitApi(uniqueId);
        showMessage(response);
      }
    } else {
      // Show a message for a mismatched link
      showMessage({ header: { status: 400, message: 'Incorrect QR Code' } });
      // Reset the uniqueId state
      setUniqueId('');
    }
  };
  
  

  const hitApi = async (uniqueId) => {
    try {
      const response = await fetch(`https://attendance-app-sepia.vercel.app/api/v1/auth/user/check?macAddress=B4-69-21-76-35-68`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uniqueid: uniqueId, // Use 'uniqueid' instead of 'deviceID'
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        // If the response status is OK, return the result
        return result;
      } else {
        navigation.navigate("VerifyDevice")
        // If the response status is not OK, throw an error with the status and message
        throw new Error(JSON.stringify(result));
      }
    } catch (error) {
      console.error('Error hitting API:', error.message);
      // Return an error object in case of an exception
      return { header: { status: 500, message: 'Internal Server Error' } };
    }
  };
  
  
  
  

  const showMessage = (response) => {
    console.log('API Response:', response);
    if (response && response.header && response.header.message) {
      setMessage(response.header.message);

      // Update check-in/check-out status based on the message
      if (response.header.message === 'Checked in successfully') {
        setCheckInOutStatus('Check Out');
      } else if (response.header.message === 'Checked out successfully') {
        setCheckInOutStatus('Check In');
      }
    } else if (response && response.errors && response.errors.length > 0) {
      setMessage(response.errors[0].msg);
    } else {
      setMessage('Unexpected response format');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Your screen layout */}
      <View style={{ marginTop: 20 }}>
        <Image source={require('../assets/images/icons/logo.jpg')} style={{ width: 50, height: 50, marginHorizontal: 20 }} />
        <Text style={{ textAlign: "right", color: "black", fontFamily: "Rubik", fontSize: 15, marginRight: 20 }}>Date: {new Date().toLocaleDateString()}</Text>
        <Text style={{ color: "black", fontFamily: "Rubik", fontSize: 38, marginLeft: 20 }}>Greetings</Text>
        <Text style={{ color: "#97BCE8", fontFamily: "Rubik", fontSize: 18, marginLeft: 20 }}>{checkInOutStatus}</Text>
      </View>

      {/* QR Code Scanner */}
      <QRCodeScanner
        onRead={handleBarCodeScanned}
        cameraStyle={{ width: 250, height: 200, alignSelf: 'center', marginTop: 10 }}
      />

      {/* Modal */}
      <Modal isVisible={modalVisible}>
        <View>
          <Text>{message}</Text>
          {message === 'Checked in successfully' || message === 'Checked out successfully' ? (
            <Button title="OK" onPress={closeModal} />
          ) : (
            <Button title="Register Device" onPress={closeModal} />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default AttendanceScreen;
