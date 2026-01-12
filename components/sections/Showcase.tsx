'use client'

import { useTranslations, useLocale } from 'next-intl'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import mediasData from '@/data/medias.json'
import Image from 'next/image'

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
  const sourceMedias = (mediasData as Media[]).filter((media) => media.active)
  
  // On triple les données pour assurer un défilement infini fluide sans coupure
  const medias = [...sourceMedias, ...sourceMedias, ...sourceMedias]

  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Parallax pour les éléments de décor
  const parallaxY1 = useTransform(scrollYProgress, [0, 1], ['-20%', '20%'])
  const parallaxY2 = useTransform(scrollYProgress, [0, 1], ['-5%', '5%'])

  const itemVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: [0.15, 0.75, 0.13, 0.95] as const },
    },
  }

  return (
    <motion.section
      ref={sectionRef}
      className="py-section bg-dark-card relative overflow-hidden"
      id="showcase"
      style={{ position: 'relative' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Éléments décoratifs Parallax */}
      <motion.div
        className="absolute top-[5%] left-[5%] w-64 h-64 rounded-full bg-accent/5"
        style={{ y: parallaxY1, filter: 'blur(100px)' }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[10%] w-80 h-80 rounded-full bg-blue-500/5"
        style={{ y: parallaxY2, filter: 'blur(120px)' }}
      />

      <div className="container mx-auto max-w-7xl relative z-10 px-6 lg:px-12 mb-16">
        <div className="text-center max-w-3xl mx-auto">
          <motion.p className="section-label" variants={itemVariants}>
            {t('label')}
          </motion.p>
          <motion.h2
            className="text-display mb-6"
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
      </div>

      {/* Zone du Carrousel */}
      <div className="relative w-full overflow-hidden py-10">
        {/* Masques dégradés pour effet fondu sur les bords */}
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 z-20 bg-gradient-to-r from-dark-card to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 z-20 bg-gradient-to-l from-dark-card to-transparent pointer-events-none" />

        {/* Piste de défilement */}
        <motion.div
          className="flex gap-6 w-max"
          animate={{ x: ['0%', '-33.333%'] }}
          transition={{
            duration: 30, // Vitesse du défilement (plus grand = plus lent)
            ease: 'linear',
            repeat: Infinity,
          }}
          whileHover={{ animationPlayState: 'paused' }} // Note: Framer Motion ne supporte pas directement animationPlayState en prop, mais on peut simuler ou laisser l'utilisateur interagir
          style={{ cursor: 'grab' }}
        >
          {medias.map((media, index) => (
            <motion.a
              key={`${media.id}-${index}`}
              href={media.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group card-dark p-8 w-[350px] md:w-[450px] flex-shrink-0 relative overflow-hidden"
              whileHover={{ 
                borderColor: '#007aff',
                y: -5,
              }}
              // Pause l'animation du parent au survol via CSS pure si possible, ou juste un effet visuel
            >
              {/* Effet Glow au survol */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <span className="px-3 py-1.5 text-xs font-mono uppercase bg-accent/10 text-accent rounded-md border border-accent/20">
                    {media.type}
                  </span>
                  <div className="p-2 bg-dark rounded-full border border-dark-border group-hover:border-accent/50 transition-colors">
                    <svg
                      className="w-4 h-4 text-light-muted group-hover:text-accent transition-colors"
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
                </div>
                
                <h3 className="text-2xl font-medium text-light mb-3 group-hover:text-accent transition-colors">
                  {media.name[locale]}
                </h3>
                
                <p className="text-light-muted leading-relaxed text-sm md:text-base flex-grow">
                  {media.description[locale]}
                </p>

                <div className="mt-6 pt-6 border-t border-dark-border/50 flex items-center text-sm font-medium text-light-subtle group-hover:text-light transition-colors">
                  Visiter le site
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>

      <div className="text-center mt-12 relative z-10">
        <motion.a
          href="#contact"
          className="inline-flex items-center px-8 py-4 text-sm font-medium border border-dark-border text-light rounded-lg bg-dark/50 backdrop-blur-sm hover:bg-dark-border/50 transition-all group"
          variants={itemVariants}
          whileHover={{
            borderColor: '#007aff',
            color: '#007aff',
            scale: 1.02
          }}
        >
          Découvrez notre réseau complet
          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.a>
      </div>
    </motion.section>
  )
}