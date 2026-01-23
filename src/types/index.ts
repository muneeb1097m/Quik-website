export type EventCategory = 'Politics' | 'Technology' | 'Sports' | 'Economy' | 'Science' | 'International' | 'Business' | 'Auto' | 'Telecom' | 'Global' | 'Pakistan' | 'Startups';

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
  content: string; // Verified fact or official confirmation
  sourceId?: string;
}

export interface LiveThread {
  id: string;
  eventId: string;
  updates: LiveUpdate[];
  isActive: boolean;
}
