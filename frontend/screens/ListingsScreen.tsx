import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getListings, deleteListing } from '../services/api';
import type { Listing, Crop } from '../services/api';

// ── Navigation param list (shared with AddListingScreen) ────────────────────
export type MarketplaceStackParamList = {
  ListingsScreen: undefined;
  AddListingScreen: undefined;
};

type Props = NativeStackScreenProps<MarketplaceStackParamList, 'ListingsScreen'>;

// ── Crop options ─────────────────────────────────────────────────────────────
const CROP_OPTIONS: { label: string; value: Crop | '' }[] = [
  { label: 'All Crops', value: '' },
  { label: 'Wheat (گندم)', value: 'wheat' },
  { label: 'Rice (چاول)', value: 'rice' },
  { label: 'Cotton (کپاس)', value: 'cotton' },
  { label: 'Maize (مکئی)', value: 'maize' },
];

// ── Crop display labels ───────────────────────────────────────────────────────
const CROP_LABELS: Record<Crop, string> = {
  wheat: 'Wheat',
  rice: 'Rice',
  cotton: 'Cotton',
  maize: 'Maize',
};

export default function ListingsScreen({ navigation }: Props) {
  const isFocused = useIsFocused();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cropFilter, setCropFilter] = useState<Crop | ''>('');
  const [locationFilter, setLocationFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Fetch listings ─────────────────────────────────────────────────────────
  const fetchListings = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const filters: { crop?: Crop; location?: string } = {};
      if (cropFilter) filters.crop = cropFilter;
      if (locationFilter.trim()) filters.location = locationFilter.trim();

      const result = await getListings(filters);
      if (result.success) {
        setListings((result as any).listings ?? []);
      }
    } catch (err) {
      console.warn('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cropFilter, locationFilter]);

  // Re-fetch whenever the screen comes into focus (handles returning from AddListingScreen)
  // or when filters change.
  useEffect(() => {
    if (isFocused) {
      fetchListings(!refreshing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, cropFilter, locationFilter]);

  // ── Pull-to-refresh ────────────────────────────────────────────────────────
  const handleRefresh = () => {
    setRefreshing(true);
    fetchListings(false);
  };

  // ── Delete listing ─────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const result = await deleteListing(id);
      if (result.success || (!result.success && (result as any).error === 'Listing not found')) {
        // Either deleted or already gone — silently refresh the list
        await fetchListings(false);
      }
    } catch (err) {
      console.warn('Delete failed:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render a single listing card ───────────────────────────────────────────
  const renderItem = ({ item }: { item: Listing }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cropBadge}>
          <Text style={styles.cropBadgeText}>{CROP_LABELS[item.crop]}</Text>
        </View>
        <Pressable
          style={styles.deleteBtn}
          onPress={() => handleDelete(item._id)}
          disabled={deletingId === item._id}
        >
          {deletingId === item._id ? (
            <ActivityIndicator size="small" color="#c62828" />
          ) : (
            <Text style={styles.deleteBtnText}>✕</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.label}>Quantity</Text>
        <Text style={styles.value}>{item.quantity.toLocaleString()} kg</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Price</Text>
        <Text style={styles.value}>PKR {item.price.toLocaleString()}/kg</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>{item.location}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{item.phone}</Text>
      </View>
    </View>
  );

  // ── Filter header rendered above the FlatList ──────────────────────────────
  const ListHeader = (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Filter by Crop</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={cropFilter}
          onValueChange={(val) => setCropFilter(val as Crop | '')}
          style={styles.picker}
          dropdownIconColor="#2e7d32"
        >
          {CROP_OPTIONS.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>

      <Text style={styles.filterLabel}>Filter by Location</Text>
      <TextInput
        style={styles.textInput}
        placeholder="e.g. Lahore"
        placeholderTextColor="#aaa"
        value={locationFilter}
        onChangeText={setLocationFilter}
        autoCorrect={false}
      />
    </View>
  );

  // ── Empty state ────────────────────────────────────────────────────────────
  const ListEmpty = loading ? null : (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🌾</Text>
      <Text style={styles.emptyTitle}>No listings yet</Text>
      <Text style={styles.emptySubtitle}>
        {cropFilter || locationFilter
          ? 'No results match your filters. Try adjusting them.'
          : 'Be the first to list your crop!'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && listings.length === 0 ? (
        <View style={styles.initialLoader}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Loading listings...</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#2e7d32"
              colors={['#2e7d32']}
            />
          }
        />
      )}

      {/* ── Floating Action Button ─────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddListingScreen')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // Initial full-screen loader
  initialLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#2e7d32',
    fontWeight: '500',
  },

  // FlatList content
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // space above FAB
  },

  // Filters
  filterContainer: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 8,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    marginBottom: 4,
  },
  picker: {
    color: '#333',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },

  // Listing card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cropBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  cropBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2e7d32',
  },
  deleteBtn: {
    padding: 6,
    minWidth: 28,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 16,
    color: '#c62828',
    fontWeight: '700',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  label: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 24,
  },

  // Floating Action Button
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 32,
  },
});
