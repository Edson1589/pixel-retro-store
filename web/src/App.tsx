import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductsPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CartProvider from './context/CartProvider';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import RequireAdmin from './pages/admin/RequireAdmin';
import RequireStaff from './pages/admin/RequireStaff';

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

import AdminSalesList from './pages/admin/sales/AdminSalesList';
import AdminSaleShow from './pages/admin/sales/AdminSaleShow';
import AdminPosSaleCreate from './pages/admin/sales/AdminPosSaleCreate';
import AdminEventWalkIn from './pages/admin/events/AdminEventWalkIn';

import AdminUsersList from './pages/admin/users/AdminUsersList';
import AdminUserCreate from './pages/admin/users/AdminUserCreate';
import AdminUserShow from './pages/admin/users/AdminUserShow';
import AdminUserEdit from './pages/admin/users/AdminUserEdit';
import AdminUserDelete from './pages/admin/users/AdminUserDelete';
import AdminChangePassword from './pages/admin/AdminChangePassword';
import AdminForgotPassword from './pages/admin/AdminForgotPassword';
import CustomerForgotPassword from './pages/auth/CustomerForgotPassword';
import CustomerChangePassword from './pages/account/CustomerChangePassword';
import RequireCustomer from './components/auth/RequireCustomer';

import AccountAppointments from './pages/account/AccountAppointments';
import AppointmentNew from './pages/account/AppointmentNew';
import AppointmentDetail from './pages/account/AppointmentDetail';
import AdminAppointmentsList from './pages/admin/appointments/AdminAppointmentsList';

import Footer from '../src/components/layout/Footer';

import About from '../src/pages/AboutPage';

import ScrollToTop from '../src/components/layout/ScrollToTop';
import NotFoundPage from '../src/pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-[#07101B]">
          <ScrollToTop />
          <Header />
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />

            <Route path="/events" element={<EventsList />} />
            <Route path="/events/:slug" element={<EventDetail />} />

            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/register" element={<CustomerRegister />} />
            <Route path="/account/orders" element={<OrdersPage />} />
            <Route path="/account/orders/:id" element={<OrderDetailPage />} />

            <Route path="/account/orders" element={<RequireCustomer><OrdersPage /></RequireCustomer>} />
            <Route path="/account/orders/:id" element={<RequireCustomer><OrderDetailPage /></RequireCustomer>} />
            <Route path="/account/change-password" element={<RequireCustomer><CustomerChangePassword /></RequireCustomer>} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/register" element={<CustomerRegister />} />
            <Route path="/forgot-password" element={<CustomerForgotPassword />} />

            <Route path="/account/orders" element={<RequireCustomer><OrdersPage /></RequireCustomer>} />
            <Route path="/account/orders/:id" element={<RequireCustomer><OrderDetailPage /></RequireCustomer>} />
            <Route path="/account/change-password" element={<RequireCustomer><CustomerChangePassword /></RequireCustomer>} />

            <Route path="/account/appointments" element={<RequireCustomer><AccountAppointments /></RequireCustomer>} />
            <Route path="/account/appointments/new" element={<RequireCustomer><AppointmentNew /></RequireCustomer>} />
            <Route path="/account/appointments/:id" element={<RequireCustomer><AppointmentDetail /></RequireCustomer>} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

            <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
              <Route path="change-password" element={<RequireAdmin><AdminChangePassword /></RequireAdmin>} />
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

              <Route path="sales" element={<AdminSalesList />} />
              <Route path="sales/:id" element={<AdminSaleShow />} />
              <Route path="pos/sale" element={<AdminPosSaleCreate />} />
              <Route path="events/onsite" element={<AdminEventWalkIn />} />

              <Route path="users" element={<AdminUsersList />} />
              <Route path="users/new" element={<AdminUserCreate />} />
              <Route path="users/:id" element={<AdminUserShow />} />
              <Route path="users/:id/edit" element={<AdminUserEdit />} />
              <Route path="users/:id/delete" element={<AdminUserDelete />} />
              <Route path="appointments" element={<RequireStaff><AdminAppointmentsList /></RequireStaff>} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
