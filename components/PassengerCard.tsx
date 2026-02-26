import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export type PassengerStatus = 'Waiting' | 'Boarded';

type PassengerCardProps = {
    name: string;
    status: PassengerStatus;
    avatar: string;
    stopName?: string;
    onPress?: () => void;
};

export default function PassengerCard({ name, status, avatar, stopName, onPress }: PassengerCardProps) {
    const isBoarded = status === 'Boarded';

    const statusColor = isBoarded ? Colors.primary : Colors.textSecondary;
    const statusBg = isBoarded ? Colors.primaryLight : 'transparent';

    const Wrapper = onPress ? TouchableOpacity : View;

    return (
        <Wrapper
            onPress={onPress}
            activeOpacity={0.6}
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
                    opacity: 1,
                }}
            />
            <View style={{ flex: 1 }}>
                <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: Colors.text,
                    textDecorationLine: 'none',
                }}>
                    {name}
                </Text>
                {/* Optional Stop Name Subtitle */}
                {stopName && (
                    <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
                        📍 {stopName}
                    </Text>
                )}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 4,
                    backgroundColor: statusBg,
                    paddingHorizontal: status !== 'Waiting' ? 8 : 0,
                    paddingVertical: status !== 'Waiting' ? 2 : 0,
                    borderRadius: 4,
                    alignSelf: 'flex-start',
                }}>
                    {isBoarded && <Ionicons name="checkmark-circle" size={14} color={statusColor} style={{ marginRight: 4 }} />}
                    <Text style={{ fontSize: 13, color: statusColor, fontWeight: '600' }}>
                        {status}
                    </Text>
                </View>
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
                {isBoarded && <Ionicons name="checkmark" size={18} color="#fff" />}
            </View>
        </Wrapper>
    );
}
