import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getListingById, deleteListing } from '../services/api';
import type { Listing, Crop } from '../services/api';
import type { MarketplaceStackParamList } from './ListingsScreen';
import { StateCard, PrimaryButton } from '../components/ui';
import { getCropIcon, getCropFullLabelI18n } from '../theme/crops';
import { useLanguage } from '../contexts/LanguageContext';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { fontSize, fontWeight, lineHeight, getFontFamily } from '../theme/typography';

type Props = NativeStackScreenProps<MarketplaceStackParamList, 'ListingDetailScreen'>;

function formatRelativeDate(isoString: string, t: (key: string) => string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('marketplace.relativeTime.justNow');
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? t('marketplace.relativeTime.minuteAgo') : t('marketplace.relativeTime.minutesAgo')}`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? t('marketplace.relativeTime.hourAgo') : t('marketplace.relativeTime.hoursAgo')}`;
  if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? t('marketplace.relativeTime.dayAgo') : t('marketplace.relativeTime.daysAgo')}`;
  return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ListingDetailScreen({ route, navigation }: Props) {
  const { listingId } = route.params;
  const { language, t } = useLanguage();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await getListingById(listingId);
        if (result.success) {
          setListing((result as any).listing ?? null);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.warn('Failed to fetch listing:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [listingId]);

  const handleCallFarmer = async () => {
    if (!listing) return;
    try {
      await Linking.openURL(`tel:${listing.phone}`);
    } catch {
      Alert.alert('Phone Number', listing.phone);
    }
  };

  const handleEdit = () => {
    if (!listing) return;
    navigation.navigate('AddListingScreen', {
      editingListingId: listing._id,
      initialData: {
        crop: listing.crop,
        quantity: listing.quantity,
        price: listing.price,
        location: listing.location,
        phone: listing.phone,
      },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      t('marketplace.listingDetailScreen.deleteConfirmTitle'),
      t('marketplace.listingDetailScreen.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('marketplace.listingsScreen.deleteButton'),
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteListing(listingId);
              navigation.goBack();
            } catch (err) {
              console.warn('Delete failed:', err);
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { fontFamily: getFontFamily(language) }]}>
          {t('marketplace.listingDetailScreen.loadingListing')}
        </Text>
      </View>
    );
  }

  // ── Not found ───────────────────────────────────────────────────────────
  if (notFound || !listing) {
    return (
      <View style={styles.center}>
        <StateCard
          variant="neutral"
          icon="🔍"
          title={t('marketplace.listingDetailScreen.notFoundTitle')}
          description={t('marketplace.listingDetailScreen.notFoundDescription')}
          actionLabel={t('marketplace.listingDetailScreen.backButton')}
          onAction={() => navigation.goBack()}
          language={language}
        />
      </View>
    );
  }

  // ── Main UI ─────────────────────────────────────────────────────────────
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Crop badge with icon */}
      <View style={styles.cropBadge}>
        <Text style={[styles.cropBadgeText, { fontFamily: getFontFamily(language) }]}>
          {getCropIcon(listing.crop)} {getCropFullLabelI18n(listing.crop, t)}
        </Text>
      </View>

      {/* Details card */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={[styles.label, { fontFamily: getFontFamily(language) }]}>
            {t('marketplace.listingDetailScreen.quantity')}
          </Text>
          <Text style={[styles.value, { fontFamily: getFontFamily(language) }]}>
            {listing.quantity.toLocaleString()} kg
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { fontFamily: getFontFamily(language) }]}>
            {t('marketplace.listingDetailScreen.price')}
          </Text>
          <Text style={[styles.value, { fontFamily: getFontFamily(language) }]}>
            PKR {listing.price.toLocaleString()}/kg
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={[styles.label, { fontFamily: getFontFamily(language) }]}>
            {t('marketplace.listingDetailScreen.location')}
          </Text>
          <Text style={[styles.value, { fontFamily: getFontFamily(language) }]}>
            {listing.location}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { fontFamily: getFontFamily(language) }]}>
            {t('marketplace.listingDetailScreen.phone')}
          </Text>
          <Text style={[styles.value, { fontFamily: getFontFamily(language) }]}>
            {listing.phone}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={[styles.label, { fontFamily: getFontFamily(language) }]}>
            {t('marketplace.listingDetailScreen.listed')}
          </Text>
          <Text style={[styles.value, { fontFamily: getFontFamily(language) }]}>
            {formatRelativeDate(listing.createdAt, t)}
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <PrimaryButton
          label={t('marketplace.listingDetailScreen.callFarmerButton')}
          icon="📞"
          variant="secondary"
          onPress={handleCallFarmer}
        />
        <PrimaryButton
          label={t('marketplace.listingDetailScreen.editButton')}
          icon="✏️"
          variant="primary"
          onPress={handleEdit}
        />
        <PrimaryButton
          label={t('marketplace.listingDetailScreen.deleteButton')}
          icon="🗑️"
          variant="danger"
          onPress={handleDelete}
          loading={deleting}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.base,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.body,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },

  // Crop badge
  cropBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.base,
    paddingVertical: 6,
    borderRadius: radius.xl,
    marginBottom: spacing.base,
  },
  cropBadgeText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },

  // Details card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    padding: spacing.base,
    marginBottom: spacing.lg,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  value: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
  },

  // Actions
  actions: {
    gap: spacing.md,
  },
});
