// VerifyDevice.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RadioButton } from 'react-native';

const VerifyDeviceScreen = () => {
  const [emails, setEmails] = useState([]); // Array to store fetched emails
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    // Fetch emails from the API
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const macAddress = 'B4-69-21-76-35-68'; // Replace with the actual MAC address
      const response = await fetch(`https://attendance-app-sepia.vercel.app/api/v1/auth/user/emails?macAddress=${macAddress}`);
      const result = await response.json();
      // Check if 'emails' is not undefined before setting state
      if (result.emails !== undefined) {
        setEmails(result.emails); // Assuming the API response contains an 'emails' array
      } else {
        console.error('Error: Emails array is undefined in API response');
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  return (
    <View>
      <Text>Select your email:</Text>
      <ScrollView>
        {emails && emails.map((email) => (
          <View key={email.id}>
            <Text>{email.address}</Text>
            <RadioButton
              value={email.id}
              status={selectedEmail === email.id ? 'checked' : 'unchecked'}
              onPress={() => setSelectedEmail(email.id)}
            />
          </View>
        ))}
      </ScrollView>
      {/* Add a button to submit the selected email and handle the submission logic */}
    </View>
  );
};

export default VerifyDeviceScreen;
