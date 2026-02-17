import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

type PassengerCardProps = {
    name: string;
    status: 'Boarded' | 'Waiting';
    avatar: string;
};

export default function PassengerCard({ name, status, avatar }: PassengerCardProps) {
    const isBoarded = status === 'Boarded';

    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: Colors.borderLight,
            }}
        >
            <Image
                source={{ uri: avatar }}
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    marginRight: 12,
                    backgroundColor: Colors.borderLight,
                }}
            />
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text }}>
                    {name}
                </Text>
                <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
                    {status}
                </Text>
            </View>
            <View
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: isBoarded ? Colors.primary : 'transparent',
                    borderWidth: isBoarded ? 0 : 2,
                    borderColor: Colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {isBoarded && (
                    <Ionicons name="checkmark" size={18} color="#fff" />
                )}
            </View>
        </View>
    );
}
