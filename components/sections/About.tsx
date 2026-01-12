'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

export default function About() {
  const t = useTranslations('about')
  const points = ['infrastructure', 'method', 'synergy']
  
  const customEase = [0.15, 0.75, 0.13, 0.95] as const
  const viewport = { once: true, amount: 0.1 }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
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

  const cardVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: customEase,
        delay: 0.15 + custom * 0.1,
      },
    }),
  }

  return (
    <motion.section
      className="py-section px-6 lg:px-12"
      id="about"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="mb-20">
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
            className="text-lg text-light-subtle max-w-2xl"
            variants={itemVariants}
          >
            {t('subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {points.map((key, index) => (
            <motion.div
              key={key}
              className="card-dark p-10"
              custom={index}
              variants={cardVariants}
              whileHover={{ borderColor: '#007aff', y: -5 }}
            >
              <h3 className="text-xl md:text-2xl font-light text-light mb-4">
                {t(`points.${key}.title`)}
              </h3>
              <p className="text-light-muted leading-relaxed">
                {t(`points.${key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div className="mt-16" variants={itemVariants}>
          <motion.a
            href="#contact"
            className="inline-block px-8 py-4 bg-accent text-white font-medium rounded-lg"
            whileHover={{ scale: 1.05, backgroundColor: '#0062cc' }}
            whileTap={{ scale: 0.95 }}
          >
            Travaillons ensemble
          </motion.a>
        </motion.div>
      </div>
    </motion.section>
  )
}
