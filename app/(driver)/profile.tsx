import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { api } from '@/services/api';
import { Vehicle } from '@/services/types';

export default function DriverProfile() {
    const [loading, setLoading] = useState(true);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);

    useEffect(() => {
        api.getVehicles()
            .then(vehicles => { if (vehicles.length > 0) setVehicle(vehicles[0]); })
            .catch(err => console.error('Failed to load vehicle:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </SafeAreaView>
        );
    }

    const driverName = vehicle?.driver_name || 'Driver';
    const vehicleType = vehicle?.vehicle_type || 'Vehicle';
    const vehicleId = vehicle ? `V-${vehicle.id}` : 'N/A';

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
            <View style={{ flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 }}>
                <Image
                    source={{ uri: `https://i.pravatar.cc/100?u=driver-${vehicle?.id || 0}` }}
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        marginBottom: 16,
                        backgroundColor: Colors.borderLight,
                    }}
                />
                <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.text }}>
                    {driverName}
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>
                    Driver
                </Text>

                <View
                    style={{
                        backgroundColor: Colors.white,
                        borderRadius: 16,
                        padding: 20,
                        width: '100%',
                        marginTop: 24,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Ionicons name="bus-outline" size={20} color={Colors.textSecondary} />
                        <Text style={{ marginLeft: 12, fontSize: 15, color: Colors.text }}>{vehicleType}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Ionicons name="card-outline" size={20} color={Colors.textSecondary} />
                        <Text style={{ marginLeft: 12, fontSize: 15, color: Colors.text }}>{vehicleId}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="car-outline" size={20} color={Colors.textSecondary} />
                        <Text style={{ marginLeft: 12, fontSize: 15, color: Colors.text }}>
                            Capacity: {vehicle?.capacity || '-'}
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
