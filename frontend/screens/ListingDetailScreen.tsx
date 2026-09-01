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
import { getCropIcon, getCropFullLabel } from '../theme/crops';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { fontSize, fontWeight, lineHeight } from '../theme/typography';

type Props = NativeStackScreenProps<MarketplaceStackParamList, 'ListingDetailScreen'>;

function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ListingDetailScreen({ route, navigation }: Props) {
  const { listingId } = route.params;
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
      'Delete Listing',
      'Are you sure you want to delete this listing? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
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
        <Text style={styles.loadingText}>Loading listing...</Text>
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
          title="Listing Not Found"
          description="This listing may have been deleted or is no longer available."
          actionLabel="← Back to Listings"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  // ── Main UI ─────────────────────────────────────────────────────────────
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Crop badge with icon */}
      <View style={styles.cropBadge}>
        <Text style={styles.cropBadgeText}>
          {getCropIcon(listing.crop)} {getCropFullLabel(listing.crop)}
        </Text>
      </View>

      {/* Details card */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Quantity</Text>
          <Text style={styles.value}>{listing.quantity.toLocaleString()} kg</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Price</Text>
          <Text style={styles.value}>PKR {listing.price.toLocaleString()}/kg</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{listing.location}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{listing.phone}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Listed</Text>
          <Text style={styles.value}>{formatRelativeDate(listing.createdAt)}</Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <PrimaryButton
          label="Call Farmer"
          icon="📞"
          variant="secondary"
          onPress={handleCallFarmer}
        />
        <PrimaryButton
          label="Edit"
          icon="✏️"
          variant="primary"
          onPress={handleEdit}
        />
        <PrimaryButton
          label="Delete"
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
