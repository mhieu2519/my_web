'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <div className="animate-spin h-8 w-8 rounded-full border-4 border-brand-200 border-t-brand-500" />
        </div>
    );
    if (!user) return null;

    return <div className="max-w-5xl mx-auto">{children}</div>;
}