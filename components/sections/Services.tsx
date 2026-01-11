'use client'

import { useTranslations } from 'next-intl'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function Services() {
  const t = useTranslations('services')
  
  const services = [
    { key: 'press', icon: '📰' },
    { key: 'content', icon: '✍️' },
    { key: 'training', icon: '🎓' },
    { key: 'consulting', icon: '💡' },
  ]

  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const parallaxY = useTransform(scrollYProgress, [0, 1], ['-15%', '15%'])

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
        delay: 0.15 + custom * 0.1,
      },
    }),
  }

  return (
    <motion.section
      ref={sectionRef}
      className="py-section px-6 lg:px-12 bg-dark relative overflow-hidden"
      id="services"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      <motion.div
        className="absolute top-[15%] right-[5%] w-72 h-72 rounded-full bg-accent/5"
        style={{ y: parallaxY, filter: 'blur(100px)' }}
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
          {services.map((service, index) => (
            <motion.div
              key={service.key}
              className="card-dark p-10 group relative overflow-hidden"
              custom={index}
              variants={cardVariants}
              whileHover={{
                borderColor: 'rgba(0, 122, 255, 0.5)',
                y: -8,
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0) 60%)',
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                whileHover={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              <div className="relative z-10">
                <div className="text-5xl mb-6 opacity-70 transition-opacity duration-300 group-hover:opacity-100">{service.icon}</div>
                <h3 className="text-2xl md:text-3xl font-light text-light mb-4 group-hover:text-accent transition-colors duration-300">
                  {t(`items.${service.key}.title`)}
                </h3>
                <p className="text-light-muted leading-relaxed">
                  {t(`items.${service.key}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
