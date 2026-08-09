'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const { refreshMe } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            return;
        }
        api
            .get(`/auth/verify-email?token=${token}`)
            .then(async () => {
                setStatus('success');
                await refreshMe();
            })
            .catch(() => setStatus('error'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    return (
        <div className="text-center py-16">
            {status === 'loading' && <p className="text-gray-400">Đang xác thực email...</p>}
            {status === 'success' && (
                <>
                    <p className="text-green-600 mb-4">Xác thực email thành công!</p>
                    <Link href="/" className="text-brand hover:underline">
                        Về trang chủ
                    </Link>
                </>
            )}
            {status === 'error' && (
                <p className="text-red-600">Link xác thực không hợp lệ hoặc đã hết hạn.</p>
            )}
        </div>
    );
}