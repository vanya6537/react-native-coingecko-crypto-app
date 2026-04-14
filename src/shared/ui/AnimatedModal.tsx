/**
 * Animated Modal with backdrop, scale, and entrance animations
 * Reusable modal component with WOW effect entrance and exit
 */

import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Modal,
  ViewStyle,
  ModalProps,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
  Layout,
} from 'react-native-reanimated';

interface AnimatedModalProps {
  children: React.ReactNode;
  visible: boolean;
  onDismiss: () => void;
  style?: ViewStyle;
  backdropOpacity?: number;
  animationType?: 'fade' | 'slide' | 'zoom';
  delay?: number;
  transparent?: boolean;
  hardwareAccelerated?: boolean;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  children,
  visible,
  onDismiss,
  style,
  backdropOpacity = 0.5,
  animationType = 'zoom',
  delay = 0,
  transparent = true,
  hardwareAccelerated = true,
}) => {
  const getEnteringAnimation = () => {
    switch (animationType) {
      case 'fade':
        return FadeIn.duration(300);
      case 'slide':
        return ZoomIn.duration(400).springify();
      case 'zoom':
      default:
        return ZoomIn.duration(400).springify();
    }
  };

  const getExitingAnimation = () => {
    switch (animationType) {
      case 'fade':
        return FadeOut.duration(300);
      case 'slide':
        return ZoomOut.duration(300);
      case 'zoom':
      default:
        return ZoomOut.duration(300);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={transparent}
      animationType="none"
      hardwareAccelerated={hardwareAccelerated}
      onRequestClose={onDismiss}
    >
      {/* Animated Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
          },
        ]}
        entering={FadeIn.duration(300).delay(delay)}
        exiting={FadeOut.duration(300)}
      >
        <Pressable
          style={styles.backdropPressable}
          onPress={onDismiss}
          hitSlop={10}
        />
      </Animated.View>

      {/* Animated Modal Content */}
      <Animated.View
        style={[styles.modalContainer]}
        entering={getEnteringAnimation().delay(delay + 50)}
        exiting={getExitingAnimation()}
        layout={Layout.springify()}
      >
        <View
          style={[
            styles.modalContent,
            style,
          ]}
          onStartShouldSetResponder={() => true}
        >
          {children}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
    maxWidth: '90%',
  },
});
