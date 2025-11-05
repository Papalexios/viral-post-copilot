import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { PostCard } from './components/PostCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { CampaignHistory } from './components/CampaignHistory';
import { ApiConfigurator } from './components/ApiConfigurator';
import { WordPressConfigurator } from './components/WordPressConfigurator';
import { BottomNavBar } from './components/BottomNavBar';
import { Resources } from './components/Resources';
import { LandingPage } from './components/LandingPage';
import { AiProvider, type ApiResponse, type GeneratedPost, type InputFormData, type AiConfig, type WordPressConfig, type ViralPost, type SchedulingSuggestion, PostVariation, Tone } from './types';
import { generateViralPostsStream, generateImageFromPrompt, generateViralTrends, generateSchedulingSuggestions, rewriteText, generateMoreLikeThis, generateClipScript } from './services/aiService';
import { publishPostToWordPress } from './services/wordpressService';
import { AI_PROVIDERS } from './constants';
import { WordPressIcon } from './components/icons/WordPressIcon';

const ViralVault = lazy(() => import('./components/ViralVault'));
const Scheduler = lazy(() => import('./components/Scheduler'));


const LOADING_MESSAGES = [
  "Querying AI for the latest trends...",
  "Analyzing audience sentiment and engagement patterns...",
  "Identifying strategic content opportunities...",
  "Building a high-impact campaign framework...",
  "Crafting compelling post variations...",
  "Art-directing scroll-stopping visuals...",
  "Finalizing viral strategy...",
  "Calculating optimal engagement windows...",
];

export type ActiveView = 'generator' | 'history' | 'config' | 'wordpress' | 'resources' | 'vault' | 'scheduler';
export type Theme = 'light' | 'dark';

// #region Performance Utilities
const base64ToBlob = (base64Data: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

const dataUrlToBlobUrl = (dataUrl: string): { blobUrl: string; base64: string; mimeType: string } => {
    const [meta, base64] = dataUrl.split(',');
    if (!meta || !base64) throw new Error("Invalid data URL format.");
    
    const mimeMatch = meta.match(/:(.*?);/);
    if (!mimeMatch) throw new Error("Could not determine image MIME type.");
    const mimeType = mimeMatch[1];
    
    const blob = base64ToBlob(base64, mimeType);
    const blobUrl = URL.createObjectURL(blob);
    
    return { blobUrl, base64, mimeType };
};

export async function upscale(base64: string): Promise<string> {
  const img = new Image();
  img.src = base64;
  await img.decode();
  const canvas = new OffscreenCanvas(img.width * 2, img.height * 2);
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.92 });
  return new Promise(r => {
    const reader = new FileReader();
    reader.onload = () => r(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
// #endregion

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBulkPublishing, setIsBulkPublishing] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [campaignHistory, setCampaignHistory] = useState<ApiResponse[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('generator');
  const [theme, setTheme] = useState<Theme>('dark');
  
  // Viral Vault State
  const [viralTrends, setViralTrends] = useState<ViralPost[] | null>(null);
  const [isVaultLoading, setIsVaultLoading] = useState<boolean>(false);
  const [vaultError, setVaultError] = useState<string | null>(null);

  const [aiConfig, setAiConfig] = useState<AiConfig>({
      provider: AI_PROVIDERS[0].name,
      apiKey: '',
      model: AI_PROVIDERS[0].defaultModel,
      isValidated: false,
  });
  
  const [wordPressConfig, setWordPressConfig] = useState<WordPressConfig>({
      url: '',
      username: '',
      password: '',
      isValidated: false,
  });

  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);

    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Config initialization
    try {
      const savedAiConfig = localStorage.getItem('aiConfig');
      const savedWpConfig = localStorage.getItem('wordPressConfig');
      const savedHistory = localStorage.getItem('campaignHistory');

      if (savedAiConfig) {
        const parsedConfig: AiConfig = JSON.parse(savedAiConfig);
        if (AI_PROVIDERS.some(p => p.name === parsedConfig.provider)) {
          setAiConfig(parsedConfig);
           if (!parsedConfig.isValidated) setActiveView('config');
        } else {
            handleSaveApiConfig(aiConfig);
        }
      } else {
         const geminiProvider = AI_PROVIDERS.find(p => p.name === AiProvider.Gemini);
         const defaultConfig: AiConfig = {
            provider: AiProvider.Gemini,
            apiKey: '',
            model: geminiProvider?.defaultModel || 'gemini-2.5-pro',
            isValidated: true,
         };
         setAiConfig(defaultConfig);
         localStorage.setItem('aiConfig', JSON.stringify(defaultConfig));
      }
      
      if (savedWpConfig) {
        setWordPressConfig(JSON.parse(savedWpConfig));
      }

      if (savedHistory) {
        setCampaignHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
      localStorage.clear();
    }
  }, []);
  
  // Effect to clean up blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (apiResponse) {
        apiResponse.posts.forEach(post => {
          if (post.imageUrl && post.imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(post.imageUrl);
          }
        });
      }
    };
  }, [apiResponse]);


  const toggleTheme = () => {
    setTheme(prevTheme => {
        const newTheme = prevTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        return newTheme;
    });
  };
  
  const handleSaveApiConfig = (newConfig: AiConfig) => {
    setAiConfig(newConfig);
    try {
        localStorage.setItem('aiConfig', JSON.stringify(newConfig));
    } catch (e) {
        console.error("Failed to save AI config to localStorage", e);
    }
    if (newConfig.isValidated) {
        setActiveView('generator');
    }
  };
  
  const handleSaveWordPressConfig = (newConfig: WordPressConfig) => {
    setWordPressConfig(newConfig);
    try {
        localStorage.setItem('wordPressConfig', JSON.stringify(newConfig));
    } catch (e) {
        console.error("Failed to save WordPress config to localStorage", e);
    }
    if (newConfig.isValidated) {
        setActiveView('generator');
    }
  };


  useEffect(() => {
    let interval: number;
    if (isLoading) {
      let i = 0;
      setLoadingMessage(LOADING_MESSAGES[0]);
      interval = window.setInterval(() => {
        i = (i + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[i]);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);


  const saveCampaignToHistory = useCallback((campaign: ApiResponse) => {
    setCampaignHistory(prevHistory => {
      const newHistory = [campaign, ...prevHistory.filter(p => p.id !== campaign.id)].slice(0, 20); // Keep latest 20
      try {
        localStorage.setItem('campaignHistory', JSON.stringify(newHistory));
      } catch (e) {
        console.error("Failed to save campaign history to localStorage", e);
      }
      return newHistory;
    });
  }, []);

  const deleteCampaign = (campaignId: string) => {
    setCampaignHistory(prev => {
        const newHistory = prev.filter(c => c.id !== campaignId);
        localStorage.setItem('campaignHistory', JSON.stringify(newHistory));
        return newHistory;
    });
  };

  const loadCampaign = (campaign: ApiResponse) => {
    setApiResponse(campaign);
    setActiveView('generator');
  }

  const generateAllImages = useCallback(async (posts: GeneratedPost[], currentCampaign: ApiResponse) => {
    let updatedCampaign = { ...currentCampaign };

    const imageGenerationPromises = posts.map((post, index) =>
      generateImageFromPrompt(post, currentCampaign.tone, aiConfig)
        .then(async (dataUrl) => {
          const upscaled = await upscale(dataUrl);
          setApiResponse(prev => {
            if (!prev) return null;
            const newPosts = [...prev.posts];
            const { blobUrl } = dataUrlToBlobUrl(upscaled);
            newPosts[index] = { ...newPosts[index], imageUrl: blobUrl, imageDataUrl: upscaled, imageIsLoading: false, wordpressStatus: 'idle' };
            updatedCampaign = { ...prev, posts: newPosts };
            return updatedCampaign;
          });
        })
        .catch(err => {
          console.error(`Failed to generate image for post ${index}:`, err);
           setApiResponse(prev => {
            if (!prev) return null;
            const newPosts = [...prev.posts];
            newPosts[index] = { ...newPosts[index], imageIsLoading: false, imageUrl: 'error', imageError: (err as Error).message }; // Mark as failed
            updatedCampaign = { ...prev, posts: newPosts };
            return updatedCampaign;
          });
        })
    );
    await Promise.allSettled(imageGenerationPromises);
    saveCampaignToHistory(updatedCampaign);
  }, [aiConfig, saveCampaignToHistory]);

  const regenerateImageForPost = useCallback(async (postIndex: number) => {
    if (!apiResponse) return;

    const postToUpdate = apiResponse.posts[postIndex];
    if (!postToUpdate) return;
    
    // Revoke old blob URL if it exists
    if (postToUpdate.imageUrl && postToUpdate.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(postToUpdate.imageUrl);
    }

    setApiResponse(prev => {
        if (!prev) return null;
        const newPosts = [...prev.posts];
        newPosts[postIndex] = { ...newPosts[postIndex], imageIsLoading: true, imageUrl: undefined, imageDataUrl: undefined, wordpressStatus: 'idle', imageError: undefined };
        return { ...prev, posts: newPosts };
    });

    try {
        const dataUrl = await generateImageFromPrompt(postToUpdate, apiResponse.tone, aiConfig);
        const upscaled = await upscale(dataUrl);
        const { blobUrl } = dataUrlToBlobUrl(upscaled);
        setApiResponse(prev => {
            if (!prev) return null;
            const newPosts = [...prev.posts];
            newPosts[postIndex] = { ...newPosts[postIndex], imageUrl: blobUrl, imageDataUrl: upscaled, imageIsLoading: false };
            const finalCampaign = { ...prev, posts: newPosts };
            saveCampaignToHistory(finalCampaign);
            return finalCampaign;
        });
    } catch (err: any) {
        console.error(`Failed to regenerate image for post ${postIndex}:`, err);
        setApiResponse(prev => {
            if (!prev) return null;
            const newPosts = [...prev.posts];
            newPosts[postIndex] = { ...newPosts[postIndex], imageIsLoading: false, imageUrl: 'error', imageError: err.message };
            return { ...prev, posts: newPosts };
        });
    }
}, [apiResponse, aiConfig, saveCampaignToHistory]);

const handlePublishToWordPress = async (postIndex: number, variationIndex: number): Promise<void> => {
    if (!apiResponse || !wordPressConfig.isValidated) {
        if (!wordPressConfig.isValidated) {
            setError("WordPress Configuration is not validated. Please check your settings.");
            setActiveView('wordpress');
        }
        return;
    }

    const postToPublish = { ...apiResponse.posts[postIndex] };
    
    setApiResponse(prev => {
        if (!prev) return null;
        const newPosts = [...prev.posts];
        newPosts[postIndex] = { ...newPosts[postIndex], wordpressStatus: 'publishing', wordpressError: undefined };
        return { ...prev, posts: newPosts };
    });

    try {
        const postUrl = await publishPostToWordPress(postToPublish, variationIndex, wordPressConfig);
        setApiResponse(prev => {
            if (!prev) return null;
            const newPosts = [...prev.posts];
            newPosts[postIndex] = { ...newPosts[postIndex], wordpressStatus: 'published', wordpressUrl: postUrl };
            const finalCampaign = { ...prev, posts: newPosts };
            saveCampaignToHistory(finalCampaign);
            return finalCampaign;
        });
    } catch (err: any) {
        console.error("WordPress publishing error:", err);
        setApiResponse(prev => {
            if (!prev) return null;
            const newPosts = [...prev.posts];
            newPosts[postIndex] = { ...newPosts[postIndex], wordpressStatus: 'error', wordpressError: err.message };
            const finalCampaign = { ...prev, posts: newPosts };
            saveCampaignToHistory(finalCampaign);
            return finalCampaign;
        });
    }
};

const handlePublishAll = async () => {
    if (!apiResponse || !wordPressConfig.isValidated || isBulkPublishing) return;
    setIsBulkPublishing(true);

    for (const [index] of apiResponse.posts.entries()) {
        const post = apiResponse.posts[index];
        if (post.wordpressStatus !== 'published' && post.imageDataUrl) {
            await handlePublishToWordPress(index, 0); // Using first variation by default for bulk publish
            await new Promise(res => setTimeout(res, 500)); // Rate-limiting delay
        }
    }
    
    setIsBulkPublishing(false);
};
  
  const handleGenerate = useCallback(async (formData: InputFormData) => {
    if (isLoading || !aiConfig.isValidated) {
      if (!aiConfig.isValidated) {
        setError("API Configuration is not validated. Please check your settings.");
        setActiveView('config');
      }
      return;
    }
    setIsLoading(true);
    setError(null);
    setApiResponse(null);

    const campaignId = `campaign_${Date.now()}`;
    let finalResponse: ApiResponse = {
      id: campaignId,
      campaignTitle: formData.topic || formData.sourceUrl,
      timestamp: Date.now(),
      tone: formData.tone,
      topic_analysis: {
        campaign_strategy: "Analyzing topic and formulating strategy...",
        trend_alignment: "Scanning current trends...",
        audience_resonance: "Identifying audience triggers...",
        content_gaps: "Looking for unique opportunities...",
        viral_hooks: [],
      },
      posts: [],
    };

    setApiResponse(finalResponse);

    try {
      const stream = generateViralPostsStream(formData, aiConfig);

      for await (const chunk of stream) {
        if (chunk.type === 'analysis') {
          finalResponse.topic_analysis = chunk.data;
        } else if (chunk.type === 'post') {
          const newPost: GeneratedPost = { ...chunk.data, id: `post_${Date.now()}_${finalResponse.posts.length}`, imageIsLoading: true, wordpressStatus: 'idle', isScheduled: false, rewritingPart: null };
          finalResponse.posts.push(newPost);
        } else if (chunk.type === 'grounding') {
          finalResponse.groundingMetadata = chunk.data;
        }
        setApiResponse({ ...finalResponse, posts: [...finalResponse.posts] });
      }

      setIsLoading(false);
      
      const finalGeneratedCampaign = { ...finalResponse };

      const hasAnalysis = finalGeneratedCampaign.topic_analysis.campaign_strategy !== "Analyzing topic and formulating strategy...";
      const hasPosts = finalGeneratedCampaign.posts.length > 0;

      if (hasAnalysis || hasPosts) {
        saveCampaignToHistory(finalGeneratedCampaign);
        if (hasPosts) {
          // Fire off image generation and scheduling suggestions in parallel
          generateAllImages(finalGeneratedCampaign.posts, finalGeneratedCampaign);
          
          generateSchedulingSuggestions(formData, finalGeneratedCampaign.topic_analysis, aiConfig)
            .then(suggestions => {
              setApiResponse(prev => {
                if (!prev || prev.id !== finalGeneratedCampaign.id) return prev;
                const updatedCampaign = { ...prev, schedulingSuggestions: suggestions };
                saveCampaignToHistory(updatedCampaign);
                return updatedCampaign;
              });
            })
            .catch(err => console.error("Failed to get scheduling suggestions:", err));
        }
      } else {
        throw new Error("Generation process did not produce any content. The AI model may have returned an empty response.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
      setApiResponse(null);
    }
  }, [isLoading, aiConfig, saveCampaignToHistory, generateAllImages]);

  const handleSchedulePost = (postId: string, date: number) => {
    setApiResponse(prev => {
      if (!prev) return null;
      const newPosts = prev.posts.map(p =>
        p.id === postId ? { ...p, isScheduled: true, scheduledDate: date } : p
      );
      const updatedCampaign = { ...prev, posts: newPosts };
      saveCampaignToHistory(updatedCampaign);
      return updatedCampaign;
    });
  };

  const handleUnschedulePost = (postId: string) => {
    setApiResponse(prev => {
      if (!prev) return null;
      const newPosts = prev.posts.map(p =>
        p.id === postId ? { ...p, isScheduled: false, scheduledDate: undefined } : p
      );
      const updatedCampaign = { ...prev, posts: newPosts };
      saveCampaignToHistory(updatedCampaign);
      return updatedCampaign;
    });
  };
  
  const handleGenerateViralTrends = async (niche: string) => {
    if (!aiConfig.isValidated || isVaultLoading) return;
    setIsVaultLoading(true);
    setVaultError(null);
    setViralTrends(null);
    try {
        const trends = await generateViralTrends(niche, aiConfig);
        setViralTrends(trends);
    } catch (err: any) {
        setVaultError(err.message || "An unexpected error occurred.");
    } finally {
        setIsVaultLoading(false);
    }
  };

  const handleRewritePostPart = async (
    postIndex: number,
    variationIndex: number,
    part: 'post_title' | 'post_text' | 'call_to_action' | 'image_prompt',
    instruction: string
  ) => {
    if (!apiResponse) return;

    const postToUpdate = apiResponse.posts[postIndex];
    const partName = part.replace('_', ' ');
    let originalText = '';

    if (part === 'image_prompt') {
        originalText = postToUpdate.image_prompt;
    } else {
        originalText = postToUpdate.variations[variationIndex][part];
    }
    
    // Set loading state
    setApiResponse(prev => {
        if (!prev) return null;
        const newPosts = [...prev.posts];
        newPosts[postIndex] = { ...newPosts[postIndex], rewritingPart: part };
        return { ...prev, posts: newPosts };
    });

    try {
        const newText = await rewriteText(originalText, partName, instruction, aiConfig);

        setApiResponse(prev => {
            if (!prev) return null;
            const newPosts = [...prev.posts];
            const updatedPost = { ...newPosts[postIndex] };
            
            if (part === 'image_prompt') {
                updatedPost.image_prompt = newText;
            } else {
                const newVariations = [...updatedPost.variations];
                newVariations[variationIndex] = { ...newVariations[variationIndex], [part]: newText };
                updatedPost.variations = newVariations;
            }
            
            updatedPost.rewritingPart = null;
            newPosts[postIndex] = updatedPost;
            const finalCampaign = { ...prev, posts: newPosts };
            saveCampaignToHistory(finalCampaign);
            return finalCampaign;
        });

    } catch (err: any) {
        console.error("Rewrite error:", err);
        setError(`Rewrite failed: ${err.message}`);
        // Clear loading state on error
        setApiResponse(prev => {
            if (!prev) return null;
            const newPosts = [...prev.posts];
            newPosts[postIndex] = { ...newPosts[postIndex], rewritingPart: null };
            return { ...prev, posts: newPosts };
        });
    }
  };

  const handleGenerateMoreLikeThis = async (postIndex: number, variationIndex: number) => {
    if (!apiResponse || isLoading) return;

    const sourcePost = apiResponse.posts[postIndex];
    const sourceVariation = sourcePost.variations[variationIndex];
    setIsLoading(true);
    setLoadingMessage("Generating similar content concepts...");

    try {
        const newPostsData = await generateMoreLikeThis(sourcePost, sourceVariation, aiConfig);
        
        const newPosts: GeneratedPost[] = newPostsData.map((p, i) => ({
            ...p,
            id: `post_${Date.now()}_${apiResponse.posts.length + i}`,
            imageIsLoading: true,
            wordpressStatus: 'idle',
            isScheduled: false,
            rewritingPart: null
        }));

        let updatedCampaign: ApiResponse | null = null;
        setApiResponse(prev => {
            if (!prev) return null;
            const combinedPosts = [...prev.posts, ...newPosts];
            updatedCampaign = { ...prev, posts: combinedPosts };
            saveCampaignToHistory(updatedCampaign);
            return updatedCampaign;
        });

        if (updatedCampaign) {
            await generateAllImages(newPosts, updatedCampaign);
        }

    } catch (err: any) {
        console.error("Generate more error:", err);
        setError(`Failed to generate more posts: ${err.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleGenerateClipScript = async (postIndex: number, variationIndex: number) => {
    if (!apiResponse) return;

    const postToUpdate = apiResponse.posts[postIndex];
    const variation = postToUpdate.variations[variationIndex];

    setApiResponse(prev => {
        if (!prev) return null;
        const newPosts = [...prev.posts];
        newPosts[postIndex] = { ...newPosts[postIndex], clipScriptIsLoading: true };
        return { ...prev, posts: newPosts };
    });

    try {
        const script = await generateClipScript(postToUpdate, variation, aiConfig);
        setApiResponse(prev => {
            if (!prev) return null;
            const newPosts = [...prev.posts];
            const updatedPost = { ...newPosts[postIndex], clipScript: script, clipScriptIsLoading: false };
            newPosts[postIndex] = updatedPost;
            const finalCampaign = { ...prev, posts: newPosts };
            saveCampaignToHistory(finalCampaign);
            return finalCampaign;
        });
    } catch (err: any) {
        console.error("Clip script generation error:", err);
        setError(`Failed to generate clip script: ${err.message}`);
        setApiResponse(prev => {
            if (!prev) return null;
            const newPosts = [...prev.posts];
            newPosts[postIndex] = { ...newPosts[postIndex], clipScriptIsLoading: false };
            return { ...prev, posts: newPosts };
        });
    }
  };

  const hasResults = useMemo(() => apiResponse && (apiResponse.posts.length > 0 || apiResponse.topic_analysis.campaign_strategy !== "Analyzing topic and formulating strategy..."), [apiResponse]);
  
  const renderContent = () => {
    // Mobile view switching
    if (activeView === 'history') {
      return (
         <CampaignHistory 
            history={campaignHistory}
            onLoad={loadCampaign}
            onDelete={deleteCampaign}
          />
      );
    }
    if (activeView === 'config' || !aiConfig.isValidated) {
      return (
          <ApiConfigurator
            currentConfig={aiConfig}
            onSave={handleSaveApiConfig}
            onClose={() => setActiveView('generator')}
          />
      );
    }
     if (activeView === 'wordpress') {
      return (
          <WordPressConfigurator
            currentConfig={wordPressConfig}
            onSave={handleSaveWordPressConfig}
            onClose={() => setActiveView('generator')}
          />
      );
    }
     if (activeView === 'resources') {
        return <Resources />;
     }

     if (activeView === 'vault') {
        return (
            <ViralVault 
                onGenerate={handleGenerateViralTrends}
                trends={viralTrends}
                isLoading={isVaultLoading}
                error={vaultError}
            />
        );
     }
     
    if (activeView === 'scheduler') {
        if (apiResponse && apiResponse.posts.length > 0) {
            return (
                <Scheduler
                    campaign={apiResponse}
                    onSchedulePost={handleSchedulePost}
                    onUnschedulePost={handleUnschedulePost}
                />
            );
        } else {
            return (
                <div className="text-center py-12 px-4 mt-8 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">No Active Campaign</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Please generate a campaign first to use the scheduler.
                    </p>
                    <button
                        onClick={() => setActiveView('generator')}
                        className="mt-4 text-sm font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-green-500 hover:from-cyan-500 hover:to-green-400 text-white mx-auto"
                    >
                        Create New Campaign
                    </button>
                </div>
            );
        }
    }

    // Default generator view
    if (isLoading) return <LoadingSpinner message={loadingMessage} />;
    if (error) return (
       <div className="mt-8 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-center animate-fade-in">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 px-4 py-1 bg-red-200 dark:bg-red-600/50 text-red-800 dark:text-white rounded-md hover:bg-red-300 dark:hover:bg-red-500/50"
        >
          Dismiss
        </button>
      </div>
    );

    if (hasResults && apiResponse) {
      return (
        <div className="animate-fade-in">
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => {
                setApiResponse(null);
                setError(null);
                if (!aiConfig.isValidated) setActiveView('config');
              }} 
              className="w-full text-lg font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 to-green-500 hover:from-cyan-500 hover:to-green-400 text-white transform hover:scale-105 active:scale-100"
            >
              Create New Campaign
            </button>
            {wordPressConfig.isValidated && apiResponse.posts.length > 0 && (
                <button 
                  onClick={handlePublishAll}
                  disabled={isBulkPublishing}
                  className="w-full text-lg font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 bg-slate-600 hover:bg-slate-500 text-white transform hover:scale-105 active:scale-100 disabled:bg-slate-500 disabled:opacity-70 disabled:cursor-wait"
                >
                  {isBulkPublishing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                        <span>Publishing...</span>
                      </>
                  ) : (
                      <>
                        <WordPressIcon className="w-6 h-6" />
                        <span>Publish Full Campaign</span>
                      </>
                  )}
                </button>
            )}
          </div>

          <div className="my-8 text-center">
            <a
              href="https://seo-hub.affiliatemarketingforsuccess.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-base md:text-lg font-bold py-4 px-6 rounded-lg transition-all duration-300 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 text-white transform hover:scale-105 active:scale-100 shadow-lg hover:shadow-2xl"
            >
              Dominate Your Niche – Unlock Your Complete AI-Powered SEO Arsenal
            </a>
          </div>
          
          <div className="mt-4">
            <AnalysisDisplay analysis={apiResponse.topic_analysis} groundingMetadata={apiResponse.groundingMetadata} />
          </div>
          {apiResponse.posts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-green-500 dark:from-cyan-400 dark:to-green-400">
                Generated Campaign Content
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {apiResponse.posts.map((post, index) => (
                  <PostCard 
                    key={post.id} 
                    post={post}
                    postIndex={index}
                    schedulingSuggestions={apiResponse.schedulingSuggestions}
                    onRegenerate={() => regenerateImageForPost(index)}
                    onPublish={(variationIndex) => handlePublishToWordPress(index, variationIndex)}
                    isWordPressConfigured={wordPressConfig.isValidated}
                    onNavigateToScheduler={() => setActiveView('scheduler')}
                    onRewrite={(variationIndex, part, instruction) => handleRewritePostPart(index, variationIndex, part, instruction)}
                    onGenerateMore={(variationIndex) => handleGenerateMoreLikeThis(index, variationIndex)}
                    onSchedulePost={handleSchedulePost}
                    onGenerateClipScript={() => handleGenerateClipScript(index, 0)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return <LandingPage onGenerate={handleGenerate} isLoading={isLoading} />;
  }

  return (
    <div className="min-h-screen font-sans transition-colors duration-300 flex flex-col">
      <Header 
        isLandingPage={!hasResults && activeView === 'generator'}
        theme={theme}
        toggleTheme={toggleTheme}
        onToggleHistory={() => setActiveView('history')}
        onToggleApiConfig={() => setActiveView('config')}
        onToggleWordPressConfig={() => setActiveView('wordpress')}
        onToggleResources={() => setActiveView('resources')}
        onToggleViralVault={() => setActiveView('vault')}
        onToggleScheduler={() => setActiveView('scheduler')}
      />
      <main className="container mx-auto px-2 sm:px-4 py-8 pb-24 md:pb-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner message="Loading..." /></div>}>
            {renderContent()}
          </Suspense>
        </div>
      </main>
      
      <BottomNavBar activeView={activeView} setActiveView={setActiveView} />
      <footer className="text-center py-12 sm:py-16 px-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto max-w-4xl flex flex-col items-center gap-8">
            <a href="https://affiliatemarketingforsuccess.com" target="_blank" rel="noopener noreferrer" className="block">
                <img 
                    src="https://affiliatemarketingforsuccess.com/wp-content/uploads/2023/03/cropped-Affiliate-Marketing-for-Success-Logo-Edited.png?lm=6666FEE0" 
                    alt="AffiliateMarketingForSuccess.com Logo" 
                    className="h-14 w-auto transition-transform duration-300 hover:scale-105" 
                />
            </a>

            <div className="text-center">
                <p className="text-base text-slate-700 dark:text-slate-300">
                    This App is Created by <span className="font-semibold text-slate-900 dark:text-slate-100">Alexios Papaioannou</span>
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Owner of <a href="https://affiliatemarketingforsuccess.com" target="_blank" rel="noopener noreferrer" className="font-medium text-green-600 dark:text-green-400 hover:underline">affiliatemarketingforsuccess.com</a>
                </p>
            </div>

            <div className="w-full max-w-2xl text-center">
                 <p className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Explore Key Topics</p>
                 <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <a href="https://affiliatemarketingforsuccess.com/affiliate-marketing" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 dark:hover:text-green-400 hover:underline">Affiliate Marketing</a>
                    <span className="text-slate-300 dark:text-slate-700 select-none">|</span>
                    <a href="https://affiliatemarketingforsuccess.com/ai" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 dark:hover:text-green-400 hover:underline">AI</a>
                    <span className="text-slate-300 dark:text-slate-700 select-none">|</span>
                    <a href="https://affiliatemarketingforsuccess.com/seo" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 dark:hover:text-green-400 hover:underline">SEO</a>
                    <span className="text-slate-300 dark:text-slate-700 select-none">|</span>
                    <a href="https://affiliatemarketingforsuccess.com/blogging" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 dark:hover:text-green-400 hover:underline">Blogging</a>
                    <span className="text-slate-300 dark:text-slate-700 select-none hidden sm:inline">|</span>
                    <a href="https://affiliatemarketingforsuccess.com/review" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 dark:hover:text-green-400 hover:underline">Reviews</a>
                </div>
            </div>

            <div className="pt-8 mt-4 w-full border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    © {new Date().getFullYear()} AffiliateMarketingForSuccess.com. All Rights Reserved.
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;