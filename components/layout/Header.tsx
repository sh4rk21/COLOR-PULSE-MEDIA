'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const switchLocale = () => {
    router.replace(pathname, { locale: locale === 'fr' ? 'en' : 'fr' })
  }

  const closeMenu = () => setIsMenuOpen(false)

  const navLinks = [
    { href: '#services', label: 'Services' },
    { href: '#showcase', label: 'Projets' },
    { href: '#about', label: 'À propos' },
    { href: '#contact', label: 'Contact' },
  ]

  const menuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { staggerChildren: 0.05 } },
  }

  const menuItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-md border-b border-dark-border"
    >
      <div className="container mx-auto px-6 lg:px-12 py-6 flex justify-between items-center max-w-7xl">
        <motion.a 
          href="#hero" 
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Image
            src="/logo/logo.png"
            alt="Color Pulse Media"
            width={48}
            height={48}
            className="w-auto h-10 md:h-12"
            style={{ width: 'auto' }}
            priority
          />
        </motion.a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8" aria-label="Navigation principale">
          {navLinks.map(link => (
            <motion.a
              key={link.href}
              href={link.href}
              className="text-sm text-light-subtle hover:text-light"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              {link.label}
            </motion.a>
          ))}
        </nav>

        {/* Desktop Language Toggle */}
        <motion.button
          onClick={switchLocale}
          className="hidden md:block px-4 py-2 text-sm font-medium border border-dark-border rounded-lg text-light-subtle"
          whileHover={{ scale: 1.05, color: '#007aff', borderColor: '#007aff' }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Switch to ${locale === 'fr' ? 'English' : 'Français'}`}
        >
          {locale === 'fr' ? 'EN' : 'FR'}
        </motion.button>

        {/* Mobile Menu Button */}
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-light-subtle"
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <motion.svg
            key={isMenuOpen ? 'close' : 'open'}
            initial={{ rotate: isMenuOpen ? -90 : 0, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            {isMenuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </motion.svg>
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden border-t border-dark-border bg-dark-card overflow-hidden"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <nav className="container mx-auto px-6 py-6 flex flex-col gap-2" aria-label="Navigation mobile">
              {navLinks.map(link => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="text-light-subtle py-3"
                  variants={menuItemVariants}
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.button
                onClick={() => { switchLocale(); closeMenu(); }}
                className="px-4 py-3 mt-2 text-sm font-medium border border-dark-border rounded-lg text-left text-light-subtle"
                variants={menuItemVariants}
              >
                {locale === 'fr' ? 'Switch to EN' : 'Passer en FR'}
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
