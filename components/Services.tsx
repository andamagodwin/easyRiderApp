import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type Service = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive?: boolean;
};

export type ServicesProps = {
  services: Service[];
  onServicePress?: (service: Service) => void;
};

export default function Services({ services, onServicePress }: ServicesProps) {
  return (
    <View>
      <Text className="text-dark1 text-xl font-bold mb-4">Services</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        {services.map((service, index) => (
          <TouchableOpacity
            key={service.id}
            onPress={() => onServicePress?.(service)}
            activeOpacity={0.7}
            className={`mr-3 px-4 py-3 rounded-2xl flex-row items-center ${
              service.isActive ? 'bg-primary' : 'bg-lighter border border-gray2'
            }`}
            style={{ marginRight: index === services.length - 1 ? 16 : 12 }}
          >
            <Ionicons
              name={service.icon}
              size={20}
              color={service.isActive ? '#ffffff' : '#235AFF'}
            />
            <Text
              className={`ml-2 font-medium ${
                service.isActive ? 'text-white' : 'text-dark1'
              }`}
            >
              {service.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}