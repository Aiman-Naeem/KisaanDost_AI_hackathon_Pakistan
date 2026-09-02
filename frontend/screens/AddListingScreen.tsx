import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createListing, deleteListing } from '../services/api';
import type { Crop } from '../services/api';
import type { MarketplaceStackParamList } from './ListingsScreen';
import { useFarmerContext } from '../contexts/FarmerContext';
import { useLanguage } from '../contexts/LanguageContext';
import { StateCard, PrimaryButton } from '../components/ui';
import { getCropIcon, getCropFullLabelI18n } from '../theme/crops';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { fontSize, fontWeight, getFontFamily } from '../theme/typography';

type Props = NativeStackScreenProps<MarketplaceStackParamList, 'AddListingScreen'>;

type FieldErrors = Partial<Record<'crop' | 'quantity' | 'price' | 'location' | 'phone' | 'general', string>>;

export default function AddListingScreen({ route, navigation }: Props) {
  const { farmerId } = useFarmerContext();
  const { language, t } = useLanguage();

  const editingListingId = route.params?.editingListingId;
  const initialData = route.params?.initialData;
  const isEditing = !!editingListingId;

  useEffect(() => {
    if (isEditing) {
      navigation.setOptions({ title: t('marketplace.addListingScreen.editTitle') });
    }
  }, [isEditing, navigation, t]);

  const [crop, setCrop] = useState<Crop>(initialData?.crop ?? 'wheat');
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() ?? '');
  const [price, setPrice] = useState(initialData?.price?.toString() ?? '');
  const [location, setLocation] = useState(initialData?.location ?? '');
  const [phone, setPhone] = useState(initialData?.phone ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) <= 0)
      e.quantity = t('marketplace.addListingScreen.quantityError');
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0)
      e.price = t('marketplace.addListingScreen.priceError');
    if (!location.trim())
      e.location = t('marketplace.addListingScreen.locationError');
    if (!/^\d{11}$/.test(phone.trim()))
      e.phone = t('marketplace.addListingScreen.phoneError');
    return e;
  };

  const mapApiError = (apiError: string): FieldErrors => {
    const lower = apiError.toLowerCase();
    if (lower.includes('quantity')) return { quantity: apiError };
    if (lower.includes('price')) return { price: apiError };
    if (lower.includes('location')) return { location: apiError };
    if (lower.includes('phone')) return { phone: apiError };
    if (lower.includes('crop')) return { crop: apiError };
    return { general: apiError };
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const listingData = {
      farmerId: farmerId ?? undefined,
      crop,
      quantity: Number(quantity),
      price: Number(price),
      location: location.trim(),
      phone: phone.trim(),
    };

    try {
      if (isEditing && editingListingId) {
        const deleteResult = await deleteListing(editingListingId);
        if (!deleteResult.success) {
          setErrors({ general: t('marketplace.addListingScreen.errorDeleteOriginal') });
          return;
        }
        const createResult = await createListing(listingData);
        if (createResult.success) {
          navigation.popToTop();
        } else {
          Alert.alert(
            t('marketplace.addListingScreen.updateFailedTitle'),
            t('marketplace.addListingScreen.updateFailedMessage'),
            [{ text: t('common.ok'), onPress: () => navigation.popToTop() }]
          );
        }
      } else {
        const result = await createListing(listingData);
        if (result.success) {
          navigation.goBack();
        } else {
          setErrors(mapApiError((result as any).error ?? t('marketplace.addListingScreen.generalError')));
        }
      }
    } catch (err) {
      setErrors({ general: t('common.error') });
      console.warn('Listing submission failed:', err);
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
          <StateCard
            variant="error"
            icon="⚠️"
            title={t('common.error')}
            description={errors.general}
            language={language}
          />
        )}

        {/* ── Edit mode notice ──────────────────────────────────────── */}
        {isEditing && (
          <StateCard
            variant="info"
            icon="✏️"
            title={t('marketplace.addListingScreen.editingNotice')}
            description={t('marketplace.addListingScreen.editingDescription')}
            language={language}
          />
        )}

        {/* ── Crop ──────────────────────────────────────────────────── */}
        <Text style={[styles.label, { fontFamily: getFontFamily(language) }]}>
          {t('marketplace.addListingScreen.cropLabel')}
        </Text>
        <View style={[styles.pickerWrapper, errors.crop && styles.inputError]}>
          <Picker
            selectedValue={crop}
            onValueChange={(val) => setCrop(val as Crop)}
            style={styles.picker}
            dropdownIconColor={colors.primary}
          >
            {(['wheat', 'rice', 'cotton', 'maize'] as Crop[]).map((cropVal) => (
              <Picker.Item
                key={cropVal}
                label={`${getCropIcon(cropVal)} ${getCropFullLabelI18n(cropVal, t)}`}
                value={cropVal}
              />
            ))}
          </Picker>
        </View>
        {errors.crop && <Text style={styles.fieldError}>{errors.crop}</Text>}

        {/* ── Quantity ──────────────────────────────────────────────── */}
        <Text style={[styles.label, { fontFamily: getFontFamily(language) }]}>
          {t('marketplace.addListingScreen.quantityLabel')}
        </Text>
        <TextInput
          style={[styles.input, errors.quantity && styles.inputError, { fontFamily: getFontFamily(language) }]}
          placeholder={t('marketplace.addListingScreen.quantityPlaceholder')}
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
        <Text style={[styles.label, { fontFamily: getFontFamily(language) }]}>
          {t('marketplace.addListingScreen.priceLabel')}
        </Text>
        <TextInput
          style={[styles.input, errors.price && styles.inputError, { fontFamily: getFontFamily(language) }]}
          placeholder={t('marketplace.addListingScreen.pricePlaceholder')}
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
        <Text style={[styles.label, { fontFamily: getFontFamily(language) }]}>
          {t('marketplace.addListingScreen.locationLabel')}
        </Text>
        <TextInput
          style={[styles.input, errors.location && styles.inputError, { fontFamily: getFontFamily(language) }]}
          placeholder={t('marketplace.addListingScreen.locationPlaceholder')}
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
        <Text style={[styles.label, { fontFamily: getFontFamily(language) }]}>
          {t('marketplace.addListingScreen.phoneLabel')}
        </Text>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError, { fontFamily: getFontFamily(language) }]}
          placeholder={t('marketplace.addListingScreen.phonePlaceholder')}
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
        <PrimaryButton
          label={isEditing ? t('marketplace.addListingScreen.saveChangesButton') : t('marketplace.addListingScreen.postListingButton')}
          onPress={handleSubmit}
          loading={submitting}
          style={styles.submitButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },

  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    marginTop: spacing.base,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  pickerWrapper: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  picker: {
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
  },
  fieldError: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: 2,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});
