export interface Product {
    id: number;
    name: string;
    slug: string;
    category_id: number;
    subcategory_id: number;
    brand_id: number;
    description?: string;
    price: number;
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