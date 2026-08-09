'use client';

import { useEffect, useState } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { api } from '@/lib/api-client';

type UserRow = {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'USER';
    isBanned: boolean;
    emailVerified: boolean;
    createdAt: string;
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
            <h1 className="text-2xl font-bold mb-6">Quản lý người dùng</h1>
            {loading ? (
                <p className="text-gray-400">Đang tải...</p>
            ) : (
                <table className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
                    <thead className="bg-gray-100 text-left text-sm">
                        <tr>
                            <th className="px-4 py-2">Tên</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Quyền</th>
                            <th className="px-4 py-2">Trạng thái</th>
                            <th className="px-4 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} className="border-t text-sm">
                                <td className="px-4 py-2">{u.name}</td>
                                <td className="px-4 py-2">{u.email}</td>
                                <td className="px-4 py-2">{u.role}</td>
                                <td className="px-4 py-2">
                                    {u.isBanned ? (
                                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Đã khoá</span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Hoạt động</span>
                                    )}
                                </td>
                                <td className="px-4 py-2 text-right space-x-3">
                                    <button onClick={() => changeRole(u)} className="text-brand hover:underline">
                                        Đổi quyền
                                    </button>
                                    <button onClick={() => toggleBan(u)} className="text-yellow-700 hover:underline">
                                        {u.isBanned ? 'Mở khoá' : 'Khoá'}
                                    </button>
                                    <button onClick={() => removeUser(u)} className="text-red-600 hover:underline">
                                        Xoá
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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