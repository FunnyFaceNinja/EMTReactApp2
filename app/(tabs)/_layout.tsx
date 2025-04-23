import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { HapticTab } from '@/components/HapticTab';
import { Ionicons } from '@expo/vector-icons'; // Change to Ionicons
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
          title: 'MCQ',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="document-text" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Diagram"
        options={{
          title: 'Diagram',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="body" color={color} />,
        }}
      />
      <Tabs.Screen
        name="HighScoresScreen"
        options={{
          title: 'High Scores',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="stats-chart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ScenarioScreen"
        options={{
          title: 'Scenarios',
          tabBarIcon: ({ color }) => <Ionicons name="medkit" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="CPG"
        options={{
          title: 'CPG',
          tabBarIcon: ({ color }) => <Ionicons name="clipboard" color={color} size={28} />,
        }}
      />
    </Tabs>
  );
}