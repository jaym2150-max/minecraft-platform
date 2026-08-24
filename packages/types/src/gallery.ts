export type GalleryItemType = 'IMAGE' | 'VIDEO';

export interface GalleryImage {
  id: string;
  type: GalleryItemType;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  width?: number;
  height?: number;
  order: number;
}
