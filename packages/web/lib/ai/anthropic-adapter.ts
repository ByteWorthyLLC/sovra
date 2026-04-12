import { createAnthropic } from '@ai-sdk/anthropic'
import type { AIProviderAdapter } from './adapter'

export class AnthropicAdapter implements AIProviderAdapter {
  readonly provider = 'anthropic'
  private client: ReturnType<typeof createAnthropic>

  constructor(apiKey?: string) {
    this.client = createAnthropic({ apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY })
  }

  getModel(modelName: string) {
    return this.client(modelName)
  }
}
