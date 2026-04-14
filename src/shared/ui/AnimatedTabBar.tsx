/**
 * Animated Tab Bar with sliding indicator and smooth transitions
 * Premium navigation with Reanimated physics and spring animations
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  FadeInDown,
  Layout,
} from 'react-native-reanimated';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface AnimatedTabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  color?: string;
  backgroundColor?: string;
}

interface TabLayout {
  x: number;
  width: number;
}

const screenWidth = Dimensions.get('window').width;

export const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  color = '#1976D2',
  backgroundColor = '#FFFFFF',
}) => {
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const activeTabLayout = tabLayouts[activeTab];

  useEffect(() => {
    if (activeTabLayout) {
      indicatorX.value = withSpring(activeTabLayout.x, { damping: 8 });
      indicatorWidth.value = withSpring(activeTabLayout.width, { damping: 8 });

      // Scroll to active tab
      if (scrollViewRef.current) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: Math.max(0, activeTabLayout.x - 30),
            animated: true,
          });
        }, 100);
      }
    }
  }, [activeTab, activeTabLayout]);

  const handleTabLayout = (tabId: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => ({
      ...prev,
      [tabId]: { x, width },
    }));
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  return (
    <Animated.View
      style={[styles.container, { backgroundColor }]}
      entering={FadeInDown.duration(400).delay(100)}
      layout={Layout.springify()}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {tabs.map((tab, index) => (
          <Animated.View
            key={tab.id}
            onLayout={(event) => handleTabLayout(tab.id, event)}
            entering={FadeInDown.duration(400).delay(150 + index * 50)}
            layout={Layout.springify()}
          >
            <Pressable
              onPress={() => onTabChange(tab.id)}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab,
              ]}
            >
              {tab.icon && (
                <Animated.Text
                  style={[
                    styles.tabIcon,
                    {
                      color: activeTab === tab.id ? color : '#757575',
                    },
                  ]}
                >
                  {tab.icon}
                </Animated.Text>
              )}
              <Animated.Text
                style={[
                  styles.tabLabel,
                  {
                    color: activeTab === tab.id ? color : '#757575',
                    fontWeight: activeTab === tab.id ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Animated.Text>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Animated Indicator */}
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: color },
          indicatorStyle,
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollView: {
    height: 56,
  },
  tab: {
    paddingHorizontal: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  activeTab: {
    opacity: 1,
  },
  tabIcon: {
    fontSize: 18,
    marginRight: 6,
    fontWeight: '600',
  },
  tabLabel: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  indicator: {
    height: 3,
    borderTopRightRadius: 1.5,
    borderTopLeftRadius: 1.5,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});
