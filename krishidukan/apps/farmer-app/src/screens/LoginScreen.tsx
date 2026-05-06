import React, { useRef, useState } from 'react';
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
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { auth } from '../firebase';
import { useAuth } from '../AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export function LoginScreen({ navigation }: Props) {
  const recaptchaVerifier = useRef<any>(null);
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const { sendOtp } = useAuth();

  async function handleSendOtp() {
    const normalized = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
    if (normalized.length < 12) {
      Alert.alert('Invalid number', 'Enter a valid 10-digit mobile number.');
      return;
    }
    setSending(true);
    try {
      const verificationId = await sendOtp(normalized, recaptchaVerifier.current);
      navigation.navigate('OtpVerify', { verificationId, phone: normalized });
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to send OTP. Try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={auth.app.options}
        attemptInvisibleVerification
      />

      <View style={styles.card}>
        <Text style={styles.emoji}>🌾</Text>
        <Text style={styles.title}>KrishiDukan</Text>
        <Text style={styles.subtitle}>Find agri-inputs near you</Text>

        <Text style={styles.label}>Mobile Number</Text>
        <View style={styles.inputRow}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="98765 43210"
            keyboardType="phone-pad"
            maxLength={10}
            returnKeyType="done"
            onSubmitEditing={handleSendOtp}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, sending && styles.buttonDisabled]}
          onPress={handleSendOtp}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send OTP</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.notice}>
          We'll send a verification code to your mobile number.
        </Text>
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
  emoji: { fontSize: 36, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#14532d', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 28 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  prefix: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#f3f4f6',
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    letterSpacing: 1,
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
  notice: { fontSize: 11, color: '#9ca3af', textAlign: 'center' },
});
