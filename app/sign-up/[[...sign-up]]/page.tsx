'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-lg mb-6 shadow-sm">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Join WhatsDown</h1>
          <p className="text-gray-600">Create your account and start connecting</p>
        </div>
        
        {/* Sign-up card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 
                  'bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200 border-0',
                card: 'bg-transparent shadow-none border-0',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 
                  'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-md transition-colors duration-200',
                socialButtonsBlockButtonText: 'text-gray-700 font-medium',
                formFieldInput: 
                  'bg-white border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-gray-900 placeholder-gray-500 rounded-md py-3 px-4 transition-colors duration-200',
                formFieldLabel: 'text-gray-700 font-medium mb-2',
                footerActionLink: 'text-gray-600 hover:text-gray-900 font-medium',
                identityPreviewText: 'text-gray-900',
                formHeaderTitle: 'text-gray-900 text-xl font-semibold',
                formHeaderSubtitle: 'text-gray-600',
                dividerLine: 'bg-gray-200',
                dividerText: 'text-gray-500',
                formResendCodeLink: 'text-gray-600 hover:text-gray-900',
                otpCodeFieldInput: 'bg-white border-gray-300 text-gray-900',
                formFieldErrorText: 'text-red-600',
                alertClerkError: 'text-red-600 bg-red-50 border-red-200',
                formFieldSuccessText: 'text-green-600',
                formFieldInfoText: 'text-gray-600',
              },
              layout: {
                socialButtonsPlacement: 'top',
              },
            }}
            redirectUrl="/chat"
            signInUrl="/sign-in"
          />
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a href="/sign-in" className="text-gray-900 hover:text-gray-700 font-medium underline underline-offset-4 transition-colors">
              Sign in here
            </a>
          </p>
        </div>

        {/* Benefits showcase */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center text-gray-700 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="w-8 h-8 mr-3 text-gray-900">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium">End-to-end encrypted conversations</span>
          </div>
          <div className="flex items-center text-gray-700 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="w-8 h-8 mr-3 text-gray-900">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-medium">Real-time message delivery</span>
          </div>
          <div className="flex items-center text-gray-700 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="w-8 h-8 mr-3 text-gray-900">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium">Connect with friends worldwide</span>
          </div>
        </div>
      </div>
    </div>
  );
}
