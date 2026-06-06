'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Invite-link entry point: /join/<code>
 * Preserves the code (surviving a login redirect), then sends the user to the
 * app, which auto-joins the group once authenticated.
 */
export default function JoinPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();

  useEffect(() => {
    const code = (params?.code || '').toString().trim().toUpperCase();
    try {
      if (code) localStorage.setItem('wc_pending_join', code);
    } catch {
      /* ignore */
    }
    router.replace('/');
  }, [params, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#7F1D1D] text-white">
      <Loader2 className="h-8 w-8 animate-spin text-[#FBBF24]" />
      <p className="font-display text-lg font-semibold uppercase tracking-wide">Joining your league…</p>
    </div>
  );
}
