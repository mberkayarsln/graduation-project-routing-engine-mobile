import React from 'react';
import { View, Text, SafeAreaView, Dimensions, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import Button from '@/components/Button';
import {
    mockDriverInfo,
    mockShuttleLocation,
    mockUserLocation,
    ISTANBUL_REGION,
} from '@/constants/mockData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EmployeeLiveTracking() {
    return (
        <View style={{ flex: 1 }}>
            {/* Map */}
            <MapView
                style={{ width: '100%', height: SCREEN_HEIGHT * 0.42 }}
                initialRegion={ISTANBUL_REGION}
                showsUserLocation
                showsMyLocationButton={false}
            >
                {/* Shuttle Marker */}
                <Marker coordinate={mockShuttleLocation}>
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
                                {mockDriverInfo.vehiclePlate}
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

                {/* User Marker */}
                <Marker coordinate={mockUserLocation}>
                    <View style={{ alignItems: 'center' }}>
                        <View
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: Colors.primary,
                                borderWidth: 3,
                                borderColor: Colors.white,
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                            }}
                        />
                        <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.text, marginTop: 4 }}>
                            You
                        </Text>
                    </View>
                </Marker>
            </MapView>

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
                        marginBottom: 20,
                    }}
                />

                {/* Status */}
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Status
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 12 }}>
                    <Text style={{ fontSize: 26, fontWeight: '700', color: Colors.text }}>
                        Arriving in 8 min
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
                            1.2 km away
                        </Text>
                    </View>
                </View>

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
                            width: '65%',
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
                        source={{ uri: mockDriverInfo.avatar }}
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
                            {mockDriverInfo.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Ionicons name="bus" size={14} color={Colors.textSecondary} />
                            <Text style={{ fontSize: 13, color: Colors.textSecondary, marginLeft: 6 }}>
                                {mockDriverInfo.role}
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
                            <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.text, fontFamily: 'Courier' }}>
                                {mockDriverInfo.vehiclePlate}
                            </Text>
                        </View>
                        <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>
                            {mockDriverInfo.vehicleModel}
                        </Text>
                    </View>
                </View>

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
            </View>
        </View>
    );
}
