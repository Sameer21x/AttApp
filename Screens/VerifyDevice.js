// VerifyDevice.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RadioButton } from 'react-native';

const VerifyDeviceScreen = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    // Fetch emails from the API
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const macAddress = 'B4-69-21-76-35-68';
      const response = await fetch(`https://attendance-app-sepia.vercel.app/api/v1/auth/user/emails?macAddress=${macAddress}`);
      const result = await response.json();

      console.log('API Response:', result);

      if (result.body && result.body.length > 0) {
        setEmails(result.body);
      } else {
        console.error('Error: Emails array is undefined or empty in API response');
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  return (
    <View>
      <Text>Select your email:</Text>
      <ScrollView>
        {emails.map((email) => (
          <View key={email._id}>
            <Text>{email.email}</Text>
            <RadioButton
              value={email._id}
              status={selectedEmail === email._id ? 'checked' : 'unchecked'}
              onPress={() => setSelectedEmail(email._id)}
            />
          </View>
        ))}
      </ScrollView>
      {/* Add a button to submit the selected email and handle the submission logic */}
    </View>
  );
};

export default VerifyDeviceScreen;
