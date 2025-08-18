import React, { useState, useEffect } from 'react';
import { type WordPressConfig } from '../types';
import { validateWordPressCredentials } from '../services/wordpressService';
import { PublishIcon } from './icons/PublishIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { InfoIcon } from './icons/InfoIcon';

interface WordPressConfiguratorProps {
  currentConfig: WordPressConfig;
  onSave: (newConfig: WordPressConfig) => void;
  onClose: () => void;
}

type ValidationStatus = 'idle' | 'validating' | 'success' | 'error';

export const WordPressConfigurator: React.FC<WordPressConfiguratorProps> = ({ currentConfig, onSave, onClose }) => {
  const [url, setUrl] = useState(currentConfig.url);
  const [username, setUsername] = useState(currentConfig.username);
  const [password, setPassword] = useState(currentConfig.password);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>(currentConfig.isValidated ? 'success' : 'idle');
  const [validationMessage, setValidationMessage] = useState<string>('');

  useEffect(() => {
    setUrl(currentConfig.url);
    setUsername(currentConfig.username);
    setPassword(currentConfig.password);
    setValidationStatus(currentConfig.isValidated ? 'success' : 'idle');
    setValidationMessage(currentConfig.isValidated ? 'WordPress connection is valid.' : '');
  }, [currentConfig]);

  const handleValidateAndSave = async () => {
    setValidationStatus('validating');
    setValidationMessage('Validating connection...');
    
    const tempConfig = { url, username, password, isValidated: false };
    const result = await validateWordPressCredentials(tempConfig);

    if (result.isValid) {
      setValidationStatus('success');
      setValidationMessage('Validation successful! Configuration saved.');
      onSave({ ...tempConfig, isValidated: true });
    } else {
      setValidationStatus('error');
      setValidationMessage(result.error || 'An unknown validation error occurred.');
      onSave({ ...tempConfig, isValidated: false });
    }
  };

  const isSaveDisabled = validationStatus === 'validating' || !url || !username || !password;

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 mt-8 shadow-lg transition-all duration-300 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3"><PublishIcon className="w-6 h-6 text-green-500 dark:text-green-300" /> Publishing Settings</h2>
         {currentConfig.isValidated && (
            <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors md:hidden" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
      </div>

       <div className="bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 p-3 rounded-lg text-sm flex items-start gap-3 border border-slate-200 dark:border-slate-700 mb-4">
            <InfoIcon className="w-5 h-5 flex-shrink-0 text-cyan-500 dark:text-cyan-400 mt-0.5" />
            <p>Connect your WordPress site to publish content directly. You'll need to create an <a href="https://wordpress.org/documentation/article/application-passwords/" target="_blank" rel="noopener noreferrer" className="text-cyan-500 dark:text-cyan-400 hover:underline font-semibold">Application Password</a> in your WordPress user profile.</p>
        </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="wpUrl" className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">WordPress Site URL</label>
          <input
            id="wpUrl"
            type="url"
            value={url}
            onChange={e => { setUrl(e.target.value); setValidationStatus('idle'); }}
            placeholder="https://yourblog.com"
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-green-500 focus:border-green-500 transition-all"
          />
        </div>

        <div>
          <label htmlFor="wpUsername" className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">WordPress Username</label>
          <input
            id="wpUsername"
            type="text"
            value={username}
            onChange={e => { setUsername(e.target.value); setValidationStatus('idle'); }}
            placeholder="Your WordPress username"
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-green-500 focus:border-green-500 transition-all"
          />
        </div>

        <div>
          <label htmlFor="wpPassword" className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">Application Password</label>
          <input
            id="wpPassword"
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setValidationStatus('idle'); }}
            placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-green-500 focus:border-green-500 transition-all"
          />
        </div>
        
        <div>
          <button
            onClick={handleValidateAndSave}
            disabled={isSaveDisabled}
            className="w-full font-bold py-2.5 px-5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed enabled:active:scale-95"
          >
            {validationStatus === 'validating' ? 'Validating...' : 'Validate & Save Connection'}
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