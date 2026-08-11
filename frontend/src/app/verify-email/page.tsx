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
        <div className="max-w-sm mx-auto card p-10 text-center">
            {status === 'loading' && <p className="text-gray-400">Đang xác thực email...</p>}
            {status === 'success' && (
                <>
                    <div className="text-4xl mb-3">🎉</div>
                    <p className="text-green-600 font-medium mb-4">Xác thực email thành công!</p>
                    <Link href="/" className="btn-primary inline-block">
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