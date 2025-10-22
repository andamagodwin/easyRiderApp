import { Stack } from 'expo-router';

import { Text, View } from 'react-native';

export default function Home() {
  return (
    <View className={styles.container}>
      <Stack.Screen options={{ title: 'Home' }} />
      <Text className='bg-red-500'>Welcome to the Home Screen!</Text>
    </View>
  );
}



const styles = {
  container: 'flex flex-1 bg-white',
};
