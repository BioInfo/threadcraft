'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture: {
    modality: string;
  };
}

// Popular models based on the API response - focusing on well-known, capable models
const POPULAR_MODELS: OpenRouterModel[] = [
  {
    id: 'anthropic/claude-4.0-sonnet',
    name: 'Claude 4.0 Sonnet',
    description: 'Anthropic\'s latest and most capable model with excellent reasoning, coding, and creative writing abilities.',
    pricing: { prompt: '3.00', completion: '15.00' },
    context_length: 200000,
    architecture: { modality: 'text+image->text' }
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'A powerful and versatile model from Anthropic, great for a wide range of tasks.',
    pricing: { prompt: '3.00', completion: '15.00' },
    context_length: 200000,
    architecture: { modality: 'text+image->text' }
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Google\'s state-of-the-art model with advanced reasoning and multimodal capabilities.',
    pricing: { prompt: '12.50', completion: '37.50' },
    context_length: 1000000,
    architecture: { modality: 'text+image->text' }
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI\'s flagship multimodal model with strong performance across all tasks.',
    pricing: { prompt: '2.50', completion: '10.00' },
    context_length: 128000,
    architecture: { modality: 'text+image->text' }
  },
  {
    id: 'openai/o3-mini-high',
    name: 'OpenAI o3 Mini High',
    description: 'OpenAI\'s o3-mini-high reasoning model: cost-effective with strong reasoning capabilities.',
    pricing: { prompt: '1.00', completion: '3.00' },
    context_length: 200000,
    architecture: { modality: 'text+image->text' }
  },
  {
    id: 'mistralai/mistral-large-2407',
    name: 'Mistral Large 2407',
    description: 'Mistral\'s flagship model with excellent multilingual support and reasoning.',
    pricing: { prompt: '2.00', completion: '6.00' },
    context_length: 131072,
    architecture: { modality: 'text->text' }
  },
  {
    id: 'x-ai/grok-4',
    name: 'Grok 4',
    description: 'xAI\'s latest reasoning model with a large context window and multimodal capabilities.',
    pricing: { prompt: '3.00', completion: '15.00' },
    context_length: 256000,
    architecture: { modality: 'text+image->text' }
  },
  {
    id: 'qwen/qwen3-235b-a22b-thinking-2507',
    name: 'Qwen 3.2 235B',
    description: 'A large-scale model from Alibaba Cloud with advanced thinking and reasoning capabilities.',
    pricing: { prompt: '0.12', completion: '0.12' },
    context_length: 262144,
    architecture: { modality: 'text->text' }
  },
  {
    id: 'z-ai/glm-4.5',
    name: 'GLM 4.5',
    description: 'A powerful new model from Zhipu AI with strong performance in various tasks.',
    pricing: { prompt: '0.20', completion: '0.20' },
    context_length: 131072,
    architecture: { modality: 'text->text' }
  },
  {
    id: 'deepseek/deepseek-r1-0528',
    name: 'DeepSeek R1 0528',
    description: 'An open-source model with performance on par with leading proprietary models.',
    pricing: { prompt: '0.27', completion: '0.27' },
    context_length: 163840,
    architecture: { modality: 'text->text' }
  }
];

export default function ConfigPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load saved config on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openrouter_api_key');
    const savedModel = localStorage.getItem('openrouter_model');
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
      // Automatically test connection if API key is loaded
      testConnection(savedApiKey);
    }
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  const testConnection = async (keyToTest: string) => {
    if (!keyToTest.trim()) {
      setStatusMessage({ type: 'error', message: 'Please enter an API key' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    setIsConnected(false);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${keyToTest}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setStatusMessage({ type: 'success', message: 'Connection successful!' });
        setIsConnected(true);
        localStorage.setItem('openrouter_api_key', keyToTest);
      } else {
        const errorData = await response.json();
        setStatusMessage({ type: 'error', message: errorData.error?.message || 'Invalid API key or connection failed' });
        localStorage.removeItem('openrouter_api_key');
      }
    } catch (error) {
      setStatusMessage({ type: 'error', message: 'Network error occurred' });
      localStorage.removeItem('openrouter_api_key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    testConnection(apiKey);
  };

  const handleDisconnect = () => {
    setApiKey('');
    setIsConnected(false);
    setStatusMessage(null);
    localStorage.removeItem('openrouter_api_key');
    localStorage.removeItem('openrouter_model');
  };

  const saveConfig = () => {
    if (!isConnected) {
      setStatusMessage({ type: 'error', message: 'Please connect to OpenRouter first' });
      return;
    }

    if (!selectedModel) {
      setStatusMessage({ type: 'error', message: 'Please select a model' });
      return;
    }

    // Save to localStorage
    localStorage.setItem('openrouter_model', selectedModel);

    setStatusMessage({ type: 'success', message: 'Configuration saved successfully!' });

    // Redirect to home page after a short delay
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num === 0) return 'Free';
    return `$${num.toFixed(2)}/1M tokens`;
  };

  const formatContextLength = (length: number) => {
    if (length >= 1000000) return `${(length / 1000000).toFixed(1)}M tokens`;
    if (length >= 1000) return `${(length / 1000).toFixed(0)}K tokens`;
    return `${length} tokens`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
      <Header />
      <div className="max-w-4xl mx-auto flex-1 w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">OpenRouter Configuration</h1>
          <p className="text-gray-600">
            Connect your OpenRouter account and select your preferred AI model.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connect to OpenRouter</h2>
          
          <div className="flex items-center space-x-4 mb-4">
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isConnected}
            />
            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={isLoading || !apiKey.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Connecting...' : 'Connect'}
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
          
          <div className="h-6">
            {statusMessage && (
              <div
                className={`text-sm ${
                  statusMessage.type === 'success'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {statusMessage.message}
              </div>
            )}
          </div>
        </div>

        {isConnected && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select AI Model</h2>
            <p className="text-gray-600 mb-6">
              Choose from popular AI models available on OpenRouter. Each model has different strengths and pricing.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {POPULAR_MODELS.map((model) => (
                <div
                  key={model.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedModel === model.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{model.name}</h3>
                    <input
                      type="radio"
                      checked={selectedModel === model.id}
                      onChange={() => setSelectedModel(model.id)}
                      className="mt-1"
                    />
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                  
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Input:</span>
                      <span>{formatPrice(model.pricing.prompt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Output:</span>
                      <span>{formatPrice(model.pricing.completion)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Context:</span>
                      <span>{formatContextLength(model.context_length)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="capitalize">
                        {model.architecture.modality.includes('image') ? 'Multimodal' : 'Text'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveConfig}
                disabled={!selectedModel}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Save Configuration
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}