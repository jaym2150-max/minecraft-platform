import * as React from 'react';
import { cn } from './utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  ),
);
Avatar.displayName = 'Avatar';

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted', className)}
      {...props}
    />
  ),
);
AvatarFallback.displayName = 'AvatarFallback';

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, ...props }, ref) => {
    const [error, setError] = React.useState(false);
    if (!src || error) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={ref}
        src={src}
        alt={alt ?? ''}
        className={cn('aspect-square h-full w-full object-cover', className)}
        onError={() => setError(true)}
        {...props}
      />
    );
  },
);
AvatarImage.displayName = 'AvatarImage';

export { Avatar, AvatarFallback, AvatarImage };
