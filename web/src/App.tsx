import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProductsPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CartProvider from './context/CartProvider'

import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import RequireAdmin from './pages/admin/RequireAdmin'

import AdminProductsList from './pages/admin/products/AdminProductList'
import AdminProductCreate from './pages/admin/products/AdminProductCreate'
import AdminProductShow from './pages/admin/products/AdminProductShow'
import AdminProductEdit from './pages/admin/products/AdminProductEdit'
import AdminProductDelete from './pages/admin/products/AdminProductDelete'

import AdminCategoriesList from './pages/admin/categories/AdminCategoriesList'
import AdminCategoryCreate from './pages/admin/categories/AdminCategoryCreate'
import AdminCategoryShow from './pages/admin/categories/AdminCategoryShow'
import AdminCategoryEdit from './pages/admin/categories/AdminCategoryEdit'
import AdminCategoryDelete from './pages/admin/categories/AdminCategoryDelete'



export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<AdminProductsList />} />

            {/* Productos */}
            <Route path="products" element={<AdminProductsList />} />
            <Route path="products/new" element={<AdminProductCreate />} />
            <Route path="products/:id" element={<AdminProductShow />} />
            <Route path="products/:id/edit" element={<AdminProductEdit />} />
            <Route path="products/:id/delete" element={<AdminProductDelete />} />

            {/* Categorías */}
            <Route path="categories" element={<AdminCategoriesList />} />
            <Route path="categories/new" element={<AdminCategoryCreate />} />
            <Route path="categories/:id" element={<AdminCategoryShow />} />
            <Route path="categories/:id/edit" element={<AdminCategoryEdit />} />
            <Route path="categories/:id/delete" element={<AdminCategoryDelete />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}


