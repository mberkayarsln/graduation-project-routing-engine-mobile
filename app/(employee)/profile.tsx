import React from 'react';
import { View, Text, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function EmployeeProfile() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
            <View style={{ flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 }}>
                <Image
                    source={{ uri: 'https://i.pravatar.cc/100?img=5' }}
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        marginBottom: 16,
                        backgroundColor: Colors.borderLight,
                    }}
                />
                <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.text }}>
                    Jane Smith
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>
                    Employee
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
                        <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
                        <Text style={{ marginLeft: 12, fontSize: 15, color: Colors.text }}>jane.smith@company.com</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Ionicons name="business-outline" size={20} color={Colors.textSecondary} />
                        <Text style={{ marginLeft: 12, fontSize: 15, color: Colors.text }}>Engineering Department</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
                        <Text style={{ marginLeft: 12, fontSize: 15, color: Colors.text }}>Headquarters - HQ</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
