import React from 'react';
import { View, Text, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { mockDriverInfo } from '@/constants/mockData';

export default function DriverProfile() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
            <View style={{ flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 }}>
                <Image
                    source={{ uri: mockDriverInfo.avatar }}
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        marginBottom: 16,
                        backgroundColor: Colors.borderLight,
                    }}
                />
                <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.text }}>
                    {mockDriverInfo.name}
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>
                    {mockDriverInfo.role}
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
                        <Text style={{ marginLeft: 12, fontSize: 15, color: Colors.text }}>{mockDriverInfo.vehicleModel}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Ionicons name="card-outline" size={20} color={Colors.textSecondary} />
                        <Text style={{ marginLeft: 12, fontSize: 15, color: Colors.text }}>{mockDriverInfo.vehiclePlate}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="star" size={20} color="#FFB800" />
                        <Text style={{ marginLeft: 12, fontSize: 15, color: Colors.text }}>{mockDriverInfo.rating} Rating</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
