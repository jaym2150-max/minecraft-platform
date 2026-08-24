export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  createdAt: string;
}
