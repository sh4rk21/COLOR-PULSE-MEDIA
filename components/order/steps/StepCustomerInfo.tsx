'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface StepCustomerInfoProps {
  email: string;
  name: string;
  onEmailChange: (email: string) => void;
  onNameChange: (name: string) => void;
  t: {
    email: string;
    emailPlaceholder: string;
    name: string;
    namePlaceholder: string;
    nameHint: string;
  };
}

const customEase = [0.15, 0.75, 0.13, 0.95] as const;

export default function StepCustomerInfo({
  email,
  name,
  onEmailChange,
  onNameChange,
  t,
}: StepCustomerInfoProps) {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailValid, setEmailValid] = useState(false);

  useEffect(() => {
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Email invalide');
        setEmailValid(false);
      } else {
        setEmailError(null);
        setEmailValid(true);
      }
    } else {
      setEmailError(null);
      setEmailValid(false);
    }
  }, [email]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: customEase }}
      className="space-y-6"
    >
      {/* Email */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-2xl bg-dark-card border border-dark-border"
      >
        <label className="flex items-center gap-2 text-sm text-light-subtle mb-3">
          <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          {t.email} <span className="text-accent">*</span>
        </label>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder={t.emailPlaceholder}
            className={`form-input pr-10 ${emailError ? 'border-red-500/50 focus:ring-red-500' : emailValid ? 'border-green-500/30' : ''}`}
            required
          />
          {emailValid && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          )}
        </div>
        {emailError && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-400 mt-2 flex items-center gap-1"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {emailError}
          </motion.p>
        )}
      </motion.div>

      {/* Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-5 rounded-2xl bg-dark-card border border-dark-border"
      >
        <label className="flex items-center gap-2 text-sm text-light-subtle mb-3">
          <svg className="w-4 h-4 text-light-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {t.name}
          <span className="text-xs text-light-muted font-normal">(optionnel)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t.namePlaceholder}
          className="form-input"
        />
        <p className="text-xs text-light-muted mt-2 flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          {t.nameHint}
        </p>
      </motion.div>
    </motion.div>
  );
}
