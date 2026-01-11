'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

export default function Hero() {
  const t = useTranslations('hero')
  const kpisT = useTranslations('kpis')

  const customEase = [0.15, 0.75, 0.13, 0.95]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
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

  const kpiVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: customEase,
        delay: 0.3 + custom * 0.1,
      },
    }),
  }

  return (
    <section
      className="min-h-screen flex items-center justify-center px-6 lg:px-12 pt-32 pb-24 relative"
      id="hero"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 w-[100vw] h-[100vw] max-w-[1200px] max-h-[1200px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0) 60%)',
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
      <motion.div
        className="container mx-auto max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-16">
          <motion.p className="section-label" variants={itemVariants}>
            {t('label')}
          </motion.p>

          <motion.h1 className="text-hero text-light max-w-5xl" variants={itemVariants}>
            {t('title')}
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-light-subtle max-w-2xl leading-relaxed"
            variants={itemVariants}
          >
            {t('subtitle')}
          </motion.p>

          <motion.div className="flex gap-4" variants={itemVariants}>
            <motion.a
              href="#contact"
              className="px-8 py-4 bg-accent text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-dark"
              whileHover={{ scale: 1.05, backgroundColor: 'var(--colors-accent-hover)' }}
              whileTap={{ scale: 0.95 }}
            >
              {t('cta')}
            </motion.a>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            {['media_count', 'audience', 'years'].map((key, index) => (
              <motion.div
                key={key}
                className="card-dark p-8"
                custom={index}
                variants={kpiVariants}
                whileHover={{ borderColor: 'var(--colors-accent)', y: -5 }}
              >
                <div className="text-5xl md:text-6xl font-light text-accent mb-3">
                  {kpisT(`${key}.value`)}
                </div>
                <div className="text-sm text-light-muted uppercase tracking-wider">
                  {kpisT(`${key}.label`)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
