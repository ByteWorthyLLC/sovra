import { describe, it, expect } from 'vitest'

describe('Smoke Test', () => {
  it('confirms test infrastructure works', () => {
    expect(1 + 1).toBe(2)
  })

  it('confirms JSX compilation works', () => {
    const element = <div data-testid="test">Hello ByteSwarm</div>
    expect(element.props['data-testid']).toBe('test')
    expect(element.props.children).toBe('Hello ByteSwarm')
  })
})
