const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { walk } = require('../util');
const matter = require('gray-matter');
const settings = require('electron-settings');

function cosineSimilarity(qEmb, vEmb) {
  if (qEmb.length !== vEmb.length) {
    throw new Error('Vectors have different dimensions');
  }

  let dotProduct = 0;
  let qNorm = 0;
  let vNorm = 0;

  // take the dotProduct of the two vectors and also sum the squares of every element in qEmb and vEmb
  for (let i = 0; i < qEmb.length; i++) {
    dotProduct += qEmb[i] * vEmb[i];
    qNorm += qEmb[i] ** 2;
    vNorm += vEmb[i] ** 2;
  }

  qNorm = Math.sqrt(qNorm);
  vNorm = Math.sqrt(vNorm);

  if (normA === 0 || normB === 0) {
    throw new Error('One of the vectors is zero, cannot compute similarity');
  }

  return dotProduct / (qNorm * vNorm);
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
        // Embeddings need to be generated based on the index
        await this.walkAndGenerateEmbeddings(memoPath, index);
        this.saveEmbeddings();
      }
    } catch (error) {
      console.log('failed to load embeddings', error);
    }
    return {};
  }

  async walkAndGenerateEmbeddings(memoPath, index) {
    this.embeddings = new Map();
    for (let [entryPath, metadata] of index) {
      this.addDocument(entryPath, metadata);
    }
  }

  async addDocument(entryPath, metadata) {
    try {
      // only index parent posts with the reply concatenated to parent post
      if (metadata.isReply) return;

      let fullPath = path.join(this.memoPath, entryPath);
      let fileContent = fs.readFileSync(fullPath, 'utf8');
      let { content } = matter(fileContent);
      content =
        'Entry on ' + metadata.createdAt + '\n\n' + content + '\n\nReplies:\n';

      //concatenate all of the replies
      for (let replyPath of metadata.replies) {
        let replyPath = path.join(this.memoPath, replyPath);
        let _replyContent = fs.readFileSync(replyPath, 'utf8');
        let { content: replyContent } = matter(_replyContent);
        content += '\n' + replyContent;
      }

      try {
        const embedding = await this.generateEmbeddings(content);
        this.embeddings.set(entryPath, embedding);
      } catch (error) {
        console.warn(
          `Failed to generate embedding for thread: ${entryPath}`,
          error,
        );
        // Skip this document and continue with the next one
        return;
      }

      this.saveEmbeddings();
    } catch (error) {
      console.log('failed to add document', error);
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

  async generateEmbeddings(content) {
    const memoAIProvider = await settings.get('memoAIProvider');
    const embeddingModel = await settings.get('embeddingModel');
    const Ollama = memoAIProvider === 'ollama';

    try {
      if (Ollama) {
        const url = 'http://127.0.0.1:11434/api/embed';
        const data = {
          model: 'mxbai-embed-large',
          input: content,
        };
        const repsonse = await axios.post(url, data);
        const embedding = response.data.embeddings;
        return response.data.embeddings[0];
      }
    } catch (error) {
      console.log('failed to generate embeddings', error);
      return null;
    }
  }

  async regenerateEmbeddings(index) {
    this.embeddings.clear();
    for (let [entryPath, metadata] of index) {
      await this.addDocument(entryPath, metadata);
    }
    this.saveEmbeddings();
  }

  async search(query, k = 50) {
    const queryEmbedding = await this.generateEmbeddings(query);
  
    if (!queryEmbedding) {
      console.error('Failed to generate query embedding.');
      return [];
    }
  
    let scores = [];
    this.embeddings.forEach((embedding, entryPath) => {
      let score = cosineSimilarity(queryEmbedding, embedding);
      scores.push({ score, entryPath });
    });
  
    scores.sort((a, b) => b.score - a.score);
    const topResults = scores.slice(0, k).map((score) => score.entryPath);
    return topResults;
  }
}

module.exports = new MemoEmbeddings();
