export interface Product {
    id: number;
    name: string;
    slug: string;
    barcode?: string;
    category_id: number;
    subcategory_id: number;
    brand_id: number;
    brand:{name:string};
    description?: string;
    price: number;
    category:{title:string};
    subcategory:{title:string};
    discount?: number;
    stock_quantity: number;
    fabric?: string;
    color?: string;
    size?: string;
    work_type?: string;
    occasion?: string;
    weight?: number;
    is_bestseller: boolean;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
  }

  export interface ProductImage {
    id: number;
    product_id: number;
    image_path: string;
    alt_text?: string;
    is_primary: boolean;
    display_order: number;
    created_at?: string;
    updated_at?: string;
  }

  export interface ProductSpecification {
    id: number;
    product_id: number;
    name: string;
    value: string;
    created_at?: string;
    updated_at?: string;
  }


export interface ProductVideo {
  id: number;
  product_id: number;
  video_provider_id: number;
  title: string;
  video_id: string;
  description?: string;
  thumbnail?: string;
  display_order: number;
  is_featured: boolean;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  video_provider: VideoProvider;
}

export interface VideoProvider {
  id: number;
  name: string;
  base_url: string;
  logo?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface Color {
    id: number;
    name: string;
    hex_code?: string;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
  }

  export interface Size {
    id: number;
    name: string;
    code?: string;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
  }

  export interface ProductVariant {
    id: number;
    product_id: number;
    color_id?: number;
    size_id?: number;
    sku: string;
    barcode?: string;
    price: number;
    discount: number;
    stock_quantity: number;
    image_path?: string;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
    color?: Color;
    size?: Size;
  }
