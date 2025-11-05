import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AiProvider, type InputFormData, type TopicAnalysis, type GeneratedPost, type GroundingMetadata, type AiConfig, InputMode, type ViralPost, type StreamChunk, type SchedulingSuggestion, PostVariation, Platform, Tone, ViralTrigger } from '../types';

// #region Schemas

const schedulingSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    platform: { type: Type.STRING },
                    dayOfWeek: { type: Type.STRING },
                    timeOfDay: { type: Type.STRING },
                    reasoning: { type: Type.STRING },
                },
                required: ["platform", "dayOfWeek", "timeOfDay", "reasoning"],
            }
        }
    },
    required: ["suggestions"],
};

// Schema for the second, posts-only generation call. Guarantees valid JSON structure.
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
                    hashtags: { 
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    share_snippet: { type: Type.STRING },
                    viral_trigger: { type: Type.STRING },
                },
                required: ["variation_name", "post_title", "post_text", "call_to_action", "hashtags", "viral_trigger"],
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
            required: ["emotional_resonance", "platform_optimization", "content_value", "engagement_triggers"],
          },
          optimization_notes: { type: Type.STRING },
          paa_block_html: { type: Type.STRING },
          schema_org_jsonld: { type: Type.STRING },
          internal_links_html: { type: Type.STRING },
        },
        required: ["platform", "variations", "image_prompt", "viral_score", "viral_breakdown", "optimization_notes", "paa_block_html", "schema_org_jsonld", "internal_links_html"],
      }
    }
  },
  required: ["posts"],
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
        required: ["platform", "post_text", "neuro_score", "viral_trigger"],
      },
    },
  },
  required: ["viral_posts"],
};

// #endregion

// #region SOTA Enhancements
const ASPECT_RATIOS: Record<Platform, string> = {
  [Platform.Instagram]: '3:4',
  [Platform.Pinterest]: '9:16',
  [Platform.Twitter]: '16:9',
  [Platform.Facebook]: '16:9',
  [Platform.LinkedIn]: '16:9',
  [Platform.Threads]: '3:4',
  [Platform.Bluesky]: '16:9',
  [Platform.YouTubeShorts]: '9:16',
};

const STYLE_REF: Record<string, string> = {
  'professional': 'https://images.unsplash.com/photo-1553877522-43269d4ea984', // modern office
  'casual': 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e', // street style
  'witty': 'https://images.unsplash.com/photo-1518770660439-4636190af475', // tech / neon
  'inspirational': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773', // serene, mindful
  'persuasive': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d', // collaborative, energetic team
};

const buildImagePrompt = (
  rawPrompt: string,
  platform: Platform,
  tone: Tone
): string => {
  const ratio = ASPECT_RATIOS[platform];
  const toneKey = tone.toLowerCase() as keyof typeof STYLE_REF;
  const ref = STYLE_REF[toneKey] ?? STYLE_REF['professional'];

  return `
PHOTO_REALISTIC_MASTERPIECE, ${ratio}, 8K, HDR, shot on ARRI Alexa 65, Cooke S7/i, 
style reference from ${ref},
RAW prompt: "${rawPrompt}",
camera rule of thirds, shallow DoF f/1.4, 35mm,
lighting: cinematic rim light, soft-box key light, volumetric back-glow,
mood: awe-inspiring, hyper-detailed, award-winning National Geographic cover photo,
negative prompt: no text, no watermark, no distortion, no plastic skin, no illustration
  `.trim().replace(/\s+/g, ' ');
};

// #endregion

// #region Prompt Engineering

// Prompt for Phase 1: Use Google Search to generate a strategic analysis.
const generateAnalysisPrompt = (formData: InputFormData): string => {
  const { inputMode, topic, sourceUrl, selectedPlatforms, campaignGoal, trendBoost, userLocation } = formData;
  const sourceContent = inputMode === InputMode.URLSitemap && sourceUrl ? sourceUrl : topic;
  const trendInstruction = trendBoost 
    ? "You MUST prioritize identifying and incorporating the latest emerging trends, rising queries, and viral formats related to the source material."
    : "Focus on evergreen, high-value strategic insights.";
  
  const geoInstruction = userLocation
    ? `- **GEO-SEARCH MANDATE**: You MUST use the integrated Google Maps tool to find hyper-local context (venues, landmarks, businesses) relevant to the Source Material and User Location (Lat: ${userLocation.latitude}, Lon: ${userLocation.longitude}). Your strategy must reflect these local insights.`
    : '';
  
  const sitemapInstruction = inputMode === InputMode.URLSitemap && sourceUrl 
    ? `- **SITEMAP ANALYSIS**: Analyze the provided URLs/sitemap to understand the site's structure. Identify the main "pillar page" related to the topic. All strategic recommendations should aim to drive traffic towards this pillar page to build topical authority.`
    : '';


  return `
SYSTEM DIRECTIVE: You are a world-class SEO and market research AI. Your task is to perform a deep analysis of the provided source material and generate a strategic plan.

INPUT PARAMETERS:
- Source Material: "${sourceContent}"
- Target Platforms: [${selectedPlatforms.join(', ')}]
- Core Campaign Goal: ${campaignGoal}
- Trend Priority: ${trendInstruction}
${userLocation ? `- User Location: Lat ${userLocation.latitude}, Lon ${userLocation.longitude}` : ''}

CRITICAL INSTRUCTIONS:
1.  **GROUNDING MANDATE (HIGHEST PRIORITY)**:
    - You MUST use the integrated Google Search tool to conduct thorough, real-time research on the Source Material. Gather the latest information, statistics, and audience sentiment.
    ${geoInstruction}
2.  **SGE & TOPICAL AUTHORITY OPTIMIZATION**:
    - Synthesize information from AT LEAST 3 diverse, high-authority web sources from your search to form a unique, expert conclusion. This is to optimize for Google's Search Generative Experience (SGE).
    ${sitemapInstruction}
3.  **SERP CAPTURE**: Use your search knowledge to identify the top questions being asked on sites like Reddit and Quora about the source material. Inject these insights into the "audience_resonance" and "viral_hooks" fields.
4.  **JSON OUTPUT MANDATE**: Your ENTIRE output must be ONLY a single, valid JSON object. It must start with \`{\` and end with \`}\`. Do NOT include any other text, commentary, or markdown like \`\`\`json. The JSON object must contain a single root key: "topic_analysis".

JSON SCHEMA FOR "topic_analysis":
{
  "campaign_strategy": "A concise, high-level strategy for the campaign, based on your research, incorporating SGE and Topical Authority principles.",
  "trend_alignment": "Specific, verifiable micro-trends or rising queries you identified and how the campaign can leverage them.",
  "audience_resonance": "The core psychological triggers, pain points, or questions of the target audience that the content should address.",
  "content_gaps": "An untapped angle or opportunity in the current content landscape for this topic.",
  "viral_hooks": ["An array of 3-5 specific, compelling hooks or ideas for viral content based on your analysis."]
}
`;
};

// Prompt for Phase 2: Generate post content based on the analysis from Phase 1.
const generatePostsPrompt = (
  formData: InputFormData,
  analysis: TopicAnalysis
): string => {
  const { selectedPlatforms, tone, campaignGoal, postCount, sourceUrl, inputMode } = formData;
  const sitemapContext = inputMode === InputMode.URLSitemap && sourceUrl ? `The user provided these URLs/sitemap for context: ${sourceUrl}` : '';

  return `
You are an expert SEO Content Architect and Social Media Strategist AI.
Your ONLY output is a single, valid JSON object that adheres strictly to the provided schema. No commentary.

INPUT STRATEGY & ANALYSIS:
${JSON.stringify(analysis, null, 2)}
${sitemapContext}

MANDATORY SEO/AEO & CONTENT RULES:
1.  **PAA (People Also Ask) BLOCK**: For each post, identify the top 3 most relevant "People Also Ask" questions for the core topic using your search knowledge. You MUST append this exact HTML structure to the end of the \`post_text\` field:
    \`<details><summary><strong>Q: [Question 1]</strong></summary><p>A: [Concise, helpful answer.]</p></details><details><summary>...</summary>...</details>\`
2.  **SCHEMA.ORG JSON-LD**: For each post, you MUST generate a complete and valid \`FAQPage\` Schema.org JSON-LD script block in the \`schema_org_jsonld\` field. The JSON-LD must be a stringified JSON object. Base the FAQs on the PAA block you created.
3.  **INTERNAL LINKING**: If a sitemap/URL was provided, you MUST provide a strategic internal linking suggestion in the \`internal_links_html\` field. Use this exact HTML format:
    \`<div><strong>Internal Link Strategy:</strong> To build topical authority, link from this post to <a href="[URL from sitemap]" target="_blank">[Relevant Pillar Page Title]</a> using anchor text like "[Suggested SEO-friendly Anchor Text]".</div>\`
    If no sitemap was provided, this field should contain an empty string.
4.  **PLATFORM NATIVITY**: Strictly adhere to the nuances of each platform. LinkedIn posts should be professional, Twitter concise, Instagram visual-first.
5.  **VALUE & CREDIBILITY**: Each post must offer tangible value and be grounded in the facts from the initial analysis.

TASK:
Generate ${postCount} posts for [${selectedPlatforms.join(
    ", "
  )}] with a ${tone} tone, for the campaign goal of ${campaignGoal}.
Return ONLY the \`{"posts":[ … ]}\` JSON object, ensuring all required fields, including the SEO/AEO fields, are populated correctly.
`;
};


// #endregion

// #region Service Dispatchers

export async function* generateViralPostsStream(formData: InputFormData, config: AiConfig): AsyncGenerator<StreamChunk> {
    switch (config.provider) {
        case AiProvider.Gemini:
            const useSearch = formData.inputMode === InputMode.Topic || (formData.inputMode === InputMode.URLSitemap && formData.sourceUrl) || formData.inputMode === InputMode.GeoTopic;
            if (!useSearch) throw new Error("Gemini provider requires a topic or URL to function.");
            
            const { analysisChunk, groundingChunk, postChunks } = await generateWithGemini(formData, config);
            if (groundingChunk) {
                yield groundingChunk;
            }
            yield analysisChunk;
            for (const postChunk of postChunks) {
                yield postChunk;
            }
            break;
        case AiProvider.OpenAI:
        case AiProvider.Claude:
        case AiProvider.OpenRouter:
            yield* generateWithOpenApi(formData, config);
            break;
        default:
            throw new Error(`Unsupported provider: ${config.provider}`);
    }
}

export const generateImageFromPrompt = async (post: GeneratedPost, tone: Tone, config: AiConfig): Promise<string> => {
    const masterPrompt = buildImagePrompt(post.image_prompt, post.platform, tone);

    switch (config.provider) {
        case AiProvider.Gemini:
            const apiKey = config.apiKey || process.env.API_KEY;
            if (!apiKey) throw new Error("Google Gemini API Key is not configured.");
            return generateImageWithGemini(masterPrompt, post.platform, apiKey);
        case AiProvider.OpenAI:
             return generateImageWithOpenAI(masterPrompt, post.platform, config.apiKey);
        case AiProvider.OpenRouter:
            return generateImageWithOpenAI(masterPrompt, post.platform, config.apiKey, "https://openrouter.ai/api/v1/images/generations", "openai/dall-e-3");
        case AiProvider.Claude:
            throw new Error("Image generation is not supported by Anthropic Claude.");
        default:
            throw new Error(`Unsupported provider for image generation: ${config.provider}`);
    }
};

export const validateApiKey = async (provider: AiProvider, apiKey: string, model: string): Promise<{ isValid: boolean; error?: string }> => {
    if (provider === AiProvider.Gemini) {
        if (!process.env.API_KEY && !apiKey) return { isValid: true };
    }
    if (!apiKey) {
        return { isValid: false, error: 'API Key is required.' };
    }
    try {
        let url = '';
        let options: RequestInit = {};

        switch (provider) {
            case AiProvider.Gemini:
                url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
                break;
            case AiProvider.OpenAI:
                url = 'https://api.openai.com/v1/models';
                options = { headers: { 'Authorization': `Bearer ${apiKey}` } };
                break;
            case AiProvider.Claude:
                 url = 'https://api.anthropic.com/v1/messages';
                 options = {
                     method: 'POST',
                     headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
                     body: JSON.stringify({ model: "claude-3-opus-20240229", max_tokens: 1, messages: [{"role": "user", "content": "ping"}] })
                 };
                break;
            case AiProvider.OpenRouter:
                url = 'https://openrouter.ai/api/v1/models';
                options = { headers: { 'Authorization': `Bearer ${apiKey}` } };
                break;
            default:
                return { isValid: false, error: `Unsupported provider: ${provider}` };
        }

        const response = await fetch(url, options);
        if (response.ok) {
            return { isValid: true };
        } else {
            const errorBody = await response.json().catch(() => ({ error: { message: response.statusText }}));
            return { isValid: false, error: `Validation failed (${response.status}): ${errorBody?.error?.message || 'Invalid key or network issue.'}` };
        }
    } catch (e: any) {
        return { isValid: false, error: `Network error during validation: ${e.message}` };
    }
};

export const generateViralTrends = async (niche: string, config: AiConfig): Promise<ViralPost[]> => {
    if (config.provider !== AiProvider.Gemini) {
        throw new Error("The Viral Vault feature is currently only supported with the Google Gemini provider.");
    }

    const apiKey = config.apiKey || process.env.API_KEY;
    if (!apiKey) throw new Error("Google Gemini API Key is not configured.");
    
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `SYSTEM DIRECTIVE: You are "TrendScout AI," a specialized model that identifies and architects emerging viral content hooks for the niche: "${niche}". Generate 5 SOTA (State-Of-The-Art) viral post concepts primed for explosive engagement. For each post, assign a "neuro_score" (85-100) predicting its scroll-stopping power and identify the primary 'viral_trigger' from ['Awe', 'Humor', 'Social Currency', 'Curiosity Gap', 'Urgency', 'Storytelling', 'Practical Value']. Your ENTIRE output MUST be a single, valid JSON object strictly adhering to the provided schema. No text outside the JSON.`;

    const response = await ai.models.generateContent({
      model: config.model,
      contents: prompt,
      config: {
          responseMimeType: "application/json",
          responseSchema: viralTrendResponseSchema,
      },
    });

    const jsonText = response.text.trim();
    try {
        const parsed = JSON.parse(jsonText);
        if (parsed.viral_posts && Array.isArray(parsed.viral_posts)) {
            return parsed.viral_posts;
        }
        throw new Error("Invalid JSON structure received from AI.");
    } catch (e) {
        console.error("Failed to parse viral trends JSON:", e, "Raw Text:", jsonText);
        throw new Error("The AI returned an invalid response for viral trends.");
    }
};

export const generateSchedulingSuggestions = async (formData: InputFormData, analysis: TopicAnalysis, config: AiConfig): Promise<SchedulingSuggestion[]> => {
    if (config.provider !== AiProvider.Gemini) {
        console.warn("Scheduling suggestions are only supported for the Gemini provider.");
        return [];
    }
    const apiKey = config.apiKey || process.env.API_KEY;
    if (!apiKey) throw new Error("Google Gemini API Key is not configured.");
    
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    SYSTEM DIRECTIVE: You are a social media scheduling strategist. Based on the provided campaign analysis, generate optimal posting times.

    CAMPAIGN ANALYSIS:
    - Goal: ${formData.campaignGoal}
    - Platforms: ${formData.selectedPlatforms.join(', ')}
    - Audience Resonance: ${analysis.audience_resonance}
    - Strategy: ${analysis.campaign_strategy}

    TASK:
    Based on general social media engagement data and the campaign analysis, provide the best day and time slot to post for EACH platform.
    Provide a brief 'reasoning' for each suggestion, linking it to the campaign goal or platform norms.
    
    Your ENTIRE output MUST be a single, valid JSON object with a root key "suggestions", adhering strictly to the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: config.model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schedulingSuggestionsSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
            return parsed.suggestions;
        }
        throw new Error("Invalid JSON structure for suggestions.");

    } catch (e) {
        console.error("Failed to generate scheduling suggestions:", e);
        return []; // Return empty array on failure
    }
};

export const rewriteText = async (originalText: string, partName: string, instruction: string, config: AiConfig): Promise<string> => {
    if (config.provider !== AiProvider.Gemini) {
        throw new Error("Inline editing is currently only supported with the Google Gemini provider.");
    }
    const apiKey = config.apiKey || process.env.API_KEY;
    if (!apiKey) throw new Error("Google Gemini API Key is not configured.");
    
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    SYSTEM DIRECTIVE: You are an expert copy editor AI. Your task is to rewrite a piece of text based on a specific instruction.
    
    INSTRUCTION: Rewrite the following '${partName}' to be '${instruction}'.
    
    ORIGINAL TEXT:
    ---
    ${originalText}
    ---
    
    YOUR OUTPUT:
    You MUST output ONLY the rewritten text. Do not include any preamble, commentary, or markdown formatting like quotes or backticks.
    `;

    try {
        const response = await ai.models.generateContent({
            model: config.model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (e: any) {
        console.error("Failed to rewrite text:", e);
        throw new Error(`AI rewrite failed: ${e.message}`);
    }
};

export const generateMoreLikeThis = async (sourcePost: GeneratedPost, variation: PostVariation, config: AiConfig): Promise<GeneratedPost[]> => {
    if (config.provider !== AiProvider.Gemini) {
        throw new Error("This feature is currently only supported with the Google Gemini provider.");
    }
    const apiKey = config.apiKey || process.env.API_KEY;
    if (!apiKey) throw new Error("Google Gemini API Key is not configured.");

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    SYSTEM DIRECTIVE: You are "Cognito-Strategist X," a Tier-1 AI content generator. Your task is to generate TWO new, unique social media posts inspired by the provided example.

    INSPIRATION POST:
    - Platform: ${sourcePost.platform}
    - Title: ${variation.post_title}
    - Text: ${variation.post_text}
    - Viral Trigger: ${variation.viral_trigger}
    - Style/Tone: Emulate the professional, value-driven, and engaging tone of the example.
    - Core Topic: The new posts should be on the same core topic but explore different angles, hooks, or sub-topics.

    CRITICAL INSTRUCTIONS:
    1.  **DO NOT COPY**: The new posts must be entirely original and not just rephrased versions of the example.
    2.  **MAINTAIN QUALITY**: Adhere to all the quality mandates of the original generation process (SOTA image prompts, platform-native formatting, viral triggers, etc.).
    3.  **JSON OUTPUT**: Your output MUST be a single, valid JSON object containing only a "posts" array, adhering strictly to the provided API schema.

    Generate 2 new posts now.
    `;

    try {
        const response = await ai.models.generateContent({
            model: config.model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: postsOnlySchema,
            }
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        if (parsed.posts && Array.isArray(parsed.posts)) {
            return parsed.posts;
        }
        throw new Error("Invalid JSON structure received from AI for generating more posts.");
    } catch (e: any) {
        console.error("Failed to generate more posts like this:", e);
        throw new Error(`AI generation failed: ${e.message}`);
    }
};


export const generateClipScript = async (post: GeneratedPost, variation: PostVariation, config: AiConfig): Promise<string> => {
    if (config.provider !== AiProvider.Gemini) {
        throw new Error("This feature is currently only supported with the Google Gemini provider.");
    }
    const apiKey = config.apiKey || process.env.API_KEY;
    if (!apiKey) throw new Error("Google Gemini API Key is not configured.");

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    SYSTEM DIRECTIVE: You are a viral video scriptwriter for TikTok, Reels, and YouTube Shorts.
    
    TASK: Convert the following social media post into a compelling 30-second video script.
    
    SOURCE POST:
    - Title: ${variation.post_title}
    - Body: ${variation.post_text}
    - Image Concept: ${post.image_prompt}

    SCRIPT REQUIREMENTS:
    1.  **VOICEOVER:** Write a concise, punchy voiceover script, maximum 45 words. It must have a strong hook in the first 3 seconds.
    2.  **SCENES:** Provide 5 distinct scene descriptions. Each scene should be a visual prompt, similar in style to a high-quality image generation prompt.
    3.  **FORMAT:** Output the script in Markdown format. Use "VOICEOVER:" and "SCENES:" headers.
    
    Example Output:
    VOICEOVER:
    You've been told a lie about productivity. The 8-hour workday is dead. Here’s the 3-hour model that billion-dollar startups are using to ship twice as fast.
    
    SCENES:
    1.  A massive, crumbling stone clocktower with vines growing over it, representing the old way of work. Cinematic, moody lighting.
    2.  An entrepreneur's minimalist, sun-drenched desk with a single laptop and a cup of coffee. The screen shows a rapidly completing task list.
    3.  Close up on a neural network graph, glowing and pulsing with energy, symbolizing efficient thinking.
    4.  A team of energized, diverse founders collaborating around a holographic interface, smiling and engaged.
    5.  A rocket ship launching into a vibrant nebula, symbolizing explosive growth and success.

    Now, generate the script for the provided source post.
    `;

    try {
        const response = await ai.models.generateContent({
            model: config.model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (e: any) {
        console.error("Failed to generate clip script:", e);
        throw new Error(`AI script generation failed: ${e.message}`);
    }
};


// #endregion

// #region Gemini Implementation (New & Robust)
async function generateWithGemini(formData: InputFormData, config: AiConfig): Promise<{ analysisChunk: StreamChunk, groundingChunk: StreamChunk | null, postChunks: StreamChunk[] }> {
    const apiKey = config.apiKey || process.env.API_KEY;
    if (!apiKey) throw new Error("Google Gemini API Key is not configured.");
    const ai = new GoogleGenAI({ apiKey });

    // Phase 1: Analysis Call
    const analysisPrompt = generateAnalysisPrompt(formData);
    
    const tools: any[] = [{ googleSearch: {} }];
    const toolConfig: any = {};
    if (formData.userLocation) {
        tools.push({ googleMaps: {} });
        toolConfig.retrievalConfig = {
            latLng: {
                latitude: formData.userLocation.latitude,
                longitude: formData.userLocation.longitude
            }
        };
    }
    
    const analysisResult = await ai.models.generateContent({
        model: config.model,
        contents: analysisPrompt,
        config: { tools, ...(Object.keys(toolConfig).length > 0 && { toolConfig }) },
    });

    const analysisResponseText = analysisResult.text;
    const groundingData = analysisResult.candidates?.[0]?.groundingMetadata as GroundingMetadata;

    let jsonToParse: string;

    const firstBrace = analysisResponseText.indexOf('{');
    if (firstBrace === -1) {
        throw new Error(`AI failed to generate valid JSON for the analysis phase. No JSON object found. Response: ${analysisResponseText}`);
    }

    let braceCount = 1;
    let lastBrace = -1;
    for (let i = firstBrace + 1; i < analysisResponseText.length; i++) {
        if (analysisResponseText[i] === '{') braceCount++;
        else if (analysisResponseText[i] === '}') braceCount--;
        
        if (braceCount === 0) {
            lastBrace = i;
            break;
        }
    }

    if (lastBrace !== -1) {
        jsonToParse = analysisResponseText.substring(firstBrace, lastBrace + 1);
    } else {
        throw new Error(`AI failed to generate valid JSON for the analysis phase. Incomplete JSON object. Response: ${analysisResponseText}`);
    }

    let analysisData: { topic_analysis: TopicAnalysis };
    try {
        analysisData = JSON.parse(jsonToParse);
    } catch (e) {
        throw new Error(`Failed to parse analysis JSON. Raw text from AI: ${jsonToParse}`);
    }
    
    if (!analysisData.topic_analysis) {
        throw new Error("Parsed JSON from analysis phase is missing the 'topic_analysis' key.");
    }
    
    const analysisChunk: StreamChunk = { type: 'analysis', data: analysisData.topic_analysis };
    const groundingChunk: StreamChunk | null = (groundingData && groundingData.groundingChunks?.length > 0) 
        ? { type: 'grounding', data: groundingData } 
        : null;

    // Phase 2: Post Generation Call
    const postsPrompt = generatePostsPrompt(formData, analysisData.topic_analysis);
    const postsResult = await ai.models.generateContent({
        model: config.model,
        contents: postsPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: postsOnlySchema,
        }
    });

    const postsResponseText = postsResult.text;
    let postsData: { posts: GeneratedPost[] };
    try {
        postsData = JSON.parse(postsResponseText);
    } catch(e) {
        throw new Error(`Failed to parse posts JSON, despite schema enforcement. Raw text: ${postsResponseText}`);
    }

    if (!postsData.posts || !Array.isArray(postsData.posts)) {
        throw new Error("API response for posts is missing the 'posts' array.");
    }

    let finalPosts = postsData.posts;

    // Handle syndication
    if (formData.syndicate) {
        const syndicatedPosts: GeneratedPost[] = [];
        const twitterPost = finalPosts.find(p => p.platform === Platform.Twitter);
        const instagramPost = finalPosts.find(p => p.platform === Platform.Instagram);

        finalPosts.forEach(originalPost => {
            // Syndicate to Threads
            const threadsContent = instagramPost || twitterPost || originalPost;
            syndicatedPosts.push({ ...threadsContent, platform: Platform.Threads });

            // Syndicate to Bluesky
            const blueskyContent = twitterPost || originalPost;
            syndicatedPosts.push({ ...blueskyContent, platform: Platform.Bluesky });
            
            // Syndicate to YouTube Shorts
            const shortsVariation: PostVariation = {
                ...originalPost.variations[0],
                variation_name: "YouTube Shorts Idea",
                post_text: `Script Idea: ${originalPost.image_prompt}`,
                call_to_action: "Check out the full blog post for more details!",
            };
            syndicatedPosts.push({ ...originalPost, platform: Platform.YouTubeShorts, variations: [shortsVariation] });
        });
        
        // Add unique syndicated posts
        const existingPlatforms = new Set(finalPosts.map(p => p.platform));
        syndicatedPosts.forEach(sp => {
            if (!existingPlatforms.has(sp.platform)) {
                finalPosts.push(sp);
                existingPlatforms.add(sp.platform);
            }
        });
    }

    const postChunks: StreamChunk[] = finalPosts.map(post => ({ type: 'post', data: post as any }));
    
    return { analysisChunk, groundingChunk, postChunks };
}

const generateImageWithGemini = async (prompt: string, platform: Platform, apiKey: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: ASPECT_RATIOS[platform],
            },
        });

        const firstImage = response.generatedImages?.[0];

        const feedback = (firstImage as any)?.promptFeedback;
        if (feedback?.blockReason) {
             const reason = feedback.blockReason;
             throw new Error(`Image generation blocked by safety filters. Reason: ${reason}.`);
        }

        const base64ImageBytes: string | undefined = firstImage?.image?.imageBytes;

        if (base64ImageBytes) {
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }

        console.error("Invalid response structure from Gemini image API (imagen-4.0):", response);
        throw new Error("The API returned an unexpected or empty response for the image.");

    } catch (error: any) {
        console.error("Error generating image with Gemini Imagen 4.0:", error);
        let errorMessage = error.message || "An unknown error occurred during image generation.";

        try {
            // Attempt to parse a JSON error message from the API for better readability
            const errorJson = JSON.parse(errorMessage);
            if (errorJson?.error?.message) {
                errorMessage = errorJson.error.message;
            }
        } catch (e) {
            // Not a JSON error, use the raw message
        }
        
        if (errorMessage.includes("API key not valid")) {
             errorMessage = "Your Google API key is invalid or lacks permissions for this model.";
        } else if (errorMessage.includes("404") || errorMessage.includes("not found")) {
            errorMessage = "The requested model 'imagen-4.0-generate-001' may not be available for your project or key."
        }

        throw new Error(`[Gemini Image] ${errorMessage}`);
    }
};
// #endregion

// #region OpenAPI-Compatible Implementation

async function* generateWithOpenApi(formData: InputFormData, config: AiConfig): AsyncGenerator<StreamChunk> {
    const { provider } = config;

    // Phase 1: Generate a mock analysis since non-Gemini providers lack search tools.
    const mockAnalysis: TopicAnalysis = {
        campaign_strategy: `A targeted campaign for "${formData.topic || formData.sourceUrl}" to achieve ${formData.campaignGoal}.`,
        trend_alignment: "Content is aligned with evergreen topics and common questions in the niche.",
        audience_resonance: `Addressing the core needs of the audience interested in ${formData.topic || formData.sourceUrl}.`,
        content_gaps: "Focusing on providing clear, actionable advice.",
        viral_hooks: ["A surprising fact", "A common mistake to avoid", "A simple how-to guide"],
    };
    yield { type: 'analysis', data: mockAnalysis };

    // Phase 2: Generate posts using the unified prompt with the mock analysis.
    const postsPrompt = generatePostsPrompt(formData, mockAnalysis);
    
    const { url, headers, body } = getOpenApiRequestConfig(postsPrompt, config);
    
    const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: { message: `HTTP ${response.status} ${response.statusText}`}}));
        throw new Error(`[${provider}] API Error (${response.status}): ${err.error?.message || JSON.stringify(err)}`);
    }

    const fullJson = await response.json();
    const responseText = provider === AiProvider.Claude 
        ? fullJson.content[0].text
        : fullJson.choices[0].message.content;

    let postsData: { posts: GeneratedPost[] };
    try {
        postsData = JSON.parse(responseText.trim());
    } catch (e) {
        throw new Error(`Failed to parse posts JSON from ${provider}. Raw text: ${responseText}`);
    }
    
    if (!postsData.posts || !Array.isArray(postsData.posts)) {
        throw new Error(`API response for posts from ${provider} is missing the 'posts' array.`);
    }

    // Phase 3: Yield post chunks.
    for (const post of postsData.posts) {
        yield { type: 'post', data: post as any };
    }
}

const generateImageWithOpenAI = async (prompt: string, platform: Platform, apiKey: string, url = 'https://api.openai.com/v1/images/generations', model = 'dall-e-3'): Promise<string> => {
    const isOpenRouter = url.includes('openrouter.ai');
    const providerName = isOpenRouter ? 'OpenRouter' : 'OpenAI';

    const headers: HeadersInit = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    };

    if (isOpenRouter) {
        headers['Referer'] = `https://${location.hostname}`;
        headers['X-Title'] = 'Viral Post Co-pilot AI';
    }

    const getDalleSize = (platform: Platform): '1024x1024' | '1792x1024' | '1024x1792' => {
        const ratio = ASPECT_RATIOS[platform];
        if (ratio === '16:9') return '1792x1024';
        if (ratio === '9:16' || ratio === '3:4') return '1024x1792';
        return '1024x1024'; // Default to square
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                n: 1,
                size: getDalleSize(platform),
                response_format: 'b64_json',
                quality: 'hd',
                style: 'vivid'
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text().catch(() => '');
            let errorMessage = `API Error (${response.status}): ${response.statusText || 'No status text'}.`;

            if (errorBody) {
                try {
                    const errorJson = JSON.parse(errorBody);
                    if (errorJson?.error?.message) {
                        errorMessage = `API Error: ${errorJson.error.message}`;
                    } else {
                        errorMessage += ` Details: ${errorBody}`;
                    }
                } catch (e) {
                    errorMessage += ` Raw response: ${errorBody}`;
                }
            }
            
            if (response.status === 401) {
                errorMessage += " Please check if your API key is correct and your account has sufficient credits.";
            }
            if (response.status === 405) {
                errorMessage += " This error often indicates a proxy or CORS issue. Ensure the API provider allows client-side requests from this origin."
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        
        if (!data?.data?.[0]?.b64_json) {
            console.error(`Invalid response structure from ${providerName} image generation API:`, data);
            const detail = data?.error?.message ? ` Details: ${data.error.message}` : '';
            throw new Error(`The API returned an unexpected response structure. This can happen if a prompt is blocked by a safety filter.${detail}`);
        }

        return `data:image/jpeg;base64,${data.data[0].b64_json}`;

    } catch (error: any) {
        console.error(`Error during ${providerName} image generation:`, error);
        throw new Error(`[${providerName} Image Generation] ${error.message}`);
    }
};


function getOpenApiRequestConfig(prompt: string, config: AiConfig) {
    const { provider, apiKey, model } = config;
    const commonBody = {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        top_p: 0.9,
    };

    switch (provider) {
        case AiProvider.OpenAI:
            return {
                url: 'https://api.openai.com/v1/chat/completions',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: { ...commonBody, response_format: { type: "json_object" } },
            };
        case AiProvider.Claude:
             return {
                url: 'https://api.anthropic.com/v1/messages',
                headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
                body: { ...commonBody, max_tokens: 4096 },
            };
        case AiProvider.OpenRouter:
             return {
                url: 'https://openrouter.ai/api/v1/chat/completions',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: { ...commonBody, response_format: { type: "json_object" } },
            };
        default:
            throw new Error(`Invalid provider for OpenApi config: ${provider}`);
    }
}
// #endregion

// #region Utilities
function* parseAndYieldFullJson(responseString: string): Generator<StreamChunk, void, unknown> {
    if (!responseString || responseString.trim() === '') {
        return;
    }
    
    try {
        const match = responseString.match(/```json\s*([\s\S]+?)\s*```|({[\s\S]+}|\[[\s\S]+\])/);

        if (!match) {
            console.error("No valid JSON object or array found in the AI response.", "Raw Response:", responseString);
            throw new Error(`The AI returned a non-JSON response. Raw output: "${responseString.trim()}"`);
        }

        const jsonContent = match[1] || match[2];
        const parsedData = JSON.parse(jsonContent);

        let yieldedData = false;
        if (parsedData.topic_analysis) {
            yield { type: 'analysis', data: parsedData.topic_analysis };
            yieldedData = true;
        }

        if (Array.isArray(parsedData.posts)) {
            for (const post of parsedData.posts) {
                yield { type: 'post', data: post };
                yieldedData = true;
            }
        }
        
        if (!yieldedData) {
            console.warn("Parsed JSON was valid but did not contain 'topic_analysis' or 'posts'.", parsedData);
        }

    } catch (error) {
        console.error("Failed to parse final JSON from stream:", error, "Raw Response:", responseString);
        let message = "The AI returned an invalid JSON response. Please try again.";
        if (error instanceof Error) {
            message = `Error parsing AI response: ${error.message}. Please check the console for the raw response.`;
        }
        throw new Error(message);
    }
}
// #endregion