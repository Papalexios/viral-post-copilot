import { GoogleGenAI, Type } from "@google/genai";
import { AiProvider, type InputFormData, type TopicAnalysis, type GeneratedPost, type GroundingMetadata, type AiConfig, InputMode, type ViralPost, type StreamChunk } from '../types';

// #region Schemas

const postsOnlySchema = {
  type: Type.OBJECT,
  properties: {
    posts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          platform: { type: Type.STRING },
          funnel_stage: { type: Type.STRING },
          variations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    variation_name: { type: Type.STRING },
                    post_title: { type: Type.STRING },
                    post_text: { type: Type.STRING },
                    call_to_action: { type: Type.STRING },
                    share_snippet: { type: Type.STRING },
                    viral_trigger: { type: Type.STRING },
                },
            }
          },
          hashtag_strategy: {
              type: Type.OBJECT,
              properties: {
                  core: { type: Type.ARRAY, items: { type: Type.STRING } },
                  niche: { type: Type.ARRAY, items: { type: Type.STRING } },
                  trending: { type: Type.ARRAY, items: { type: Type.STRING } },
              }
          },
          image_prompt: { type: Type.STRING },
          viral_score: { type: Type.NUMBER },
          viral_breakdown: {
            type: Type.OBJECT,
            properties: {
              emotional_resonance: { type: Type.NUMBER },
              platform_optimization: { type: Type.NUMBER },
              content_value: { type: Type.NUMBER },
              engagement_triggers: { type: Type.NUMBER },
            },
          },
          optimization_notes: { type: Type.STRING },
        },
      }
    }
  },
};

const viralTrendResponseSchema = {
  type: Type.OBJECT,
  properties: {
    viral_posts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          platform: { type: Type.STRING },
          post_text: { type: Type.STRING },
          neuro_score: { type: Type.NUMBER },
          viral_trigger: { type: Type.STRING },
        },
      },
    },
  },
};

// #endregion

// #region Prompt Engineering

const generateAnalysisPrompt = (formData: InputFormData): string => {
  const { inputMode, topic, sourceUrl, selectedPlatforms, campaignGoal, trendBoost, location } = formData;
  const sourceContent = inputMode === InputMode.URLSitemap && sourceUrl ? sourceUrl : topic;
  const trendInstruction = trendBoost 
    ? "You MUST prioritize identifying and incorporating the latest emerging trends, rising queries, and viral formats related to the source material."
    : "Focus on evergreen, high-value strategic insights.";
  const locationInstruction = location ? `- Target Location: "${location}" (Use this to inform local trends, language, and examples.)` : '';

  return `
SYSTEM DIRECTIVE: You are a world-class market research, SEO, and content strategy AI. Your task is to perform a deep analysis of the provided source material and generate a comprehensive strategic plan.

INPUT PARAMETERS:
- Source Material: "${sourceContent}"
- Target Platforms: [${selectedPlatforms.join(', ')}]
- Core Campaign Goal: ${campaignGoal}
- Trend Priority: ${trendInstruction}
${locationInstruction}

CRITICAL INSTRUCTIONS:
1.  **GROUNDING MANDATE (HIGHEST PRIORITY)**: You MUST use the integrated Google Search and Google Maps tools to conduct thorough, real-time research on the Source Material. Gather the latest information, statistics, audience sentiment, and emerging trends. If a location is provided, Maps data is critical.
2.  **JSON OUTPUT MANDATE**: Your ENTIRE output must be ONLY a single, valid JSON object. It must start with \`{\` and end with \`}\`. Do NOT include any other text, commentary, or markdown like \`\`\`json. The JSON object must contain a single root key: "topic_analysis".

JSON SCHEMA FOR "topic_analysis":
{
  "campaign_strategy": "A concise, high-level strategy for the campaign, based on your research.",
  "trend_alignment": "Specific, verifiable micro-trends or rising queries you identified and how the campaign can leverage them.",
  "audience_resonance": "The core psychological triggers or pain points of the target audience that the content should address.",
  "content_gaps": "An untapped angle or opportunity in the current content landscape for this topic.",
  "viral_hooks": ["An array of 3-5 specific, compelling hooks or ideas for viral content based on your analysis."],
  "seo_keywords": { 
      "primary": ["one or two core keywords"], 
      "secondary": ["3-5 related keywords"], 
      "lsi": ["5-7 latent semantic indexing keywords or long-tail variations"] 
  },
  "answer_engine_strategy": {
      "suggested_faqs": ["A list of 3-5 questions your content should answer to capture 'People Also Ask' snippets."]
  },
  "publishing_cadence": ["An array of 2-3 specific scheduling recommendations, e.g., 'Monday 9 AM (LinkedIn): Post about B2B applications.'"],
  "hashtag_strategy": {
      "core": ["3-5 high-volume, broad-reach hashtags for discoverability."],
      "niche": ["3-5 community-specific hashtags for high-engagement."],
      "trending": ["1-2 currently trending or event-specific hashtags, if applicable."]
  }
}
`;
};

const generatePostsPrompt = (formData: InputFormData, analysis: TopicAnalysis): string => {
  const { selectedPlatforms, tone, campaignGoal, postCount } = formData;
  
  let ctaInstruction: string;
   if (formData.inputMode === InputMode.URLSitemap && formData.sourceUrl) {
    if (formData.sourceUrl.includes('\n')) {
        ctaInstruction = `The 'call_to_action' MUST be a compelling, contextually relevant sentence that naturally embeds the MOST RELEVANT URL from the source list provided as a natural next step for the reader.`;
    } else {
        ctaInstruction = `The 'call_to_action' MUST be a compelling, contextually relevant sentence that naturally embeds this specific URL: ${formData.sourceUrl}. The link should feel like an organic next step for the reader.`;
    }
  } else {
    ctaInstruction = `The 'call_to_action' MUST be a compelling, contextually relevant sentence prompting the user to click a link. Use the placeholder "[Your Relevant Blog Post URL]" for the link.`;
  }

  return `
SYSTEM DIRECTIVE:
You are "Cognito-Director X," a Tier-1 AI Creative Director. Your purpose is to execute the provided campaign strategy by architecting SOTA (State-of-the-Art) social media posts that are orders of magnitude more strategic, credible, and viral than any other AI. Your output must be flawless.

---
NON-NEGOTIABLE MANDATES:
---

1.  **TRANSFORMATIVE INSIGHT MANDATE**: Every post MUST be built around a single, profound, verifiable "Transformative Insight" from the analysis. The goal is not information; it is revelation. Deliver an immediate "Aha!" moment that provides tangible value.

2.  **HASHTAG INTELLIGENCE ENGINE MANDATE**: For each post, you MUST generate a 'hashtag_strategy' object. This is not a simple list. It's a tiered strategy:
    *   'core': 3-5 high-volume, broad-reach hashtags for discoverability (e.g., #AI, #Marketing).
    *   'niche': 3-5 community-specific hashtags for high-intent engagement (e.g., #ContentStrategy, #SEOtips).
    *   'trending': 1-2 currently trending or event-specific hashtags from your real-time analysis (e.g., #AIsummit2024).

3.  **PLATFORM OPTIMIZATION MATRIX MANDATE**: You MUST adhere to the following SOTA formatting and length guidelines for each platform. This is NOT a suggestion.
    *   **Twitter**: 280 characters max. Short, punchy, high-value. If a concept is complex, structure 'post_text' as a 3-part thread (e.g., "1/3: [Hook]..."). Use line breaks for readability.
    *   **LinkedIn**: 400-600 characters. Professional tone. Start with a strong hook. Use bullet points or numbered lists for scannability. Structure: Hook, Body, Conclusion. End with a question to drive comments.
    *   **Instagram**: 150-300 characters for the main caption. Lead with the most important info. The visual is primary, the caption provides context and a CTA.
    *   **Facebook**: 300-500 characters. More conversational. Can tell a brief story. Use emojis strategically to guide the reader's eye.

4.  **VIDEO SCRIPT MANDATE**: For each post, you MUST generate a third variation with "variation_name": "Video Script". This script must be for a 15-30 second vertical video (Reels/TikTok). Format it clearly with "SCENE:" and "VO:" (voiceover) tags. The script must be fast-paced, visually engaging, and use trending audio concepts where applicable.

5.  **NEUROAESTHETIC™ IMAGE DIRECTION MANDATE**: Generate an 'image_prompt' that directs the image model like a world-class art director. The goal is to create an image so compelling people *want* to save it. It MUST specify:
    *   **EMOTIONAL CORE:** State the primary emotion to evoke (e.g., 'Evokes a profound sense of awe and wonder').
    *   **ARTIST/DIRECTOR STYLE:** Reference a specific style (e.g., 'in the hyper-detailed, dramatic style of photographer Gregory Crewdson,' or 'cinematography in the style of Roger Deakins').
    *   **CAMERA & LENS:** (e.g., 'Shot on a Hasselblad X2D 100C with a 90mm f/2.5 lens').
    *   **LIGHTING:** (e.g., 'dramatic chiaroscuro lighting, with a single key light illuminating the subject against a dark, moody background').
    *   **COMPOSITION:** (e.g., 'masterful use of the golden ratio, with strong leading lines guiding the viewer's eye').
    *   **SOTA DETAIL:** (e.g., '8K resolution, photorealistic, hyper-detailed textures, subsurface scattering for realistic skin').

6.  **PSYCHOLOGICAL TRIGGER MANDATE**: For each text variation, identify the primary 'viral_trigger' from: ['Awe', 'Humor', 'Social Currency', 'Curiosity Gap', 'Urgency', 'Storytelling', 'Practical Value'].

7.  **IMPERATIVE CTA MANDATE**: ALWAYS include a compelling 'call_to_action'. ${ctaInstruction}

---
INPUT STRATEGY (FROM PHASE 1 ANALYSIS)
\`\`\`json
${JSON.stringify(analysis, null, 2)}
\`\`\`

EXECUTION INSTRUCTION:
Based *only* on the INPUT STRATEGY provided, generate ${postCount} social media posts for [${selectedPlatforms.join(', ')}]. Tone: ${tone}. Goal: ${campaignGoal}. Each post must have TWO text variations (A/B test) and ONE video script variation.

Your output MUST be a single, valid JSON object containing only a "posts" array, adhering strictly to the provided API schema.
`;
};

// #endregion

// #region API Interaction Layer

const getGeminiClient = (apiKey?: string) => {
  const key = apiKey || process.env.API_KEY;
  if (!key) throw new Error("API key is not configured.");
  return new GoogleGenAI({ apiKey: key });
};

export async function* generateViralPostsStream(formData: InputFormData, aiConfig: AiConfig): AsyncGenerator<StreamChunk> {
  const ai = getGeminiClient(aiConfig.apiKey);
  
  // Phase 1: Analysis
  const analysisPrompt = generateAnalysisPrompt(formData);
  // Fix for TypeScript error on line 204. Explicitly type the 'tools' array to allow both googleSearch and googleMaps.
  const tools: ({ googleSearch: {} } | { googleMaps: {} })[] = [{ googleSearch: {} }];
  if (formData.location) {
    tools.push({ googleMaps: {} });
  }

  const analysisResponse = await ai.models.generateContent({
    model: aiConfig.model,
    contents: analysisPrompt,
    config: { tools },
  });

  const analysisData: TopicAnalysis = JSON.parse(analysisResponse.text).topic_analysis;
  yield { type: 'analysis', data: analysisData };

  if (analysisResponse.candidates?.[0]?.groundingMetadata) {
     yield { type: 'grounding', data: { groundingChunks: analysisResponse.candidates[0].groundingMetadata.groundingChunks } };
  }
 
  // Phase 2: Post Generation
  const postsPrompt = generatePostsPrompt(formData, analysisData);
  
  const postsResponse = await ai.models.generateContent({
    model: aiConfig.model,
    contents: postsPrompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: postsOnlySchema,
    },
  });

  const postsData: { posts: GeneratedPost[] } = JSON.parse(postsResponse.text);

  for (const post of postsData.posts) {
    yield { type: 'post', data: { ...post, sourceUrl: formData.inputMode === InputMode.URLSitemap ? formData.sourceUrl : undefined } };
  }
}

export const generateImageFromPrompt = async (imagePrompt: string, aiConfig: AiConfig): Promise<string> => {
  // Currently only supports Gemini provider for SOTA image generation
  if (aiConfig.provider !== AiProvider.Gemini) {
      throw new Error(`Image generation is only supported for Google Gemini provider at this time. Please switch your provider in the API settings.`);
  }

  const ai = getGeminiClient(aiConfig.apiKey);

  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: imagePrompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1',
    },
  });

  if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("The AI did not return an image. The prompt may have been blocked.");
  }

  const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
  return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const generateViralTrends = async (niche: string, aiConfig: AiConfig): Promise<ViralPost[]> => {
    const ai = getGeminiClient(aiConfig.apiKey);
    const prompt = `
        As a viral trend analyst with access to real-time social media data, identify the top 5 emerging, SOTA (State-of-the-Art) viral hooks and post ideas for the niche: "${niche}".
        For each idea, provide a platform, a compelling post_text hook, a neuro_score (1-100) indicating its potential for virality based on psychological triggers, and identify the primary viral_trigger (e.g., 'Curiosity Gap', 'Social Proof', 'Urgency').
        Your output MUST be a single, valid JSON object with a root key "viral_posts".
    `;

    const response = await ai.models.generateContent({
        model: aiConfig.model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: viralTrendResponseSchema,
        },
    });

    const parsed = JSON.parse(response.text);
    return parsed.viral_posts;
};

export const validateApiKey = async (provider: AiProvider, apiKey: string, model: string): Promise<{ isValid: boolean; error?: string }> => {
  if (provider === AiProvider.Gemini && !apiKey) {
    // For Gemini, we can proceed with the pre-configured key
    return { isValid: true };
  }
  if (!apiKey) {
    return { isValid: false, error: 'API key is required.' };
  }

  try {
    const ai = getGeminiClient(apiKey); // Use the provided key for validation
    await ai.models.generateContent({
        model: model,
        contents: "Test prompt: say 'hello'",
    });
    return { isValid: true };
  } catch (error: any) {
    console.error("API Key validation error:", error);
    let errorMessage = "Validation failed. Please check the API key and model name.";
    if (error.message) {
      if (error.message.includes('API key not valid')) {
        errorMessage = 'The provided API key is not valid. Please check and try again.';
      } else if (error.message.includes('permission')) {
        errorMessage = 'The API key is valid, but lacks permission for the selected model.';
      } else {
        errorMessage = error.message;
      }
    }
    return { isValid: false, error: errorMessage };
  }
};
