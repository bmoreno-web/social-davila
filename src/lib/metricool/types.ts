export interface MetricoolSimpleProfile {
  id: number; // blogId
  userId: number;
  ownerUserId: number;
  label: string;
  url: string | null;
  title: string | null;
  description: string;
  picture: string | null;
  instagram: string | null;
  facebook: string | null;
  facebookPageId: string | null;
  linkedinCompany: string | null;
  youtube: string | null;
  tiktok: string | null;
  threads: string | null;
  bluesky: string | null;
  pinterest: string | null;
  twitter: string | null;
  gmb: string | null;
  adwords: string | null;
  timezone: string | null;
  hash: string | null;
}

export interface MetricoolPostItem {
  blogId?: number;
  pageId?: string;
  postId?: string;
  created?: {
    dateTime: string;
    timezone?: string;
  };
  timestamp?: number;
  link?: string;
  text?: string;
  type?: string;
  shares?: number;
  comments?: number;
  reactions?: number;
  like?: number;
  love?: number;
  likes?: number;
  saves?: number;
  reach?: number;
  impressions?: number;
  engagement?: number;
  engagementRatio?: number;
  mediaUrl?: string;
  picture?: string;
  thumbnailUrl?: string;
  videoViews?: number;
}

export interface MetricoolTimelineItem {
  metric: string;
  values: Array<[string, string | number] | { date: string; value: number }>;
}

export interface MetricoolTimelineResponse {
  data: MetricoolTimelineItem[];
}

export interface UnifiedSocialPost {
  id: string;
  platform: 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK' | 'LINKEDIN' | 'YOUTUBE' | 'PINTEREST' | 'THREADS' | 'X';
  publishedAt: string;
  caption: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  postType: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  permalink?: string;
}

export interface UnifiedMetricTimeline {
  date: string;
  followers?: number;
  reach?: number;
  impressions?: number;
  interactions?: number;
  engagement?: number;
  postsCount?: number;
}

export interface MetricoolSyncSummary {
  clientId: string;
  clientName: string;
  blogId: string;
  syncedPostsCount: number;
  platforms: string[];
  lastSyncAt: string;
  status: 'SUCCESS' | 'PARTIAL' | 'ERROR';
  message?: string;
}
