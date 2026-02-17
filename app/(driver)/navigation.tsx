import React from 'react';
import { View, Text, SafeAreaView, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import Button from '@/components/Button';
import PassengerCard from '@/components/PassengerCard';
import {
    mockPassengers,
    mockNextStop,
    mockRouteCoordinates,
    ISTANBUL_REGION,
} from '@/constants/mockData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DriverActiveNavigation() {
    return (
        <View style={{ flex: 1 }}>
            {/* Map */}
            <MapView
                style={{ width: '100%', height: SCREEN_HEIGHT * 0.45 }}
                initialRegion={ISTANBUL_REGION}
                showsUserLocation
                showsMyLocationButton={false}
            >
                <Polyline
                    coordinates={mockRouteCoordinates}
                    strokeColor={Colors.primary}
                    strokeWidth={4}
                />
                {mockRouteCoordinates.map((coord, index) => (
                    <Marker key={index} coordinate={coord}>
                        <View
                            style={{
                                width: 16,
                                height: 16,
                                borderRadius: 8,
                                backgroundColor: Colors.white,
                                borderWidth: 3,
                                borderColor: Colors.primary,
                            }}
                        />
                    </Marker>
                ))}
            </MapView>

            {/* Arrival Badge */}
            <View
                style={{
                    position: 'absolute',
                    top: SCREEN_HEIGHT * 0.28,
                    right: 20,
                    backgroundColor: Colors.white,
                    borderRadius: 12,
                    padding: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                    alignItems: 'center',
                }}
            >
                <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase' }}>
                    Arrival
                </Text>
                <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.text }}>
                    {mockNextStop.arrivalTime}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.primary }}>
                    {mockNextStop.minutesAway} min
                </Text>
            </View>

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
                        marginBottom: 16,
                    }}
                />

                {/* Next Stop Info */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <View>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Next Stop
                        </Text>
                        <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.text, marginTop: 4 }}>
                            {mockNextStop.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Ionicons name="people" size={16} color={Colors.textSecondary} />
                            <Text style={{ fontSize: 14, color: Colors.textSecondary, marginLeft: 6 }}>
                                {mockNextStop.passengerCount} Passengers
                            </Text>
                        </View>
                    </View>
                    <View style={{ padding: 8 }}>
                        <Ionicons name="search-outline" size={22} color={Colors.textSecondary} />
                    </View>
                </View>

                {/* Passenger List */}
                <View style={{ flex: 1 }}>
                    {mockPassengers.map((passenger) => (
                        <PassengerCard
                            key={passenger.id}
                            name={passenger.name}
                            status={passenger.status}
                            avatar={passenger.avatar}
                        />
                    ))}
                </View>

                {/* Arrived Button */}
                <SafeAreaView>
                    <View style={{ paddingBottom: 8, paddingTop: 12 }}>
                        <Button
                            title="Arrived at Stop"
                            onPress={() => { }}
                            icon="flag-outline"
                        />
                    </View>
                </SafeAreaView>
            </View>
        </View>
    );
}
