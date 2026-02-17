export const mockPassengers = [
    {
        id: 1,
        name: 'Sarah Jenkins',
        status: 'Boarded' as const,
        avatar: 'https://i.pravatar.cc/100?img=1',
    },
    {
        id: 2,
        name: 'Mike Ross',
        status: 'Waiting' as const,
        avatar: 'https://i.pravatar.cc/100?img=3',
    },
    {
        id: 3,
        name: 'David Chen',
        status: 'Waiting' as const,
        avatar: 'https://i.pravatar.cc/100?img=4',
    },
];

export const mockItinerary = [
    {
        id: 1,
        time: '07:30 AM',
        location: 'Sector 4',
        type: 'pickup' as const,
        pickupCount: undefined,
    },
    {
        id: 2,
        time: '07:45 AM',
        location: 'Downtown',
        type: 'pickup' as const,
        pickupCount: 4,
    },
    {
        id: 3,
        time: '08:10 AM',
        location: 'North Gate',
        type: 'dropoff' as const,
        pickupCount: undefined,
    },
];

export const mockDriverInfo = {
    name: 'John Doe',
    role: 'Driver',
    avatar: 'https://i.pravatar.cc/100?img=8',
    rating: 4.5,
    vehiclePlate: 'XYZ-1234',
    vehicleModel: 'Toyota Coaster',
};

export const mockShiftInfo = {
    date: 'Oct 24, 2023',
    routeId: '4B',
    vehicleModel: 'Toyota Coaster',
    vehiclePlate: 'XYZ-123',
    totalPassengers: 12,
};

export const mockNextStop = {
    name: 'North Gate',
    passengerCount: 3,
    arrivalTime: '08:46',
    minutesAway: 4,
};

// Istanbul coordinates for map centering
export const ISTANBUL_REGION = {
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
};

export const mockRouteCoordinates = [
    { latitude: 41.0082, longitude: 28.9684 },
    { latitude: 41.0102, longitude: 28.9724 },
    { latitude: 41.0122, longitude: 28.9764 },
    { latitude: 41.0142, longitude: 28.9784 },
    { latitude: 41.0162, longitude: 28.9824 },
];

export const mockShuttleLocation = {
    latitude: 41.0122,
    longitude: 28.9764,
};

export const mockUserLocation = {
    latitude: 41.0162,
    longitude: 28.9824,
};
