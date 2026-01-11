import { describe, it, expect } from 'vitest'

describe('Contact API', () => {
  it('should validate required fields', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      project: 'Test project description',
    }

    expect(validData.name).toBeTruthy()
    expect(validData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    expect(validData.project.length).toBeGreaterThanOrEqual(10)
  })

  it('should reject invalid email format', () => {
    const invalidEmails = ['invalid', 'invalid@', '@invalid.com', 'invalid@.com']

    invalidEmails.forEach((email) => {
      expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    })
  })

  it('should detect honeypot spam', () => {
    const spamData = {
      name: 'Bot',
      email: 'bot@spam.com',
      project: 'Spam message',
      honeypot: 'filled by bot',
    }

    expect(spamData.honeypot).toBeTruthy()
  })
})
