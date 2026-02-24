import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

const SCHEDULE = [
    { day: 'Monday', morning: '07:30', evening: '18:00' },
    { day: 'Tuesday', morning: '07:30', evening: '18:00' },
    { day: 'Wednesday', morning: '07:30', evening: '18:00' },
    { day: 'Thursday', morning: '07:30', evening: '18:00' },
    { day: 'Friday', morning: '07:30', evening: '17:00' },
    { day: 'Saturday', morning: '—', evening: '—' },
    { day: 'Sunday', morning: '—', evening: '—' },
];

export default function ScheduleScreen() {
    const router = useRouter();
    const today = new Date().getDay(); // 0=Sun, 1=Mon...
    const todayIdx = today === 0 ? 6 : today - 1; // Convert to Mon=0

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.text, marginLeft: 16 }}>Schedule & Timetable</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Info card */}
                <View style={{ backgroundColor: Colors.primaryLight, borderRadius: 14, padding: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="information-circle" size={22} color={Colors.primary} />
                    <Text style={{ fontSize: 13, color: Colors.primary, marginLeft: 10, flex: 1, fontWeight: '500' }}>
                        Shuttle departs from your pickup stop at the scheduled time. Please arrive 5 minutes early.
                    </Text>
                </View>

                {/* Schedule Table */}
                <View style={{ backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden' }}>
                    {/* Table Header */}
                    <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.background, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
                        <Text style={{ flex: 2, fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase' }}>Day</Text>
                        <Text style={{ flex: 1, fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', textAlign: 'center' }}>Morning</Text>
                        <Text style={{ flex: 1, fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', textAlign: 'center' }}>Evening</Text>
                    </View>
                    {/* Table Rows */}
                    {SCHEDULE.map((row, i) => {
                        const isToday = i === todayIdx;
                        const isWeekend = i >= 5;
                        return (
                            <View
                                key={i}
                                style={{
                                    flexDirection: 'row',
                                    paddingHorizontal: 16,
                                    paddingVertical: 14,
                                    borderBottomWidth: i < SCHEDULE.length - 1 ? 1 : 0,
                                    borderBottomColor: Colors.borderLight,
                                    backgroundColor: isToday ? Colors.primaryLight : 'transparent',
                                }}
                            >
                                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                                    {isToday && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginRight: 8 }} />}
                                    <Text style={{
                                        fontSize: 15,
                                        color: isWeekend ? Colors.textMuted : Colors.text,
                                        fontWeight: isToday ? '700' : '400',
                                    }}>
                                        {row.day}
                                    </Text>
                                </View>
                                <Text style={{
                                    flex: 1, fontSize: 15, textAlign: 'center',
                                    color: isWeekend ? Colors.textMuted : Colors.text,
                                    fontWeight: isToday ? '700' : '400',
                                }}>
                                    {row.morning}
                                </Text>
                                <Text style={{
                                    flex: 1, fontSize: 15, textAlign: 'center',
                                    color: isWeekend ? Colors.textMuted : Colors.text,
                                    fontWeight: isToday ? '700' : '400',
                                }}>
                                    {row.evening}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
