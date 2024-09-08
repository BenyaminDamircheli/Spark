const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { walk } = require('../util');
const matter = require('gray-matter');
const settings = require('electron-settings');

function cosineSimilarity(embedding, queryEmbedding) {
  if (embedding?.length !== queryEmbedding?.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < embedding.length; i++) {
    dotProduct += embedding[i] * queryEmbedding[i];
    normA += embedding[i] ** 2;
    normB += queryEmbedding[i] ** 2;
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    throw new Error('One of the vectors is zero, cannot compute similarity');
  }

  return dotProduct / (normA * normB);
}

class MemoEmbeddings {
  constructor() {
    this.memoPath = null;
    this.fileName = 'embeddings.json';
    this.embeddings = new Map();
  }

  async initialize(memoPath, index) {
    try {
      this.memoPath = memoPath;

      const embeddingFilePath = path.join(memoPath, this.fileName);

      if (fs.existsSync(embeddingFilePath)) {
        const data = fs.readFileSync(embeddingFilePath, 'utf8');
        this.embeddings = new Map(JSON.parse(data));
      } else {
        await this.walkAndGenerateEmbeddings(memoPath, index);
        this.saveEmbeddings();
      }
    } catch (error) {
      console.error('Failed to load embeddings:', error);
    }
    return {};
  }

  async walkAndGenerateEmbeddings(memoPath, index) {
    console.log('🧮 Generating embeddings for index:', index.size);
    this.embeddings = new Map();
    for (let [entryPath, metadata] of index) {
      await this.addDocument(entryPath, metadata);
    }
  }

  async addDocument(entryPath, metadata) {
    try {
      if (metadata.isReply) return;

      let fullPath = path.join(this.memoPath, entryPath);
      let fileContent = fs.readFileSync(fullPath, 'utf8');
      let { content } = matter(fileContent);
      content =
        'Entry on ' + metadata.createdAt + '\n\n' + content + '\n\nReplies:\n';

      for (let replyPath of metadata.replies) {
        let replyFullPath = path.join(this.memoPath, replyPath);
        let replyFileContent = fs.readFileSync(replyFullPath, 'utf8');
        let { content: replyContent } = matter(replyFileContent);
        content += '\n' + replyContent;
      }

      try {
        const embedding = await this.generateEmbedding(content);
        this.embeddings.set(entryPath, embedding);
        console.log('🧮 Embeddings created for thread: ', entryPath);
      } catch (error) {
        console.warn(
          `Failed to generate embedding for thread: ${entryPath}`,
          error
        );
        return;
      }

      this.saveEmbeddings();
    } catch (error) {
      console.error('Failed to process thread for vector index.', error);
    }
  }

  saveEmbeddings() {
    try {
      const embeddingsFilePath = path.join(this.memoPath, this.fileName);
      const entries = this.embeddings.entries();
      if (!entries) return;
      let stringMap = JSON.stringify(Array.from(entries));
      fs.writeFileSync(embeddingsFilePath, stringMap, 'utf8');
    } catch (error) {
      console.error('Failed to save embeddings:', error);
    }
  }

  async generateEmbedding(document) {
    const memoAIProvider = await settings.get('memoAIProvider');
    const embeddingModel = await settings.get('embeddingModel');
    console.log('🧮 Generating embedding for document:', document);
    console.log('🧮 Memo AI Provider:', memoAIProvider);
    console.log('🧮 Embedding Model:', embeddingModel);
    const isOllama = memoAIProvider === 'ollama';

    // Perhaps in the future this will support other AI providers if the users want to use them.
    // which is why I have written the if statement.
    if (isOllama){
      const url = 'http://127.0.0.1:11434/api/embed';
      const data = {
        model: 'mxbai-embed-large',
        input: document,
      };
      try {
        const response = await axios.post(url, data);
        return response.data.embeddings[0];
      } catch (error) {
        console.error('Error generating embedding with Ollama:', error);
        return null;
      }
    }
    
  }

  async regenerateEmbeddings(index) {
    console.log('🧮 Regenerating embeddings for index:', index.size);
    this.embeddings.clear();
    for (let [entryPath, metadata] of index) {
      await this.addDocument(entryPath, metadata);
    }
    this.saveEmbeddings();
    console.log('✅ Embeddings regeneration complete');
  }

  async search(query, k = 50) {
    const queryEmbedding = await this.generateEmbedding(query);
  
    if (!queryEmbedding) {
      console.error('Failed to generate query embedding.');
      return [];
    }
  
    let scores = [];
    this.embeddings.forEach((embedding, entryPath) => {
      let score = cosineSimilarity(embedding, queryEmbedding);
      scores.push({ score, entryPath });
    });
  
    scores.sort((a, b) => b.score - a.score);
    const topResults = scores.slice(0, k).map((score) => score.entryPath);
    return topResults;
  }
}

module.exports = new MemoEmbeddings();
