import { Stack } from 'expo-router';
import type { ReactNode } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import PromoBanner from '../components/PromoBanner';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';

export default function Home() {
  return (
    <SafeAreaView className={styles.container}>
      <Stack.Screen options={{ title: 'Home' }} />
      <Header />
      <MainContent />
    </SafeAreaView>
  );
}



const styles = {
  container: 'flex flex-1 bg-white',
};

function MainContent() {
  return (
    <>
      <Section>
        <SearchBar />
      </Section>

      <Section className="mt-4">
        <PromoBanner />
      </Section>
    </>
  );
}

function Section({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <View className={`px-4 ${className}`}>{children}</View>;
}
