import React from 'react';
import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  value?: string;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChangeText,
  onFocus,
  placeholder = 'Enter address or city name',
}: Props) {
  return (
    <View className="bg-lighter flex-row items-center rounded-2xl px-4 h-14">
      <Ionicons name="search-outline" size={22} color="#A0A0A0" />
      <TextInput
        className="flex-1 ml-3 text-dark1"
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        returnKeyType="search"
      />
    </View>
  );
}
