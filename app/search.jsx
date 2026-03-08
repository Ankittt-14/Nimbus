import { Feather } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { WeatherContext } from "./_layout";

const FILTERS = ["Current Location", "Favorites", "Map View"];

export default function SearchScreen() {
  const { setGlobalCity } = useContext(WeatherContext);
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [filter, setFilter] = useState("Current Location");
  const [recent, setRecent] = useState([]);

  // Load saved searches when screen opens
  useEffect(() => {
    async function loadSaved() {
      const saved = await AsyncStorage.getItem("recentSearches");
      if (saved) setRecent(JSON.parse(saved));
    }
    loadSaved();
  }, []);

  // Live autocomplete as user types
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
        // Search Geocoding API for city names matching query
        const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`);
        const data = await res.json();
        setSuggestions(data || []);
      } catch (err) {
        setSuggestions([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  async function handleSearch(cityName) {
    const searchTarget = typeof cityName === 'string' ? cityName : query;
    if (!searchTarget.trim()) return;

    // Hide suggestions
    setSuggestions([]);

    // Add a temporary loading state
    const loadingCity = { city: "Searching...", country: "", temp: "--", icon: "⏳", isTemp: true };
    setRecent([loadingCity, ...recent.filter(r => !r.isTemp)].slice(0, 10));

    try {
      const BASE = process.env.EXPO_PUBLIC_BASE_URL;
      const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

      const res = await fetch(`${BASE}/weather?q=${searchTarget}&appid=${API_KEY}&units=metric`);
      const data = await res.json();

      if (data.cod === 200) {
        const condition = data.weather[0].main;
        const iconCode = data.weather[0].icon;
        const isNight = iconCode?.endsWith('n');
        let icon = { Clear: "☀️", Clouds: "⛅", Rain: "🌧️", Thunderstorm: "⛈️", Snow: "❄️" }[condition] || "🌡️";
        if (isNight && condition === 'Clear') icon = "🌙";

        const newCity = {
          city: data.name,
          country: data.sys.country,
          temp: Math.round(data.main.temp),
          icon: icon
        };

        const updated = [newCity, ...recent.filter(r => r.city !== newCity.city && !r.isTemp)].slice(0, 10);
        setRecent(updated);
        await AsyncStorage.setItem("recentSearches", JSON.stringify(updated));
        setQuery("");
      } else {
        alert("City not found");
        setRecent(recent.filter(r => !r.isTemp));
      }
    } catch (err) {
      alert("Failed to search city");
      setRecent(recent.filter(r => !r.isTemp));
    }
  }

  function handleCityTap(item) {
    if (item.isTemp) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGlobalCity(item.city);
    router.navigate("/");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search City</Text>

      {/* Search input */}
      <View style={styles.searchBar}>
        <Feather name="search" size={20} color="rgba(255,255,255,0.5)" />
        <TextInput
          style={styles.input}
          placeholder="Search city..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleSearch(query);
          }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setQuery("");
          }}>
            <Feather name="x-circle" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        )}
      </View>

      {/* Autocomplete Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsBox}>
          {suggestions.map((s, index) => (
            <TouchableOpacity
              key={`${s.name}-${s.lat}-${index}`}
              style={styles.suggestionRow}
              onPress={() => {
                setQuery(s.name);
                handleSearch(s.name);
              }}
            >
              <Text style={styles.suggestionCity}>{s.name}</Text>
              <Text style={styles.suggestionState}>{s.state ? `${s.state}, ` : ''}{s.country}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[styles.tab, filter === f && styles.activeTab]} onPress={() => setFilter(f)}>
            <Text style={[styles.tabText, filter === f && styles.activeTabText]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.recentHeader}>
        <Text style={styles.recentTitle}>Recent Searches</Text>
        <TouchableOpacity onPress={() => { setRecent([]); AsyncStorage.removeItem("recentSearches"); }}>
          <Text style={styles.clearAll}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={recent}
        keyExtractor={i => i.city}
        contentContainerStyle={[
          { paddingBottom: 100 },
          recent.length === 0 && { flex: 1, justifyContent: "center", alignItems: "center" }
        ]}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center", opacity: 0.5 }}>
            <Feather name="map" size={48} color="#fff" style={{ marginBottom: 12 }} />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}>No recent searches</Text>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 4 }}>Cities you search for will appear here</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.cityRow} onPress={() => handleCityTap(item)}>
            <View style={styles.clockIcon}><Text>🕐</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cityName}>{item.city}</Text>
              <Text style={styles.cityCountry}>{item.country}</Text>
            </View>
            <Text style={styles.cityTemp}>{item.temp}°</Text>
            <Text>{item.icon}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0800", paddingTop: 50 },
  title: { color: "#fff", fontSize: 24, fontWeight: "700", marginLeft: 20, marginBottom: 20 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", marginHorizontal: 20, borderRadius: 16, paddingHorizontal: 15, height: 50, marginBottom: 20, zIndex: 10 },
  input: { flex: 1, color: "#fff", marginLeft: 10, fontSize: 16 },

  suggestionsBox: {
    backgroundColor: "#1c2024",
    marginHorizontal: 20,
    borderRadius: 12,
    marginTop: -10,
    marginBottom: 20,
    paddingVertical: 8,
    zIndex: 5,
  },
  suggestionRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)"
  },
  suggestionCity: { color: "#fff", fontSize: 16, fontWeight: "600" },
  suggestionState: { color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 2 },

  filterRow: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 25 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)", marginRight: 10 },
  activeTab: { backgroundColor: "#E8891A" },
  tabText: { color: "rgba(255,255,255,0.6)", fontWeight: "600" },
  activeTabText: { color: "#fff" },
  recentHeader: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 15 },
  recentTitle: { color: "#fff", fontWeight: "700", fontSize: 17 },
  clearAll: { color: "rgba(255,255,255,0.4)" },
  cityRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, marginHorizontal: 16, marginBottom: 8, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16 },
  clockIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center", marginRight: 15 },
  cityName: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cityCountry: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 },
  cityTemp: { color: "#fff", fontSize: 18, fontWeight: "700", marginRight: 15 },
  arrow: { color: "rgba(255,255,255,0.3)", fontSize: 24, marginLeft: 15, marginBottom: 2 }
});