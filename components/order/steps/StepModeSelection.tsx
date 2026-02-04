'use client';

import { motion } from 'framer-motion';
import RadioCard from '../ui/RadioCard';
import type { OrderMode, SitePricing } from '@/lib/order/types';
import { formatPrice } from '@/lib/order/pricing';

interface StepModeSelectionProps {
  selectedMode: OrderMode | null;
  onModeSelect: (mode: OrderMode) => void;
  pricing: SitePricing;
  t: {
    lien_seul: { title: string; description: string };
    article_fourni: { title: string; description: string };
    redaction: { title: string; description: string };
  };
}

const customEase = [0.15, 0.75, 0.13, 0.95] as const;

export default function StepModeSelection({
  selectedMode,
  onModeSelect,
  pricing,
  t,
}: StepModeSelectionProps) {
  const modes: { mode: OrderMode; icon: string; title: string; description: string; price: number }[] = [
    {
      mode: 'lien_seul',
      icon: '🔗',
      title: t.lien_seul.title,
      description: t.lien_seul.description,
      price: pricing.Prix_Lien,
    },
    {
      mode: 'article_fourni',
      icon: '📄',
      title: t.article_fourni.title,
      description: t.article_fourni.description,
      price: pricing.Prix_Article,
    },
    {
      mode: 'redaction',
      icon: '✍️',
      title: t.redaction.title,
      description: t.redaction.description,
      price: pricing.Prix_Article_Redige,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: customEase }}
      className="space-y-4"
    >
      {modes.map((item, index) => (
        <motion.div
          key={item.mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4, ease: customEase }}
        >
          <RadioCard
            icon={item.icon}
            title={item.title}
            description={item.description}
            price={`${formatPrice(item.price)}+`}
            selected={selectedMode === item.mode}
            onClick={() => onModeSelect(item.mode)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
