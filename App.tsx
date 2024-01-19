// In your navigation setup
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AttendanceScreen from './Screens/AttendanceScreen';
import VerifyDeviceScreen from './Screens/VerifyDevice';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AttendanceScreen">
        <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} />
        {/* <Stack.Screen name="VerifyDevice" component={VerifyDeviceScreen} /> */}
        {/* Add other screens as needed */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
