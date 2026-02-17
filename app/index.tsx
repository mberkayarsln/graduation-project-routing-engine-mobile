import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/colors';
import Button from '@/components/Button';
import InputField from '@/components/InputField';

export default function LoginScreen() {
  const router = useRouter();
  const [role, setRole] = useState<'employee' | 'driver'>('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    if (role === 'driver') {
      router.replace('/(driver)/route');
    } else {
      router.replace('/(employee)/home');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            justifyContent: 'center',
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Text
            style={{
              fontSize: 32,
              fontWeight: '700',
              color: Colors.text,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Welcome Back
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: Colors.textSecondary,
              textAlign: 'center',
              marginBottom: 32,
            }}
          >
            Enter your details to access the shuttle service
          </Text>

          {/* Role Toggle */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: Colors.borderLight,
              borderRadius: 12,
              padding: 4,
              marginBottom: 32,
            }}
          >
            <TouchableOpacity
              onPress={() => setRole('employee')}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: role === 'employee' ? Colors.white : 'transparent',
                alignItems: 'center',
                shadowColor: role === 'employee' ? '#000' : 'transparent',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: role === 'employee' ? 0.1 : 0,
                shadowRadius: 2,
                elevation: role === 'employee' ? 2 : 0,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: role === 'employee' ? '600' : '400',
                  color: role === 'employee' ? Colors.text : Colors.textMuted,
                }}
              >
                Employee
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRole('driver')}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: role === 'driver' ? Colors.white : 'transparent',
                alignItems: 'center',
                shadowColor: role === 'driver' ? '#000' : 'transparent',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: role === 'driver' ? 0.1 : 0,
                shadowRadius: 2,
                elevation: role === 'driver' ? 2 : 0,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: role === 'driver' ? '600' : '400',
                  color: role === 'driver' ? Colors.text : Colors.textMuted,
                }}
              >
                Driver
              </Text>
            </TouchableOpacity>
          </View>

          {/* Email Input */}
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: Colors.primary,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            Email Address
          </Text>
          <InputField
            placeholder="name@company.com"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
            keyboardType="email-address"
          />

          {/* Password Input */}
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: Colors.primary,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginTop: 20,
              marginBottom: 8,
            }}
          >
            Password
          </Text>
          <InputField
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            icon="lock-closed-outline"
            secureTextEntry
          />

          {/* Forgot Password */}
          <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 12 }}>
            <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <View style={{ marginTop: 32 }}>
            <Button title="Sign In" onPress={handleSignIn} />
          </View>

          {/* Footer */}
          <TouchableOpacity style={{ marginTop: 24, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
              Need help?{' '}
              <Text style={{ color: Colors.primary, fontWeight: '600' }}>
                Contact Dispatch
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
