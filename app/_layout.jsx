import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from "expo-router";
import { createContext, useState } from "react";
import { StyleSheet, View } from "react-native";
import SplashScreen from "./splash";

export const WeatherContext = createContext();

export default function Layout() {
  const [globalCity, setGlobalCity] = useState(null);
  const [appReady, setAppReady] = useState(false);

  return (
    <WeatherContext.Provider value={{ globalCity, setGlobalCity }}>
      <View style={{ flex: 1 }}>
        <Tabs screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: "rgba(13, 8, 0, 0.6)", // Semi-transparent dark
            borderTopColor: "rgba(255,255,255,0.1)",
            paddingBottom: 8,
            height: 64,
            elevation: 0, // Remove shadow on Android
          },
          tabBarBackground: () => (
            <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFill} />
          ),
          tabBarActiveTintColor: "#E8891A",
          tabBarInactiveTintColor: "rgba(255,255,255,0.35)",
        }}>
          <Tabs.Screen name="index" options={{ title: "Weather", tabBarIcon: ({ color }) => <Feather name="cloud" size={24} color={color} /> }} />
          <Tabs.Screen name="forecast" options={{ title: "Forecast", tabBarIcon: ({ color }) => <Feather name="calendar" size={24} color={color} /> }} />
          <Tabs.Screen name="search" options={{ title: "Search", tabBarIcon: ({ color }) => <Feather name="search" size={24} color={color} /> }} />
          <Tabs.Screen name="splash" options={{ href: null }} />
        </Tabs>

        {/* Full Screen Custom Nimbus Splash Overlay */}
        {!appReady && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]}>
            <SplashScreen onDone={() => setAppReady(true)} />
          </View>
        )}
      </View>
    </WeatherContext.Provider>
  );
}