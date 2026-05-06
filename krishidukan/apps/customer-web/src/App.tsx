import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LocationProvider } from './LocationContext';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { RetailerPage } from './pages/RetailerPage';
import { ShopsPage } from './pages/ShopsPage';
import { AccountPage } from './pages/AccountPage';
// Legacy routes kept for back-compat
import { SearchPage } from './pages/SearchPage';
import { ShopPage } from './pages/ShopPage';

export default function App() {
  return (
    <LocationProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/retailer/:id" element={<RetailerPage />} />
            <Route path="/retailers" element={<ShopsPage />} />
            <Route path="/account" element={<AccountPage />} />
            {/* legacy */}
            <Route path="/search" element={<SearchPage />} />
            <Route path="/shop/:id" element={<ShopPage />} />
            <Route path="/shops" element={<ShopsPage />} />
            <Route path="/categories" element={<HomePage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </LocationProvider>
  );
}
