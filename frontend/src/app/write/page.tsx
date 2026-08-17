'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import PostForm from '../admin/posts/PostForm';

export default function WritePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    if (loading) return <p className="text-gray-400">Đang tải...</p>;
    if (!user) return null;

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 heading-gradient inline-block">Viết bài mới</h1>
            <PostForm />
        </div>
    );
}