import React from 'react';
import { View, Text, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MapView from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import Button from '@/components/Button';
import { ISTANBUL_REGION } from '@/constants/mockData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EmployeeRequestShuttle() {
    const router = useRouter();

    return (
        <View style={{ flex: 1 }}>
            {/* Map Background */}
            <MapView
                style={{ width: '100%', height: SCREEN_HEIGHT * 0.45 }}
                initialRegion={ISTANBUL_REGION}
                showsUserLocation
                showsMyLocationButton={false}
                userInterfaceStyle="dark"
            />

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
                </View>
            </SafeAreaView>

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

                {/* Title */}
                <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.text }}>
                    Request Shuttle
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4, marginBottom: 24 }}>
                    Available shuttles nearby
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
            </View>
        </View>
    );
}
