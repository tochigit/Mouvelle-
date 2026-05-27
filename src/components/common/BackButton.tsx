'use client';

import { ArrowLeft } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigation';
import type { PageView } from '@/lib/types';

interface BackButtonProps {
  fallbackPage?: PageView;
  fallbackProductId?: string | null;
  label?: string;
}

export default function BackButton({
  fallbackPage = 'home',
  fallbackProductId = null,
  label = 'Back',
}: BackButtonProps) {
  const { canGoBack, goBack, navigate } = useNavigationStore();

  const handleClick = () => {
    if (canGoBack()) {
      goBack();
    } else {
      navigate(fallbackPage, fallbackProductId);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors group"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      <span>{label}</span>
    </button>
  );
}
