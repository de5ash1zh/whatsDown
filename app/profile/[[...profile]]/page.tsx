'use client';

import { UserProfile } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
          <button
            onClick={() => router.push('/chat')}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            ← Back to Chat
          </button>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow">
          <UserProfile 
            appearance={{
              elements: {
                card: 'shadow-none border-0',
                navbar: 'hidden',
                pageScrollBox: 'p-6',
                formButtonPrimary: 
                  'bg-blue-500 hover:bg-blue-600 text-sm normal-case',
                formFieldInput: 
                  'border border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                accordionTriggerButton: 
                  'text-gray-900 hover:text-blue-600',
              },
            }}
            routing="path"
            path="/profile"
          />
        </div>
      </div>
    </div>
  );
}
