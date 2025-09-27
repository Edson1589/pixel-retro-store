import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductsPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CartProvider from './context/CartProvider';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import RequireAdmin from './pages/admin/RequireAdmin';

import AdminProductsList from './pages/admin/products/AdminProductList';
import AdminProductCreate from './pages/admin/products/AdminProductCreate';
import AdminProductShow from './pages/admin/products/AdminProductShow';
import AdminProductEdit from './pages/admin/products/AdminProductEdit';
import AdminProductDelete from './pages/admin/products/AdminProductDelete';

import AdminCategoriesList from './pages/admin/categories/AdminCategoriesList';
import AdminCategoryCreate from './pages/admin/categories/AdminCategoryCreate';
import AdminCategoryShow from './pages/admin/categories/AdminCategoryShow';
import AdminCategoryEdit from './pages/admin/categories/AdminCategoryEdit';
import AdminCategoryDelete from './pages/admin/categories/AdminCategoryDelete';

import EventsList from './pages/EventsList';
import EventDetail from './pages/EventDetail';

import AdminEventsList from './pages/admin/events/AdminEventsList';
import AdminEventCreate from './pages/admin/events/AdminEventCreate';
import AdminEventShow from './pages/admin/events/AdminEventShow';
import AdminEventEdit from './pages/admin/events/AdminEventEdit';
import AdminEventDelete from './pages/admin/events/AdminEventDelete';
import AdminEventRegistrations from './pages/admin/events/AdminEventRegistrations';

import CheckoutSuccess from './pages/checkout/CheckoutSuccess';

import CustomerLogin from './pages/auth/CustomerLogin';
import CustomerRegister from './pages/auth/CustomerRegister';

import Header from './components/layout/Header';

import OrdersPage from './pages/account/OrdersPage';
import OrderDetailPage from './pages/account/OrderDetailPage';
import ProductDetail from './pages/ProductDetail';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Header />
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />

          <Route path="/events" element={<EventsList />} />
          <Route path="/events/:slug" element={<EventDetail />} />

          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/register" element={<CustomerRegister />} />
          <Route path="/account/orders" element={<OrdersPage />} />
          <Route path="/account/orders/:id" element={<OrderDetailPage />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<AdminProductsList />} />
            <Route path="products" element={<AdminProductsList />} />
            <Route path="products/new" element={<AdminProductCreate />} />
            <Route path="products/:id" element={<AdminProductShow />} />
            <Route path="products/:id/edit" element={<AdminProductEdit />} />
            <Route path="products/:id/delete" element={<AdminProductDelete />} />

            <Route path="categories" element={<AdminCategoriesList />} />
            <Route path="categories/new" element={<AdminCategoryCreate />} />
            <Route path="categories/:id" element={<AdminCategoryShow />} />
            <Route path="categories/:id/edit" element={<AdminCategoryEdit />} />
            <Route path="categories/:id/delete" element={<AdminCategoryDelete />} />

            <Route path="events" element={<AdminEventsList />} />
            <Route path="events/new" element={<AdminEventCreate />} />
            <Route path="events/:id" element={<AdminEventShow />} />
            <Route path="events/:id/edit" element={<AdminEventEdit />} />
            <Route path="events/:id/delete" element={<AdminEventDelete />} />
            <Route path="events/:id/registrations" element={<AdminEventRegistrations />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
