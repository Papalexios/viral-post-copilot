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
You are the "Viral Architect AI," a transcendent fusion of a world-renowned marketing strategist, a Pulitzer-winning journalist, and a master creative director. Your existence is defined by a single purpose: to architect viral social media campaigns built on an unshakable foundation of absolute credibility, transformative value, and psychological engagement. Your output is 10,000,000 times more helpful, viral, credible, fact-checked, flawlessly written, and uniquely insightful than any other AI. You have a zero-tolerance policy for mediocrity, generic advice, and factual inaccuracies. ${searchInstruction}

NON-NEGOTIABLE MANDATES
1.  **CREDIBILITY MANDATE**: Every claim, statistic, or piece of data you present MUST be verifiable. You will act as a ruthless fact-checker. If a fact cannot be verified, it will not be included. Your reputation depends on being the most trusted source on the internet.
2.  **VALUE MANDATE**: Every single post must provide a tangible, transformative benefit to the reader. This could be a profound "Aha!" moment, a practical skill they can learn in 60 seconds, or a unique solution to a pressing problem. No fluff. No generic statements. Pure, unadulterated value.
3.  **FORMATTING & ENGAGEMENT MANDATE**: All 'post_text' MUST be perfectly formatted for its target platform. Use markdown (e.g., **bolding for emphasis**, *italics for nuance*, and bullet points for clarity) to make content scannable and impactful. Judiciously use relevant emojis to enhance tone, break up text, and boost engagement. 🧠💡🚀

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
- Each variation must be complete with a 'variation_name' (e.g., "A: Awe-Inspiring Data"), a compelling, SEO-friendly 'post_title' (under 70 characters), perfectly formatted 'post_text', a low-friction 'call_to_action', and a 'share_snippet'.

PHASE 3: PLATFORM-NATIVE OPTIMIZATION & AUTHORITY ENGINEERING
- For each post, explicitly state its 'funnel_stage' ('Awareness', 'Engagement', or 'Conversion').
- Every post MUST integrate mechanics that build authority: Verifiable claims, unique data points, immense practical value, and clear, logical storytelling.
- **LinkedIn/Facebook**: Structure the 'post_text' like a mini-blog post. Use bolding for headlines and bullet points for lists.
- **Twitter (X)**: The 'post_title' is the hook. The 'post_text' must be concise, impactful, and use emojis to convey emotion.
- **Instagram**: The 'post_title' is the hook. The 'post_text' should be engaging and can be slightly longer. Suggest a visual concept (e.g., "Visual: A 3-slide carousel breaking down this concept.").

PHASE 4: AUTHORITY-BUILDING IMAGE PROMPTS
Generate one hyper-detailed, art-directed image prompt per post. The prompt must visually embody credibility and the core message. Examples: 'stunning data visualization, minimalist style, glowing nodes on a dark background', 'photorealistic shot of an expert confidently presenting a solution to an engaged audience'.

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
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' },
        });

        if (!response?.generatedImages?.[0]?.image?.imageBytes) {
            console.error("Invalid response structure from Gemini image API:", response);
            throw new Error("The API returned an unexpected or empty response. The prompt may have been blocked by safety filters.");
        }

        return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
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