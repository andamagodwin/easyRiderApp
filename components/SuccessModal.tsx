import React from 'react';
import { Modal, View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SuccessModalProps = {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
};

export function SuccessModal({ 
  visible, 
  title, 
  message, 
  buttonText = "Done",
  onClose 
}: SuccessModalProps) {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, scaleAnim]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <Animated.View 
          style={{ transform: [{ scale: scaleAnim }] }}
          className="bg-white rounded-3xl p-6 w-full max-w-sm"
        >
          {/* Success Icon */}
          <View className="items-center mb-4">
            <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center">
              <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-dark1 text-center mb-3">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-base text-gray1 text-center mb-6">
            {message}
          </Text>

          {/* Button */}
          <TouchableOpacity 
            onPress={onClose}
            className="bg-primary py-4 rounded-2xl"
          >
            <Text className="text-white text-center text-lg font-semibold">
              {buttonText}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
