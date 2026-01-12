'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Contact() {
  const t = useTranslations('contact')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const customEase = [0.15, 0.75, 0.13, 0.95] as const
  const viewport = { once: true, amount: 0.1 }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: customEase },
    },
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    const form = e.currentTarget
    const formData = new FormData(form)
    
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const project = formData.get('project') as string
    const honeypot = formData.get('honeypot') as string

    if (honeypot || !name || name.length < 2 || !project || project.length < 10) {
      setSubmitStatus('error')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      })

      if (!response.ok) throw new Error('Response not OK')

      setSubmitStatus('success')
      form.reset()
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitStatus('idle'), 5000)
    }
  }

  return (
    <motion.section
      className="py-section px-6 lg:px-12 bg-dark-card"
      id="contact"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="mb-16">
          <motion.p className="section-label" variants={itemVariants}>
            {t('label')}
          </motion.p>
          <motion.h2
            className="text-display mb-6 max-w-3xl"
            variants={itemVariants}
          >
            {t('title')}
          </motion.h2>
          <motion.p
            className="text-lg text-light-subtle"
            variants={itemVariants}
          >
            {t('subtitle')}
          </motion.p>
        </div>

        <motion.form onSubmit={handleSubmit} className="space-y-6" variants={itemVariants}>
          <input type="text" name="honeypot" className="absolute opacity-0 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="form-label">{t('form.name')}</label>
              <input type="text" id="name" name="name" required minLength={2} className="form-input" />
            </div>
            <div>
              <label htmlFor="email" className="form-label">{t('form.email')}</label>
              <input type="email" id="email" name="email" required className="form-input" />
            </div>
          </div>

          <div>
            <label htmlFor="company" className="form-label">{t('form.company')}</label>
            <input type="text" id="company" name="company" className="form-input" />
          </div>

          <div>
            <label htmlFor="project" className="form-label">{t('form.project')}</label>
            <textarea id="project" name="project" required minLength={10} rows={4} className="form-input resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="budget" className="form-label">{t('form.budget')}</label>
              <select id="budget" name="budget" className="form-input">
                <option value="">-</option>
                <option value="10k-25k">10K - 25K €</option>
                <option value="25k-50k">25K - 50K €</option>
                <option value="50k+">50K+ €</option>
              </select>
            </div>
            <div>
              <label htmlFor="timeline" className="form-label">{t('form.timeline')}</label>
              <select id="timeline" name="timeline" className="form-input">
                <option value="">-</option>
                <option value="1-3months">1-3 mois</option>
                <option value="3-6months">3-6 mois</option>
                <option value="6months+">6+ mois</option>
              </select>
            </div>
          </div>

          <div>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-4 bg-accent text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02, backgroundColor: 'var(--colors-accent-hover)' }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Envoi en cours...' : t('form.submit')}
            </motion.button>
          </div>

          <AnimatePresence>
            {submitStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-lg text-center ${
                  submitStatus === 'success'
                    ? 'bg-accent/10 border border-accent text-accent'
                    : 'bg-red-900/20 border border-red-500 text-red-400'
                }`}
              >
                {submitStatus === 'success'
                  ? 'Message envoyé ! Nous vous répondrons vite.'
                  : 'Erreur. Vérifiez les champs et réessayez.'
                }
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </motion.section>
  )
}
