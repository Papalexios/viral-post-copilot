

export enum Platform {
  Facebook = 'Facebook',
  Instagram = 'Instagram',
  Pinterest = 'Pinterest',
  LinkedIn = 'LinkedIn',
  Twitter = 'Twitter',
  Threads = 'Threads',
  Bluesky = 'Bluesky',
  YouTubeShorts = 'YouTube Shorts',
}

export enum Tone {
  Professional = 'Professional',
  Casual = 'Casual',
  Witty = 'Witty',
  Inspirational = 'Inspirational',
  Persuasive = 'Persuasive',
}

export enum InputMode {
  Topic = 'Topic / Keyword',
  URLSitemap = 'URL / Sitemap',
  GeoTopic = 'Geo-Targeted Topic',
}

export enum CampaignGoal {
    BrandAwareness = 'Brand Awareness',
    LeadGeneration = 'Lead Generation',
    CommunityEngagement = 'Community Engagement',
    ThoughtLeadership = 'Thought Leadership',
    SalesConversion = 'Sales & Conversion',
}

export interface ViralBreakdown {
  emotional_resonance: number;
  platform_optimization: number;
  content_value: number;
  engagement_triggers: number;
}

export type ViralTrigger = 'Awe' | 'Humor' | 'Social Currency' | 'Curiosity Gap' | 'Urgency' | 'Storytelling' | 'Practical Value';

export interface PostVariation {
    variation_name: string;
    post_title: string;
    post_text: string;
    call_to_action: string;
    hashtags: string[];
    share_snippet: string;
    viral_trigger: ViralTrigger;
}

export type WordPressPostStatus = 'idle' | 'publishing' | 'published' | 'error';

export interface GeneratedPost {
  id: string;
  platform: Platform;
  variations: PostVariation[];
  image_prompt: string;
  viral_score: number;
  viral_breakdown: ViralBreakdown;
  optimization_notes: string;
  funnel_stage?: 'Awareness' | 'Engagement' | 'Conversion';
  sourceUrl?: string;
  // Image generation status
  imageUrl?: string; // High-performance Blob URL for display
  imageDataUrl?: string; // Original base64 data URL for uploads
  imageIsLoading?: boolean;
  imageError?: string;
  // WordPress publishing status
  wordpressStatus: WordPressPostStatus;
  wordpressUrl?: string;
  wordpressError?: string;
  // Scheduling status
  isScheduled?: boolean;
  scheduledDate?: number; // timestamp
  performanceMetrics?: {
      impressions?: number;
      engagementRate?: number;
      conversions?: number;
  };
  // In-app editing status
  rewritingPart?: 'post_title' | 'post_text' | 'call_to_action' | 'image_prompt' | null;
  // New SOTA features
  paa_block_html?: string;
  schema_org_jsonld?: string;
  internal_links_html?: string;
  clipScript?: string;
  clipScriptIsLoading?: boolean;
}

export interface TopicAnalysis {
    campaign_strategy: string;
    trend_alignment: string;
    audience_resonance: string;
    content_gaps: string;
    viral_hooks: string[];
}

// Type for Google Search grounding results
export interface WebGroundingSource {
  uri: string;
  title: string;
}

export interface MapsGroundingSource {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            text: string;
            author: string;
        }[];
    };
}

export interface GroundingChunk {
  web?: WebGroundingSource;
  maps?: MapsGroundingSource;
}


export interface GroundingMetadata {
    groundingChunks: GroundingChunk[];
}

export interface SchedulingSuggestion {
    platform: Platform;
    dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    timeOfDay: string; // e.g., "9:00 AM - 11:00 AM"
    reasoning: string;
}

export interface ApiResponse {
    // New fields for history management
    id: string;
    campaignTitle: string;
    timestamp: number;
    tone: Tone;
    // Core response
    topic_analysis: TopicAnalysis;
    posts: GeneratedPost[];
    groundingMetadata?: GroundingMetadata;
    schedulingSuggestions?: SchedulingSuggestion[];
}

export interface InputFormData {
  inputMode: InputMode;
  topic: string;
  sourceUrl: string;
  selectedPlatforms: Platform[];
  tone: Tone;
  campaignGoal: CampaignGoal;
  postCount: number;
  trendBoost: boolean;
  syndicate: boolean;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface ViralPost {
    platform: string;
    post_text: string;
    neuro_score: number;
    viral_trigger: string;
}

export enum AiProvider {
    Gemini = 'Google Gemini',
    OpenAI = 'OpenAI',
    Claude = 'Anthropic Claude',
    OpenRouter = 'OpenRouter',
}

export interface AiConfig {
    provider: AiProvider;
    apiKey: string;
    model: string;
    isValidated: boolean;
}

export interface WordPressConfig {
    url: string;
    username: string;
    password: string; // Application Password
    isValidated: boolean;
}


// Type for the chunks yielded by the generator stream
export type StreamChunk = 
    | { type: 'analysis'; data: TopicAnalysis }
    | { type: 'post'; data: Omit<GeneratedPost, 'id' | 'wordpressStatus' | 'isScheduled' | 'rewritingPart' | 'clipScript' | 'clipScriptIsLoading'> }
    | { type: 'grounding'; data: GroundingMetadata };