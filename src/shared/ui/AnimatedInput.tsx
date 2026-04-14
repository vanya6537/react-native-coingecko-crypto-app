/**
 * Animated Input Field with floating label and focus animations
 * Material Design inspired text input with WOW effects
 */

import React, { useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  Layout,
} from 'react-native-reanimated';

interface AnimatedInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  icon?: string;
  color?: string;
  style?: ViewStyle;
  delay?: number;
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  icon,
  color = '#1976D2',
  style,
  delay = 0,
  ...inputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusValue = useSharedValue(value.length > 0 ? 1 : 0);
  const errorValue = useSharedValue(error ? 1 : 0);

  const handleFocus = () => {
    setIsFocused(true);
    focusValue.value = withSpring(1, { damping: 8 });
  };

  const handleBlur = () => {
    if (value.length === 0) {
      focusValue.value = withSpring(0, { damping: 8 });
    }
    setIsFocused(false);
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);
    if (text.length > 0) {
      focusValue.value = withSpring(1, { damping: 8 });
    } else if (!isFocused) {
      focusValue.value = withSpring(0, { damping: 8 });
    }
  };

  const labelStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      focusValue.value,
      [0, 1],
      [14, 11],
      Extrapolate.CLAMP
    ),
    fontWeight: interpolate(
      focusValue.value,
      [0, 1],
      [400, 700],
      Extrapolate.CLAMP
    ) as any,
    color: isFocused
      ? color
      : interpolate(focusValue.value, [0, 1], [0.6, 1], Extrapolate.CLAMP) < 0.8
        ? '#9E9E9E'
        : color,
    transform: [
      {
        translateY: interpolate(focusValue.value, [0, 1], [8, -8], Extrapolate.CLAMP),
      },
    ],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    borderBottomColor: error
      ? '#F44336'
      : isFocused
        ? color
        : interpolate(focusValue.value, [0, 0.5, 1], ['#E0E0E0', '#BDBDBD', color], Extrapolate.CLAMP),
    borderBottomWidth: isFocused ? 2 : 1,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    color: error
      ? '#F44336'
      : isFocused
        ? color
        : '#9E9E9E',
    fontSize: 18,
  }));

  const errorStyle = useAnimatedStyle(() => ({
    opacity: errorValue.value,
    transform: [{ translateY: interpolate(errorValue.value, [0, 1], [-4, 0], Extrapolate.CLAMP) }],
  }));

  return (
    <Animated.View
      style={[
        styles.wrapper,
        style,
      ]}
      entering={FadeInDown.duration(400).delay(delay)}
      layout={Layout.springify()}
    >
      <Animated.View style={[styles.container, containerStyle]}>
        {icon && (
          <Animated.Text style={[styles.icon, iconStyle]}>
            {icon}
          </Animated.Text>
        )}

        {/* Label */}
        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>

        {/* Input */}
        <TextInput
          {...inputProps}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            {
              color: error ? '#F44336' : '#212121',
            },
          ]}
          placeholderTextColor="#BDBDBD"
          cursorColor={color}
        />
      </Animated.View>

      {/* Error message */}
      {error && (
        <Animated.Text style={[styles.errorText, errorStyle]}>
          {error}
        </Animated.Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  icon: {
    marginRight: 8,
    fontWeight: '600',
  },
  label: {
    position: 'absolute',
    left: 0,
    color: '#9E9E9E',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 8,
    paddingHorizontal: 0,
    letterSpacing: 0.2,
  },
  inputWithIcon: {
    marginLeft: 2,
  },
  errorText: {
    fontSize: 11,
    color: '#F44336',
    marginTop: 6,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
