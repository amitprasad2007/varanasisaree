import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collection, collectionsService } from '@/services/collections';

interface CollectionCardProps {
  collection: Collection;
  className?: string;
}

export default function CollectionCard({ collection, className = '' }: CollectionCardProps) {
  const imageUrl = collectionsService.getImageUrl(collection.thumbnail_image || collection.banner_image);

  return (
    <Link href={`/collections/${collection.slug}`} className={`block ${className}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative overflow-hidden">
          <img
            src={imageUrl}
            alt={collection.name}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '/logo.svg';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
          {collection.collection_type && (
            <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800 hover:bg-white">
              {collection.collection_type.name}
            </Badge>
          )}
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors duration-200">
            {collection.name}
          </h3>
          {collection.description && (
            <p className="text-gray-600 mt-2 line-clamp-2">
              {collection.description}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              View Collection
            </span>
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}