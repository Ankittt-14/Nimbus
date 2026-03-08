import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from "react";
import { Animated, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useWeather } from "../hooks/useWeather";
import { formatDay } from "../utils/weatherHelpers";

export default function ForecastScreen() {
    const { forecast, weather, loading, error, refetch } = useWeather();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setRefreshing(true);
        if (refetch) await refetch();
        setRefreshing(false);
    };

    if (loading) return <SkeletonForecast />;
    if (error || !forecast || forecast.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Feather name="calendar" size={64} color="rgba(255,255,255,0.2)" style={{ marginBottom: 20 }} />
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 10 }}>Forecast Unavailable</Text>
                <Text style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 30 }}>
                    {error || "Unable to load the 7-day forecast data at this time."}
                </Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Pull down to refresh</Text>
                </View>
            </View>
        );
    }

    // Read the coordinates to center the map
    const lat = weather?.coord?.lat || 0;
    const lon = weather?.coord?.lon || 0;

    // Get 1 reading per day (every 8 entries = every 24 hours)
    const daily = forecast.filter((_, i) => i % 8 === 0).slice(0, 7);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>7-Day Forecast</Text>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            >
                {daily.map((item, i) => <ForecastRow key={i} item={item} index={i} timezoneOffset={forecast.city?.timezone} />)}

                {/* Regional Radar section at the bottom */}
                <View style={styles.radarBox}>
                    <View style={styles.radarHeader}>
                        <Text style={styles.radarTitle}>Regional Radar</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Feather name="maximize-2" size={14} color="rgba(255,255,255,0.4)" />
                            <Text style={styles.liveBadge}>LIVE</Text>
                        </View>
                    </View>
                    <View style={styles.radarMap}>
                        {lat !== 0 && lon !== 0 ? (
                            <MapView
                                style={{ width: "100%", height: "100%", borderRadius: 12 }}
                                initialRegion={{
                                    latitude: lat,
                                    longitude: lon,
                                    latitudeDelta: 0.5,
                                    longitudeDelta: 0.5,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                            >
                                <Marker coordinate={{ latitude: lat, longitude: lon }} title={weather?.name} />
                            </MapView>
                        ) : (
                            <Text style={styles.radarCity}>📍 {forecast.city?.name}, {forecast.city?.country}</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

// Each row animates independently with a staggered delay
function ForecastRow({ item, index, timezoneOffset }) {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true })
        ]).start();
    }, []);

    const isToday = index === 0;
    const { name, color } = getIconOptions(item.weather[0].main, item.weather[0].icon);

    return (
        <Animated.View style={[
            styles.row,
            isToday && styles.todayRow,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
            <View style={[styles.iconBox, isToday && styles.todayIconBox]}>
                <Feather name={name} size={22} color={color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.dayName}>{isToday ? "Today" : formatDay(item.dt, timezoneOffset)}</Text>
                <Text style={styles.condText}>{item.weather[0].description}</Text>
            </View>
            <Text style={styles.temps}>
                {Math.round(item.main.temp_max)}°
                <Text style={styles.tempLow}> / {Math.round(item.main.temp_min)}°</Text>
            </Text>
        </Animated.View>
    );
}

function SkeletonForecast() {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true })
            ])
        ).start();
    }, []);

    const animStyle = { opacity: pulseAnim };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>7-Day Forecast</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <View key={i} style={styles.row}>
                        <Animated.View style={[styles.skeletonBlock, animStyle, { width: 44, height: 44, borderRadius: 22, marginRight: 15 }]} />
                        <View style={{ flex: 1 }}>
                            <Animated.View style={[styles.skeletonBlock, animStyle, { width: 80, height: 16, borderRadius: 8, marginBottom: 8 }]} />
                            <Animated.View style={[styles.skeletonBlock, animStyle, { width: 120, height: 12, borderRadius: 6 }]} />
                        </View>
                        <Animated.View style={[styles.skeletonBlock, animStyle, { width: 60, height: 16, borderRadius: 8 }]} />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

function getIconOptions(c, icon) {
    if (icon?.endsWith('n') && c === 'Clear') return { name: "moon", color: "#60a5fa" };
    return {
        Clear: { name: "sun", color: "#fbbf24" },
        Clouds: { name: "cloud", color: "#9ca3af" },
        Rain: { name: "cloud-rain", color: "#60a5fa" },
        Thunderstorm: { name: "cloud-lightning", color: "#818cf8" },
        Snow: { name: "cloud-snow", color: "#e2e8f0" }
    }[c] || { name: "thermometer", color: "#f87171" };
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0d0800", paddingTop: 50 },
    loading: { flex: 1, textAlign: "center", color: "#fff", fontSize: 18, marginTop: 50 },
    title: { color: "#fff", fontSize: 24, fontWeight: "700", marginLeft: 20, marginBottom: 20 },
    row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, marginHorizontal: 16, marginBottom: 8, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16 },
    todayRow: { backgroundColor: "rgba(232, 137, 26, 0.15)", borderColor: "#E8891A", borderWidth: 1 },
    iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginRight: 15 },
    todayIconBox: { backgroundColor: "rgba(232, 137, 26, 0.2)" },
    dayName: { color: "#fff", fontSize: 16, fontWeight: "600" },
    condText: { color: "rgba(255,255,255,0.5)", fontSize: 13, textTransform: "capitalize", marginTop: 2 },
    temps: { color: "#fff", fontSize: 16, fontWeight: "700" },
    tempLow: { color: "rgba(255,255,255,0.4)" },
    radarBox: { margin: 16, marginTop: 20, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 20, padding: 16 },
    radarHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
    radarTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
    liveBadge: { color: "#FF3B30", fontWeight: "800", fontSize: 12, backgroundColor: "rgba(255,59,48,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: "hidden" },
    radarMap: { height: 160, backgroundColor: "#1c2024", borderRadius: 12, alignItems: "center", justifyContent: "center" },
    radarCity: { color: "#fff", fontWeight: "600" },
    skeletonBlock: { backgroundColor: "rgba(255,255,255,0.08)" },
});