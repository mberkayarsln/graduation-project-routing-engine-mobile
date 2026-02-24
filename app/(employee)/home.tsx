import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, Dimensions, TouchableOpacity, Animated, PanResponder, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import Button from '@/components/Button';
import { api } from '@/services/api';
import { Route } from '@/services/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.55;
const SHEET_MIN_HEIGHT = 80;
const SNAP_THRESHOLD = 50;

const ISTANBUL_REGION = {
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
};

export default function EmployeeRequestShuttle() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [route, setRoute] = useState<Route | null>(null);
    const [expanded, setExpanded] = useState(true);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [locationInView, setLocationInView] = useState(false);

    const sheetHeight = useRef(new Animated.Value(SHEET_MAX_HEIGHT)).current;
    const lastHeight = useRef(SHEET_MAX_HEIGHT);
    const mapRef = useRef<MapView>(null);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
            onPanResponderMove: (_, gesture) => {
                const newHeight = lastHeight.current - gesture.dy;
                const clamped = Math.max(SHEET_MIN_HEIGHT, Math.min(SHEET_MAX_HEIGHT, newHeight));
                sheetHeight.setValue(clamped);
            },
            onPanResponderRelease: (_, gesture) => {
                const currentHeight = lastHeight.current - gesture.dy;
                const shouldExpand = gesture.dy < -SNAP_THRESHOLD || (currentHeight > (SHEET_MAX_HEIGHT + SHEET_MIN_HEIGHT) / 2 && gesture.dy >= -SNAP_THRESHOLD && gesture.dy <= SNAP_THRESHOLD);
                const target = shouldExpand ? SHEET_MAX_HEIGHT : SHEET_MIN_HEIGHT;
                Animated.spring(sheetHeight, {
                    toValue: target,
                    useNativeDriver: false,
                    bounciness: 4,
                    speed: 14,
                }).start();
                lastHeight.current = target;
                setExpanded(target === SHEET_MAX_HEIGHT);
            },
        })
    ).current;

    function toggleSheet() {
        const target = expanded ? SHEET_MIN_HEIGHT : SHEET_MAX_HEIGHT;
        Animated.spring(sheetHeight, {
            toValue: target,
            useNativeDriver: false,
            bounciness: 4,
            speed: 14,
        }).start();
        lastHeight.current = target;
        setExpanded(!expanded);
    }

    useEffect(() => {
        loadData();
    }, []);

    /**
     * TESTING ONLY: Uses the first employee's coordinates as the user's location
     * and fetches the route matching that employee's cluster_id.
     * For production, replace employee location with real GPS.
     */
    async function loadData() {
        try {
            const [employees, routes] = await Promise.all([
                api.getEmployees(),
                api.getRoutes(),
            ]);

            // Use first employee with a cluster as the mock user
            const emp = employees.find(e => e.cluster_id !== null) || employees[0];
            if (emp) {
                const coords = {
                    latitude: emp.lat,
                    longitude: emp.lon,
                };
                setUserLocation(coords);
                mapRef.current?.animateToRegion({
                    ...coords,
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03,
                }, 1000);

                // Find the route matching this employee's cluster
                const matchingRoute = routes.find(r => r.cluster_id === emp.cluster_id);
                if (matchingRoute) {
                    setRoute(matchingRoute);
                } else if (routes.length > 0) {
                    setRoute(routes[0]);
                }
            } else if (routes.length > 0) {
                setRoute(routes[0]);
            }
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    }

    function goToMyLocation() {
        if (!userLocation) return;
        mapRef.current?.animateToRegion({
            ...userLocation,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }, 800);
        setLocationInView(true);
        if (expanded) {
            Animated.spring(sheetHeight, {
                toValue: SHEET_MIN_HEIGHT,
                useNativeDriver: false,
                bounciness: 4,
                speed: 14,
            }).start();
            lastHeight.current = SHEET_MIN_HEIGHT;
            setExpanded(false);
        }
    }

    const mapRegion = userLocation
        ? {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
        }
        : route
            ? {
                latitude: route.center[0],
                longitude: route.center[1],
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
            }
            : ISTANBUL_REGION;

    return (
        <View style={{ flex: 1 }}>
            {/* Map — fullscreen */}
            <MapView
                ref={mapRef}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                initialRegion={ISTANBUL_REGION}
                showsUserLocation
                showsMyLocationButton={false}
                onPanDrag={() => setLocationInView(false)}
            >
                {userLocation && (
                    <Marker
                        coordinate={userLocation}
                        title="You are here"
                    >
                        <View style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: Colors.primary,
                            borderWidth: 3,
                            borderColor: Colors.white,
                        }} />
                    </Marker>
                )}
            </MapView>

            {/* Header Overlay */}
            <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 }}>
                    <TouchableOpacity
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Ionicons name="menu-outline" size={22} color={Colors.text} />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center', gap: 10 }}>
                        <TouchableOpacity
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={goToMyLocation}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Ionicons name="locate" size={20} color={locationInView ? Colors.primary : Colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            {/* Draggable Bottom Sheet */}
            <Animated.View
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: sheetHeight,
                    backgroundColor: Colors.white,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 10,
                    overflow: 'hidden',
                }}
            >
                {/* Drag Handle */}
                <View {...panResponder.panHandlers}>
                    <TouchableOpacity
                        onPress={toggleSheet}
                        activeOpacity={0.8}
                        style={{ paddingTop: 12, paddingBottom: 8, alignItems: 'center' }}
                    >
                        <View
                            style={{
                                width: 36,
                                height: 5,
                                borderRadius: 3,
                                backgroundColor: Colors.border,
                            }}
                        />
                    </TouchableOpacity>
                </View>

                {/* Sheet Content */}
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={async () => {
                                setRefreshing(true);
                                await loadData();
                                setRefreshing(false);
                            }}
                            tintColor={Colors.primary}
                        />
                    }
                >
                    {/* Title */}
                    <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.text }}>
                        Request Shuttle
                    </Text>
                    <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4, marginBottom: 24 }}>
                        {loading ? 'Loading routes...' : route ? route.employee_count + ' employees on this route' : 'Available shuttles nearby'}
                    </Text>

                    {/* Pickup Location */}
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 16,
                            paddingHorizontal: 16,
                            backgroundColor: Colors.background,
                            borderRadius: 12,
                            marginBottom: 12,
                        }}
                    >
                        <View
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: 6,
                                backgroundColor: Colors.primary,
                                marginRight: 14,
                            }}
                        />
                        <Text style={{ fontSize: 16, color: Colors.text, fontWeight: '500' }}>
                            Headquarters - HQ
                        </Text>
                    </TouchableOpacity>

                    {/* Destination */}
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 16,
                            paddingHorizontal: 16,
                            backgroundColor: Colors.background,
                            borderRadius: 12,
                            marginBottom: 12,
                        }}
                    >
                        <Ionicons name="location" size={16} color={Colors.textMuted} style={{ marginRight: 12 }} />
                        <Text style={{ fontSize: 16, color: Colors.textMuted }}>
                            Where to?
                        </Text>
                    </TouchableOpacity>

                    {/* Leave Now */}
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 16,
                            paddingHorizontal: 16,
                            backgroundColor: Colors.background,
                            borderRadius: 12,
                            marginBottom: 24,
                        }}
                    >
                        <Ionicons name="time-outline" size={18} color={Colors.primary} style={{ marginRight: 12 }} />
                        <Text style={{ fontSize: 16, color: Colors.text, fontWeight: '500' }}>
                            Leave Now
                        </Text>
                        <Ionicons name="chevron-down" size={18} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>

                    {/* Request Button */}
                    <Button
                        title="Request Shuttle"
                        onPress={() => router.push('/(employee)/tracking')}
                        icon="bus-outline"
                    />
                </ScrollView>
            </Animated.View>
        </View>
    );
}
