import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

export interface OllamaRequestOptions {
    endpoint: string;
    model: string;
    prompt: string;
    system?: string;
}

export class OllamaClient {
    public async generateStream(
        options: OllamaRequestOptions,
        onToken: (token: string) => void
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = new URL('/api/generate', options.endpoint);
                const requestModule = apiUrl.protocol === 'https:' ? https : http;

                const reqOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                };

                const req = requestModule.request(apiUrl, reqOptions, (res) => {
                    if (res.statusCode && res.statusCode >= 400) {
                        reject(new Error(`Ollama API error: ${res.statusCode}`));
                        return;
                    }

                    res.on('data', (chunk) => {
                        const lines = chunk.toString().split('\n').filter((line: string) => line.trim() !== '');
                        for (const line of lines) {
                            try {
                                const parsed = JSON.parse(line);
                                if (parsed.response) {
                                    onToken(parsed.response);
                                }
                                if (parsed.done) {
                                    resolve();
                                }
                            } catch (e) {
                                console.error('Error parsing Ollama chunk:', e);
                            }
                        }
                    });

                    res.on('end', () => {
                        resolve();
                    });
                });

                req.on('error', (e) => {
                    reject(e);
                });

                const body = JSON.stringify({
                    model: options.model,
                    prompt: options.prompt,
                    system: options.system,
                    stream: true
                });

                req.write(body);
                req.end();
            } catch (err) {
                reject(err);
            }
        });
    }
}
