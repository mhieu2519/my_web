'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AuthCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { loginWithToken } = useAuth();
    const [error, setError] = useState('');

    useEffect(() => {
        const token = searchParams.get('accessToken');
        if (!token) {
            setError('Thiếu token đăng nhập');
            return;
        }
        loginWithToken(token)
            .then(() => router.push('/'))
            .catch(() => setError('Đăng nhập thất bại'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    return (
        <div className="text-center py-16">
            {error ? (
                <p className="text-red-600">{error}</p>
            ) : (
                <p className="text-gray-400">Đang đăng nhập...</p>
            )}
        </div>
    );
}