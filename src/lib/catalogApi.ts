import { api } from './api'
import { unwrapResults } from './pagination'

export type Category = {
  id: number
  name: string
  slug?: string | null
  description?: string | null
  image?: string | null
}

export type Brand = {
  id: number
  name: string
  slug?: string | null
  logo?: string | null
}

export type CarModel = {
  id: number
  brand: number
  brand_name?: string
  name: string
  year_start?: number | null
  year_end?: number | null
  body_type?: string | null
}

export type ProductImage = {
  image: string
  alt_text?: string | null
}

export type ProductListItem = {
  id: number
  name: string
  slug?: string | null
  sku?: string | null
  category?: number | null
  category_name?: string | null
  brand?: number | null
  brand_name?: string | null
  price: string
  stock_quantity?: number
  is_in_stock?: boolean
  rating?: string | number | null
  is_featured?: boolean
  primary_image?: ProductImage | null
}

export type ProductDetail = ProductListItem & {
  description?: string | null
  images?: ProductImage[]
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await api.get('/products/categories/')
  return unwrapResults<Category>(res.data)
}

export async function fetchBrands(): Promise<Brand[]> {
  const res = await api.get('/products/brands/')
  return unwrapResults<Brand>(res.data)
}

export async function fetchCarModels(params: { brand?: number }): Promise<CarModel[]> {
  const res = await api.get('/products/car-models/', { params })
  return unwrapResults<CarModel>(res.data)
}

export async function fetchFeaturedProducts(): Promise<ProductListItem[]> {
  const res = await api.get('/products/', { params: { is_featured: true } })
  return unwrapResults<ProductListItem>(res.data)
}

export async function fetchProducts(params: {
  search?: string
  category?: string
  brand?: string
  compatible_car_models?: string
}): Promise<ProductListItem[]> {
  const res = await api.get('/products/', { params })
  return unwrapResults<ProductListItem>(res.data)
}

export async function fetchProduct(productId: string): Promise<ProductDetail> {
  const res = await api.get(`/products/${productId}/`)
  return res.data as ProductDetail
}

