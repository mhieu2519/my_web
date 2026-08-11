'use client';

import { useEffect, useState } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { api } from '@/lib/api-client';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

type Overview = {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalComments: number;
    totalReactions: number;
    totalUsers: number;
};

type TimeseriesPoint = { date: string; posts: number; comments: number };

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
    return (
        <div className="card p-5">
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">{label}</div>
                <span className="text-lg">{icon}</span>
            </div>
            <div className="text-3xl font-extrabold mt-2 heading-gradient inline-block">{value}</div>
        </div>
    );
}

function Content() {
    const [overview, setOverview] = useState<Overview | null>(null);
    const [series, setSeries] = useState<TimeseriesPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get('/stats/overview'), api.get('/stats/timeseries?days=30')]).then(
            ([o, s]) => {
                setOverview(o.data);
                setSeries(s.data);
                setLoading(false);
            },
        );
    }, []);

    if (loading || !overview) return <p className="text-gray-400">Đang tải...</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8 heading-gradient inline-block">Thống kê tổng quan</h1>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <StatCard label="Tổng bài viết" value={overview.totalPosts} icon="📝" />
                <StatCard label="Đã đăng" value={overview.publishedPosts} icon="✅" />
                <StatCard label="Nháp" value={overview.draftPosts} icon="📄" />
                <StatCard label="Bình luận" value={overview.totalComments} icon="💬" />
                <StatCard label="Cảm xúc" value={overview.totalReactions} icon="✨" />
                <StatCard label="Người dùng" value={overview.totalUsers} icon="👥" />
            </div>

            <div className="card p-6">
                <h2 className="font-bold mb-5">30 ngày gần nhất</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={series}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F6EC" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                        <YAxis allowDecimals={false} stroke="#9ca3af" />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '2px solid #DEEAD1' }} />
                        <Line type="monotone" dataKey="posts" stroke="#3A6330" strokeWidth={2.5} name="Bài viết" dot={false} />
                        <Line type="monotone" dataKey="comments" stroke="#D98C4A" strokeWidth={2.5} name="Bình luận" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default function AdminStatsPage() {
    return (
        <AdminGuard>
            <Content />
        </AdminGuard>
    );
}