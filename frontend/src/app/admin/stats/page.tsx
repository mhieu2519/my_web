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

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-2xl font-bold mt-1">{value}</div>
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
            <h1 className="text-2xl font-bold mb-6">Thống kê tổng quan</h1>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <StatCard label="Tổng bài viết" value={overview.totalPosts} />
                <StatCard label="Đã đăng" value={overview.publishedPosts} />
                <StatCard label="Nháp" value={overview.draftPosts} />
                <StatCard label="Bình luận" value={overview.totalComments} />
                <StatCard label="Cảm xúc" value={overview.totalReactions} />
                <StatCard label="Người dùng" value={overview.totalUsers} />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="font-semibold mb-4">30 ngày gần nhất</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={series}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="posts" stroke="#4f46e5" name="Bài viết" />
                        <Line type="monotone" dataKey="comments" stroke="#16a34a" name="Bình luận" />
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