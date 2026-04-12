import { openai } from '@ai-sdk/openai'
import { embed, embedMany as embedManyAi } from 'ai'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EXPECTED_DIMENSIONS = 1536

export async function embedText(text: string): Promise<number[]> {
  const result = await embed({
    model: openai.embedding(EMBEDDING_MODEL),
    value: text,
  })

  if (result.embedding.length !== EXPECTED_DIMENSIONS) {
    throw new Error(
      `Expected embedding dimension ${EXPECTED_DIMENSIONS}, got ${result.embedding.length}`
    )
  }

  return result.embedding
}

export async function embedMany(texts: string[]): Promise<number[][]> {
  const result = await embedManyAi({
    model: openai.embedding(EMBEDDING_MODEL),
    values: texts,
  })

  for (let i = 0; i < result.embeddings.length; i++) {
    if (result.embeddings[i].length !== EXPECTED_DIMENSIONS) {
      throw new Error(
        `Expected embedding dimension ${EXPECTED_DIMENSIONS} at index ${i}, got ${result.embeddings[i].length}`
      )
    }
  }

  return result.embeddings
}
