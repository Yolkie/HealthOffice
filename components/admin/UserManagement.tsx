"use client";

import { useState, useEffect } from "react";
import { BRANCH_OPTIONS } from "@/lib/types";

type User = {
    id: string;
    username: string;
    email: string;
    role: string;
    branch: string;
    createdAt: string;
};

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRole, setNewRole] = useState("reporter");
    const [newBranch, setNewBranch] = useState(BRANCH_OPTIONS[0]);
    const [creating, setCreating] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users");
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setUsers(data.users);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: newUsername,
                    password: newPassword,
                    role: newRole,
                    branch: newBranch,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create user");
            }

            // Reset form and reload
            setNewUsername("");
            setNewPassword("");
            setNewRole("reporter");
            setNewBranch(BRANCH_OPTIONS[0]);
            fetchUsers();
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete user");
            }

            fetchUsers();
        } catch (err: any) {
            console.error(err);
            alert(err.message);
        }
    };

    return (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
            <p className="text-sm text-slate-500">
                Manage access for Admins and Reporters.
            </p>

            {/* Create User Form */}
            <form
                onSubmit={handleCreateUser}
                className="mt-6 grid gap-4 rounded-lg bg-slate-50 p-4 md:grid-cols-5 md:items-end"
            >
                <div>
                    <label className="block text-xs font-medium text-slate-700">
                        Username
                    </label>
                    <input
                        type="text"
                        required
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="jdoe"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-700">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="••••••••"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-700">
                        Role
                    </label>
                    <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                        <option value="reporter">Reporter</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-700">
                        Branch
                    </label>
                    <select
                        value={newBranch}
                        onChange={(e) => setNewBranch(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                        {BRANCH_OPTIONS.map((branch) => (
                            <option key={branch} value={branch}>
                                {branch}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={creating}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {creating ? "Adding..." : "Add User"}
                </button>
            </form>

            {error && (
                <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* User List */}
            <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                Username
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                Branch
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                Created At
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">
                                    Loading users...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                                        {user.username}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                        <span
                                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.role === "admin"
                                                ? "bg-purple-100 text-purple-800"
                                                : "bg-green-100 text-green-800"
                                                }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                        {user.branch}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
