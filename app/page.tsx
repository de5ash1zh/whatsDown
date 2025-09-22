'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.push('/chat');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsDown</h1>
          <p className="text-gray-600">Real-time chat application</p>
        </div>

        <div className="space-y-4">
          <div className="text-4xl mb-4">💬</div>
          
          <p className="text-gray-700 mb-6">
            Connect with friends and family through secure, real-time messaging.
          </p>

          <div className="space-y-3">
            <Link
              href="/sign-in"
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium block"
            >
              Sign In
            </Link>
            
            <Link
              href="/sign-up"
              className="w-full border border-blue-500 text-blue-500 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors font-medium block"
            >
              Create Account
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <p>Features:</p>
            <ul className="mt-2 space-y-1">
              <li>✓ Real-time messaging</li>
              <li>✓ Online status indicators</li>
              <li>✓ Typing indicators</li>
              <li>✓ Message delivery status</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
