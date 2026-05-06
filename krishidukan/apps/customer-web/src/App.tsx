import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LocationProvider } from './LocationContext';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ProductPage } from './pages/ProductPage';
import { ShopPage } from './pages/ShopPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ShopsPage } from './pages/ShopsPage';
import { AccountPage } from './pages/AccountPage';

export default function App() {
  return (
    <LocationProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/shop/:id" element={<ShopPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/shops" element={<ShopsPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </LocationProvider>
  );
}
