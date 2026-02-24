import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Switch, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import Button from '@/components/Button';
import { api } from '@/services/api';
import { Route, Vehicle } from '@/services/types';

export default function DriverRouteOverview() {
    const router = useRouter();
    const [isOnline, setIsOnline] = useState(true);
    const [loading, setLoading] = useState(true);
    const [route, setRoute] = useState<Route | null>(null);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [stopNames, setStopNames] = useState<Record<string, string>>({});

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            const [routes, vehicles] = await Promise.all([
                api.getRoutes(),
                api.getVehicles(),
            ]);

            // Use the first route and vehicle for now (no auth to scope by driver)
            if (routes.length > 0) {
                setRoute(routes[0]);

                // Resolve stop names
                if (routes[0].stops && routes[0].stops.length > 0) {
                    try {
                        const names = await api.getStopNames(routes[0].stops);
                        setStopNames(names);
                    } catch {
                        // Stop names are optional
                    }
                }
            }
            if (vehicles.length > 0) {
                setVehicle(vehicles[0]);
            }
        } catch (err) {
            console.error('Failed to load route data:', err);
        } finally {
            setLoading(false);
        }
    }

    function getStopName(stop: number[], index: number): string {
        const key = `${stop[0].toFixed(5)},${stop[1].toFixed(5)}`;
        return stopNames[key] || `Stop ${index + 1}`;
    }

    function formatTime(index: number, totalStops: number): string {
        // Estimate times based on duration_min spread across stops
        if (!route) return '--:--';
        const startHour = 7;
        const startMin = 30;
        const intervalMin = totalStops > 1 ? route.duration_min / (totalStops - 1) : 0;
        const totalMin = startMin + index * intervalMin;
        const hour = startHour + Math.floor(totalMin / 60);
        const min = Math.round(totalMin % 60);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        return `${String(displayHour).padStart(2, '0')}:${String(min).padStart(2, '0')} ${period}`;
    }

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ marginTop: 12, color: Colors.textSecondary }}>Loading route...</Text>
            </SafeAreaView>
        );
    }

    if (!route) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
                <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 }}>No Route Assigned</Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
                    There are no routes available. Please contact dispatch.
                </Text>
            </SafeAreaView>
        );
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
            {/* Header */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    backgroundColor: Colors.white,
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.borderLight,
                }}
            >
                <TouchableOpacity>
                    <Ionicons name="menu-outline" size={26} color={Colors.text} />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: isOnline ? Colors.primary : Colors.textMuted,
                        }}
                    />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text }}>
                        {isOnline ? 'Online' : 'Offline'}
                    </Text>
                    <Switch
                        value={isOnline}
                        onValueChange={setIsOnline}
                        trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                        thumbColor={isOnline ? Colors.primary : Colors.textMuted}
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    />
                </View>
                <TouchableOpacity>
                    <Ionicons name="notifications-outline" size={24} color={Colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Shift Info Card */}
                <View
                    style={{
                        backgroundColor: Colors.white,
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        elevation: 3,
                    }}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                        <View>
                            <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Shift Date</Text>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: 2 }}>
                                {dateStr}
                            </Text>
                        </View>
                        <View
                            style={{
                                backgroundColor: Colors.primaryLight,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 8,
                                alignSelf: 'flex-start',
                            }}
                        >
                            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.primary }}>
                                Route {route.cluster_id}
                            </Text>
                        </View>
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingTop: 16,
                            borderTopWidth: 1,
                            borderTopColor: Colors.borderLight,
                        }}
                    >
                        <Ionicons name="bus-outline" size={20} color={Colors.textSecondary} />
                        <Text style={{ fontSize: 14, color: Colors.textSecondary, marginLeft: 8, flex: 1 }}>
                            {vehicle?.vehicle_type || 'Vehicle'}
                        </Text>
                        <View
                            style={{
                                backgroundColor: Colors.primaryLight,
                                borderRadius: 6,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                            }}
                        >
                            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.primary }}>
                                {route.distance_km} km · {Math.round(route.duration_min)} min
                            </Text>
                        </View>
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 12,
                        }}
                    >
                        <Ionicons name="people-outline" size={20} color={Colors.textSecondary} />
                        <Text style={{ fontSize: 14, color: Colors.textSecondary, marginLeft: 8 }}>
                            Passengers
                        </Text>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text, marginLeft: 'auto' }}>
                            {route.employee_count} Total
                        </Text>
                    </View>
                </View>

                {/* Itinerary */}
                <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 16 }}>
                    Itinerary
                </Text>

                {route.stops.map((stop, index) => (
                    <View key={index} style={{ flexDirection: 'row', marginBottom: 4 }}>
                        {/* Timeline */}
                        <View style={{ alignItems: 'center', width: 24, marginRight: 16 }}>
                            <View
                                style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: 6,
                                    backgroundColor: index === 0 ? Colors.primary : Colors.white,
                                    borderWidth: 2,
                                    borderColor: Colors.primary,
                                }}
                            />
                            {index < route.stops.length - 1 && (
                                <View
                                    style={{
                                        width: 2,
                                        flex: 1,
                                        backgroundColor: Colors.primary,
                                        opacity: 0.3,
                                        minHeight: 50,
                                    }}
                                />
                            )}
                        </View>

                        {/* Stop Content */}
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: Colors.white,
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 12,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.04,
                                shadowRadius: 4,
                                elevation: 1,
                            }}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text }}>
                                    {getStopName(stop, index)}
                                </Text>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.primary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                                    {formatTime(index, route.stops.length)}
                                </Text>
                            </View>
                            {index === route.stops.length - 1 && (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginTop: 8,
                                        backgroundColor: Colors.primaryLight,
                                        paddingHorizontal: 10,
                                        paddingVertical: 4,
                                        borderRadius: 6,
                                        alignSelf: 'flex-start',
                                    }}
                                >
                                    <Ionicons name="flag" size={14} color={Colors.primary} />
                                    <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: '600', marginLeft: 4 }}>
                                        Destination
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Start Trip Button */}
            <View style={{ padding: 20, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.borderLight }}>
                <Button
                    title="Start Trip"
                    onPress={() => router.push('/(driver)/navigation')}
                    icon="play-circle-outline"
                />
            </View>
        </SafeAreaView>
    );
}
