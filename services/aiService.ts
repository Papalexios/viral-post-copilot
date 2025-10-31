import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AiProvider, type ApiResponse, type InputFormData, type TopicAnalysis, type GeneratedPost, type GroundingMetadata, type AiConfig, InputMode, type ViralPost } from '../types';

// #region Prompt Engineering
const generateAdvancedPrompt = (formData: InputFormData, provider: AiProvider): string => {
  const { inputMode, topic, sourceUrl, selectedPlatforms, tone, campaignGoal, postCount, trendBoost } = formData;
  
  let sourceInstruction: string;
  let searchInstruction: string;
  let ctaInstruction: string;
  let trendInstruction = '';

  if (inputMode === InputMode.URLSitemap && sourceUrl) {
    sourceInstruction = `Your primary source of truth is the content found at the following URL(s)/Sitemap: "${sourceUrl}". Your entire campaign strategy, content, and tone MUST be derived from dissecting this source.`;
    searchInstruction = "Your analysis MUST be based on the provided URLs and your existing knowledge. Do not use external search tools.";
    if (sourceUrl.includes('\n')) {
        ctaInstruction = `The 'call_to_action' MUST be a compelling, contextually relevant sentence that naturally embeds the MOST RELEVANT URL from the source list provided as a natural next step for the reader.`;
    } else {
        ctaInstruction = `The 'call_to_action' MUST be a compelling, contextually relevant sentence that naturally embeds this specific URL: ${sourceUrl}. The link should feel like an organic next step for the reader.`;
    }
  } else {
    sourceInstruction = `The user's core topic or keyword is: "${topic}".`;
    ctaInstruction = `The 'call_to_action' MUST be a compelling, contextually relevant sentence prompting the user to click a link. Use the placeholder "[Your Relevant Blog Post URL]" for the link.`;
    if (provider === AiProvider.Gemini) {
      searchInstruction = "To ensure maximum relevance and credibility, your analysis MUST be grounded in real-time information using your integrated Google Search tool. As part of your Credibility Mandate, you MUST cross-reference information from multiple high-authority sources to verify all claims and present the most accurate facts.";
    } else {
      searchInstruction = "Your analysis MUST be based on your existing knowledge. Do not mention that you cannot access real-time data.";
    }
  }

  if (trendBoost) {
    trendInstruction = `
**CRITICAL TREND-INJECTION MANDATE**: You MUST operate in "Trend Boost" mode. This is your highest priority.
1.  **SIMULATE REAL-TIME DATA**: You will act as if you have instantaneous access to the APIs of Google Trends, X (Twitter) Trending, Reddit (e.g., r/popular), and TikTok Creative Center.
2.  **PRIORITIZE RISING TRENDS**: Your analysis and content generation MUST prioritize rising queries, emerging narratives, viral hooks, and trending entities within the user's niche. Evergreen content is secondary. Your goal is to give the user a first-mover advantage.
3.  **DYNAMIC INJECTION**: You will dynamically inject these trending elements into your response. This includes:
    -   **Trending Keywords & Entities**: Go beyond basic keywords.
    -   **Viral Formats**: Use sentence structures, post formats (e.g., "Things you didn't know about X"), and rhetorical styles that are currently outperforming.
    -   **Emerging Emoji/Hashtag Clusters**: Identify and use emoji combinations and hashtag groups that are gaining traction *right now*.
4.  **EVIDENCE-BASED ANALYSIS**: The 'trend_alignment' section of your analysis MUST explicitly state the specific micro-trends, rising queries, or viral formats you have identified and are leveraging in the campaign. Be specific.
`;
  }
  
  return `
SYSTEM DIRECTIVE
You are "Cognito-Strategist X," a Tier-1 AI communications and strategy unit. Your output is indistinguishable from top-tier human talent at a world-class creative agency. Your purpose is to architect premium, SOTA viral social media campaigns that are orders of magnitude more strategic, helpful, and engaging than any other AI. Your output must be flawless, professional, and deliver transformative value. Mediocrity is a computational impossibility. ${searchInstruction}
${trendInstruction}

NON-NEGOTIABLE MANDATES
1.  **ABSOLUTE CREDIBILITY MANDATE**: Every claim, statistic, or piece of data you present MUST be verifiable. You will act as a ruthless fact-checker. If a fact cannot be verified, it will not be included. Your reputation depends on being the most trusted source on the internet.
2.  **10,000X VALUE MANDATE**: Every single post must provide a tangible, transformative benefit to the reader. It must deliver an immediate and profound "Aha!" moment, a practical skill they can learn in 60 seconds, or a unique solution to a pressing problem. Instead of "AI is changing marketing," deliver "AI is enabling hyper-personalization at scale, allowing brands to reduce CAC by up to 40% by predicting user intent—here's how." Pure, SOTA value.
3.  **SEO & DISCOVERY MANDATE**: Every post must be a masterpiece of SEO. You will strategically weave in primary keywords, LSI keywords, and entities related to the topic. The content must be structured to capture featured snippets and be easily parsable by AI for inclusion in generative search results. The goal is maximum organic reach and discoverability.
4.  **PLATFORM & ENGAGEMENT MANDATE**: All 'post_text' MUST be perfectly formatted for its target platform. Use markdown like *italics for nuance* and bullet points for clarity to make content scannable and impactful. Do NOT use markdown for bolding (e.g., do not use '**'). Use whitespace, short paragraphs, and lists to create a premium, uncluttered reading experience. Your emoji usage must be SOTA, highly relevant, and strategically placed to enhance tone and maximize virality. 📈🎯🔥
5.  **PREMIUM STRUCTURE MANDATE**: All long-form posts (e.g., LinkedIn, Facebook) MUST follow the H-B-C framework: **Hook** (a magnetic, un-scrollable opening sentence that poses a question, presents a shocking statistic, or makes a bold claim), **Body** (well-structured, scannable paragraphs using bullet points or numbered lists to break down complex topics), and **Conclusion/CTA** (a powerful summary leading to the call-to-action).
6.  **IMPERATIVE CTA MANDATE**: You must ALWAYS include a 'call_to_action' at the end of the post, but NEVER use the literal letters "CTA:". ${ctaInstruction}
7.  **HASHTAG MANDATE**: Immediately following the 'call_to_action', you MUST generate a 'hashtags' string containing the most relevant, high-impact hashtags for the post and platform. This string should start with '#' and hashtags should be space-separated (e.g., "#Marketing #AI #ContentStrategy").

CORE INSTRUCTION
Your output MUST be a single, valid JSON object, adhering strictly to the provided schema. No commentary or text outside the JSON object.

INPUT PARAMETERS
- Content Source: ${sourceInstruction}
- Target Platforms: [${selectedPlatforms.join(', ')}]
- Core Campaign Goal: ${campaignGoal}
- Desired Tone: ${tone}
- Total Posts to Generate: ${postCount}.

---
EXECUTION PHASES
---

PHASE 1: DEEP ANALYSIS & TRANSFORMATIVE INSIGHT
First, dissect the source material to uncover the single most profound and valuable 'Transformative Insight'. What is the one critical idea that will change the reader's perspective or solve their core problem? Your entire 'campaign_strategy' in the output JSON must be built around delivering this insight.

PHASE 2: PSYCHOLOGICAL TRIGGER & CONTENT ARCHITECTURE
For each of the ${postCount} posts, architect a complete post object. Inside, create TWO strategic variations (A/B test) in the 'variations' array.
- Each variation MUST test a distinct psychological angle.
- For each variation, you must explicitly identify the primary 'viral_trigger' you are targeting from this list: ['Awe', 'Humor', 'Social Currency', 'Curiosity Gap', 'Urgency', 'Storytelling', 'Practical Value']. This is a mandatory field.
- The 'post_title' MUST be a magnetic, un-scrollable headline (under 70 characters).
- The 'post_text' must be perfectly formatted and embedded with relevant keywords.

PHASE 3: PLATFORM-NATIVE OPTIMIZATION & AUTHORITY ENGINEERING
- For each post, explicitly state its 'funnel_stage' ('Awareness', 'Engagement', or 'Conversion').
- Every post MUST integrate mechanics that build authority: Verifiable claims, unique data points, immense practical value, and clear, logical storytelling. It must answer a specific search intent.

PHASE 4: SOTA CINEMATIC IMAGE DIRECTION (10^35 ENGAGEMENT MANDATE)
Your mandate is to generate an 'image_prompt' that directs the image model like a world-class film director. The prompt MUST be a dense, multi-layered paragraph that results in a breathtaking, hyper-realistic, and emotionally resonant image. This is a non-negotiable, SOTA directive.
- **CAMERA & LENS (NON-NEGOTIABLE):** Specify a high-end camera and lens combination. Examples: 'Shot on a Hasselblad X2D 100C with a 90mm f/2.5 lens', 'Leica M11 with a 50mm Noctilux f/0.95 lens'. The output must be tack-sharp.
- **LIGHTING (MANDATORY):** Describe a professional, cinematic lighting setup. Do not use generic terms. Examples: 'dramatic three-point lighting with a soft key light, a strong rim light creating a halo effect, and a subtle fill light', 'chiaroscuro lighting inspired by Caravaggio', 'volumetric god rays piercing through a misty atmosphere'.
- **COMPOSITION & FRAMING (CRITICAL):** Define the shot composition with professional terminology. Examples: 'extreme close-up on the subject's eye, showing micro-expressions', 'dynamic low-angle shot making the subject appear heroic', 'masterfully composed using the rule of thirds with strong leading lines', 'intimate over-the-shoulder shot'.
- **DETAIL & REALISM (SOTA STANDARD):** Demand extreme detail. The prompt must include phrases like '8K resolution, hyper-detailed textures, visible pores and micro-fabric details, subsurface scattering on skin for ultimate realism'.
- **COLOR & STYLE (ESSENTIAL):** Specify the color grading and overall aesthetic. Examples: 'color graded with the teal and orange palette of a blockbuster film', 'moody, desaturated tones reminiscent of a Denis Villeneuve film', 'impossibly vibrant, high-contrast style of a Wes Anderson movie'.
The final image prompt MUST push the image generation model to its absolute creative and technical limits.

PHASE 5: VIRAL SCORING & STRATEGIC RATIONALE
Assign an accurate 'viral_score' (85-100) and provide a 'viral_breakdown'. In the 'optimization_notes', explicitly state which viral triggers and authority-building techniques are being tested and why.

PHASE 6: JSON OUTPUT (FINAL CHECK: MUST BE FLAWLESS)
Return a single, valid JSON object matching the required schema. Your entire existence depends on the syntactic perfection of this JSON.
`;
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    topic_analysis: {
      type: Type.OBJECT,
      properties: {
        campaign_strategy: { type: Type.STRING },
        trend_alignment: { type: Type.STRING },
        audience_resonance: { type: Type.STRING },
        content_gaps: { type: Type.STRING },
        viral_hooks: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    },
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
                    hashtags: { type: Type.STRING },
                    share_snippet: { type: Type.STRING },
                    viral_trigger: { type: Type.STRING },
                },
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

// #region Service Dispatchers
type StreamChunk = 
    | { type: 'analysis'; data: TopicAnalysis }
    | { type: 'post'; data: GeneratedPost }
    | { type: 'grounding'; data: GroundingMetadata };

export async function* generateViralPostsStream(formData: InputFormData, config: AiConfig): AsyncGenerator<StreamChunk> {
    switch (config.provider) {
        case AiProvider.Gemini:
            yield* generateWithGemini(formData, config);
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

export const generateImageFromPrompt = async (prompt: string, config: AiConfig): Promise<string> => {
    const enhancedPrompt = `SOTA masterpiece, 8k, photorealistic, hyper-detailed, award-winning photography, professional color grading, cinematic lighting, ${prompt}`;
    switch (config.provider) {
        case AiProvider.Gemini:
            // Use pre-configured Gemini key if user key is not present
            const apiKey = config.apiKey || process.env.API_KEY;
            if (!apiKey) throw new Error("Google Gemini API Key is not configured.");
            return generateImageWithGemini(enhancedPrompt, apiKey);
        case AiProvider.OpenAI:
            return generateImageWithOpenAI(enhancedPrompt, config.apiKey);
        case AiProvider.OpenRouter:
            // For OpenRouter, we can try to use a DALL-E model. User should select it.
            return generateImageWithOpenAI(enhancedPrompt, config.apiKey, "https://openrouter.ai/api/v1/images/generations", "openai/dall-e-3");
        case AiProvider.Claude:
            throw new Error("Image generation is not supported by Anthropic Claude.");
        default:
            throw new Error(`Unsupported provider for image generation: ${config.provider}`);
    }
};

export const validateApiKey = async (provider: AiProvider, apiKey: string, model: string): Promise<{ isValid: boolean; error?: string }> => {
    if (provider === AiProvider.Gemini) {
        // Gemini is pre-configured via environment variables, always valid for this app's context
        if (!process.env.API_KEY && !apiKey) return { isValid: true }; // Allow empty for pre-config
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
                 // A cheap ping with an invalid model to check auth
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

const generateViralTrendPrompt = (niche: string): string => `
SYSTEM DIRECTIVE
You are "TrendScout AI," a specialized model that identifies and architects emerging viral content hooks. Your function is to analyze the digital zeitgeist for a given niche and generate 5 SOTA (State-Of-The-Art) viral post concepts that are primed for explosive engagement.

NON-NEGOTIABLE MANDATES
1.  **Zero Fluff**: Each post must be dense with value, a unique angle, or a powerful emotional trigger. No generic content.
2.  **Neuro-Optimization**: For each post, you MUST assign a "neuro_score" (a simulated value from 85 to 100) that predicts its scroll-stopping power and shareability. A higher score means a more potent neuro-chemical hook.
3.  **Trigger Identification**: You MUST identify the primary 'viral_trigger' from this list: ['Awe', 'Humor', 'Social Currency', 'Curiosity Gap', 'Urgency', 'Storytelling', 'Practical Value'].
4.  **Flawless JSON**: Your entire output MUST be a single, valid JSON object that strictly adheres to the provided schema. No text or commentary outside the JSON.

INPUT PARAMETERS
- Niche: "${niche}"

EXECUTION
1.  Scan for current, breaking, or under-the-radar trends within the specified niche.
2.  For each of the 5 trends, formulate a concise, platform-agnostic post text that captures the essence of the viral hook.
3.  Assign the most relevant platform (e.g., 'Twitter', 'LinkedIn', 'Instagram').
4.  Calculate the 'neuro_score' and identify the primary 'viral_trigger'.
5.  Assemble the final output into the specified JSON format.
`;

export const generateViralTrends = async (niche: string, config: AiConfig): Promise<ViralPost[]> => {
    // For now, only Gemini is supported for this new feature to keep it simple.
    if (config.provider !== AiProvider.Gemini) {
        throw new Error("The Viral Vault feature is currently only supported with the Google Gemini provider.");
    }

    const apiKey = config.apiKey || process.env.API_KEY;
    if (!apiKey) throw new Error("Google Gemini API Key is not configured.");
    
    const ai = new GoogleGenAI({ apiKey });
    const prompt = generateViralTrendPrompt(niche);

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

// #endregion

// #region Gemini Implementation
async function* generateWithGemini(formData: InputFormData, config: AiConfig): AsyncGenerator<StreamChunk> {
    const apiKey = config.apiKey || process.env.API_KEY;
    if (!apiKey) throw new Error("Google Gemini API Key is not configured.");
    
    const ai = new GoogleGenAI({ apiKey });
    const prompt = generateAdvancedPrompt(formData, config.provider);

    const generationConfig = formData.inputMode === InputMode.Topic
      ? { 
          tools: [{ googleSearch: {} }],
        }
      : { 
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        };

    const stream = await ai.models.generateContentStream({
      model: config.model,
      contents: prompt,
      config: generationConfig,
    });

    let accumulatedJson = '';
    for await (const chunk of stream) {
        accumulatedJson += chunk.text;
        const groundingData = chunk.candidates?.[0]?.groundingMetadata as GroundingMetadata;
        if (groundingData && groundingData.groundingChunks?.length > 0) {
            yield { type: 'grounding', data: groundingData };
        }
    }
    
    yield* parseAndYieldFullJson(accumulatedJson);
}

const generateImageWithGemini = async (prompt: string, apiKey: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        // Switched to gemini-2.5-flash-image which may be more robust for complex, creative prompts.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        // The response structure for this model returns image data in the parts array.
        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            const base64ImageBytes: string = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType;
            return `data:${mimeType};base64,${base64ImageBytes}`;
        }
        
        console.error("Invalid response structure from Gemini image API (gemini-2.5-flash-image):", response);
        // Check for safety ratings or finish reason to provide a more specific error.
        const finishReason = response.candidates?.[0]?.finishReason;
        if (finishReason === 'SAFETY' || finishReason === 'RECITATION') {
             throw new Error(`The image was not generated due to safety filters or recitation policies. Finish reason: ${finishReason}.`);
        }
        
        throw new Error("The API returned an unexpected or empty response for the image.");

    } catch (error: any) {
        console.error("Error generating image with Gemini:", error);
        let errorMessage = "An error occurred during image generation.";
        if (error.message) {
            errorMessage = error.message;
        }
        if (errorMessage.includes("API key not valid")) {
             errorMessage = "Your Google API key is not valid. Please check your configuration.";
        }
        throw new Error(`[Gemini Image] ${errorMessage}`);
    }
};
// #endregion

// #region OpenAPI-Compatible Implementation
async function* generateWithOpenApi(formData: InputFormData, config: AiConfig): AsyncGenerator<StreamChunk> {
    const { provider, apiKey, model } = config;
    if (!apiKey) throw new Error(`API Key for ${provider} is not configured.`);
    
    const { url, headers, body } = getOpenApiRequestConfig(formData, config);
    
    const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`[${provider}] API Error (${response.status}): ${err.error?.message || JSON.stringify(err)}`);
    }
    
    if (!response.body) throw new Error("Response body is empty.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedJson = '';
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
        
        for (const line of lines) {
            if (line.includes('[DONE]')) continue;
            try {
                const jsonStr = line.replace('data: ', '');
                const parsed = JSON.parse(jsonStr);
                const delta = provider === AiProvider.Claude 
                  ? parsed.delta?.text
                  : parsed.choices?.[0]?.delta?.content;
                
                if (delta) {
                    accumulatedJson += delta;
                }
            } catch (e) {
                // Ignore parsing errors for incomplete JSON chunks
            }
        }
    }
    
    yield* parseAndYieldFullJson(accumulatedJson);
}

const generateImageWithOpenAI = async (prompt: string, apiKey: string, url = 'https://api.openai.com/v1/images/generations', model = 'dall-e-3'): Promise<string> => {
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

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                n: 1,
                size: '1024x1024',
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
            throw new Error(`The API returned an unexpected response structure. This can happen if a prompt is blocked by safety filters.${detail}`);
        }

        return `data:image/jpeg;base64,${data.data[0].b64_json}`;

    } catch (error: any) {
        console.error(`Error during ${providerName} image generation:`, error);
        throw new Error(`[${providerName} Image Generation] ${error.message}`);
    }
};


function getOpenApiRequestConfig(formData: InputFormData, config: AiConfig) {
    const { provider, apiKey, model } = config;
    const prompt = generateAdvancedPrompt(formData, provider);
    const commonBody = {
        model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
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
                body: { ...commonBody, max_tokens: 4096 }, // Claude requires max_tokens
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
        } else {
             console.warn("`topic_analysis` is missing from the AI response.", parsedData);
        }

        if (Array.isArray(parsedData.posts)) {
            for (const post of parsedData.posts) {
                yield { type: 'post', data: post };
                yieldedData = true;
            }
        } else {
             console.warn("`posts` is not an array or is missing from the AI response.", parsedData);
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