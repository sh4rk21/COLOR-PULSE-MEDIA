'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Footer() {
  const t = useTranslations('footer')

  const viewport = { once: true, amount: 0.2 }
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  }

  return (
    <motion.footer 
      className="bg-dark border-t border-dark-border py-16 px-6 lg:px-12"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <motion.div variants={itemVariants}>
            <Image
              src="/logo/logo.png"
              alt="Color Pulse Media"
              width={300}
              height={100}
              className="w-auto h-16 md:h-20 mb-4"
              style={{ width: 'auto' }}
            />
            <p className="text-light-muted text-sm">{t('tagline')}</p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="font-medium text-light mb-4">Navigation</h4>
            <nav className="space-y-3" aria-label="Footer navigation">
              {['Services', 'Projets', 'À propos', 'Contact'].map(label => (
                <motion.a 
                  key={label}
                  href={`#${label.toLowerCase().replace('à propos', 'about')}`} 
                  className="block text-sm text-light-muted"
                  whileHover={{ color: '#f5f5f5', x: 2 }}
                >
                  {label}
                </motion.a>
              ))}
            </nav>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="font-medium text-light mb-4">Contact</h4>
            <motion.a
              href="#contact"
              className="inline-block px-6 py-3 bg-accent text-white font-medium rounded-lg"
              whileHover={{ scale: 1.05, backgroundColor: '#0062cc' }}
              whileTap={{ scale: 0.95 }}
            >
              {t('cta')}
            </motion.a>
          </motion.div>
        </div>

        <motion.div 
          className="pt-8 border-t border-dark-border text-center text-sm text-light-muted"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewport}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <p>{t('rights')}</p>
        </motion.div>
      </div>
    </motion.footer>
  )
}
