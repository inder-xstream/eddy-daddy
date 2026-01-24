'use client';

import { useActionState } from 'react';
import { updateProfile } from '@/server/actions/user';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Saving...' : 'Save Changes'}
    </button>
  );
}

interface UserProps {
    id: string;
    username: string;
    email: string;
    avatarUrl: string | null;
    authProvider: string | null;
    role: string;
}

const initialState = {
    success: false,
    error: '',
    message: ''
};

export function ProfileForm({ user }: { user: UserProps }) {
  const [state, formAction] = useActionState(updateProfile, initialState);
  const isCredentialsUser = !user.authProvider || user.authProvider === 'credentials';

  return (
    <form action={formAction} className="space-y-6">
        {/* Read Only Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                </label>
                <input
                    type="text"
                    disabled
                    value={user.username}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-gray-100 dark:bg-dark-900 text-gray-500 shadow-sm sm:text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                </label>
                <input
                    type="text"
                    disabled
                    value={user.email}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-gray-100 dark:bg-dark-900 text-gray-500 shadow-sm sm:text-sm"
                />
            </div>
        </div>

        <div className="border-t border-gray-200 dark:border-dark-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Details</h3>
            
            <div>
                <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Avatar URL
                </label>
                <p className="text-xs text-gray-500 mb-2">Link to an image (e.g., from Imgur or other host).</p>
                <input
                    type="url"
                    name="avatarUrl"
                    id="avatarUrl"
                    defaultValue={user.avatarUrl || ''}
                    placeholder="https://example.com/avatar.jpg"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                />
            </div>
        </div>

        {isCredentialsUser && (
             <div className="border-t border-gray-200 dark:border-dark-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
                
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Current Password
                        </label>
                        <input
                            type="password"
                            name="currentPassword"
                            id="currentPassword"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            New Password
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            id="newPassword"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                        />
                    </div>
                </div>
            </div>
        )}

       {state.error && (
            <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 text-sm">
                {state.error}
            </div>
       )}
       
       {state.success && (
            <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-200 text-sm">
                {state.message}
            </div>
       )}
       
       <div className="pt-4">
            <SubmitButton />
       </div>
    </form>
  );
}
