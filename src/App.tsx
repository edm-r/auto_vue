import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { PrivateRoute } from './auth/PrivateRoute'
import { AdminRoute } from './admin/AdminRoute'
import { getApiBaseUrl } from './config/apiBaseUrl'
import { ConfigErrorPage } from './pages/ConfigErrorPage'
import { DashboardPage } from './pages/DashboardPage'
import { CategoryPage } from './pages/CategoryPage'
import { HomePage } from './pages/HomePage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage'
import { CheckoutCancelPage } from './pages/CheckoutCancelPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ProductsPage } from './pages/ProductsPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { AccountLayoutPage } from './pages/account/AccountLayoutPage'
import { AccountProfilePage } from './pages/account/AccountProfilePage'
import { AccountAddressesPage } from './pages/account/AccountAddressesPage'
import { AccountOrdersPage } from './pages/account/AccountOrdersPage'
import { AccountOrderDetailPage } from './pages/account/AccountOrderDetailPage'
import { AccountWishlistPage } from './pages/account/AccountWishlistPage'
import { AccountVehiclesPage } from './pages/account/AccountVehiclesPage'
import { AdminLayoutPage } from './pages/admin/AdminLayoutPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage'
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage'
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage'
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage'
import { AdminPromotionsPage } from './pages/admin/AdminPromotionsPage'

export default function App() {
  if (!getApiBaseUrl()) {
    return <ConfigErrorPage />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/account"
          element={
            <PrivateRoute>
              <AccountLayoutPage />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<AccountProfilePage />} />
          <Route path="addresses" element={<AccountAddressesPage />} />
          <Route path="orders" element={<AccountOrdersPage />} />
          <Route path="orders/:id" element={<AccountOrderDetailPage />} />
          <Route path="wishlist" element={<AccountWishlistPage />} />
          <Route path="vehicles" element={<AccountVehiclesPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayoutPage />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="promotions" element={<AdminPromotionsPage />} />
        </Route>
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <CheckoutPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout/success"
          element={
            <PrivateRoute>
              <CheckoutSuccessPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout/cancel"
          element={
            <PrivateRoute>
              <CheckoutCancelPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
