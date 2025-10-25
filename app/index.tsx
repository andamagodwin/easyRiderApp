import { Stack } from 'expo-router';
import Map from '../components/Map';
import { View } from 'react-native';

export default function Home() {
  return (
    <View className={styles.container}>
      <Stack.Screen options={{ title: 'Home' }} />
      <Map />
    </View>
  );
}



const styles = {
  container: 'flex flex-1 bg-white',
};
