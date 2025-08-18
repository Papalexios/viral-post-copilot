

import React, { useState, useEffect } from 'react';
import { AiProvider, type AiConfig } from '../types';
import { AI_PROVIDERS } from '../constants';
import { validateApiKey } from '../services/aiService';
import { KeyIcon } from './icons/KeyIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { InfoIcon } from './icons/InfoIcon';

interface ApiConfiguratorProps {
  currentConfig: AiConfig;
  onSave: (newConfig: AiConfig) => void;
  onClose: () => void;
}

type ValidationStatus = 'idle' | 'validating' | 'success' | 'error';

export const ApiConfigurator: React.FC<ApiConfiguratorProps> = ({ currentConfig, onSave, onClose }) => {
  const [provider, setProvider] = useState<AiProvider>(currentConfig.provider);
  const [apiKey, setApiKey] = useState<string>(currentConfig.apiKey);
  const [model, setModel] = useState<string>(currentConfig.model);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>(currentConfig.isValidated ? 'success' : 'idle');
  const [validationMessage, setValidationMessage] = useState<string>('');
  
  const providerInfo = AI_PROVIDERS.find(p => p.name === provider);
  const isGemini = provider === AiProvider.Gemini;

  useEffect(() => {
    setProvider(currentConfig.provider);
    setApiKey(currentConfig.apiKey);
    setModel(currentConfig.model);
    setValidationStatus(currentConfig.isValidated ? 'success' : 'idle');
    if (currentConfig.isValidated) {
      setValidationMessage(currentConfig.provider === AiProvider.Gemini ? 'Google Gemini is ready (pre-configured).' : 'API Key is valid.');
    } else {
      setValidationMessage('');
    }
  }, [currentConfig]);

  const handleProviderChange = (newProvider: AiProvider) => {
    setProvider(newProvider);
    const newProviderInfo = AI_PROVIDERS.find(p => p.name === newProvider);
    setModel(newProviderInfo?.defaultModel || '');
    setApiKey('');
    setValidationStatus('idle');
    setValidationMessage('');
  };

  const handleValidateAndSave = async () => {
    setValidationStatus('validating');
    setValidationMessage('Validating...');

    const result = await validateApiKey(provider, apiKey, model);

    if (result.isValid) {
      setValidationStatus('success');
      setValidationMessage('Validation successful! Configuration saved.');
      onSave({ provider, apiKey, model, isValidated: true });
    } else {
      setValidationStatus('error');
      setValidationMessage(result.error || 'An unknown error occurred.');
      onSave({ provider, apiKey, model, isValidated: false });
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 mt-8 shadow-lg transition-all duration-300 animate-fade-in">
      <div className="flex justify-between items-center mb-1">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3"><KeyIcon className="w-6 h-6 text-yellow-500 dark:text-yellow-300" /> API Configuration</h2>
          {currentConfig.isValidated && (
            <button
                onClick={onClose}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors md:hidden"
                aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          )}
      </div>
      {!currentConfig.isValidated && (
         <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4">Please configure a valid API key to begin generating content.</p>
      )}


      <div className="space-y-4">
        <div>
          <label htmlFor="provider" className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">AI Provider</label>
          <select
            id="provider"
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value as AiProvider)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
          >
            {AI_PROVIDERS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        
        {isGemini ? (
             <div className="bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 p-3 rounded-lg text-sm flex items-center gap-3 border border-slate-200 dark:border-slate-700">
                <InfoIcon className="w-5 h-5 flex-shrink-0 text-cyan-500 dark:text-cyan-400" />
                <p>Google Gemini is pre-configured for use. You can optionally add your own key to use a different model.</p>
            </div>
        ) : null}

        <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">
                API Key {isGemini && '(Optional)'}
                {providerInfo && (
                    <a href={providerInfo.apiKeyUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-cyan-500 dark:text-cyan-400 hover:underline text-xs">(Get Key)</a>
                )}
            </label>
           <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setValidationStatus('idle');
            }}
            placeholder={`Enter your ${provider} API Key`}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
          />
        </div>

        {provider === AiProvider.OpenRouter && (
            <div>
                 <label htmlFor="model" className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">Model Name (from OpenRouter)</label>
                 <input
                    id="model"
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g., google/gemini-flash-1.5"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
            </div>
        )}

        <div>
          <button
            onClick={handleValidateAndSave}
            disabled={validationStatus === 'validating' || (provider !== AiProvider.Gemini && !apiKey)}
            className="w-full font-bold py-2.5 px-5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed enabled:active:scale-95"
          >
            {validationStatus === 'validating' ? 'Validating...' : 'Validate & Save'}
          </button>
        </div>
        
        {validationStatus !== 'idle' && validationMessage && (
            <div className={`flex items-center gap-3 p-3 rounded-lg text-sm mt-2 transition-all ${
                validationStatus === 'success' ? 'bg-green-50 dark:bg-green-900/50 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700' : ''
            } ${
                validationStatus === 'error' ? 'bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700' : ''
            } ${
                validationStatus === 'validating' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700 animate-pulse' : ''
            }`}>
                {validationStatus === 'success' && <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />}
                {validationStatus === 'error' && <XCircleIcon className="w-5 h-5 flex-shrink-0" />}
                {validationStatus === 'validating' && <div className="w-4 h-4 border-2 border-slate-400 dark:border-slate-500 border-t-slate-700 dark:border-t-white rounded-full animate-spin"></div>}
                <p className="flex-1">{validationMessage}</p>
            </div>
        )}
      </div>
    </div>
  );
};