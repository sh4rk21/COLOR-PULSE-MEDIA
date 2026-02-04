'use client';

import { motion } from 'framer-motion';

interface StepperProps {
  currentStep: number;
  steps: string[];
}

export default function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="relative">
      {/* Background track */}
      <div className="absolute top-5 left-0 right-0 h-[2px] bg-dark-border mx-12 sm:mx-16" />

      {/* Animated progress */}
      <motion.div
        className="absolute top-5 left-0 h-[2px] bg-accent mx-12 sm:mx-16"
        initial={{ width: '0%' }}
        animate={{
          width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
        }}
        transition={{ duration: 0.5, ease: [0.15, 0.75, 0.13, 0.95] }}
        style={{ maxWidth: 'calc(100% - 6rem)' }}
      />

      <div className="relative flex items-start justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={step} className="flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
              {/* Step circle */}
              <motion.div
                className={`
                  relative z-10 flex items-center justify-center w-10 h-10 rounded-full
                  text-sm font-medium transition-all duration-300
                  ${isActive
                    ? 'bg-accent text-white shadow-[0_0_20px_rgba(0,122,255,0.3)]'
                    : isCompleted
                      ? 'bg-accent text-white'
                      : 'bg-dark-card border border-dark-border text-light-muted'
                  }
                `}
                initial={false}
                animate={{
                  scale: isActive ? 1.15 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {isCompleted ? (
                  <motion.svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                ) : (
                  stepNumber
                )}
              </motion.div>

              {/* Step label */}
              <motion.span
                className={`
                  mt-2.5 text-xs font-medium text-center leading-tight
                  transition-colors duration-300
                  ${isActive ? 'text-accent' : isCompleted ? 'text-light-subtle' : 'text-light-muted'}
                `}
                initial={false}
                animate={{ opacity: isActive ? 1 : 0.7 }}
              >
                {step}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
