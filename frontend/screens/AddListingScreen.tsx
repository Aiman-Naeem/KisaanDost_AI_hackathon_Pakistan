import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createListing } from '../services/api';
import type { Crop } from '../services/api';
import type { MarketplaceStackParamList } from './ListingsScreen';

// ── Types ──────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<MarketplaceStackParamList, 'AddListingScreen'>;

const CROP_OPTIONS: { label: string; value: Crop }[] = [
  { label: 'Wheat (گندم)', value: 'wheat' },
  { label: 'Rice (چاول)', value: 'rice' },
  { label: 'Cotton (کپاس)', value: 'cotton' },
  { label: 'Maize (مکئی)', value: 'maize' },
];

/** Hardcoded farmer ID placeholder — will come from auth context later. */
const PLACEHOLDER_FARMER_ID = 'farmer_001';

// ── Field error map ────────────────────────────────────────────────────────
type FieldErrors = Partial<Record<'crop' | 'quantity' | 'price' | 'location' | 'phone' | 'general', string>>;

export default function AddListingScreen({ navigation }: Props) {
  const [crop, setCrop] = useState<Crop>('wheat');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  // ── Client-side validation ────────────────────────────────────────────────
  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) <= 0)
      e.quantity = 'Enter a valid quantity (kg)';
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0)
      e.price = 'Enter a valid price (PKR/kg)';
    if (!location.trim())
      e.location = 'Location is required';
    if (!/^\d{11}$/.test(phone.trim()))
      e.phone = 'Phone must be exactly 11 digits';
    return e;
  };

  // ── Map an API field-error string to our FieldErrors key ─────────────────
  const mapApiError = (apiError: string): FieldErrors => {
    const lower = apiError.toLowerCase();
    if (lower.includes('quantity')) return { quantity: apiError };
    if (lower.includes('price')) return { price: apiError };
    if (lower.includes('location')) return { location: apiError };
    if (lower.includes('phone')) return { phone: apiError };
    if (lower.includes('crop')) return { crop: apiError };
    return { general: apiError };
  };

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const result = await createListing({
        farmerId: PLACEHOLDER_FARMER_ID,
        crop,
        quantity: Number(quantity),
        price: Number(price),
        location: location.trim(),
        phone: phone.trim(),
      });

      if (result.success) {
        // Navigate back; ListingsScreen re-fetches via useIsFocused
        navigation.goBack();
      } else {
        setErrors(mapApiError((result as any).error ?? 'Submission failed'));
      }
    } catch (err) {
      setErrors({ general: 'Something went wrong, please try again.' });
      console.warn('createListing failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* ── General error ─────────────────────────────────────────── */}
        {errors.general && (
          <View style={styles.generalError}>
            <Text style={styles.generalErrorText}>{errors.general}</Text>
          </View>
        )}

        {/* ── Crop ──────────────────────────────────────────────────── */}
        <Text style={styles.label}>Crop *</Text>
        <View style={[styles.pickerWrapper, errors.crop && styles.inputError]}>
          <Picker
            selectedValue={crop}
            onValueChange={(val) => setCrop(val as Crop)}
            style={styles.picker}
            dropdownIconColor="#2e7d32"
          >
            {CROP_OPTIONS.map((opt) => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>
        {errors.crop && <Text style={styles.fieldError}>{errors.crop}</Text>}

        {/* ── Quantity ──────────────────────────────────────────────── */}
        <Text style={styles.label}>Quantity (kg) *</Text>
        <TextInput
          style={[styles.input, errors.quantity && styles.inputError]}
          placeholder="e.g. 500"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          value={quantity}
          onChangeText={(v) => {
            setQuantity(v);
            if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: undefined }));
          }}
        />
        {errors.quantity && <Text style={styles.fieldError}>{errors.quantity}</Text>}

        {/* ── Price ─────────────────────────────────────────────────── */}
        <Text style={styles.label}>Price (PKR/kg) *</Text>
        <TextInput
          style={[styles.input, errors.price && styles.inputError]}
          placeholder="e.g. 3200"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          value={price}
          onChangeText={(v) => {
            setPrice(v);
            if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
          }}
        />
        {errors.price && <Text style={styles.fieldError}>{errors.price}</Text>}

        {/* ── Location ──────────────────────────────────────────────── */}
        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={[styles.input, errors.location && styles.inputError]}
          placeholder="e.g. Lahore"
          placeholderTextColor="#aaa"
          value={location}
          autoCorrect={false}
          onChangeText={(v) => {
            setLocation(v);
            if (errors.location) setErrors((prev) => ({ ...prev, location: undefined }));
          }}
        />
        {errors.location && <Text style={styles.fieldError}>{errors.location}</Text>}

        {/* ── Phone ─────────────────────────────────────────────────── */}
        <Text style={styles.label}>Phone (11 digits) *</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          placeholder="e.g. 03001234567"
          placeholderTextColor="#aaa"
          keyboardType="phone-pad"
          maxLength={11}
          value={phone}
          onChangeText={(v) => {
            setPhone(v);
            if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
          }}
        />
        {errors.phone && <Text style={styles.fieldError}>{errors.phone}</Text>}

        {/* ── Submit ────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Post Listing</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },

  // General error banner
  generalError: {
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  generalErrorText: {
    color: '#e65100',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Field labels
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444',
    marginTop: 16,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // Picker
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    color: '#333',
  },

  // Text input
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  inputError: {
    borderColor: '#c62828',
  },

  // Field-level error text
  fieldError: {
    fontSize: 12,
    color: '#c62828',
    marginTop: 4,
    marginLeft: 2,
  },

  // Submit button
  submitButton: {
    marginTop: 28,
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#81c784',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
