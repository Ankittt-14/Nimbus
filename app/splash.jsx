// ─────────────────────────────────────────────────────────────────
//  NIMBUS — Splash Screen  (app/splash.jsx)
//  Animation: Sun rises from bottom → Logo appears → Loading bar
// ─────────────────────────────────────────────────────────────────

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ onDone }) {
    const router = useRouter();

    // ── Animation values ──────────────────────────────────────────
    const sunY = useRef(new Animated.Value(200)).current;  // sun starts below screen
    const sunScale = useRef(new Animated.Value(0.4)).current;  // sun starts small
    const sunSpin = useRef(new Animated.Value(0)).current;    // rays rotate
    const sunGlow = useRef(new Animated.Value(0)).current;    // glow opacity
    const horizonGlow = useRef(new Animated.Value(0)).current;    // bottom glow
    const logoOpacity = useRef(new Animated.Value(0)).current;    // logo fade
    const logoY = useRef(new Animated.Value(40)).current;   // logo slide
    const loaderWidth = useRef(new Animated.Value(0)).current;    // loading bar
    const bgOpacity = useRef(new Animated.Value(0)).current;    // whole screen fade in

    useEffect(() => {
        StatusBar.setHidden(true);

        // ① Fade screen in
        Animated.timing(bgOpacity, {
            toValue: 1, duration: 400, useNativeDriver: true,
        }).start();

        // ② Sun rises up from bottom + horizon glow together
        Animated.parallel([
            Animated.spring(sunY, {
                toValue: -80,           // final Y position (negative = up)
                tension: 40,
                friction: 8,
                delay: 300,
                useNativeDriver: true,
            }),
            Animated.spring(sunScale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                delay: 300,
                useNativeDriver: true,
            }),
            Animated.timing(horizonGlow, {
                toValue: 1, duration: 1200, delay: 300, useNativeDriver: true,
            }),
            Animated.timing(sunGlow, {
                toValue: 1, duration: 800, delay: 600, useNativeDriver: true,
            }),
        ]).start();

        // ③ Rays spin continuously
        Animated.loop(
            Animated.timing(sunSpin, {
                toValue: 1, duration: 10000, useNativeDriver: true,
            })
        ).start();

        // ④ Logo appears after sun is visible
        Animated.parallel([
            Animated.spring(logoY, {
                toValue: 0, tension: 60, friction: 8, delay: 1400, useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
                toValue: 1, duration: 600, delay: 1400, useNativeDriver: true,
            }),
        ]).start();

        // ⑤ Loading bar fills
        Animated.timing(loaderWidth, {
            toValue: 140,   // final width in px
            duration: 1800,
            delay: 2000,
            useNativeDriver: false,   // width can't use native driver
        }).start();

        // ⑥ Navigate to Home after animation completes
        const timer = setTimeout(() => {
            StatusBar.setHidden(false);
            if (onDone) {
                onDone();
            } else {
                router.replace("/");   // go to home screen fallback
            }
        }, 4000);

        return () => clearTimeout(timer);
    }, []);

    // Rays rotation interpolation
    const spin = sunSpin.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <Animated.View style={[styles.container, { opacity: bgOpacity }]}>
            <LinearGradient
                colors={["#0A0702", "#130A02", "#1A0E04"]}
                style={StyleSheet.absoluteFill}
            />

            {/* ── Atmosphere ────────── */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: horizonGlow }]}>
                <LinearGradient
                    colors={["transparent", "rgba(232,137,26,0.1)"]}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>

            {/* ── Stars ─────────────── */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: horizonGlow }]}>
                {Array.from({ length: 40 }).map((_, i) => <Star key={i} />)}
            </Animated.View>

            {/* ── Floating Particles ── */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: sunGlow }]}>
                {[1, 2, 3, 4, 5, 6].map((i) => <Particle key={i} index={i} />)}
            </Animated.View>

            {/* ── Horizon glow ─────────────────────────────────── */}
            <Animated.View
                style={[styles.horizonGlow, { opacity: horizonGlow }]}
                pointerEvents="none"
            />

            {/* ── Sun ──────────────────────────────────────────── */}
            <Animated.View
                style={[
                    styles.sunContainer,
                    {
                        transform: [
                            { translateY: sunY },
                            { scale: sunScale },
                        ],
                    },
                ]}
            >
                {/* Outer glow ring */}
                <Animated.View style={[styles.sunGlowRing, { opacity: sunGlow }]} />

                {/* Spinning rays */}
                <Animated.View
                    style={[styles.raysContainer, { transform: [{ rotate: spin }] }]}
                >
                    {Array.from({ length: 12 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.ray,
                                { transform: [{ rotate: `${(360 / 12) * i}deg` }] },
                            ]}
                        />
                    ))}
                </Animated.View>

                {/* Sun core */}
                <View style={styles.sunCore}>
                    <View style={styles.sunInner} />
                </View>
            </Animated.View>

            {/* ── Horizon line ─────────────────────────────────── */}
            <LinearGradient
                colors={["transparent", "rgba(10,7,2,0.95)"]}
                style={styles.horizonLine}
                pointerEvents="none"
            />

            {/* ── Logo ─────────────────────────────────────────── */}
            <Animated.View
                style={[
                    styles.logoArea,
                    {
                        opacity: logoOpacity,
                        transform: [{ translateY: logoY }],
                    },
                ]}
            >
                <Text style={styles.appName}>
                    NI<Text style={styles.appNameAccent}>M</Text>BUS
                </Text>
                <Text style={styles.tagline}>YOUR SKY, SIMPLIFIED</Text>
            </Animated.View>

            {/* ── Loading bar ──────────────────────────────────── */}
            <Animated.View style={[styles.loaderWrap, { opacity: logoOpacity }]}>
                <View style={styles.loaderTrack}>
                    <Animated.View style={[styles.loaderFill, { width: loaderWidth }]} />
                </View>
                {/* Dots */}
                <View style={styles.dots}>
                    {[0, 1, 2].map((i) => (
                        <LoadingDot key={i} delay={i * 200} />
                    ))}
                </View>
            </Animated.View>

        </Animated.View>
    );
}

// Animated loading dot component
function LoadingDot({ delay }) {
    const anim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={[styles.dot, { opacity: anim }]} />
    );
}

// Animated Star component
function Star() {
    const size = useRef(Math.random() * 2.5 + 0.5).current;
    const top = useRef(`${Math.random() * 60}%`).current;
    const left = useRef(`${Math.random() * 100}%`).current;
    const delay = useRef(Math.random() * 3000).current;
    const duration = useRef(1500 + Math.random() * 2000).current;
    const opacityAnim = useRef(new Animated.Value(0.3)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(opacityAnim, { toValue: 1, duration, delay, useNativeDriver: true }),
                    Animated.timing(scaleAnim, { toValue: 1.4, duration, delay, useNativeDriver: true })
                ]),
                Animated.parallel([
                    Animated.timing(opacityAnim, { toValue: 0.3, duration, useNativeDriver: true }),
                    Animated.timing(scaleAnim, { toValue: 1, duration, useNativeDriver: true })
                ])
            ])
        ).start();
    }, []);

    return <Animated.View style={{ position: 'absolute', top, left, width: size, height: size, backgroundColor: '#fff', borderRadius: size / 2, opacity: opacityAnim, transform: [{ scale: scaleAnim }] }} />
}

// Floating Particle component
function Particle({ index }) {
    const size = useRef(Math.random() * 4 + 2).current;
    const left = useRef(`${30 + Math.random() * 40}%`).current;
    const duration = useRef(2000 + Math.random() * 3000).current;
    const delay = useRef(index * 400).current;
    const startY = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        Animated.loop(
            Animated.parallel([
                Animated.timing(startY, { toValue: -300, duration, delay, useNativeDriver: true }),
                Animated.timing(scale, { toValue: 0, duration, delay, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration, delay, useNativeDriver: true })
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={{
            position: 'absolute', bottom: 80 + Math.random() * 60, left,
            width: size, height: size, backgroundColor: 'rgba(232,137,26,0.6)', borderRadius: size / 2,
            opacity, transform: [{ translateY: startY }, { scale }]
        }} />
    );
}

// ─────────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────────
const ORANGE = "#E8891A";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0A0702",
    },

    // Horizon warm glow at bottom
    horizonGlow: {
        position: "absolute",
        bottom: -100,
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width * 0.75,
        backgroundColor: "transparent",
        // Use shadow for glow effect
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 80,
        // Android glow
        elevation: 0,
    },

    // Sun position
    sunContainer: {
        position: "absolute",
        bottom: "30%",
        alignItems: "center",
        justifyContent: "center",
        width: 160,
        height: 160,
    },

    // Outer glow ring
    sunGlowRing: {
        position: "absolute",
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: "transparent",
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 50,
    },

    // Rays container
    raysContainer: {
        position: "absolute",
        width: 150,
        height: 150,
        alignItems: "center",
        justifyContent: "center",
    },

    // Single ray
    ray: {
        position: "absolute",
        width: 5,
        height: 20,
        backgroundColor: ORANGE,
        borderRadius: 3,
        top: 0,
        left: "50%",
        marginLeft: -2.5,
        opacity: 0.8,
        transformOrigin: "2.5px 75px",
    },

    // Sun core circle
    sunCore: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#FFB020",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#FFD060",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 10,
    },

    sunInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#FFE060",
    },

    // Horizon gradient fade
    horizonLine: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 300,
        pointerEvents: "none",
    },

    // Logo
    logoArea: {
        position: "absolute",
        bottom: "22%",
        alignItems: "center",
        gap: 6,
    },

    appName: {
        fontSize: 48,
        fontWeight: "900",
        color: "#FFFFFF",
        letterSpacing: 10,
        textShadowColor: "rgba(232,137,26,0.4)",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },

    appNameAccent: {
        color: ORANGE,
    },

    tagline: {
        fontSize: 11,
        fontWeight: "400",
        color: "rgba(255,255,255,0.35)",
        letterSpacing: 4,
    },

    // Loading bar
    loaderWrap: {
        position: "absolute",
        bottom: "8%",
        alignItems: "center",
        gap: 12,
    },

    loaderTrack: {
        width: 140,
        height: 3,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 2,
        overflow: "hidden",
    },

    loaderFill: {
        height: "100%",
        backgroundColor: ORANGE,
        borderRadius: 2,
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
    },

    dots: {
        flexDirection: "row",
        gap: 6,
    },

    dot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: ORANGE,
    },
});
