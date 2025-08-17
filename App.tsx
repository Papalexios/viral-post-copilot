


import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { PostCard } from './components/PostCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { CampaignHistory } from './components/CampaignHistory';
import { ApiConfigurator } from './components/ApiConfigurator';
import { AiProvider, type ApiResponse, type GeneratedPost, type InputFormData, type AiConfig } from './types';
import { generateViralPostsStream, generateImageFromPrompt } from './services/aiService';
import { AI_PROVIDERS } from './constants';

const LOADING_MESSAGES = [
  "Querying AI for the latest trends...",
  "Analyzing audience sentiment and engagement patterns...",
  "Identifying strategic content opportunities...",
  "Building a high-impact campaign framework...",
  "Crafting compelling post variations...",
  "Art-directing scroll-stopping visuals...",
  "Finalizing viral strategy...",
];

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [campaignHistory, setCampaignHistory] = useState<ApiResponse[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isApiConfigOpen, setIsApiConfigOpen] = useState<boolean>(false);
  
  const [aiConfig, setAiConfig] = useState<AiConfig>({
      provider: AI_PROVIDERS[0].name,
      apiKey: '',
      model: AI_PROVIDERS[0].defaultModel,
      isValidated: false,
  });

  // Load settings from localStorage on initial render
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('aiConfig');
      const savedHistory = localStorage.getItem('campaignHistory');

      if (savedConfig) {
        const parsedConfig: AiConfig = JSON.parse(savedConfig);
        // Ensure provider exists, otherwise default
        if (AI_PROVIDERS.some(p => p.name === parsedConfig.provider)) {
          setAiConfig(parsedConfig);
        } else {
            handleSaveApiConfig(aiConfig); // save default
        }
      } else {
         // If no config, default to Gemini (which is pre-configured)
         const defaultConfig: AiConfig = {
            provider: AiProvider.Gemini,
            apiKey: '',
            model: 'gemini-2.5-flash',
            isValidated: true, // Gemini is pre-configured
         };
         setAiConfig(defaultConfig);
         localStorage.setItem('aiConfig', JSON.stringify(defaultConfig));
      }

      if (savedHistory) {
        setCampaignHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
      localStorage.clear(); // Clear corrupted storage
    }
  }, []);
  
  const handleSaveApiConfig = (newConfig: AiConfig) => {
    setAiConfig(newConfig);
    try {
        localStorage.setItem('aiConfig', JSON.stringify(newConfig));
    } catch (e) {
        console.error("Failed to save AI config to localStorage", e);
    }
    if (newConfig.isValidated) {
        setIsApiConfigOpen(false);
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


  const saveCampaignToHistory = (campaign: ApiResponse) => {
    setCampaignHistory(prevHistory => {
      const newHistory = [campaign, ...prevHistory.filter(p => p.id !== campaign.id)].slice(0, 20); // Keep latest 20
      try {
        localStorage.setItem('campaignHistory', JSON.stringify(newHistory));
      } catch (e) {
        console.error("Failed to save campaign history to localStorage", e);
      }
      return newHistory;
    });
  };

  const deleteCampaign = (campaignId: string) => {
    setCampaignHistory(prev => {
        const newHistory = prev.filter(c => c.id !== campaignId);
        localStorage.setItem('campaignHistory', JSON.stringify(newHistory));
        return newHistory;
    });
  };

  const loadCampaign = (campaign: ApiResponse) => {
    setApiResponse(campaign);
    setShowHistory(false);
  }

  const generateAllImages = async (posts: GeneratedPost[], currentCampaign: ApiResponse) => {
    let updatedCampaign = { ...currentCampaign };

    const imageGenerationPromises = posts.map((post, index) =>
      generateImageFromPrompt(post.image_prompt, aiConfig)
        .then(imageUrl => {
          setApiResponse(prev => {
            if (!prev) return null;
            const newPosts = [...prev.posts];
            newPosts[index] = { ...newPosts[index], imageUrl, imageIsLoading: false };
            updatedCampaign = { ...prev, posts: newPosts };
            return updatedCampaign;
          });
        })
        .catch(err => {
          console.error(`Failed to generate image for post ${index}:`, err);
           setApiResponse(prev => {
            if (!prev) return null;
            const newPosts = [...prev.posts];
            newPosts[index] = { ...newPosts[index], imageIsLoading: false, imageUrl: 'error' }; // Mark as failed
            updatedCampaign = { ...prev, posts: newPosts };
            return updatedCampaign;
          });
        })
    );
    await Promise.allSettled(imageGenerationPromises);
    saveCampaignToHistory(updatedCampaign);
  };

  const regenerateImageForPost = async (postIndex: number) => {
    if (!apiResponse) return;

    const postToUpdate = apiResponse.posts[postIndex];
    if (!postToUpdate) return;

    setApiResponse(prev => {
        if (!prev) return null;
        const newPosts = [...prev.posts];
        newPosts[postIndex] = { ...newPosts[postIndex], imageIsLoading: true, imageUrl: undefined };
        return { ...prev, posts: newPosts };
    });

    try {
        const imageUrl = await generateImageFromPrompt(postToUpdate.image_prompt, aiConfig);
        setApiResponse(prev => {
            if (!prev) return null;
            const newPosts = [...prev.posts];
            newPosts[postIndex] = { ...newPosts[postIndex], imageUrl, imageIsLoading: false };
            const finalCampaign = { ...prev, posts: newPosts };
            saveCampaignToHistory(finalCampaign);
            return finalCampaign;
        });
    } catch (err) {
        console.error(`Failed to regenerate image for post ${postIndex}:`, err);
        setApiResponse(prev => {
            if (!prev) return null;
            const newPosts = [...prev.posts];
            newPosts[postIndex] = { ...newPosts[postIndex], imageIsLoading: false, imageUrl: 'error' };
            return { ...prev, posts: newPosts };
        });
    }
};
  
  const handleGenerate = useCallback(async (formData: InputFormData) => {
    if (isLoading || !aiConfig.isValidated) {
      if (!aiConfig.isValidated) {
        setError("API Configuration is not validated. Please check your settings.");
        setIsApiConfigOpen(true);
      }
      return;
    }
    setIsLoading(true);
    setError(null);
    setApiResponse(null);

    const campaignId = `campaign_${Date.now()}`;
    // Create a mutable object to hold the response as it builds
    let finalResponse: ApiResponse = {
      id: campaignId,
      campaignTitle: formData.topic || formData.sourceUrl,
      timestamp: Date.now(),
      topic_analysis: {
        campaign_strategy: "Analyzing topic and formulating strategy...",
        trend_alignment: "Scanning current trends...",
        audience_resonance: "Identifying audience triggers...",
        content_gaps: "Looking for unique opportunities...",
        viral_hooks: [],
      },
      posts: [],
    };

    // Set initial state for the UI
    setApiResponse(finalResponse);

    try {
      const stream = generateViralPostsStream(formData, aiConfig);

      for await (const chunk of stream) {
        if (chunk.type === 'analysis') {
          finalResponse.topic_analysis = chunk.data;
        } else if (chunk.type === 'post') {
          const newPost: GeneratedPost = { ...chunk.data, imageIsLoading: true };
          finalResponse.posts.push(newPost);
        } else if (chunk.type === 'grounding') {
          finalResponse.groundingMetadata = chunk.data;
        }

        // Update the UI with a new object to trigger re-render
        setApiResponse({ ...finalResponse, posts: [...finalResponse.posts] });
      }

      setIsLoading(false);

      const hasAnalysis = finalResponse.topic_analysis.campaign_strategy !== "Analyzing topic and formulating strategy...";
      const hasPosts = finalResponse.posts.length > 0;

      if (hasAnalysis || hasPosts) {
        saveCampaignToHistory(finalResponse);
        if (hasPosts) {
          await generateAllImages(finalResponse.posts, finalResponse);
        }
      } else {
        // Only throw an error if we received no meaningful content at all.
        throw new Error("Generation process did not produce any content. The AI model may have returned an empty response.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
      setApiResponse(null); // Clear partial results from UI on error
    }
  }, [isLoading, aiConfig]);
  
  const hasResults = useMemo(() => apiResponse && (apiResponse.posts.length > 0 || apiResponse.topic_analysis.campaign_strategy !== "Analyzing topic and formulating strategy..."), [apiResponse]);
  const showInputForm = !hasResults && !isLoading && aiConfig.isValidated && !isApiConfigOpen;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <Header 
        onToggleHistory={() => setShowHistory(prev => !prev)} 
        onToggleApiConfig={() => setIsApiConfigOpen(prev => !prev)}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <CampaignHistory 
            isOpen={showHistory}
            history={campaignHistory}
            onLoad={loadCampaign}
            onDelete={deleteCampaign}
            onClose={() => setShowHistory(false)}
          />

          {(isApiConfigOpen || !aiConfig.isValidated) && (
              <ApiConfigurator
                currentConfig={aiConfig}
                onSave={handleSaveApiConfig}
              />
          )}

          {showInputForm && <InputForm onGenerate={handleGenerate} isLoading={isLoading} />}
          
          {isLoading && <LoadingSpinner message={loadingMessage} />}
          
          {error && (
            <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {hasResults && apiResponse && (
            <div className="animate-fade-in">
              <button 
                onClick={() => {
                  setApiResponse(null);
                  setError(null);
                  if (!aiConfig.isValidated) setIsApiConfigOpen(true);
                }} 
                className="mb-8 w-full text-lg font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white transform hover:scale-105"
              >
                Create New Campaign
              </button>

              <div className="mt-4">
                <AnalysisDisplay analysis={apiResponse.topic_analysis} groundingMetadata={apiResponse.groundingMetadata} />
              </div>

              {apiResponse.posts.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                    Generated Campaign Content
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {apiResponse.posts.map((post, index) => (
                      <PostCard 
                        key={`${apiResponse.id}-${index}`} 
                        post={post} 
                        onRegenerate={() => regenerateImageForPost(index)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>Powered by AI. Built by a World-Class Senior Frontend Engineer.</p>
      </footer>
    </div>
  );
};

export default App;
