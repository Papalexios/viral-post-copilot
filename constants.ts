import React from 'react';
import { Platform, Tone, CampaignGoal, AiProvider } from './types';
import { FacebookIcon } from './components/icons/FacebookIcon';
import { InstagramIcon } from './components/icons/InstagramIcon';
import { PinterestIcon } from './components/icons/PinterestIcon';
import { LinkedInIcon } from './components/icons/LinkedInIcon';
import { TwitterIcon } from './components/icons/TwitterIcon';

export const AI_PROVIDERS: { name: AiProvider; defaultModel: string; apiKeyUrl: string; }[] = [
    { name: AiProvider.Gemini, defaultModel: 'gemini-2.5-pro', apiKeyUrl: 'https://aistudio.google.com/app/apikey' },
    { name: AiProvider.OpenAI, defaultModel: 'gpt-4o', apiKeyUrl: 'https://platform.openai.com/api-keys' },
    { name: AiProvider.Claude, defaultModel: 'claude-3-haiku-20240307', apiKeyUrl: 'https://console.anthropic.com/settings/keys' },
    { name: AiProvider.OpenRouter, defaultModel: 'anthropic/claude-3.5-sonnet', apiKeyUrl: 'https://openrouter.ai/keys' },
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

export const RESOURCE_LINKS = [
  {
    category: 'Affiliate Marketing Fundamentals',
    description: 'Learn the basics and build a strong foundation for your affiliate marketing journey.',
    links: [
      { title: "Beginner's Guide to Affiliate Marketing", url: 'https://affiliatemarketingforsuccess.com/affiliate-marketing/beginners-guide-to-affiliate-marketing/' },
      { title: 'How to Choose a Profitable Niche', url: 'https://affiliatemarketingforsuccess.com/how-to-start/how-to-choose-your-niche/' },
      { title: 'Why Affiliate Marketing is the Best Business Model', url: 'https://affiliatemarketingforsuccess.com/affiliate-marketing/discover-why-affiliate-marketing-is-the-best-business-model/' },
      { title: 'Join The Best Affiliate Networks', url: 'https://affiliatemarketingforsuccess.com/affiliate-marketing/join-the-best-affiliate-networks/' },
      { title: 'High-Ticket vs. Low-Ticket Affiliate Marketing', url: 'https://affiliatemarketingforsuccess.com/affiliate-marketing/high-ticket-affiliate-marketing/' },
    ]
  },
  {
    category: 'Content & Blogging Strategy',
    description: 'Master the art of creating content that converts and ranks.',
    links: [
      { title: 'How to Create a Winning Content Strategy', url: 'https://affiliatemarketingforsuccess.com/blogging/winning-content-strategy/' },
      { title: 'How to Create Evergreen Content', url: 'https://affiliatemarketingforsuccess.com/blogging/how-to-create-evergreen-content/' },
      { title: 'Promote Your Blog to Increase Traffic', url: 'https://affiliatemarketingforsuccess.com/blogging/promote-your-blog-to-increase-traffic/' },
      { title: 'The Best Structure of a Blog Post for SEO', url: 'https://affiliatemarketingforsuccess.com/blogging/what-is-the-best-structure-of-a-blog-post/' },
    ]
  },
   {
    category: 'SEO & Traffic Generation',
    description: 'Drive organic traffic to your blog with proven SEO techniques.',
    links: [
      { title: 'Build an Effective SEO Strategy from Scratch', url: 'https://affiliatemarketingforsuccess.com/seo/build-an-effective-seo-strategy/' },
      { title: 'Write Meta Descriptions That Convert', url: 'https://affiliatemarketingforsuccess.com/seo/write-meta-descriptions-that-convert/' },
      { title: 'The Importance of Keyword Research', url: 'https://affiliatemarketingforsuccess.com/seo/the-importance-of-keywords-research/' },
      { title: 'Link Building Strategies That Work', url: 'https://affiliatemarketingforsuccess.com/seo/link-building-strategies/' },
    ]
  },
   {
    category: 'AI in Marketing',
    description: 'Leverage Artificial Intelligence to automate and scale your marketing efforts.',
    links: [
      { title: 'Discover the Power of ChatGPT for Marketing', url: 'https://affiliatemarketingforsuccess.com/ai/discover-the-power-of-chatgpt/' },
      { title: 'What is AI Prompt Engineering?', url: 'https://affiliatemarketingforsuccess.com/ai/what-is-ai-prompt-engineering/' },
      { title: 'How to Avoid AI Content Detection', url: 'https://affiliatemarketingforsuccess.com/ai/avoid-ai-detection/' },
      { title: 'Launch Your Affiliate Business with AI Tools', url: 'https://affiliatemarketingforsuccess.com/affiliate-marketing/launch-affiliate-business-ai-tools/' },
    ]
  },
  {
    category: 'Email Marketing',
    description: 'Build and nurture your audience with powerful email campaigns.',
    links: [
      { title: 'Proven Ways to Grow Your Email List', url: 'https://affiliatemarketingforsuccess.com/email-marketing/proven-ways-to-grow-your-email-list/' },
      { title: 'Understanding Email Marketing Funnels', url: 'https://affiliatemarketingforsuccess.com/email-marketing/understanding-email-marketing/' },
      { title: 'Craft Irresistible Email Newsletters', url: 'https://affiliatemarketingforsuccess.com/email-marketing/craft-irresistible-email-newsletters/' },
    ]
  },
  {
    category: 'Website & Hosting',
    description: 'Set up your website for success with the right foundation.',
    links: [
        { title: '10 Simple Steps to Build Your Website', url: 'https://affiliatemarketingforsuccess.com/how-to-start/10-simple-steps-to-build-your-website-a-beginners-guide/' },
        { title: 'How to Choose a Web Host', url: 'https://affiliatemarketingforsuccess.com/how-to-start/how-to-choose-a-web-host/' },
        { title: 'WordPress Blogging Tips for Success', url: 'https://affiliatemarketingforsuccess.com/blogging/wordpress-blogging-tips/' },
    ]
  }
];