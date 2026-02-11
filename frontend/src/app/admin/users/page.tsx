"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { getAdminUsers, updateAdminUserRole, AdminUser } from "@/lib/api";
import { Card, Skeleton, Button, Input } from "@/components/ui";

export default function AdminUsersPage() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const result = await getAdminUsers(token, {
        page,
        limit: 20,
        search: search || undefined,
        role: roleFilter || undefined,
      });

      if (result.data) {
        setUsers(result.data.users);
        setTotalPages(result.data.totalPages);
        setTotal(result.data.total);
      } else {
        setError(result.error || "Failed to load users");
      }
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [getToken, page, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: 'STUDENT' | 'ADMIN' | 'COUNSELOR') => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      await updateAdminUserRole(token, userId, newRole);
      fetchUsers();
    } catch (err) {
      alert("Failed to update user role");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-700';
      case 'COUNSELOR':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Users</h1>
          <p className="text-[#6B7280]">{total} registered users</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="ADMIN">Admin</option>
            <option value="COUNSELOR">Counselor</option>
          </select>
        </div>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchUsers()}>Try Again</Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && users.length === 0 && (
        <Card className="p-12 text-center">
          <span className="text-4xl mb-4 block">👤</span>
          <h2 className="text-xl font-semibold text-[#111827] mb-2">No users found</h2>
          <p className="text-[#6B7280]">
            {search || roleFilter
              ? "Try adjusting your filters"
              : "Users will appear here when they sign up"}
          </p>
        </Card>
      )}

      {/* Users Table */}
      {!isLoading && !error && users.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-[#111827]">
                        {user.email}
                      </div>
                      <div className="text-xs text-[#6B7280]">
                        ID: {user.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {user.studentProfile ? (
                        <div className="text-sm">
                          <div className="text-[#111827]">
                            {user.studentProfile.country}
                          </div>
                          <div className="text-[#6B7280]">
                            {user.studentProfile.targetField}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-[#6B7280]">No profile</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#6B7280]">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(
                            user.id,
                            e.target.value as 'STUDENT' | 'ADMIN' | 'COUNSELOR'
                          )
                        }
                        className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="COUNSELOR">Counselor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-[#6B7280]">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <span className="text-xl">💡</span>
          <div>
            <h3 className="font-medium text-[#111827]">Role Permissions</h3>
            <ul className="text-sm text-[#6B7280] mt-1 space-y-1">
              <li><strong>Student:</strong> Can browse, save, and track applications</li>
              <li><strong>Counselor:</strong> Same as Student (future: can view assigned leads)</li>
              <li><strong>Admin:</strong> Full access to admin dashboard and all data</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
