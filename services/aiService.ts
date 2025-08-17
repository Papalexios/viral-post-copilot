import { GoogleGenAI, Type } from "@google/genai";
import { AiProvider, type ApiResponse, type InputFormData, type TopicAnalysis, type GeneratedPost, type GroundingMetadata, type AiConfig, InputMode } from '../types';

// #region Prompt Engineering
const generateAdvancedPrompt = (formData: InputFormData, provider: AiProvider): string => {
  const { inputMode, topic, sourceUrl, selectedPlatforms, tone, campaignGoal, postCount } = formData;
  
  let sourceInstruction: string;
  let searchInstruction: string;

  if (inputMode === InputMode.URLSitemap && sourceUrl) {
    sourceInstruction = `Your primary source of truth is the content found at the following URL(s)/Sitemap: "${sourceUrl}". Your entire campaign strategy, content, and tone MUST be derived from dissecting this source.`;
    searchInstruction = "Your analysis MUST be based on the provided URLs and your existing knowledge. Do not use external search tools.";
  } else {
    sourceInstruction = `The user's core topic or keyword is: "${topic}".`;
    if (provider === AiProvider.Gemini) {
      searchInstruction = "To ensure maximum relevance and credibility, your analysis MUST be grounded in real-time information using your integrated Google Search tool. As part of your Credibility Mandate, you MUST cross-reference information from multiple high-authority sources to verify all claims and present the most accurate facts.";
    } else {
      searchInstruction = "Your analysis MUST be based on your existing knowledge. Do not mention that you cannot access real-time data.";
    }
  }
  
  return `
SYSTEM DIRECTIVE
You are "CognitoViral," an elite AI strategist with an obsessive commitment to factual accuracy, verifiable credibility, and delivering immense, tangible value. Your mission is to architect viral movements built on a foundation of trust and pure value, establishing the user's brand as a definitive authority. Your output is 10,000,000 times more valuable, helpful, pure, credible, fact-checked, accurate, precise, viral, and unique than any alternative. You have a zero-tolerance policy for generic, rehashed ideas. Every post must be 100% novel and provide a fresh perspective. ${searchInstruction}

CORE INSTRUCTION
Your output MUST be a single, valid JSON object. Your entire strategy must be authority-driven.

INPUT PARAMETERS
- Content Source: ${sourceInstruction}
- Target Platforms: [${selectedPlatforms.join(', ')}]
- Core Campaign Goal: ${campaignGoal}
- Desired Tone: ${tone}
- Total Posts to Generate: ${postCount}. Distribute these posts logically and effectively across the selected target platforms. You can and should create multiple posts for the same platform if it serves the campaign strategy.

---
EXECUTION PHASES
---

PHASE 1: CORE VALUE PROPOSITION & USER INTENT ANALYSIS
First, identify the single most helpful, valuable, or unique 'Core Value Proposition' within the source material. What is the one critical insight the audience needs? Then, perform a deep analysis of USER INTENT. Go beyond simple keywords to understand the underlying questions, problems, and goals of the target audience. Your 'campaign_strategy' in the output JSON must be built around delivering this Core Value Proposition and answering the audience's true intent.

PHASE 2: SEO & DISCOVERABILITY MAXIMIZATION (USER INTENT FOCUSED)
Your content must be engineered to rank and be discovered by answering user intent. Weave in primary keywords, LSI keywords, and question-based phrases naturally into all post copy and hashtags. This is not about keyword stuffing; it's about providing definitive answers.

PHASE 3: STRATEGIC CONTENT & A/B TEST ARCHITECTURE
For each of the ${postCount} posts, architect a post object. Inside, create TWO strategic variations (A/B test) in the 'variations' array.
- The variations MUST test distinct psychological triggers. Example: Variation A uses a 'Credibility/Data' hook, while Variation B uses a 'Storytelling/Emotional' angle.
- Each variation must be complete with its own 'variation_name' (e.g., "A: Data-Driven Authority"), 'post_text', a low-friction 'call_to_action', AND a 'share_snippet'. The 'share_snippet' is a critical, short, compelling sentence or question designed to maximize organic sharing by providing value.

PHASE 4: PLATFORM-NATIVE OPTIMIZATION & AUTHORITY ENGINEERING
- For each post, explicitly state its 'funnel_stage' ('Awareness', 'Engagement', or 'Conversion').
- Every post MUST integrate mechanics that build authority: Verifiable claims, unique data points, immense practical value, and clear, logical storytelling. The goal is trust, not just clicks.
- FACEBOOK: 40-80 words, high credibility, cite a surprising fact or data point. 3-5 high-volume hashtags.
- INSTAGRAM: 30-50 words, create a value-packed carousel or infographic concept, use 8-15 hashtags (mix of popular & niche).
- PINTEREST: 20-40 words, use strong SEO keywords focused on "how-to" or "ultimate guide" queries, have a direct CTA to a high-value resource.
- LINKEDIN: 150-250 words, professional tone, present a well-reasoned, data-backed argument or unique industry insight. Use 3-5 targeted professional hashtags.
- TWITTER (X): Under 280 characters, lead with a powerful, verifiable statistic or a myth-busting statement. Use 2-3 hyper-relevant hashtags. Create a thread-worthy hook.

PHASE 5: AUTHORITY-BUILDING IMAGE PROMPTS
Generate one hyper-detailed, art-directed image prompt per post. The prompt must visually communicate credibility and value. Think 'data visualization, minimalist style', 'photorealistic product in a clean, professional setting', 'expert portrait, confident expression, dramatic lighting'. Avoid generic stock photos.

PHASE 6: VIRAL SCORING & STRATEGIC RATIONALE
Assign an accurate 'viral_score' (85-100) and provide a 'viral_breakdown' that heavily weights 'content_value'. Write concise 'optimization_notes' that explicitly state which authority-building triggers are being tested and why.

PHASE 7: JSON OUTPUT (FINAL CHECK: MUST BE FLAWLESS)
Return a single, valid JSON object matching the required schema. NO commentary or text outside the JSON object.
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
                    post_text: { type: Type.STRING },
                    call_to_action: { type: Type.STRING },
                    share_snippet: { type: Type.STRING },
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
    const enhancedPrompt = `masterpiece, high quality, professional photography, cinematic, ${prompt}`;
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

// #endregion

// #region Gemini Implementation
async function* generateWithGemini(formData: InputFormData, config: AiConfig): AsyncGenerator<StreamChunk> {
    const apiKey = config.apiKey || process.env.API_KEY;
    if (!apiKey) throw new Error("Google Gemini API Key is not configured.");
    
    const ai = new GoogleGenAI({ apiKey });
    const prompt = generateAdvancedPrompt(formData, config.provider);

    // Explicitly define the generation config based on the input mode
    // to prevent sending mutually exclusive parameters (tools vs. responseMimeType).
    const generationConfig = formData.inputMode === InputMode.Topic
      ? { // Config for Topic mode: Use Google Search, do not enforce JSON output via API.
          tools: [{ googleSearch: {} }],
        }
      : { // Config for URL/Sitemap mode: Enforce strict JSON output, do not use tools.
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
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' },
        });

        // Defensive validation of the response structure
        if (!response?.generatedImages?.[0]?.image?.imageBytes) {
            console.error("Invalid response structure from Gemini image API:", response);
            // It's possible the prompt was blocked by safety filters without throwing an error
            throw new Error("The API returned an unexpected or empty response. The prompt may have been blocked by safety filters.");
        }

        return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    } catch (error: any) {
        console.error("Error generating image with Gemini:", error);
        // Create a more user-friendly error message
        let errorMessage = "An error occurred during image generation.";
        if (error.message) {
            // The SDK often includes details in the message
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

    // Add provider-specific headers required for client-side requests to OpenRouter.
    // 'Referer' and 'X-Title' help bypass their proxy/firewall, which can cause 405 errors.
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
            }),
        });

        if (!response.ok) {
            // The error body might be empty, so handle that gracefully.
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
            // Add specific advice for the 405 error
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
        // Re-throw with a consistent, provider-specific error message format.
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
        // Model returned nothing. The calling function in App.tsx will handle this.
        return;
    }
    
    try {
        // Find a JSON object or array within the string. This handles cases where the model
        // adds conversational text before or after the JSON block.
        const match = responseString.match(/```json\s*([\s\S]+?)\s*```|({[\s\S]+}|\[[\s\S]+\])/);

        if (!match) {
            console.error("No valid JSON object or array found in the AI response.", "Raw Response:", responseString);
            // Throw a more informative error if there's text but no JSON.
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
            // This is the case that leads to the "no content" error. The JSON is valid but empty of our data.
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