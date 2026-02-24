import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import Button from '@/components/Button';
import PassengerCard from '@/components/PassengerCard';
import { api } from '@/services/api';
import { Route, ClusterEmployee } from '@/services/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DriverActiveNavigation() {
    const [loading, setLoading] = useState(true);
    const [route, setRoute] = useState<Route | null>(null);
    const [passengers, setPassengers] = useState<ClusterEmployee[]>([]);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [stopNames, setStopNames] = useState<Record<string, string>>({});

    useEffect(() => {
        loadNavigationData();
    }, []);

    async function loadNavigationData() {
        try {
            setLoading(true);
            const routes = await api.getRoutes();
            if (routes.length === 0) return;

            const firstRoute = routes[0];
            setRoute(firstRoute);

            // Load cluster for passenger data
            const cluster = await api.getCluster(firstRoute.cluster_id);
            if (cluster.employees) {
                setPassengers(cluster.employees);
            }

            // Resolve stop names
            if (firstRoute.stops && firstRoute.stops.length > 0) {
                try {
                    const names = await api.getStopNames(firstRoute.stops);
                    setStopNames(names);
                } catch {
                    // Optional
                }
            }
        } catch (err) {
            console.error('Failed to load navigation data:', err);
        } finally {
            setLoading(false);
        }
    }

    function getStopName(stop: number[]): string {
        const key = `${stop[0].toFixed(5)},${stop[1].toFixed(5)}`;
        return stopNames[key] || 'Next Stop';
    }

    function handleArrivedAtStop() {
        if (route && currentStopIndex < route.stops.length - 1) {
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

    if (!route || route.coordinates.length === 0) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <Ionicons name="navigate-circle-outline" size={48} color={Colors.textMuted} />
                <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 }}>No Route Data</Text>
            </SafeAreaView>
        );
    }

    // Convert [lat, lon] arrays to {latitude, longitude} objects
    const routeCoordinates = route.coordinates.map(c => ({
        latitude: c[0],
        longitude: c[1],
    }));

    const stopCoordinates = route.stops.map(s => ({
        latitude: s[0],
        longitude: s[1],
    }));

    const currentStop = route.stops[currentStopIndex];
    const nextStopName = currentStop ? getStopName(currentStop) : 'End';

    // Estimate arrival time
    const stopsRemaining = route.stops.length - currentStopIndex;
    const minutesPerStop = route.stops.length > 1 ? route.duration_min / (route.stops.length - 1) : 0;
    const minutesAway = Math.round(minutesPerStop);

    const now = new Date();
    const arrivalDate = new Date(now.getTime() + minutesAway * 60 * 1000);
    const arrivalTime = `${String(arrivalDate.getHours()).padStart(2, '0')}:${String(arrivalDate.getMinutes()).padStart(2, '0')}`;

    // Center map on current stop
    const mapRegion = {
        latitude: currentStop ? currentStop[0] : routeCoordinates[0].latitude,
        longitude: currentStop ? currentStop[1] : routeCoordinates[0].longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Map */}
            <MapView
                style={{ width: '100%', height: SCREEN_HEIGHT * 0.45 }}
                initialRegion={mapRegion}
                showsUserLocation
                showsMyLocationButton={false}
            >
                <Polyline
                    coordinates={routeCoordinates}
                    strokeColor={Colors.primary}
                    strokeWidth={4}
                />
                {stopCoordinates.map((coord, index) => (
                    <Marker key={index} coordinate={coord}>
                        <View
                            style={{
                                width: index === currentStopIndex ? 20 : 16,
                                height: index === currentStopIndex ? 20 : 16,
                                borderRadius: index === currentStopIndex ? 10 : 8,
                                backgroundColor: index === currentStopIndex ? Colors.primary : Colors.white,
                                borderWidth: 3,
                                borderColor: index < currentStopIndex ? Colors.textMuted : Colors.primary,
                                opacity: index < currentStopIndex ? 0.5 : 1,
                            }}
                        />
                    </Marker>
                ))}
            </MapView>

            {/* Arrival Badge */}
            <View
                style={{
                    position: 'absolute',
                    top: SCREEN_HEIGHT * 0.28,
                    right: 20,
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

            {/* Bottom Sheet */}
            <View
                style={{
                    flex: 1,
                    backgroundColor: Colors.white,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    marginTop: -24,
                    paddingHorizontal: 20,
                    paddingTop: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 10,
                }}
            >
                {/* Pull Indicator */}
                <View
                    style={{
                        width: 36,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: Colors.border,
                        alignSelf: 'center',
                        marginBottom: 16,
                    }}
                />

                {/* Next Stop Info */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <View>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1 }}>
                            {currentStopIndex < route.stops.length - 1 ? 'Next Stop' : 'Final Stop'}
                        </Text>
                        <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.text, marginTop: 4 }}>
                            {nextStopName}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Ionicons name="people" size={16} color={Colors.textSecondary} />
                            <Text style={{ fontSize: 14, color: Colors.textSecondary, marginLeft: 6 }}>
                                {passengers.length} Passengers
                            </Text>
                        </View>
                    </View>
                    <View style={{ padding: 8 }}>
                        <Text style={{ fontSize: 12, color: Colors.textMuted }}>
                            {currentStopIndex + 1} / {route.stops.length}
                        </Text>
                    </View>
                </View>

                {/* Passenger List */}
                <View style={{ flex: 1 }}>
                    {passengers.slice(0, 5).map((passenger) => (
                        <PassengerCard
                            key={passenger.id}
                            name={passenger.name}
                            status={currentStopIndex > 0 ? 'Boarded' : 'Waiting'}
                            avatar={`https://i.pravatar.cc/100?u=${passenger.id}`}
                        />
                    ))}
                    {passengers.length > 5 && (
                        <Text style={{ fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginTop: 8 }}>
                            +{passengers.length - 5} more passengers
                        </Text>
                    )}
                </View>

                {/* Arrived Button */}
                <SafeAreaView>
                    <View style={{ paddingBottom: 8, paddingTop: 12 }}>
                        <Button
                            title={currentStopIndex < route.stops.length - 1 ? 'Arrived at Stop' : 'Trip Complete'}
                            onPress={handleArrivedAtStop}
                            icon={currentStopIndex < route.stops.length - 1 ? 'flag-outline' : 'checkmark-circle-outline'}
                        />
                    </View>
                </SafeAreaView>
            </View>
        </View>
    );
}
