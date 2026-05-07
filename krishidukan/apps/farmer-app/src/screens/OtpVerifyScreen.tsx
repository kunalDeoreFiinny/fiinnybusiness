import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation';
import { useAuth } from '../AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OtpVerify'>;
  route: RouteProp<RootStackParamList, 'OtpVerify'>;
};

export function OtpVerifyScreen({ navigation, route }: Props) {
  const { verificationId, phone } = route.params;
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const { confirmOtp } = useAuth();

  async function handleVerify() {
    if (code.length !== 6) {
      Alert.alert('Invalid OTP', 'Enter the 6-digit code.');
      return;
    }
    setVerifying(true);
    try {
      await confirmOtp(verificationId, code);
      // onAuthStateChanged in AuthContext handles redirect to Home
    } catch {
      Alert.alert('Verification failed', 'Incorrect OTP. Try again.');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to {phone}
        </Text>

        <TextInput
          style={styles.otpInput}
          value={code}
          onChangeText={setCode}
          placeholder="• • • • • •"
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
          returnKeyType="done"
          onSubmitEditing={handleVerify}
        />

        <TouchableOpacity
          style={[styles.button, verifying && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={verifying}
        >
          {verifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify & Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Change number</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#14532d', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 28 },
  otpInput: {
    borderWidth: 2,
    borderColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 16,
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: { backgroundColor: '#86efac' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  back: { fontSize: 13, color: '#16a34a', textAlign: 'center', fontWeight: '600' },
});
