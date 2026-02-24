import { Route, Vehicle, Employee, Cluster, StopNamesMap } from './types';

/**
 * Base URL for the Flask backend.
 * Port 5050 avoids macOS AirPlay (5000) and Docker Desktop (5001) conflicts.
 */
const API_BASE: string = 'http://localhost:5050';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    console.log('[API] Fetching:', url);
    const res = await fetch(url, options);
    if (!res.ok) {
        const body = await res.text();
        throw new Error('API ' + res.status + ': ' + body);
    }
    return res.json();
}

export const api = {
    /** Get all routes (lightweight, no bus stops by default) */
    getRoutes: () =>
        request<Route[]>(`${API_BASE}/api/routes?include_bus_stops=true`),

    /** Get a single route with full details including bus stops */
    getRoute: (clusterId: number) =>
        request<Route>(`${API_BASE}/api/routes/${clusterId}`),

    /** Get all vehicles */
    getVehicles: () =>
        request<Vehicle[]>(`${API_BASE}/api/vehicles`),

    /** Get all employees */
    getEmployees: () =>
        request<Employee[]>(`${API_BASE}/api/employees`),

    /** Get a single employee */
    getEmployee: (id: number) =>
        request<Employee>(`${API_BASE}/api/employees/${id}`),

    /** Get a cluster with employees and route info */
    getCluster: (id: number) =>
        request<Cluster>(`${API_BASE}/api/clusters/${id}`),

    /** Resolve bus stop names from coordinates */
    getStopNames: (coords: number[][]) =>
        request<StopNamesMap>(`${API_BASE}/api/stops/names`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coordinates: coords }),
        }),

    /** Get walking route between two points via OSRM */
    getWalkingRoute: (originLat: number, originLon: number, destLat: number, destLon: number) =>
        request<{ coordinates: number[][]; distance_km: number; duration_min: number }>(
            `${API_BASE}/api/walking-route?origin_lat=${originLat}&origin_lon=${originLon}&dest_lat=${destLat}&dest_lon=${destLon}`
        ),
};
