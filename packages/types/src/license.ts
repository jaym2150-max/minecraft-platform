export enum LicenseType {
  PERMISSIVE = 'PERMISSIVE',
  COPYLEFT = 'COPYLEFT',
  PROPRIETARY = 'PROPRIETARY',
  PUBLIC_DOMAIN = 'PUBLIC_DOMAIN',
  UNKNOWN = 'UNKNOWN',
}

export interface License {
  id: string;
  shortId: string;
  name: string;
  type: LicenseType;
  url?: string;
  description?: string;
  body?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseListItem {
  id: string;
  shortId: string;
  name: string;
  type: LicenseType;
  url?: string;
  description?: string;
  featured: boolean;
}
