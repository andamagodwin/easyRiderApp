import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="select-stylist" 
        options={{
          title: "Select Stylist",
          headerShown: false,
        }} 
      />
    </Stack>
  );
}