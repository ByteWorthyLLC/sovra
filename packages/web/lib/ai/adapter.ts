import type { LanguageModel } from 'ai'

export interface AIProviderAdapter {
  readonly provider: string
  getModel(modelName: string): LanguageModel
}
