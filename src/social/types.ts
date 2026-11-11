export interface SocialPublishRequest {
  videoPath: string;
  title: string;
  description: string;
  tags: string[];
}

export interface PlatformPublishResult {
  platform: 'youtube' | 'instagram';
  success: boolean;
  publishedUrl?: string;
  id?: string;
  skipped?: boolean;
  error?: string;
}

export interface AggregatePublishResult {
  youtube?: PlatformPublishResult;
  instagram?: PlatformPublishResult;
}
