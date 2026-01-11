'use client'

import { useTranslations, useLocale } from 'next-intl'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import mediasData from '@/data/medias.json'

type Media = {
  id: number
  name: { fr: string; en: string }
  description: { fr: string; en: string }
  type: string
  url: string
  active: boolean
}

export default function Showcase() {
  const t = useTranslations('showcase')
  const locale = useLocale() as 'fr' | 'en'
  const medias = (mediasData as Media[]).filter((media) => media.active)

  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const parallaxY1 = useTransform(scrollYProgress, [0, 1], ['-20%', '20%'])
  const parallaxY2 = useTransform(scrollYProgress, [0, 1], ['-5%', '5%'])

  const customEase = [0.15, 0.75, 0.13, 0.95]
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

  const cardVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: customEase,
        delay: 0.15 + custom * 0.05,
      },
    }),
  }

  return (
    <motion.section
      ref={sectionRef}
      className="py-section px-6 lg:px-12 bg-dark-card relative overflow-hidden"
      id="showcase"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      {/* Parallax Elements */}
      <motion.div
        className="absolute top-[5%] left-[5%] w-64 h-64 rounded-full bg-accent/5"
        style={{ y: parallaxY1, filter: 'blur(100px)' }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[10%] w-80 h-80 rounded-full bg-blue-500/5"
        style={{ y: parallaxY2, filter: 'blur(120px)' }}
      />

      <div className="container mx-auto max-w-7xl relative z-10">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {medias.map((media, index) => (
            <motion.a
              key={media.id}
              href={media.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group card-dark p-8"
              custom={index}
              variants={cardVariants}
              whileHover={{ 
                borderColor: 'var(--colors-accent)',
                y: -5,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="px-3 py-1.5 text-xs font-mono uppercase bg-accent-light text-accent rounded-md">
                  {media.type}
                </span>
                <svg
                  className="w-5 h-5 text-light-muted group-hover:text-accent transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-light text-light mb-3 group-hover:text-accent transition-colors">
                {media.name[locale]}
              </h3>
              <p className="text-light-muted leading-relaxed">
                {media.description[locale]}
              </p>
            </motion.a>
          ))}
        </div>

        <motion.div className="mt-16" variants={itemVariants}>
           <motion.a
            href="#contact"
            className="inline-block px-8 py-4 text-sm font-medium border border-dark-border text-light rounded-lg"
            whileHover={{
              borderColor: 'var(--colors-accent)',
              color: 'var(--colors-accent)',
            }}
          >
            Découvrez notre réseau complet
          </motion.a>
        </motion.div>
      </div>
    </motion.section>
  )
}
