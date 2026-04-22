import { pipeline, env } from '@xenova/transformers';

// Skip local model check since we are in the browser
env.allowLocalModels = false;

class PipelineSingleton {
    static instances = {};

    static async getInstance(task, model, progress_callback = null) {
        if (!this.instances[task]) {
            this.instances[task] = await pipeline(task, model, { progress_callback });
        }
        return this.instances[task];
    }
}

// Calculate Cosine Similarity between two vectors
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += Math.pow(vecA[i], 2);
        normB += Math.pow(vecB[i], 2);
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { type, text, userText, jobTexts } = event.data;

    // Initialization for Interview Simulator (Sentiment)
    if (type === 'init') {
        try {
            await PipelineSingleton.getInstance('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', x => {
                self.postMessage({ status: 'progress', progress: x });
            });
            self.postMessage({ status: 'ready' });
        } catch (error) {
            self.postMessage({ status: 'error', error: error.message });
        }
        return;
    }

    // Initialization for Smart Search (Embeddings)
    if (type === 'init_embeddings') {
        try {
            await PipelineSingleton.getInstance('feature-extraction', 'Xenova/all-MiniLM-L6-v2', x => {
                self.postMessage({ status: 'progress', progress: x });
            });
            self.postMessage({ status: 'ready' });
        } catch (error) {
            self.postMessage({ status: 'error', error: error.message });
        }
        return;
    }

    // Run sentiment analysis
    if (type === 'analyze') {
        try {
            self.postMessage({ status: 'analyzing' });
            let classifier = await PipelineSingleton.getInstance('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
            let output = await classifier(text);
            self.postMessage({ status: 'complete', result: output });
        } catch (error) {
            self.postMessage({ status: 'error', error: error.message });
        }
    }

    // Run semantic job ranking
    if (type === 'rank_jobs') {
        try {
            self.postMessage({ status: 'analyzing' });
            let extractor = await PipelineSingleton.getInstance('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

            // 1. Generate User Embedding
            const userOutput = await extractor(userText, { pooling: 'mean', normalize: true });
            const userVector = Array.from(userOutput.data);

            // 2. Generate Job Embeddings and calculate similarity
            const rankedJobs = [];
            for (let i = 0; i < jobTexts.length; i++) {
                const jobText = jobTexts[i].text;
                const jobOutput = await extractor(jobText, { pooling: 'mean', normalize: true });
                const jobVector = Array.from(jobOutput.data);
                
                const score = cosineSimilarity(userVector, jobVector);
                rankedJobs.push({
                    originalIndex: jobTexts[i].index,
                    semanticScore: score
                });
            }

            // Sort by highest score
            rankedJobs.sort((a, b) => b.semanticScore - a.semanticScore);

            self.postMessage({ status: 'complete', result: rankedJobs });
        } catch (error) {
            self.postMessage({ status: 'error', error: error.message });
        }
        return;
    }

    // Initialization for Resume Builder (NER)
    if (type === 'init_ner') {
        try {
            await PipelineSingleton.getInstance('token-classification', 'Xenova/bert-base-NER', x => {
                self.postMessage({ status: 'progress', progress: x });
            });
            self.postMessage({ status: 'ready' });
        } catch (error) {
            self.postMessage({ status: 'error', error: error.message });
        }
        return;
    }

    // Run NER for skill extraction
    if (type === 'extract_skills') {
        try {
            self.postMessage({ status: 'analyzing' });
            let ner = await PipelineSingleton.getInstance('token-classification', 'Xenova/bert-base-NER');
            
            // Extract entities
            let output = await ner(text, { ignore_labels: ['O'] });
            
            // Clean up subwords and filter only to high confidence
            let extractedWords = new Set();
            let currentWord = '';
            
            output.forEach(token => {
                if (token.score > 0.5) {
                   if (token.word.startsWith('##')) {
                       currentWord += token.word.substring(2);
                   } else {
                       if (currentWord) extractedWords.add(currentWord);
                       currentWord = token.word;
                   }
                }
            });
            if (currentWord) extractedWords.add(currentWord);

            self.postMessage({ status: 'complete', result: Array.from(extractedWords) });
        } catch (error) {
            self.postMessage({ status: 'error', error: error.message });
        }
    }
});
