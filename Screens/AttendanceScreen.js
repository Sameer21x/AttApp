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
  const [allowScanning, setAllowScanning] = useState(true); // State to control scanning

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

  const handleBarCodeScanned = async ({ data }) => {
    console.log('Scanned QR Code:', data);
  
    // Check if scanning is allowed
    if (!allowScanning) {
      console.log('Scanning not allowed');
      return;
    }
  
    // Check if the scanned link matches the expected link
    if (data === 'https://me-qr.com/IuU006HM') {
      setScannedLink(data);
      await checkAndRegisterDevice(data, 'B4-69-21-76-35-68', 'c0f7d82050856b8f');
    } else {
      // Show failure modal if the scanned link doesn't match
      showMessage({
        header: { status: 400, message: 'Scanned link does not match the expected link' },
      });
  
      // Reset allowScanning to true for the next scan
      setAllowScanning(true);
    }
  };
  
  

  const checkAndRegisterDevice = async (scannedLink, uniqueId, retry = false) => {
    // ... (other logic)

    if (!uniqueId) {
      // If not, navigate to the 'VerifyDevice' screen
      navigation.navigate('VerifyDevice');
      // Reset the uniqueId state
      setUniqueId('');
    } else {
      // Hit the API and show the response in a modal
      const response = await hitApi(uniqueId);
      if (response.header && response.header.status !== 200 && !retry) {
        // Retry scanning if the response is not successful and it's the first attempt
        console.log('Retrying QR Code Scanning...');
        setTimeout(() => {
          // Scanning after a delay to avoid interference with the ongoing rendering
          checkAndRegisterDevice(scannedLink, uniqueId, true);
        }, 2000);
      } else {
        showMessage(response);
      }
    }
  };

  const hitApi = async (uniqueId) => {
    try {
      const finalUniqueId = uniqueId || 'c0f7d82050856b8f';
  
      const response = await fetch(
        `https://attendance-app-sepia.vercel.app/api/v1/auth/user/check?macAddress=B4-69-21-76-35-68`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deviceId: finalUniqueId,
          }),
        }
      );
  
      const textResult = await response.text();
  
      try {
        const result = JSON.parse(textResult);
  
        if (response.ok) {
          // If the response status is OK, return the result
          return result;
        } else {
          // If the response status is 404, treat it as a success
          if (response.status === 404) {
            return { header: { status: 200, message: 'Checked in successfully' } };
          } else {
            throw new Error(JSON.stringify(result));
          }
        }
      } catch (jsonError) {
        return textResult;
      }
    } catch (error) {
      console.error('Error hitting API:', error.message);
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
    setAllowScanning(false); // Prevent scanning until modal is closed
  };

  const closeModal = () => {
    setModalVisible(false);
    setAllowScanning(true); // Allow scanning again regardless of the message
    setScannedLink(null);
  };
  

  const handleRegisterDevice = () => {
    setScannedLink(null); // Reset scanned link when registering device
    setAllowScanning(true); // Allow scanning again
    setModalVisible(false); // Close the modal
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* Your screen layout */}
      <View style={{ marginTop: 20 }}>
        <Image source={require('../assets/images/icons/logo.jpg')} style={{ width: 50, height: 50, marginLeft:-160 }} />
        <Text style={{ textAlign: "right", color: "black", fontFamily: "Rubik", fontSize: 15, marginRight: -170 }}>Date: {new Date().toLocaleDateString()}</Text>
        </View>
        <View>
        <Text style={{ color: "black", fontFamily: "Rubik", fontSize: 38, marginLeft:-140 }}>Greetings</Text>
        <Text style={{ color: "#97BCE8", fontFamily: "Rubik", fontSize: 18, marginLeft:-140 }}>Mark Your Attendance</Text>
        </View>
      

      {/* QR Code Scanner */}
      <QRCodeScanner
        onRead={handleBarCodeScanned}
        cameraStyle={{ width: 250, height: 200, alignSelf: 'center', marginTop: 10 }}
      />

      {/* Modal */}
      <Modal isVisible={modalVisible}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' }}>
          {/* Green Tick Icon */}
          <Image source={require('../assets/images/icons/greentick.png')} style={{ width: 50, height: 50 }} />

          {/* Message */}
          <Text style={{ marginVertical: 10, fontSize: 18, color: 'black' }}>{message}</Text>

          {/* Buttons */}
          {message === 'Checked in successfully' || message === 'Checked out successfully' ? (
            <Button title="OK" onPress={closeModal} />
          ) : (
            <Button title="Register Device" onPress={handleRegisterDevice} />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default AttendanceScreen;
