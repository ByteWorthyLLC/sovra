import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('ai', () => ({
  embed: vi.fn(),
  embedMany: vi.fn(),
}))

vi.mock('@ai-sdk/openai', () => ({
  openai: {
    embedding: vi.fn((model: string) => ({ modelId: model })),
  },
}))

import { embedText, embedMany as embedManyFn } from './embed'
import { embed, embedMany } from 'ai'
import { openai } from '@ai-sdk/openai'

const mockEmbed = vi.mocked(embed)
const mockEmbedMany = vi.mocked(embedMany)

describe('embedText', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls openai text-embedding-3-small and returns 1536-dim array', async () => {
    const fakeEmbedding = new Array(1536).fill(0.1)
    mockEmbed.mockResolvedValue({ embedding: fakeEmbedding } as never)

    const result = await embedText('hello world')

    expect(mockEmbed).toHaveBeenCalledWith({
      model: openai.embedding('text-embedding-3-small'),
      value: 'hello world',
    })
    expect(result).toHaveLength(1536)
    expect(result).toEqual(fakeEmbedding)
  })

  it('throws if embedding dimension is not 1536', async () => {
    const wrongDim = new Array(768).fill(0.1)
    mockEmbed.mockResolvedValue({ embedding: wrongDim } as never)

    await expect(embedText('test')).rejects.toThrow('1536')
  })

  it('propagates errors from the ai module', async () => {
    mockEmbed.mockRejectedValue(new Error('API key not configured'))

    await expect(embedText('test')).rejects.toThrow('API key not configured')
  })
})

describe('embedManyFn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns array of 1536-dim arrays', async () => {
    const fakeEmbeddings = [
      new Array(1536).fill(0.1),
      new Array(1536).fill(0.2),
    ]
    mockEmbedMany.mockResolvedValue({ embeddings: fakeEmbeddings } as never)

    const result = await embedManyFn(['hello', 'world'])

    expect(mockEmbedMany).toHaveBeenCalledWith({
      model: openai.embedding('text-embedding-3-small'),
      values: ['hello', 'world'],
    })
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveLength(1536)
    expect(result[1]).toHaveLength(1536)
  })

  it('throws if any embedding dimension is not 1536', async () => {
    const badEmbeddings = [
      new Array(1536).fill(0.1),
      new Array(768).fill(0.2),
    ]
    mockEmbedMany.mockResolvedValue({ embeddings: badEmbeddings } as never)

    await expect(embedManyFn(['a', 'b'])).rejects.toThrow('1536')
  })
})
