export type EventCategory = 'Politics' | 'Technology' | 'Sports' | 'Economy' | 'Science' | 'International' | 'Business' | 'Auto' | 'AI' | 'Global' | 'Pakistan' | 'Startups';

export type EventStatus = 'Detecting' | 'Verifying' | 'Live' | 'Archived';

export interface Source {
  id: string;
  name: string;
  url: string;
  reliabilityScore: number; // 0-1
  type: 'Official' | 'Media' | 'Social' | 'Aggregator';
}

export interface NewsEvent {
  id: string;
  title: string; // Internal title
  category: EventCategory;
  status: EventStatus;
  detectedAt: string | Date; // ISO Date
  lastUpdatedAt: string | Date;
  confidenceScore: number;
  sources: Source[];
  imageUrl?: string | null;
}

// ------------------------------------------------------------------
// QUIK-NATIVE FORMATS
// ------------------------------------------------------------------

export interface Signal {
  id: string;
  eventId: string;
  headline: string; // 1-2 factual lines, no adjectives
  summary: string;
  generatedAt: string | Date;
  imageUrl?: string | null;
  fullReport?: string | null;
  event?: NewsEvent;
}

export interface Brief {
  id: string;
  eventId: string;
  bulletPoints: string[]; // 5-7 facts only
  generatedAt: string | Date;
}

export interface LiveUpdate {
  id: string;
  eventId: string;
  timestamp: string | Date;
  content: string;
  sourceId?: string;
}

export interface LiveThread {
  id: string;
  eventId: string;
  updates: LiveUpdate[];
  isActive: boolean;
}

export interface AuthorProfile {
  slug: string;
  name: string;
  role: string;
  bio: string;
  areasOfCoverage: string[];
  type: 'Person' | 'Organization';
  avatarUrl?: string;
  socials?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface TopicHub {
  slug: string;
  name: string;
  parentCategory: EventCategory | string;
  description: string;
  keywords: string[];
  relatedTopics: string[];
  minArticleThreshold: number;
}

export interface SeoQualityReport {
  score: number; // 0-100
  passed: boolean;
  breakdown: {
    contentUsefulness: number; // Max 25
    originalValue: number; // Max 20
    technicalSeo: number; // Max 15
    sourceVerification: number; // Max 15
    internalLinking: number; // Max 10
    structuredData: number; // Max 10
    mediaQuality: number; // Max 5
  };
  feedback: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
}

export type IndexAuditCategory =
  | 'A_SHOULD_INDEX'
  | 'B_NEEDS_IMPROVEMENT'
  | 'C_NOINDEX_INTENTIONAL'
  | 'D_DUPLICATE_CLUSTER'
  | 'E_CANONICAL_CONFLICT'
  | 'F_CRAWLED_NOT_INDEXED'
  | 'G_DISCOVERED_NOT_INDEXED'
  | 'H_DEAD_4XX'
  | 'I_SOFT_404'
  | 'J_REDIRECTED'
  | 'K_OTHER_TECHNICAL';

