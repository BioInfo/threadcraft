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
  custom?: boolean; // mark user-added models
}

// Popular models based on the API response - focusing on well-known, capable models
const LOCAL_CUSTOM_MODELS_KEY = 'openrouter_custom_models';

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

  // Custom model state
  const [customModels, setCustomModels] = useState<OpenRouterModel[]>([]);
  const [newModelId, setNewModelId] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelDescription, setNewModelDescription] = useState('');
  const [modelCheckMessage, setModelCheckMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<null | {
    latencyMs: number;
    inputTokens: number;
    outputTokens: number;
    inputCost: string;
    outputCost: string;
    preview: string;
  }>(null);

  // Load saved config on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openrouter_api_key');
    const savedModel = localStorage.getItem('openrouter_model');
    const savedCustom = localStorage.getItem(LOCAL_CUSTOM_MODELS_KEY);

    if (savedApiKey) {
      setApiKey(savedApiKey);
      // Automatically test connection if API key is loaded
      testConnection(savedApiKey);
    }
    if (savedModel) {
      setSelectedModel(savedModel);
    }
    if (savedCustom) {
      try {
        const parsed: OpenRouterModel[] = JSON.parse(savedCustom);
        setCustomModels(parsed);
      } catch {
        // ignore parse error
      }
    }
  }, []);

  // persist custom models
  useEffect(() => {
    localStorage.setItem(LOCAL_CUSTOM_MODELS_KEY, JSON.stringify(customModels));
  }, [customModels]);

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

  // Utility: simple ID format validation (openrouter style "provider/model")
  const isValidModelIdFormat = (id: string) => {
    // allow things like "openai/gpt-4o", "openrouter/xyz-model", "provider/name:variant"
    return /^[a-z0-9][a-z0-9-]*\/[A-Za-z0-9._:-]+$/.test(id.trim());
  };

  // Fetch models list and verify existence
  const verifyModelAvailability = async (id: string, key: string) => {
    const resp = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to fetch models from OpenRouter');
    }
    const data = await resp.json();
    const found = Array.isArray(data?.data)
      ? data.data.find((m: any) => m?.id === id)
      : undefined;
    return found as OpenRouterModel | undefined;
  };

  const addCustomModel = async () => {
    setModelCheckMessage(null);
    setTestResult(null);
    const id = newModelId.trim();
    const displayName = newModelName.trim();
    const desc = newModelDescription.trim();

    if (!apiKey) {
      setModelCheckMessage({ type: 'error', message: 'Connect your OpenRouter API key first.' });
      return;
    }
    if (!isValidModelIdFormat(id)) {
      setModelCheckMessage({ type: 'error', message: 'Invalid format. Use provider/model (e.g., openrouter/xyz-model).' });
      return;
    }
    if (!displayName) {
      setModelCheckMessage({ type: 'error', message: 'Please provide a display name for the custom model.' });
      return;
    }
    try {
      const available = await verifyModelAvailability(id, apiKey);
      if (!available) {
        setModelCheckMessage({ type: 'error', message: 'Model ID not found on your OpenRouter account. Check spelling or access.' });
        return;
      }
      const model: OpenRouterModel = {
        id,
        name: displayName,
        description: desc || (available as any)?.description || 'Custom model',
        pricing: (available as any)?.pricing ?? { prompt: '0', completion: '0' },
        context_length: (available as any)?.context_length ?? 128000,
        architecture: { modality: (available as any)?.architecture?.modality ?? 'text->text' },
        custom: true,
      };
      // dedupe by id
      setCustomModels(prev => {
        const filtered = prev.filter(m => m.id !== id);
        return [...filtered, model];
      });
      setModelCheckMessage({ type: 'success', message: 'Model added successfully. You can select it below.' });
      setNewModelId('');
      setNewModelName('');
      setNewModelDescription('');
    } catch (e: any) {
      setModelCheckMessage({ type: 'error', message: e.message || 'Validation failed.' });
    }
  };

  const removeCustomModel = (id: string) => {
    setCustomModels(prev => prev.filter(m => m.id !== id));
    if (selectedModel === id) {
      setSelectedModel('');
      localStorage.removeItem('openrouter_model');
    }
  };

  // Run a lightweight sample request against selected or provided model id
  const testCustomModel = async (id: string) => {
    if (!apiKey) {
      setModelCheckMessage({ type: 'error', message: 'Connect your OpenRouter API key first.' });
      return;
    }
    setIsTesting(true);
    setModelCheckMessage(null);
    setTestResult(null);
    const start = performance.now();
    try {
      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
          'X-Title': 'ThreadCraft',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: id,
          messages: [{ role: 'user', content: 'Say hello in one short sentence.' }],
          max_tokens: 64,
        }),
      });

      const end = performance.now();
      const latencyMs = Math.max(1, Math.round(end - start));

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Test request failed');
      }
      const data = await resp.json();
      const preview = data?.choices?.[0]?.message?.content ?? '(no content)';
      // OpenRouter sometimes includes usage cost fields; fallback to 0
      const inputTokens = data?.usage?.prompt_tokens ?? 0;
      const outputTokens = data?.usage?.completion_tokens ?? 0;
      const inputCost = data?.usage?.prompt_cost ?? '0';
      const outputCost = data?.usage?.completion_cost ?? '0';

      setTestResult({
        latencyMs,
        inputTokens,
        outputTokens,
        inputCost: typeof inputCost === 'number' ? `$${inputCost.toFixed(4)}` : String(inputCost),
        outputCost: typeof outputCost === 'number' ? `$${Number(outputCost).toFixed(4)}` : String(outputCost),
        preview: typeof preview === 'string' ? preview : JSON.stringify(preview),
      });
      setModelCheckMessage({ type: 'success', message: 'Test succeeded.' });
    } catch (e: any) {
      setModelCheckMessage({ type: 'error', message: e.message || 'Test failed.' });
    } finally {
      setIsTesting(false);
    }
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

            {/* Custom models section */}
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Custom Models</h3>
              <p className="text-gray-600 mb-4">
                Add your own model by pasting its OpenRouter Model ID. We’ll validate it and list it alongside built-ins with a “Custom” tag.
              </p>

              <div className="grid gap-3 md:grid-cols-3">
                <input
                  type="text"
                  value={newModelId}
                  onChange={(e) => setNewModelId(e.target.value)}
                  placeholder="OpenRouter Model ID (e.g., openrouter/xyz-model)"
                  aria-label="OpenRouter Model ID"
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="Display Name"
                  aria-label="Custom Model Display Name"
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  value={newModelDescription}
                  onChange={(e) => setNewModelDescription(e.target.value)}
                  placeholder="Optional Description"
                  aria-label="Custom Model Description"
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mt-3 flex gap-3">
                <button
                  onClick={addCustomModel}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Validate & Add
                </button>
                <button
                  onClick={() => testCustomModel(newModelId.trim())}
                  disabled={!newModelId.trim() || isTesting}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isTesting ? 'Testing…' : 'Test Model'}
                </button>
              </div>

              <div className="min-h-6 mt-2">
                {modelCheckMessage && (
                  <div className={`text-sm ${modelCheckMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {modelCheckMessage.message}
                  </div>
                )}
              </div>

              {testResult && (
                <div className="mt-3 border rounded-md p-3 bg-gray-50">
                  <div className="text-sm text-gray-700 grid grid-cols-2 gap-2">
                    <div>Latency: <span className="font-medium">{testResult.latencyMs} ms</span></div>
                    <div>Input tokens: <span className="font-medium">{testResult.inputTokens}</span></div>
                    <div>Output tokens: <span className="font-medium">{testResult.outputTokens}</span></div>
                    <div>Input cost: <span className="font-medium">{testResult.inputCost}</span></div>
                    <div>Output cost: <span className="font-medium">{testResult.outputCost}</span></div>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Preview:</div>
                    <pre className="text-sm whitespace-pre-wrap break-words">{testResult.preview}</pre>
                  </div>
                </div>
              )}

              {/* List custom models */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {customModels.map((model) => (
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
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{model.name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">Custom</span>
                      </div>
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

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); testCustomModel(model.id); }}
                        className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                      >
                        Test
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeCustomModel(model.id); }}
                        className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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