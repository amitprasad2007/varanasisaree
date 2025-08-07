
import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Image, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  productId: number;
  title: string;
  description: string;
  actionText: string;
  actionHref: string;
}

export function EmptyState({ productId, title, description, actionText, actionHref }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-500 p-12 text-center">
      <div className="flex flex-col items-center justify-center gap-2">
        <Image className="h-12 w-12 text-gray-400" />
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-muted-foreground">
          {description}
        </p>
        <Button className="mt-4" asChild>
          <Link href={actionHref}>
            <PlusCircle className="h-4 w-4 mr-2" />
            {actionText}
          </Link>
        </Button>
      </div>
    </div>
  );
}
