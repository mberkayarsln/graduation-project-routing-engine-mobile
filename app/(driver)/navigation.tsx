import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, Dimensions, ActivityIndicator, ScrollView, Alert, Animated, PanResponder, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import Button from '@/components/Button';
import PassengerCard, { PassengerStatus } from '@/components/PassengerCard';
import { LocationStore } from '@/services/LocationStore';
import { api } from '@/services/api';
import { Route, Vehicle, ClusterEmployee } from '@/services/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.58;
const SHEET_MIN_HEIGHT = 90;
const SNAP_THRESHOLD = 50;

export default function DriverActiveNavigation() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [route, setRoute] = useState<Route | null>(null);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [passengers, setPassengers] = useState<ClusterEmployee[]>([]);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [stopNames, setStopNames] = useState<Record<string, string>>({});
    const [passengerStatuses, setPassengerStatuses] = useState<Record<number, PassengerStatus>>({});
    const [tripStartTime] = useState(new Date());
    const [expanded, setExpanded] = useState(true);
    const [shuttleIndex, setShuttleIndex] = useState(0);
    const mapRef = useRef<MapView>(null);
    const sheetHeight = useRef(new Animated.Value(SHEET_MAX_HEIGHT)).current;
    const lastHeight = useRef(SHEET_MAX_HEIGHT);

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
                Animated.spring(sheetHeight, { toValue: target, useNativeDriver: false, bounciness: 4, speed: 14 }).start();
                lastHeight.current = target;
                setExpanded(target === SHEET_MAX_HEIGHT);
            },
        })
    ).current;

    function toggleSheet() {
        const target = expanded ? SHEET_MIN_HEIGHT : SHEET_MAX_HEIGHT;
        Animated.spring(sheetHeight, { toValue: target, useNativeDriver: false, bounciness: 4, speed: 14 }).start();
        lastHeight.current = target;
        setExpanded(!expanded);
    }

    useEffect(() => {
        loadNavigationData();
    }, []);

    // Convert route coordinates once
    const routeCoordinates = (route?.coordinates || []).map(c => ({
        latitude: c[0],
        longitude: c[1],
    }));

    const stops = route ? (route.bus_stops || route.stops) : [];
    const stopCoordinates = stops.map(s => ({
        latitude: s[0],
        longitude: s[1],
    }));

    // Simulate driving: advance along route coordinates
    useEffect(() => {
        if (routeCoordinates.length === 0) return;
        const interval = setInterval(() => {
            setShuttleIndex(prev => {
                if (prev >= routeCoordinates.length - 1) return prev;
                return prev + 1;
            });
        }, 200);
        return () => clearInterval(interval);
    }, [routeCoordinates.length]);

    // Auto-detect arrival at stops based on simulated position
    useEffect(() => {
        if (routeCoordinates.length === 0 || stops.length === 0 || !route) return;
        const driverPos = routeCoordinates[shuttleIndex];
        if (!driverPos) return;

        // Find the nearest route coordinate index for the current stop
        const stop = stops[currentStopIndex];
        if (!stop) return;

        let nearestIdx = 0;
        let minDist = Infinity;
        for (let j = 0; j < routeCoordinates.length; j++) {
            const d = Math.abs(routeCoordinates[j].latitude - stop[0]) + Math.abs(routeCoordinates[j].longitude - stop[1]);
            if (d < minDist) { minDist = d; nearestIdx = j; }
        }

        // If shuttle has passed (or reached) this stop's nearest point
        if (shuttleIndex >= nearestIdx) {
            const isLastStop = currentStopIndex >= stops.length - 1;
            if (!isLastStop) {
                setCurrentStopIndex(prev => prev + 1);
            }
        }
    }, [shuttleIndex]);

    // Publish to LocationStore
    useEffect(() => {
        if (!route || routeCoordinates.length === 0) return;
        const pos = routeCoordinates[shuttleIndex] || routeCoordinates[0];
        LocationStore.update({
            latitude: pos.latitude,
            longitude: pos.longitude,
            currentStopIndex,
            totalStops: stops.length,
            tripActive: true,
            routeId: route.cluster_id,
        });
    }, [shuttleIndex, currentStopIndex, route]);

    async function loadNavigationData() {
        try {
            setLoading(true);
            const [routes, vehicles] = await Promise.all([
                api.getRoutes(),
                api.getVehicles(),
            ]);
            if (routes.length === 0) return;

            const firstRoute = routes[0];
            setRoute(firstRoute);
            if (vehicles.length > 0) setVehicle(vehicles[0]);

            // Load cluster for passenger data
            const cluster = await api.getCluster(firstRoute.cluster_id);
            if (cluster.employees) {
                setPassengers(cluster.employees);
                const statuses: Record<number, PassengerStatus> = {};
                cluster.employees.forEach(e => { statuses[e.id] = 'Waiting'; });
                setPassengerStatuses(statuses);
            }

            // Resolve stop names
            const routeStops = firstRoute.bus_stops || firstRoute.stops;
            if (routeStops && routeStops.length > 0) {
                try {
                    const names = await api.getStopNames(routeStops);
                    setStopNames(names);
                } catch { /* Optional */ }
            }
        } catch (err) {
            console.error('Failed to load navigation data:', err);
        } finally {
            setLoading(false);
        }
    }

    function getStopName(stop: number[]): string {
        const key = `${stop[0].toFixed(5)},${stop[1].toFixed(5)}`;
        return stopNames[key] || 'Bus Stop';
    }

    function togglePassengerStatus(passengerId: number) {
        setPassengerStatuses(prev => {
            const current = prev[passengerId] || 'Waiting';
            let next: PassengerStatus;
            if (current === 'Waiting') next = 'Boarded';
            else next = 'Waiting';
            return { ...prev, [passengerId]: next };
        });
    }

    function handleArrivedAtStop() {
        if (!route) return;

        const isLastStop = currentStopIndex >= stops.length - 1;

        if (isLastStop) {
            const boarded = Object.values(passengerStatuses).filter(s => s === 'Boarded').length;
            const elapsed = Math.round((Date.now() - tripStartTime.getTime()) / 60000);

            const currentLocation = LocationStore.get();
            if (currentLocation) {
                LocationStore.update({
                    ...currentLocation,
                    tripActive: false,
                });
            }

            router.replace({
                pathname: '/(driver)/trip_summary',
                params: {
                    boarded: String(boarded),
                    totalPassengers: String(passengers.length),
                    totalStops: String(stops.length),
                    distanceKm: String(route.distance_km),
                    durationMin: String(elapsed || Math.round(route.duration_min)),
                    routeId: String(route.cluster_id),
                },
            });
        } else {
            setCurrentStopIndex(currentStopIndex + 1);
        }
    }

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ marginTop: 12, color: Colors.textSecondary }}>Loading navigation...</Text>
            </SafeAreaView>
        );
    }

    if (!route || routeCoordinates.length === 0) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <Ionicons name="navigate-circle-outline" size={48} color={Colors.textMuted} />
                <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 }}>No Route Data</Text>
            </SafeAreaView>
        );
    }

    const shuttleLocation = routeCoordinates[shuttleIndex] || routeCoordinates[0];
    const currentStop = stops[currentStopIndex];
    const nextStopName = currentStop ? getStopName(currentStop) : 'End';
    const isLastStop = currentStopIndex >= stops.length - 1;

    // Dynamic ETA based on simulation progress
    const progress = routeCoordinates.length > 1 ? shuttleIndex / (routeCoordinates.length - 1) : 0;
    const tripFinished = progress >= 1;
    const remainingFraction = 1 - progress;
    const minutesAway = Math.max(1, Math.round(route.duration_min * remainingFraction));

    const now = new Date();
    const arrivalDate = new Date(now.getTime() + minutesAway * 60 * 1000);
    const arrivalTime = `${String(arrivalDate.getHours()).padStart(2, '0')}:${String(arrivalDate.getMinutes()).padStart(2, '0')}`;

    const driverName = vehicle?.driver_name || 'Driver';
    const vehiclePlate = 'V-' + (vehicle?.id || '?');

    // Center map on route
    const mapRegion = {
        latitude: shuttleLocation.latitude,
        longitude: shuttleLocation.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
    };

    // Passenger stats
    const boardedCount = Object.values(passengerStatuses).filter(s => s === 'Boarded').length;
    const waitingCount = passengers.length - boardedCount;

    return (
        <View style={{ flex: 1 }}>
            {/* Full-screen Map */}
            <MapView
                ref={mapRef}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                initialRegion={mapRegion}
                showsUserLocation
                showsMyLocationButton={false}
            >
                <Polyline
                    coordinates={routeCoordinates}
                    strokeColor={Colors.primary}
                    strokeWidth={4}
                />
                {stopCoordinates.map((coord, index) => {
                    const passed = (() => {
                        let nearestIdx = 0;
                        let minDist = Infinity;
                        for (let j = 0; j < routeCoordinates.length; j++) {
                            const d = Math.abs(routeCoordinates[j].latitude - coord.latitude) + Math.abs(routeCoordinates[j].longitude - coord.longitude);
                            if (d < minDist) { minDist = d; nearestIdx = j; }
                        }
                        return shuttleIndex > nearestIdx;
                    })();
                    return (
                        <Marker key={index} coordinate={coord}>
                            <View
                                style={{
                                    width: index === currentStopIndex ? 14 : 12,
                                    height: index === currentStopIndex ? 14 : 12,
                                    borderRadius: 7,
                                    backgroundColor: passed ? Colors.primary : Colors.white,
                                    borderWidth: 2,
                                    borderColor: Colors.primary,
                                }}
                            />
                        </Marker>
                    );
                })}
                {/* Driver marker */}
                <Marker coordinate={shuttleLocation}>
                    <View style={{ alignItems: 'center' }}>
                        <View style={{
                            backgroundColor: Colors.primary,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6,
                            marginBottom: 4,
                        }}>
                            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
                                {vehiclePlate}
                            </Text>
                        </View>
                        <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: Colors.white,
                            borderWidth: 3,
                            borderColor: Colors.primary,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Ionicons name="bus" size={20} color={Colors.primary} />
                        </View>
                    </View>
                </Marker>
            </MapView>

            {/* Arrival Badge */}
            <View
                style={{
                    position: 'absolute',
                    top: 60,
                    right: 16,
                    backgroundColor: Colors.white,
                    borderRadius: 12,
                    padding: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                    alignItems: 'center',
                }}
            >
                <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase' }}>
                    Arrival
                </Text>
                <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.text }}>
                    {arrivalTime}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.primary }}>
                    {minutesAway} min
                </Text>
            </View>


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
                        <View style={{ width: 36, height: 5, borderRadius: 3, backgroundColor: Colors.border }} />
                    </TouchableOpacity>
                </View>

                {/* Sheet Content */}
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Next Stop Info + Boarding Stats */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1 }}>
                                {isLastStop ? 'Final Stop' : 'Next Stop'}
                            </Text>
                            <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.text, marginTop: 2 }}>
                                {nextStopName}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 12, color: Colors.textMuted }}>
                                {currentStopIndex + 1} / {route.stops.length}
                            </Text>
                        </View>
                    </View>

                    {/* Boarding Stats Bar */}
                    <View style={{
                        flexDirection: 'row',
                        gap: 12,
                        marginBottom: 12,
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        backgroundColor: Colors.background,
                        borderRadius: 10,
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary }} />
                            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }}>
                                {boardedCount} Boarded
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border }} />
                            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }}>
                                {waitingCount} Waiting
                            </Text>
                        </View>
                    </View>

                    {/* Passenger List */}
                    <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                        Passengers — Tap to update status
                    </Text>
                    {passengers.map((passenger) => (
                        <PassengerCard
                            key={passenger.id}
                            name={passenger.name}
                            status={passengerStatuses[passenger.id] || 'Waiting'}
                            avatar={`https://i.pravatar.cc/100?u=${passenger.id}`}
                            stopName={passenger.pickup_point ? getStopName(passenger.pickup_point) : 'Unknown Stop'}
                            onPress={() => togglePassengerStatus(passenger.id)}
                        />
                    ))}

                    {/* Trip Complete button — only at final stop */}
                    {isLastStop && (
                        <View style={{ paddingTop: 16 }}>
                            <Button
                                title={`Trip Complete · ${boardedCount}/${passengers.length} Boarded`}
                                onPress={handleArrivedAtStop}
                                icon="checkmark-circle-outline"
                            />
                        </View>
                    )}
                </ScrollView>
            </Animated.View>
        </View>
    );
}
