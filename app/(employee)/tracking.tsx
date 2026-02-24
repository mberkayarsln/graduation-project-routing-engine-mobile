import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, Dimensions, Image, TouchableOpacity, ActivityIndicator, Animated, PanResponder, ScrollView, RefreshControl } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import Button from '@/components/Button';
import { api } from '@/services/api';
import { Route, Vehicle, StopNamesMap } from '@/services/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.55;
const SHEET_MIN_HEIGHT = 80;
const SNAP_THRESHOLD = 50;

export default function EmployeeLiveTracking() {
    const [loading, setLoading] = useState(true);
    const [route, setRoute] = useState<Route | null>(null);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [expanded, setExpanded] = useState(true);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [assignedStop, setAssignedStop] = useState<{ latitude: number; longitude: number } | null>(null);
    const [walkingRoute, setWalkingRoute] = useState<{ latitude: number; longitude: number }[]>([]);
    const [walkingDistance, setWalkingDistance] = useState<number | null>(null);
    const [walkingDuration, setWalkingDuration] = useState<number | null>(null);
    const [stopNames, setStopNames] = useState<StopNamesMap>({});
    const [refreshing, setRefreshing] = useState(false);
    const [shuttleIndex, setShuttleIndex] = useState(0);
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
                // Snap to expanded or collapsed
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
            setLoading(true);
            const [employees, routes, vehicles] = await Promise.all([
                api.getEmployees(),
                api.getRoutes(),
                api.getVehicles(),
            ]);

            // Use first employee with a cluster as the mock user
            const emp = employees.find(e => e.cluster_id !== null) || employees[0];
            if (emp) {
                setUserLocation({
                    latitude: emp.lat,
                    longitude: emp.lon,
                });

                // Set the employee's assigned pickup stop
                if (emp.pickup_point) {
                    setAssignedStop({
                        latitude: emp.pickup_point[0],
                        longitude: emp.pickup_point[1],
                    });
                }

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

            if (vehicles.length > 0) setVehicle(vehicles[0]);

            // Fetch stop names
            const matchedRoute = routes.find(r => r.cluster_id === emp?.cluster_id) || routes[0];
            if (matchedRoute) {
                try {
                    const names = await api.getStopNames(matchedRoute.bus_stops || matchedRoute.stops);
                    setStopNames(names);
                } catch (err) {
                    console.log('Stop names not available');
                }
            }

            // Fetch OSRM walking route from employee to assigned stop
            if (emp && emp.pickup_point) {
                try {
                    const walkData = await api.getWalkingRoute(
                        emp.lat, emp.lon,
                        emp.pickup_point[0], emp.pickup_point[1]
                    );
                    setWalkingRoute(
                        walkData.coordinates.map(c => ({
                            latitude: c[0],
                            longitude: c[1],
                        }))
                    );
                    setWalkingDistance(Math.round(walkData.distance_km * 1000));
                    setWalkingDuration(Math.round(walkData.duration_min));
                } catch (err) {
                    console.log('Walking route not available, using straight line');
                }
            }
        } catch (err) {
            console.error('Failed to load tracking data:', err);
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

    // Shuttle simulation: advance along route every 2 seconds
    const routeCoordinates = (route?.coordinates || []).map(c => ({
        latitude: c[0],
        longitude: c[1],
    }));

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

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ marginTop: 12, color: Colors.textSecondary }}>Loading tracking...</Text>
            </SafeAreaView>
        );
    }

    if (!route) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <Ionicons name="bus-outline" size={48} color={Colors.textMuted} />
                <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 }}>No Active Shuttle</Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
                    No shuttle is currently assigned to your route.
                </Text>
            </SafeAreaView>
        );
    }

    const shuttleLocation = routeCoordinates[shuttleIndex] || routeCoordinates[0];

    const lastStop = route.stops[route.stops.length - 1];
    const destinationLocation = {
        latitude: lastStop[0],
        longitude: lastStop[1],
    };

    // Center map on user location if available, otherwise between shuttle and destination
    const mapCenter = userLocation || destinationLocation;
    const mapRegion = {
        latitude: mapCenter.latitude,
        longitude: mapCenter.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
    };

    // Dynamic ETA based on shuttle progress
    const progress = routeCoordinates.length > 1 ? shuttleIndex / (routeCoordinates.length - 1) : 0;
    const remainingFraction = 1 - progress;
    const distanceKm = (route.distance_km * remainingFraction).toFixed(1);
    const minutesAway = Math.max(1, Math.round(route.duration_min * remainingFraction));

    const driverName = vehicle?.driver_name || 'Driver';
    const vehicleType = vehicle?.vehicle_type || 'Shuttle';
    const vehiclePlate = 'V-' + (vehicle?.id || '?');

    return (
        <View style={{ flex: 1 }}>
            {/* Map — takes full screen */}
            <MapView
                ref={mapRef}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                initialRegion={mapRegion}
                showsUserLocation
                showsMyLocationButton={false}
                onPanDrag={() => setLocationInView(false)}
                onMapReady={() => {
                    const allPoints = [
                        ...routeCoordinates,
                        shuttleLocation,
                        ...(userLocation ? [userLocation] : []),
                        ...(assignedStop ? [assignedStop] : []),
                    ];
                    if (allPoints.length > 0) {
                        mapRef.current?.fitToCoordinates(allPoints, {
                            edgePadding: { top: 80, right: 40, bottom: 250, left: 40 },
                            animated: true,
                        });
                    }
                }}
            >
                <Polyline
                    coordinates={routeCoordinates}
                    strokeColor={Colors.primary}
                    strokeWidth={3}
                    lineDashPattern={[6, 4]}
                />
                {/* Walking route from employee to assigned stop */}
                {walkingRoute.length > 0 ? (
                    <Polyline
                        coordinates={walkingRoute}
                        strokeColor="#64B5F6"
                        strokeWidth={3}
                        lineDashPattern={[4, 6]}
                    />
                ) : userLocation && assignedStop ? (
                    <Polyline
                        coordinates={[userLocation, assignedStop]}
                        strokeColor="#64B5F6"
                        strokeWidth={3}
                        lineDashPattern={[4, 6]}
                    />
                ) : null}
                <Marker coordinate={shuttleLocation}>
                    <View style={{ alignItems: 'center' }}>
                        <View
                            style={{
                                backgroundColor: Colors.primary,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 6,
                                marginBottom: 4,
                            }}
                        >
                            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
                                {vehiclePlate}
                            </Text>
                        </View>
                        <View
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: Colors.white,
                                borderWidth: 3,
                                borderColor: Colors.primary,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Ionicons name="bus" size={20} color={Colors.primary} />
                        </View>
                    </View>
                </Marker>
                {(route.bus_stops || route.stops).map((stop, i) => {
                    // Skip the assigned pickup stop — it gets its own flag marker
                    if (assignedStop && Math.abs(stop[0] - assignedStop.latitude) < 0.001 && Math.abs(stop[1] - assignedStop.longitude) < 0.001) {
                        return null;
                    }
                    const key = `${stop[0].toFixed(5)},${stop[1].toFixed(5)}`;
                    const name = stopNames[key] || `Stop ${i + 1}`;
                    // Check if shuttle has passed this stop
                    let nearestIdx = 0;
                    let minDist = Infinity;
                    for (let j = 0; j < routeCoordinates.length; j++) {
                        const d = Math.abs(routeCoordinates[j].latitude - stop[0]) + Math.abs(routeCoordinates[j].longitude - stop[1]);
                        if (d < minDist) { minDist = d; nearestIdx = j; }
                    }
                    const passed = shuttleIndex > nearestIdx;
                    return (
                        <Marker key={i} coordinate={{ latitude: stop[0], longitude: stop[1] }} title={name}>
                            <View
                                style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: 6,
                                    backgroundColor: passed ? Colors.primary : Colors.white,
                                    borderWidth: 2,
                                    borderColor: Colors.primary,
                                }}
                            />
                        </Marker>
                    );
                })}
                {/* User location marker (mock employee position) */}
                {userLocation && (
                    <Marker coordinate={userLocation} title="You are here">
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
                {/* Assigned pickup stop marker */}
                {assignedStop && (() => {
                    const key = `${assignedStop.latitude.toFixed(5)},${assignedStop.longitude.toFixed(5)}`;
                    const name = stopNames[key] || 'Pickup Stop';
                    return (
                        <Marker coordinate={assignedStop} title={`${name} (your pickup stop)`}>
                            <View style={{
                                width: 22,
                                height: 22,
                                borderRadius: 11,
                                backgroundColor: Colors.primary,
                                borderWidth: 2,
                                borderColor: Colors.white,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Ionicons name="flag" size={12} color={Colors.white} />
                            </View>
                        </Marker>
                    );
                })()}
            </MapView>

            {/* My Location Button */}
            <TouchableOpacity
                onPress={goToMyLocation}
                style={{
                    position: 'absolute',
                    right: 16,
                    top: 60,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Ionicons name="locate" size={22} color={locationInView ? Colors.primary : Colors.text} />
            </TouchableOpacity>

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
                {/* Drag Handle Area */}
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
                    {/* Status */}
                    <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Status
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 12 }}>
                        <Text style={{ fontSize: 26, fontWeight: '700', color: Colors.text }}>
                            Arriving in {minutesAway} min
                        </Text>
                        <View
                            style={{
                                backgroundColor: Colors.primaryLight,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 8,
                                marginLeft: 12,
                            }}
                        >
                            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.primary }}>
                                {distanceKm} km away
                            </Text>
                        </View>
                    </View>

                    {/* Walking info */}
                    {walkingDistance !== null && (
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: Colors.primaryLight,
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            borderRadius: 10,
                            marginBottom: 16,
                        }}>
                            <Ionicons name="walk" size={20} color={Colors.primary} />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.primary, marginLeft: 8 }}>
                                {walkingDistance}m · {walkingDuration} min walk to your stop
                            </Text>
                        </View>
                    )}

                    {/* Progress Bar */}
                    <View
                        style={{
                            height: 6,
                            backgroundColor: Colors.borderLight,
                            borderRadius: 3,
                            marginBottom: 24,
                        }}
                    >
                        <View
                            style={{
                                height: 6,
                                width: `${Math.round(progress * 100)}%`,
                                backgroundColor: Colors.primary,
                                borderRadius: 3,
                            }}
                        />
                    </View>

                    {/* Driver Info Card */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 16,
                            borderTopWidth: 1,
                            borderTopColor: Colors.borderLight,
                        }}
                    >
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/100?u=driver-' + (vehicle?.id || 0) }}
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                marginRight: 14,
                                backgroundColor: Colors.borderLight,
                            }}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.text }}>
                                {driverName}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <Ionicons name="bus" size={14} color={Colors.textSecondary} />
                                <Text style={{ fontSize: 13, color: Colors.textSecondary, marginLeft: 6 }}>
                                    Driver
                                </Text>
                                <Ionicons name="star" size={14} color="#FFB800" style={{ marginLeft: 12 }} />
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <View
                                style={{
                                    borderWidth: 1,
                                    borderColor: Colors.border,
                                    borderRadius: 6,
                                    paddingHorizontal: 10,
                                    paddingVertical: 4,
                                }}
                            >
                                <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.text }}>
                                    {vehiclePlate}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>
                                {vehicleType}
                            </Text>
                        </View>
                    </View>

                    {/* Route Stops List */}
                    {(route.bus_stops || route.stops).length > 0 && Object.keys(stopNames).length > 0 && (
                        <View style={{ borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 16, marginBottom: 8 }}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                                Route Stops
                            </Text>
                            {(() => {
                                const stops = route.bus_stops || route.stops;
                                // Pre-compute nearest route index for each stop
                                const stopData = stops.map((stop, i) => {
                                    let nearestIdx = 0;
                                    let minDist = Infinity;
                                    for (let j = 0; j < routeCoordinates.length; j++) {
                                        const d = Math.abs(routeCoordinates[j].latitude - stop[0]) + Math.abs(routeCoordinates[j].longitude - stop[1]);
                                        if (d < minDist) { minDist = d; nearestIdx = j; }
                                    }
                                    return { stop, i, nearestIdx, passed: shuttleIndex > nearestIdx };
                                });
                                const nextStopIdx = stopData.findIndex(s => !s.passed);
                                return stopData.map(({ stop, i, passed }, idx) => {
                                    const key = `${stop[0].toFixed(5)},${stop[1].toFixed(5)}`;
                                    const name = stopNames[key] || `Stop ${i + 1}`;
                                    const isMyStop = assignedStop && Math.abs(stop[0] - assignedStop.latitude) < 0.001 && Math.abs(stop[1] - assignedStop.longitude) < 0.001;
                                    const isNext = idx === nextStopIdx;
                                    return (
                                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                                            <View style={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: 5,
                                                backgroundColor: passed ? Colors.primary : Colors.border,
                                                marginRight: 10,
                                            }} />
                                            <Text style={{
                                                fontSize: 14,
                                                color: passed ? Colors.primary : Colors.text,
                                                fontWeight: passed || isNext ? '700' : '400',
                                                flex: 1,
                                            }}>
                                                {name}{isMyStop ? ' (your pickup stop)' : ''}
                                            </Text>
                                        </View>
                                    );
                                });
                            })()}
                        </View>
                    )}

                    {/* Action Buttons */}
                    <SafeAreaView>
                        <View style={{ flexDirection: 'row', gap: 12, paddingTop: 16, paddingBottom: 8 }}>
                            <View style={{ flex: 1 }}>
                                <Button
                                    title="Contact Driver"
                                    onPress={() => { }}
                                    icon="call-outline"
                                />
                            </View>
                            <TouchableOpacity
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 12,
                                    borderWidth: 1.5,
                                    borderColor: Colors.border,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Ionicons name="chatbubble-outline" size={22} color={Colors.text} />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </ScrollView>
            </Animated.View>
        </View>
    );
}
