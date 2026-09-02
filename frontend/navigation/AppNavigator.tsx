import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import VoiceAssistantScreen from '../screens/VoiceAssistantScreen';
import MarketplaceNavigator from './MarketplaceNavigator';
import { useLanguage } from '../contexts/LanguageContext';

export type RootTabParamList = {
  VoiceAssistant: undefined;
  Marketplace: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function AppNavigator() {
  const { language, t } = useLanguage();
  const [tabLabels, setTabLabels] = useState({
    voiceAssistant: t('nav.voiceAssistant'),
    marketplace: t('nav.marketplace'),
  });

  // Update tab labels when language changes
  useEffect(() => {
    setTabLabels({
      voiceAssistant: t('nav.voiceAssistant'),
      marketplace: t('nav.marketplace'),
    });
  }, [language, t]);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2e7d32',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
        },
        headerStyle: { backgroundColor: '#2e7d32' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="VoiceAssistant"
        component={VoiceAssistantScreen}
        options={{
          title: tabLabels.voiceAssistant,
          tabBarLabel: tabLabels.voiceAssistant,
          // Tab bar icon placeholder — swap for real icons later
          tabBarIcon: ({ color, size }) => (
            <TabIcon text="🎙️" size={size} />
          ),
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceNavigator}
        options={{
          title: tabLabels.marketplace,
          tabBarLabel: tabLabels.marketplace,
          tabBarIcon: ({ color, size }) => (
            <TabIcon text="🛒" size={size} />
          ),
          // Hide the tab-level header so the stack header takes over
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

/** Simple text-based tab icon component */
function TabIcon({ text, size }: { text: string; size: number }) {
  return <Text style={{ fontSize: size * 0.6 }}>{text}</Text>;
}
