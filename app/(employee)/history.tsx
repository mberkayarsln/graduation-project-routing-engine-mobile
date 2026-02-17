import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function EmployeeHistory() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                <Ionicons name="time-outline" size={64} color={Colors.border} />
                <Text style={{ fontSize: 20, fontWeight: '600', color: Colors.text, marginTop: 16 }}>
                    Ride History
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
                    Your shuttle ride history will appear here.
                </Text>
            </View>
        </SafeAreaView>
    );
}
