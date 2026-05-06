import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { kdApi } from '../api';
import { DEFAULT_SEARCH_RADIUS_KM } from '@krishidukan/shared';

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string;
}

interface SearchResult {
  shop_id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  address_line: string;
  city: string;
  lat: number;
  lng: number;
  price: number;
  mrp: number;
  quantity: number;
  in_stock: boolean;
  distance_m: number;
}

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searching, setSearching] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    void requestLocation();
  }, []);

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationError('Location permission is required to find nearby shops.');
      return;
    }
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch {
      setLocationError('Could not get your location. Please enable GPS.');
    }
  }

  const searchProducts = useCallback(async (text: string) => {
    if (text.length < 2) { setProducts([]); return; }
    setLoadingProducts(true);
    try {
      const res = await kdApi.get<Product[]>('/products', { params: { search: text } });
      setProducts(res.data);
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void searchProducts(query), 300);
    return () => clearTimeout(timer);
  }, [query, searchProducts]);

  async function searchShops(product: Product) {
    if (!location) {
      Alert.alert('Location required', locationError || 'Waiting for location…');
      return;
    }
    setSelectedProduct(product);
    setProducts([]);
    setQuery(product.name);
    setSearching(true);
    try {
      const res = await kdApi.get<SearchResult[]>('/search', {
        params: {
          productId: product.id,
          lat: location.lat,
          lng: location.lng,
          radiusKm: DEFAULT_SEARCH_RADIUS_KM,
        },
      });
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function openDirections(lat: number, lng: number, name: string) {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(name)}&ll=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${encodeURIComponent(name)}`,
    });
    if (url) void Linking.openURL(url);
  }

  function formatDistance(meters: number) {
    return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={text => { setQuery(text); setSelectedProduct(null); setResults([]); }}
          placeholder="Search products (e.g. Mahyco MRC 6918)"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {loadingProducts && <ActivityIndicator size="small" color="#16a34a" style={{ marginRight: 10 }} />}
      </View>

      {locationError ? (
        <View style={styles.locError}>
          <Text style={styles.locErrorText}>{locationError}</Text>
          <TouchableOpacity onPress={requestLocation}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !location ? (
        <View style={styles.locError}>
          <ActivityIndicator color="#16a34a" />
          <Text style={[styles.locErrorText, { marginLeft: 8 }]}>Getting your location…</Text>
        </View>
      ) : null}

      {/* Product suggestions */}
      {products.length > 0 && (
        <View style={styles.suggestions}>
          {products.map(p => (
            <TouchableOpacity
              key={p.id}
              style={styles.suggestion}
              onPress={() => void searchShops(p)}
            >
              <Text style={styles.suggestionName}>{p.name}</Text>
              {p.brand && <Text style={styles.suggestionBrand}>{p.brand}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Search results */}
      {searching ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.searchingText}>Finding nearby shops…</Text>
        </View>
      ) : selectedProduct && results.length === 0 && !searching ? (
        <View style={styles.centered}>
          <Text style={styles.noResults}>No shops found within {DEFAULT_SEARCH_RADIUS_KM}km</Text>
          <Text style={styles.noResultsHint}>Try increasing the radius or searching a different product.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.shop_id}
          contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
          renderItem={({ item }) => (
            <View style={styles.shopCard}>
              <View style={styles.shopHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shopName}>{item.business_name}</Text>
                  <Text style={styles.shopAddress}>{item.address_line}, {item.city}</Text>
                </View>
                <Text style={styles.distance}>{formatDistance(item.distance_m)}</Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.price}>₹{item.price}</Text>
                {item.mrp > item.price && (
                  <Text style={styles.mrp}>MRP ₹{item.mrp}</Text>
                )}
                <Text style={[styles.stockBadge, item.in_stock ? styles.inStock : styles.outStock]}>
                  {item.in_stock ? `In Stock (${item.quantity})` : 'Out of Stock'}
                </Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => void Linking.openURL(`tel:${item.phone}`)}
                >
                  <Text style={styles.callBtnText}>📞 Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dirBtn}
                  onPress={() => openDirections(item.lat, item.lng, item.business_name)}
                >
                  <Text style={styles.dirBtnText}>🗺 Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListHeaderComponent={
            selectedProduct && results.length > 0 ? (
              <Text style={styles.resultsHeader}>
                {results.length} shop{results.length !== 1 ? 's' : ''} near you stocking {selectedProduct.name}
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
  },
  locError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
  },
  locErrorText: { fontSize: 12, color: '#92400e', flex: 1 },
  retryText: { fontSize: 12, color: '#16a34a', fontWeight: '700' },
  suggestions: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 4,
    overflow: 'hidden',
  },
  suggestion: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionName: { fontSize: 14, color: '#111827', fontWeight: '500' },
  suggestionBrand: { fontSize: 12, color: '#6b7280' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  searchingText: { marginTop: 12, color: '#6b7280', fontSize: 14 },
  noResults: { fontSize: 16, fontWeight: '600', color: '#374151', textAlign: 'center' },
  noResultsHint: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 8 },
  resultsHeader: { fontSize: 13, color: '#6b7280', marginBottom: 10, paddingHorizontal: 4 },
  shopCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  shopHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  shopName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  shopAddress: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  distance: { fontSize: 12, fontWeight: '700', color: '#16a34a', marginLeft: 8, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  price: { fontSize: 16, fontWeight: '700', color: '#16a34a' },
  mrp: { fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through' },
  stockBadge: { fontSize: 11, fontWeight: '600', marginLeft: 'auto', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  inStock: { backgroundColor: '#dcfce7', color: '#14532d' },
  outStock: { backgroundColor: '#fee2e2', color: '#991b1b' },
  actionRow: { flexDirection: 'row', gap: 8 },
  callBtn: {
    flex: 1, paddingVertical: 10, backgroundColor: '#f0fdf4',
    borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#86efac',
  },
  callBtnText: { fontSize: 13, fontWeight: '600', color: '#16a34a' },
  dirBtn: {
    flex: 1, paddingVertical: 10, backgroundColor: '#eff6ff',
    borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#bfdbfe',
  },
  dirBtnText: { fontSize: 13, fontWeight: '600', color: '#1d4ed8' },
});
