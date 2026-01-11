import { describe, it, expect } from 'vitest'
import mediasData from '@/data/medias.json'

describe('Medias Data', () => {
  it('should load medias from JSON', () => {
    expect(mediasData).toBeDefined()
    expect(Array.isArray(mediasData)).toBe(true)
    expect(mediasData.length).toBeGreaterThan(0)
  })

  it('should have required fields for each media', () => {
    mediasData.forEach((media) => {
      expect(media).toHaveProperty('id')
      expect(media).toHaveProperty('name')
      expect(media.name).toHaveProperty('fr')
      expect(media.name).toHaveProperty('en')
      expect(media).toHaveProperty('description')
      expect(media.description).toHaveProperty('fr')
      expect(media.description).toHaveProperty('en')
      expect(media).toHaveProperty('type')
      expect(media).toHaveProperty('url')
      expect(media).toHaveProperty('active')
    })
  })

  it('should filter active medias only', () => {
    const activeMedias = mediasData.filter((media) => media.active)
    expect(activeMedias.length).toBeGreaterThan(0)
  })
})
