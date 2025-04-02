import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';

const Colors = {
  light: {
    tint: '#F26969',
    background: '#F2F7D9',
    text: 'black',
    tabBar: '#71D6C8',
  },
  dark: {
    tint: '#F26969',
    background: '#333',
    text: 'white',
    tabBar: '#71D6C8',
  },
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.tint,
        tabBarInactiveTintColor: themeColors.text,
        tabBarStyle: {
          backgroundColor: themeColors.tabBar,
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="MCQ"
        options={{
          title: 'MCQ',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="questionmark" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Diagram"
        options={{
          title: 'Diagram',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="questionmark" color={color} />,
        }}
      />
      <Tabs.Screen
        name="HighScores"
        options={{
          title: 'High Scores',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ScenarioScreen"
        options={{
          title: 'Scenarios',
          tabBarIcon: ({ color }) => <IconSymbol name="questionmark" color={color} size={28} />,
        }}
      />
    </Tabs>
  );
}