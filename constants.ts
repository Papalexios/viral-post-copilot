
import React from 'react';
import { Platform, Tone, CampaignGoal, AiProvider } from './types';
import { FacebookIcon } from './components/icons/FacebookIcon';
import { InstagramIcon } from './components/icons/InstagramIcon';
import { PinterestIcon } from './components/icons/PinterestIcon';
import { LinkedInIcon } from './components/icons/LinkedInIcon';
import { TwitterIcon } from './components/icons/TwitterIcon';

export const AI_PROVIDERS: { name: AiProvider; defaultModel: string; apiKeyUrl: string; }[] = [
    { name: AiProvider.Gemini, defaultModel: 'gemini-2.5-flash', apiKeyUrl: 'https://aistudio.google.com/app/apikey' },
    { name: AiProvider.OpenAI, defaultModel: 'gpt-4o', apiKeyUrl: 'https://platform.openai.com/api-keys' },
    { name: AiProvider.Claude, defaultModel: 'claude-3-haiku-20240307', apiKeyUrl: 'https://console.anthropic.com/settings/keys' },
    { name: AiProvider.OpenRouter, defaultModel: 'google/gemini-flash-1.5', apiKeyUrl: 'https://openrouter.ai/keys' },
];

export const PLATFORMS: { name: Platform; icon: React.FC<{ className?: string }> }[] = [
  { name: Platform.Facebook, icon: FacebookIcon },
  { name: Platform.Instagram, icon: InstagramIcon },
  { name: Platform.Pinterest, icon: PinterestIcon },
  { name: Platform.LinkedIn, icon: LinkedInIcon },
  { name: Platform.Twitter, icon: TwitterIcon },
];

export const TONES: Tone[] = [
  Tone.Professional,
  Tone.Casual,
  Tone.Witty,
  Tone.Inspirational,
  Tone.Persuasive,
];

export const CAMPAIGN_GOALS: CampaignGoal[] = [
    CampaignGoal.BrandAwareness,
    CampaignGoal.LeadGeneration,
    CampaignGoal.CommunityEngagement,
    CampaignGoal.ThoughtLeadership,
    CampaignGoal.SalesConversion,
];
