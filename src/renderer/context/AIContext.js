import {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  createContext,
} from 'react';
import OpenAI from 'openai';
import { useMemoContext } from './MemoContext';
import { useElectronStore } from '../hooks/useElectronStore';

const reflectivePrompt =
  'You are an AI within a journaling app. Your job is to help the user reflect on their thoughts in a thoughtful and kind manner. The user can never directly address you or directly respond to you. Try not to repeat what the user said, instead try to seed new ideas, encourage or debate. Keep your responses concise, but meaningful.';
const constructivePrompt =
  'You are an AI within a journaling app. Your job is to build on the ideas of the user in a meaningful way, hopefully sparking new ideas and realizations. The user can never directly address you or directly respond to you. Try not to repeat what the user said, instead try to seed new ideas, draw connections between disciplines/ideas and provide new perspectives. Keep your responses concise, but meaningful.';
const devilsAdvocatePrompt =
  'You are an AI within a journaling app. Your job is to play devils advocate and try and critique and/or seed new ideas for the user. The user can never directly address you or directly respond to you. Try not to repeat what the user said, instead be profound in your critique and spark debate (never by conversing, just by analyzing). Keep your responses concise, but meaningful.';

const OLLAMA_URL = 'http://localhost:11434/api/chat';

const AIContext = createContext();

export const AIContextProvider = ({ children }) => {
  const { currentMemo, updateCurrentMemo } = useMemoContext();
  const [AI, setAI] = useState(null);
  const [prompt, setPrompt] = useState(reflectivePrompt);
  const [memoAIProvider, setMemoAIProvider] = useElectronStore(
    'memoAIProvider',
    'ollama',
  );

  const [model, setModel] = useElectronStore('model', 'mistral:7b');
  const [embeddingModel, setEmbeddingModel] = useElectronStore(
    'embeddingModel',
    'mxbai-embed-large',
  );
  const [baseUrl, setBaseUrl] = useElectronStore('baseUrl', OLLAMA_URL);

  // Written this way because I want to add openAI support in the future.
  const setupAI = useCallback(() => {
    if (memoAIProvider === 'ollama') {
      setAI({ type: 'ollama' });
    }
  }, [memoAIProvider, baseUrl]);

  useEffect(() => {
    if (currentMemo) {
      if (currentMemo.AIPrompt) setPrompt(currentMemo.AIPrompt);
      setupAI();
    }
  }, [currentMemo, setupAI, baseUrl]);

  const generate = useCallback(() => {
    async (context, callback) => {
      if (!ai) return;

      try {
        const response = await fetch(
          { OLLAMA_URL },
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: context,
            }),
          },
        );

        if (!response.ok) {
          console.log(
            'failed to generate with OLLMA, status:',
            response.status,
          );
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of line) {
            if (line.trim() !== '') {
              const data = JSON.parse(line);
              if (!data.done) {
                callback(data.response);
              }
            }
          }
        }
      } catch (error) {
        console.log('failed to generate with OLLMA, error:', error);
      }
    };
  }, [AI, model, baseUrl]);

  const prepareCompletionContext = useCallback(
    (thread) => {
      return [
        { role: 'system', content: prompt },
        {
          role: 'system',
          content: 'It is EXTREMELY important that you ONLY respond with plaintext, NEVER use markdown or HTML.',
        },
        ...thread.map((post) => ({ role: 'user', content: post.content })),
      ];
    },
    [prompt]
  );

  const AIContextValue = useMemo(
    () => ({
      AI,
      baseUrl,
      setBaseUrl,
      prompt,
      setPrompt,
      updateSettings: (newPrompt) =>
        updateCurrentMemo({ ...currentMemo, AIPrompt: newPrompt }),
      model,
      setModel,
      embeddingModel,
      setEmbeddingModel,
      generate,
      prepareCompletionContext,
      memoAIProvider,
      setMemoAIProvider,
    }),
    [generate],
  );

  return (
    <AIContext.Provider value={AIContextValue}>{children}</AIContext.Provider>
  );
};

export const useAIContext = () => {
  return useContext(AIContext);
};