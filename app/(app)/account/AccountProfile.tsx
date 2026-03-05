import type { CurrentUser } from "@/lib/auth";

export default function AccountProfile({ user }: { user: CurrentUser | null }) {
  if (user) {
    return (
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Profile</h2>
        <dl className="space-y-1 text-sm">
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium text-[#0d1f3c]">{user.email}</dd>
          </div>
          {user.name && (
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium text-[#0d1f3c]">{user.name}</dd>
            </div>
          )}
          {user.department && (
            <div>
              <dt className="text-gray-500">Department</dt>
              <dd className="font-medium text-[#0d1f3c]">{user.department.name}</dd>
            </div>
          )}
          <div>
            <dt className="text-gray-500">Role</dt>
            <dd className="font-medium text-[#0d1f3c]">{user.role}</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Profile</h2>
      <p className="text-sm text-gray-500">
        Your session is active. Contact your administrator to link this account to a profile (name, department, role).
      </p>
    </div>
  );
}
