

export enum Platform {
  Facebook = 'Facebook',
  Instagram = 'Instagram',
  Pinterest = 'Pinterest',
  LinkedIn = 'LinkedIn',
  Twitter = 'Twitter',
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

export interface PostVariation {
    variation_name: string;
    post_title: string;
    post_text: string;
    call_to_action: string;
    share_snippet: string;
    viral_trigger: string;
    poll_options?: string[];
}

export type WordPressPostStatus = 'idle' | 'publishing' | 'published' | 'error';
export type MediaGenerationStatus = 'idle' | 'generating' | 'completed' | 'error';

export interface HashtagStrategy {
    core: string[];
    niche: string[];
    trending: string[];
}

export interface GeneratedPost {
  platform: Platform;
  variations: PostVariation[];
  image_prompt: string;
  viral_score: number;
  viral_breakdown: ViralBreakdown;
  optimization_notes: string;
  hashtag_strategy: HashtagStrategy;
  funnel_stage?: 'Awareness' | 'Engagement' | 'Conversion';
  sourceUrl?: string;
  
  // Image generation status
  imageUrl?: string; // High-performance Blob URL for display
  imageDataUrl?: string; // Original base64 data URL for uploads
  imageIsLoading?: boolean;
  imageError?: string;
  
  // Video generation status (Veo)
  videoUrl?: string;
  videoStatus?: MediaGenerationStatus;
  videoError?: string;

  // Audio generation status (TTS)
  audioUrl?: string;
  audioStatus?: MediaGenerationStatus;
  audioError?: string;

  // WordPress publishing status
  wordpressStatus: WordPressPostStatus;
  wordpressUrl?: string;
  wordpressError?: string;
}

export interface SEOKeywords {
    primary: string[];
    secondary: string[];
    lsi: string[];
}

export interface AnswerEngineStrategy {
    suggested_faqs: string[];
}

export interface CompetitorAnalysis {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
}

export interface AudiencePersona {
    name: string;
    demographics: string;
    goals: string[];
    pain_points: string[];
    summary: string;
}

export interface PredictiveMetrics {
    estimated_engagement_rate: string;
    virality_probability: string;
    audience_sentiment_forecast: string;
    predicted_ctr: string;
}

export interface TopicAnalysis {
    campaign_strategy: string;
    trend_alignment: string;
    audience_resonance: string;
    content_gaps: string;
    viral_hooks: string[];
    seo_keywords?: SEOKeywords;
    answer_engine_strategy?: AnswerEngineStrategy;
    publishing_cadence?: string[];
    hashtag_strategy?: HashtagStrategy;
    competitor_analysis?: CompetitorAnalysis;
    audience_persona_details?: AudiencePersona;
    predictive_metrics?: PredictiveMetrics;
}

// Type for Google Search grounding results
export interface WebGroundingSource {
  uri?: string;
  title?: string;
}

export interface MapsGroundingSource {
  uri?: string;
  title?: string;
}

export interface GroundingChunk {
  web?: WebGroundingSource;
  maps?: MapsGroundingSource;
}


export interface GroundingMetadata {
    groundingChunks: GroundingChunk[];
}

export interface ApiResponse {
    // New fields for history management
    id: string;
    campaignTitle: string;
    timestamp: number;
    // Core response
    topic_analysis: TopicAnalysis;
    posts: GeneratedPost[];
    groundingMetadata?: GroundingMetadata;
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
  location?: string;
  competitorUrl?: string;
  audiencePersona?: string;
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
    | { type: 'post'; data: GeneratedPost }
    | { type: 'grounding'; data: GroundingMetadata };
