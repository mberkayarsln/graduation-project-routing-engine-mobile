import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import Button from '@/components/Button';
import { mockShiftInfo, mockItinerary } from '@/constants/mockData';

export default function DriverRouteOverview() {
    const router = useRouter();
    const [isOnline, setIsOnline] = useState(true);

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
                                {mockShiftInfo.date}
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
                                Route {mockShiftInfo.routeId}
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
                            {mockShiftInfo.vehicleModel}
                        </Text>
                        <View
                            style={{
                                borderWidth: 1,
                                borderColor: Colors.border,
                                borderRadius: 6,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                            }}
                        >
                            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                                {mockShiftInfo.vehiclePlate}
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
                            {mockShiftInfo.totalPassengers} Total
                        </Text>
                    </View>
                </View>

                {/* Itinerary */}
                <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 16 }}>
                    Itinerary
                </Text>

                {mockItinerary.map((stop, index) => (
                    <View key={stop.id} style={{ flexDirection: 'row', marginBottom: 4 }}>
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
                            {index < mockItinerary.length - 1 && (
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
                                    {stop.location}
                                </Text>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.primary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                                    {stop.time}
                                </Text>
                            </View>
                            {stop.pickupCount && (
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
                                    <Ionicons name="people" size={14} color={Colors.primary} />
                                    <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: '600', marginLeft: 4 }}>
                                        {stop.pickupCount} Pickup
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
