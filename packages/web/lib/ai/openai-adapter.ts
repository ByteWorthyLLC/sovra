import { createOpenAI } from '@ai-sdk/openai'
import type { AIProviderAdapter } from './adapter'

export class OpenAIAdapter implements AIProviderAdapter {
  readonly provider = 'openai'
  private client: ReturnType<typeof createOpenAI>

  constructor(apiKey?: string) {
    this.client = createOpenAI({ apiKey: apiKey ?? process.env.OPENAI_API_KEY })
  }

  getModel(modelName: string) {
    return this.client(modelName)
  }
}
