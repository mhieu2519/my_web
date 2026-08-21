'use client';

import { useEffect, useState } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { api } from '@/lib/api-client';

type UserRow = {
    id: number;
    email: string;
    name: string;
    role: 'ADMIN' | 'USER';
    isBanned: boolean;
    emailVerified: boolean;
    createdAt: string;
    monthlyPostLimit: number;
};


function Content() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        const res = await api.get('/users');
        setUsers(res.data);
        setLoading(false);
    }
    async function updateLimit(u: UserRow, value: number) {
        await api.patch(`/users/${u.id}/post-limit`, { monthlyPostLimit: value });
        load();
    }

    useEffect(() => {
        load();
    }, []);

    async function toggleBan(u: UserRow) {
        await api.patch(`/users/${u.id}/ban`, { isBanned: !u.isBanned });
        load();
    }

    async function changeRole(u: UserRow) {
        const nextRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
        if (!confirm(`Đổi quyền của ${u.name} thành ${nextRole}?`)) return;
        await api.patch(`/users/${u.id}/role`, { role: nextRole });
        load();
    }

    async function removeUser(u: UserRow) {
        if (!confirm(`Xoá tài khoản ${u.email}? Hành động không thể hoàn tác.`)) return;
        await api.delete(`/users/${u.id}`);
        load();
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8 heading-gradient inline-block">Quản lý người dùng</h1>
            {loading ? (
                <p className="text-gray-400">Đang tải...</p>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-brand-50 text-left text-sm text-gray-600">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Tên</th>
                                <th className="px-5 py-3 font-semibold">Email</th>
                                <th className="px-5 py-3 font-semibold">Quyền</th>
                                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                                <th className="px-5 py-3 font-semibold">Giới hạn bài/tháng</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-t border-gray-100 text-sm hover:bg-brand-50/40 transition-colors">
                                    <td className="px-5 py-3 font-medium">{u.name}</td>
                                    <td className="px-5 py-3 text-gray-500">{u.email}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        {u.isBanned ? (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Đã khoá</span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Hoạt động</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-right space-x-3">
                                        <button onClick={() => changeRole(u)} className="text-brand-600 hover:underline font-medium">
                                            Đổi quyền
                                        </button>
                                        <button onClick={() => toggleBan(u)} className="text-amber-600 hover:underline font-medium">
                                            {u.isBanned ? 'Mở khoá' : 'Khoá'}
                                        </button>
                                        <button onClick={() => removeUser(u)} className="text-red-600 hover:underline font-medium">
                                            Xoá
                                        </button>
                                    </td>
                                    <td className="px-5 py-3">
                                        {u.role === 'USER' ? (
                                            <input
                                                type="number"
                                                min={0}
                                                defaultValue={u.monthlyPostLimit}
                                                onBlur={(e) => updateLimit(u, Number(e.target.value) || 0)}
                                                className="w-20 border-2 border-gray-200 rounded-lg px-2 py-1 text-sm"
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-xs">Không giới hạn</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default function AdminUsersPage() {
    return (
        <AdminGuard>
            <Content />
        </AdminGuard>
    );
}