/**
 * TypeScript interfaces matching the Flask backend JSON responses.
 */

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface LoginPayload {
    role: 'employee' | 'driver';
    /** Employee name / numeric ID, or driver name / vehicle ID */
    identifier: string;
}

export interface LoginResponse {
    success: boolean;
    error?: string;
    role: 'employee' | 'driver';
    id: number;
    name: string;
    email: string;
    // Employee
    lat?: number;
    lon?: number;
    cluster_id?: number | null;
    pickup_point?: [number, number] | null;
    zone_id?: number | null;
    excluded?: boolean;
    // Driver
    vehicle_id?: number;
    vehicle_type?: string;
    vehicle_capacity?: number;
    route_cluster_id?: number | null;
}

export interface Route {
    cluster_id: number;
    center: [number, number];
    distance_km: number;
    duration_min: number;
    stops: number[][];
    bus_stops: number[][];
    coordinates: number[][];
    stop_count: number;
    bus_stop_count: number;
    employee_count: number;
    optimized: boolean;
}

export interface Vehicle {
    id: number;
    capacity: number;
    vehicle_type: string;
    driver_name: string;
    plate_number: string;
}

export interface Employee {
    id: number;
    name: string;
    lat: number;
    lon: number;
    zone_id: number | null;
    cluster_id: number | null;
    excluded: boolean;
    exclusion_reason: string | null;
    pickup_point: [number, number] | null;
    has_route: boolean;
}

export interface ClusterEmployee {
    id: number;
    name: string;
    lat: number;
    lon: number;
    pickup_point: [number, number] | null;
    walking_distance: number | null;
}

export interface Cluster {
    id: number;
    center: [number, number];
    employee_count: number;
    employees: ClusterEmployee[];
    route: {
        distance_km: number;
        duration_min: number;
        stops: number[][];
        coordinates: number[][];
        stop_count: number;
        optimized: boolean;
    } | null;
}

export interface StopNamesMap {
    [coordinateKey: string]: string;
}
