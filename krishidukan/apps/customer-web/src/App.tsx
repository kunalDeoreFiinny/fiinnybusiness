import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginGateModal } from './components/LoginGateModal';
import { LocationProvider } from './LocationContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { RetailerPage } from './pages/RetailerPage';
import { ShopsPage } from './pages/ShopsPage';
import { AccountPage } from './pages/AccountPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { AddressesPage } from './pages/AddressesPage';
import { SearchPage } from './pages/SearchPage';
import { ShopPage } from './pages/ShopPage';
import { MarketPage } from './pages/MarketPage';
import { HubPage } from './pages/HubPage';
import { AboutPage } from './pages/AboutPage';

export default function App() {
  return (
    <LocationProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/market" element={<MarketPage />} />
                <Route path="/hub" element={<HubPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/retailer/:id" element={<RetailerPage />} />
                <Route path="/retailers" element={<ShopsPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/addresses" element={<AddressesPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/shop/:id" element={<ShopPage />} />
                <Route path="/shops" element={<ShopsPage />} />
                <Route path="/categories" element={<MarketPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </Layout>
            <LoginGateModal />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </LocationProvider>
  );
}
