
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { PostCard } from './components/PostCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { CampaignHistory } from './components/CampaignHistory';
import { ApiConfigurator } from './components/ApiConfigurator';
import { WordPressConfigurator } from './components/WordPressConfigurator';
import { BottomNavBar } from './components/BottomNavBar';
import { Resources } from './components/Resources';
import { AiProvider, type ApiResponse, type GeneratedPost, type InputFormData, type AiConfig, type WordPressConfig } from './types';
import { generateViralPostsStream, generateImageFromPrompt } from './services/aiService';
import { publishPostToWordPress } from './services/wordpressService';
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

export type ActiveView = 'generator' | 'history' | 'config' | 'wordpress' | 'resources';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [campaignHistory, setCampaignHistory] = useState<ApiResponse[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('generator');
  
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
    try {
      const savedAiConfig = localStorage.getItem('aiConfig');
      const savedWpConfig = localStorage.getItem('wordPressConfig');
      const savedHistory = localStorage.getItem('campaignHistory');

      // AI Config Loading
      if (savedAiConfig) {
        const parsedConfig: AiConfig = JSON.parse(savedAiConfig);
        if (AI_PROVIDERS.some(p => p.name === parsedConfig.provider)) {
          setAiConfig(parsedConfig);
           if (!parsedConfig.isValidated) setActiveView('config');
        } else {
            handleSaveApiConfig(aiConfig);
        }
      } else {
         const defaultConfig: AiConfig = {
            provider: AiProvider.Gemini,
            apiKey: '',
            model: 'gemini-2.5-flash',
            isValidated: true,
         };
         setAiConfig(defaultConfig);
         localStorage.setItem('aiConfig', JSON.stringify(defaultConfig));
      }
      
      // WordPress Config Loading
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
    setActiveView('generator');
  }

  const generateAllImages = async (posts: GeneratedPost[], currentCampaign: ApiResponse) => {
    let updatedCampaign = { ...currentCampaign };

    const imageGenerationPromises = posts.map((post, index) =>
      generateImageFromPrompt(post.image_prompt, aiConfig)
        .then(imageUrl => {
          setApiResponse(prev => {
            if (!prev) return null;
            const newPosts = [...prev.posts];
            newPosts[index] = { ...newPosts[index], imageUrl, imageIsLoading: false, wordpressStatus: 'idle' };
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
        newPosts[postIndex] = { ...newPosts[postIndex], imageIsLoading: true, imageUrl: undefined, wordpressStatus: 'idle' };
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

const handlePublishToWordPress = async (postIndex: number, variationIndex: number) => {
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
          const newPost: GeneratedPost = { ...chunk.data, imageIsLoading: true, wordpressStatus: 'idle' };
          finalResponse.posts.push(newPost);
        } else if (chunk.type === 'grounding') {
          finalResponse.groundingMetadata = chunk.data;
        }
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
        throw new Error("Generation process did not produce any content. The AI model may have returned an empty response.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
      setApiResponse(null);
    }
  }, [isLoading, aiConfig]);
  
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

    // Default generator view
    if (isLoading) return <LoadingSpinner message={loadingMessage} />;
    if (error) return (
       <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center animate-fade-in">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 px-4 py-1 bg-red-600/50 text-white rounded-md hover:bg-red-500/50"
        >
          Dismiss
        </button>
      </div>
    );

    if (hasResults && apiResponse) {
      return (
        <div className="animate-fade-in">
          <button 
            onClick={() => {
              setApiResponse(null);
              setError(null);
              if (!aiConfig.isValidated) setActiveView('config');
            }} 
            className="mb-6 w-full text-lg font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 to-green-500 hover:from-cyan-500 hover:to-green-400 text-white transform hover:scale-105 active:scale-100"
          >
            Create New Campaign
          </button>
          <div className="mt-4">
            <AnalysisDisplay analysis={apiResponse.topic_analysis} groundingMetadata={apiResponse.groundingMetadata} />
          </div>
          {apiResponse.posts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-green-400">
                Generated Campaign Content
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {apiResponse.posts.map((post, index) => (
                  <PostCard 
                    key={`${apiResponse.id}-${index}`} 
                    post={post} 
                    onRegenerate={() => regenerateImageForPost(index)}
                    onPublish={(variationIndex) => handlePublishToWordPress(index, variationIndex)}
                    isWordPressConfigured={wordPressConfig.isValidated}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return <InputForm onGenerate={handleGenerate} isLoading={isLoading} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <Header 
        onToggleHistory={() => setActiveView('history')}
        onToggleApiConfig={() => setActiveView('config')}
        onToggleWordPressConfig={() => setActiveView('wordpress')}
        onToggleResources={() => setActiveView('resources')}
      />
      <main className="container mx-auto px-2 sm:px-4 py-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
      <BottomNavBar activeView={activeView} setActiveView={setActiveView} />
      <footer className="text-center py-6 text-slate-500 text-sm px-4">
        <p>An AI Tool by <a href="https://affiliatemarketingforsuccess.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-green-400 hover:underline">AffiliateMarketingForSuccess.com</a></p>
        <p className="mt-1">Learn more about <a href="https://affiliatemarketingforsuccess.com/blog/" target="_blank" rel="noopener noreferrer" className="hover:underline">Affiliate Marketing</a>, <a href="https://affiliatemarketingforsuccess.com/seo/" target="_blank" rel="noopener noreferrer" className="hover:underline">SEO</a>, and <a href="https://affiliatemarketingforsuccess.com/ai/" target="_blank" rel="noopener noreferrer" className="hover:underline">AI Content Generation</a>.</p>
      </footer>
    </div>
  );
};

export default App;