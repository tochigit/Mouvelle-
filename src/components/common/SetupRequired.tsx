'use client';

import { Button } from '@/components/ui/button';
import { Shield, Settings, Database, CreditCard } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigation';

interface SetupRequiredProps {
  title?: string;
  message?: string;
  compact?: boolean;
}

export default function SetupRequired({
  title = 'Production setup required',
  message = 'Connect Supabase and Paystack to activate live products, orders, reviews, payments, and admin actions.',
  compact = false,
}: SetupRequiredProps) {
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <div className={compact ? 'py-10' : 'min-h-[60vh] flex items-center justify-center px-4 py-16'}>
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10">
          <Shield className="h-9 w-9 text-[#D4AF37]" />
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
          Live Commerce Locked
        </p>
        <h2 className="font-serif text-3xl font-bold sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">{message}</p>
        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          {[
            { icon: Database, label: 'Supabase Postgres' },
            { icon: Settings, label: 'Supabase API keys' },
            { icon: CreditCard, label: 'Paystack keys' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-card p-4">
              <item.icon className="mb-3 h-5 w-5 text-[#D4AF37]" />
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-foreground">{item.label}</p>
            </div>
          ))}
        </div>
        <Button
          onClick={() => navigate('admin')}
          className="mt-8 bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#C0A030]"
        >
          Open Admin Setup
        </Button>
      </div>
    </div>
  );
}
