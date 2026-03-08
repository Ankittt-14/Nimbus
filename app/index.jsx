import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from "expo-linear-gradient";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useWeather } from "../hooks/useWeather";
import { formatHour, getGradient } from "../utils/weatherHelpers";
import { WeatherContext } from "./_layout";

export default function HomeScreen() {
    const { setGlobalCity } = useContext(WeatherContext);
    const { weather, forecast, loading, error, refetch } = useWeather();
    const spinAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setRefreshing(true);
        if (refetch) await refetch();
        setRefreshing(false);
    };

    const handleLocReset = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setGlobalCity(null);
    };

    useEffect(() => {
        // ① Fade the whole screen in on load
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }, []);

    if (loading) return <SkeletonHome />;

    if (error || !weather) {
        return (
            <View style={[styles.container, { backgroundColor: '#0d0800', justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Feather name="cloud-off" size={64} color="rgba(255,255,255,0.4)" style={{ marginBottom: 20 }} />
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 10 }}>Weather Unavailable</Text>
                <Text style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 30 }}>
                    {error || "Could not retrieve weather data."}
                </Text>
                <TouchableOpacity
                    onPress={onRefresh}
                    style={{ backgroundColor: '#E8891A', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 }}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tap to Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isNight = weather?.weather[0]?.icon?.endsWith('n');
    const gradient = getGradient(weather?.weather[0]?.main, weather?.weather[0]?.icon);

    return (
        <LinearGradient colors={gradient} style={styles.container}>
            <Animated.ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1, opacity: fadeAnim }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            >

                {/* Top: city name + bell */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={handleLocReset} style={styles.locButton}>
                        <Text style={styles.cityName}>📍 {weather?.name}</Text>
                        <Text style={styles.locSubtitle}>Tap to use current location</Text>
                    </TouchableOpacity>
                    <View style={styles.bellBtn}><Text>🔔</Text></View>
                </View>

                {/* Weather Vector Icon */}
                <View style={[styles.sunContainer, {
                    width: 150, height: 150, borderRadius: 75,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    justifyContent: 'center', alignItems: 'center',
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
                }]}>
                    <Feather name={getFeatherIcon(weather?.weather[0]?.main, weather?.weather[0]?.icon)} size={72} color={getFeatherColor(weather?.weather[0]?.main, weather?.weather[0]?.icon)} />
                </View>

                {/* Big temperature display */}
                <Text style={styles.temp}>{Math.round(weather?.main?.temp)}°</Text>
                <Text style={styles.condition}>{weather?.weather[0]?.description}</Text>
                <Text style={styles.hl}>H: {Math.round(weather?.main?.temp_max)}°  L: {Math.round(weather?.main?.temp_min)}°</Text>
                <Text style={styles.feels}>Feels like {Math.round(weather?.main?.feels_like)}°</Text>

                {/* Hourly forecast row */}
                <View style={styles.hourlyBox}>
                    <View style={styles.hourlyHeader}>
                        <Text style={styles.hourlyTitle}>Hourly Forecast</Text>
                        <Text style={styles.todayTag}>Today</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {forecast.slice(0, 8).map((item, i) => (
                            <View key={i} style={[styles.hourCard, i === 0 && styles.activeCard]}>
                                <Text style={styles.hourLabel}>{i === 0 ? "Now" : formatHour(item.dt, weather?.timezone)}</Text>
                                <Feather name={getFeatherIcon(item.weather[0].main, item.weather[0].icon)} size={22} color={getFeatherColor(item.weather[0].main, item.weather[0].icon)} style={{ marginVertical: 4 }} />
                                <Text style={styles.hourTemp}>{Math.round(item.main.temp)}°</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

            </Animated.ScrollView>
        </LinearGradient>
    );
}

function SkeletonHome() {
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
        <LinearGradient colors={["#1c2024", "#0a0c0e"]} style={styles.container}>
            {/* Top Bar Skeleton */}
            <View style={styles.topBar}>
                <View>
                    <Animated.View style={[styles.skeletonBlock, animStyle, { width: 150, height: 24, borderRadius: 12 }]} />
                    <Animated.View style={[styles.skeletonBlock, animStyle, { width: 180, height: 14, borderRadius: 6, marginTop: 8 }]} />
                </View>
                <Animated.View style={[styles.skeletonBlock, animStyle, { width: 40, height: 40, borderRadius: 20 }]} />
            </View>

            {/* Main Weather Skeleton */}
            <View style={styles.sunContainer}>
                <Animated.View style={[styles.skeletonBlock, animStyle, { width: 140, height: 140, borderRadius: 70, marginVertical: 20 }]} />
            </View>

            <View style={{ alignItems: "center" }}>
                <Animated.View style={[styles.skeletonBlock, animStyle, { width: 120, height: 80, borderRadius: 20, marginBottom: 15 }]} />
                <Animated.View style={[styles.skeletonBlock, animStyle, { width: 160, height: 24, borderRadius: 12, marginBottom: 10 }]} />
                <Animated.View style={[styles.skeletonBlock, animStyle, { width: 100, height: 16, borderRadius: 8 }]} />
            </View>

            {/* Hourly Skeleton */}
            <View style={[styles.hourlyBox, { marginTop: 40 }]}>
                <View style={styles.hourlyHeader}>
                    <Animated.View style={[styles.skeletonBlock, animStyle, { width: 100, height: 18, borderRadius: 8 }]} />
                    <Animated.View style={[styles.skeletonBlock, animStyle, { width: 40, height: 18, borderRadius: 8 }]} />
                </View>
                <View style={{ flexDirection: "row", gap: 10 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Animated.View key={i} style={[styles.skeletonBlock, animStyle, { width: 65, height: 90, borderRadius: 14 }]} />
                    ))}
                </View>
            </View>
        </LinearGradient>
    );
}

function getFeatherIcon(c, icon) {
    if (icon?.endsWith('n') && c === 'Clear') return "moon";
    return { Clear: "sun", Clouds: "cloud", Rain: "cloud-rain", Thunderstorm: "cloud-lightning", Snow: "cloud-snow" }[c] || "thermometer";
}

function getFeatherColor(c, icon) {
    if (icon?.endsWith('n') && c === 'Clear') return "#60a5fa";
    return { Clear: "#fbbf24", Clouds: "#9ca3af", Rain: "#60a5fa", Thunderstorm: "#818cf8", Snow: "#e2e8f0" }[c] || "#f87171";
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 50 },
    loading: { flex: 1, textAlign: "center", color: "#fff", fontSize: 18 },
    topBar: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", paddingHorizontal: 20
    },
    locButton: { flex: 1 },
    locSubtitle: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "500", marginTop: 2 },
    cityName: { color: "#fff", fontSize: 18, fontWeight: "700" },
    bellBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center", justifyContent: "center"
    },
    sunContainer: { alignItems: "center", marginVertical: 20 },
    sunIcon: { fontSize: 90 },
    temp: { textAlign: "center", fontSize: 80, fontWeight: "800", color: "#fff" },
    condition: { textAlign: "center", fontSize: 22, color: "#E8891A", fontWeight: "700", textTransform: "capitalize" },
    hl: { textAlign: "center", color: "rgba(255,255,255,0.6)", marginTop: 6 },
    feels: { textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: 13 },
    hourlyBox: { margin: 16, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 20, padding: 14 },
    hourlyHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    hourlyTitle: { color: "#fff", fontWeight: "700", fontSize: 15 },
    todayTag: { color: "#E8891A", fontWeight: "600" },
    hourCard: {
        width: 65, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 14,
        padding: 10, alignItems: "center", marginRight: 8, gap: 6
    },
    activeCard: { backgroundColor: "#E8891A" },
    hourLabel: { color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: "600" },
    hourIcon: { fontSize: 22 },
    hourTemp: { color: "#fff", fontWeight: "700", fontSize: 14 },
    skeletonBlock: { backgroundColor: "rgba(255,255,255,0.08)" },
});