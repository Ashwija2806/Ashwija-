import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function ProductImage({
  src,
  alt,
  className = 'h-full w-full object-cover object-top',
  fallbackLabel,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#F5F5F6] to-[#EAEAEC] p-4 text-center text-[#7E818C]"
      >
        <ShoppingBag className="mb-2 h-7 w-7 text-[#7E818C]" aria-hidden="true" />
        <span className="line-clamp-2 text-xs font-medium text-[#282C3F]">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
