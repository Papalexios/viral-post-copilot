

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
    post_text: string;
    call_to_action: string;
    share_snippet: string;
}

export interface GeneratedPost {
  platform: Platform;
  variations: PostVariation[];
  image_prompt: string;
  viral_score: number;
  viral_breakdown: ViralBreakdown;
  optimization_notes: string;
  funnel_stage?: 'Awareness' | 'Engagement' | 'Conversion';
  sourceUrl?: string;
  // New fields for image generation status
  imageUrl?: string;
  imageIsLoading?: boolean;
}

export interface TopicAnalysis {
    campaign_strategy: string;
    trend_alignment: string;
    audience_resonance: string;
    content_gaps: string;
    viral_hooks: string[];
}

// Type for Google Search grounding results
export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
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
