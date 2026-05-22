export interface DownloadStats {
  total: number;
  daily: { date: string; count: number }[];
  byVersion: { version: string; count: number }[];
  byLoader: { loader: string; count: number }[];
}

export interface ProjectAnalytics {
  projectId: string;
  downloads: DownloadStats;
  views: { total: number; daily: { date: string; count: number }[] };
  uniqueVisitors: number;
  averageRating: number;
}
