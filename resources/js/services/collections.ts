import axios from 'axios';

export interface CollectionType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  banner_image?: string;
  thumbnail_image?: string;
  seo_title?: string;
  seo_description?: string;
}

export interface Collection {
  id: number;
  collection_type_id: number;
  name: string;
  slug: string;
  description?: string;
  banner_image?: string;
  thumbnail_image?: string;
  seo_title?: string;
  seo_description?: string;
  collection_type?: CollectionType;
  products?: Product[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  status: string;
  imageproducts?: Array<{
    id: number;
    product_id: number;
    image_path: string;
  }>;
}

export interface CollectionResponse {
  id: number;
  collection_type_id: number;
  name: string;
  slug: string;
  description?: string;
  banner_image?: string;
  thumbnail_image?: string;
  seo_title?: string;
  seo_description?: string;
  collection_type: CollectionType;
  products: Product[];
}

class CollectionsService {
  private baseURL = '/api';

  async getCollectionTypes(): Promise<CollectionType[]> {
    const response = await axios.get(`${this.baseURL}/collection-types`);
    return response.data;
  }

  async getCollections(typeSlug?: string): Promise<Collection[]> {
    const params = typeSlug ? { type: typeSlug } : {};
    const response = await axios.get(`${this.baseURL}/collections`, { params });
    return response.data;
  }

  async getFeaturedCollections(): Promise<Collection[]> {
    const response = await axios.get(`${this.baseURL}/collections/featured`);
    return response.data;
  }

  async searchCollections(query: string): Promise<Collection[]> {
    const response = await axios.get(`${this.baseURL}/collections/search`, {
      params: { q: query }
    });
    return response.data;
  }

  async getCollection(slug: string): Promise<CollectionResponse> {
    const response = await axios.get(`${this.baseURL}/collections/${slug}`);
    return response.data;
  }

  getImageUrl(imagePath?: string): string {
    if (!imagePath) return '/logo.svg'; // fallback image
    return imagePath.startsWith('http') ? imagePath : `/storage/${imagePath}`;
  }
}

export const collectionsService = new CollectionsService();