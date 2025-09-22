'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue your conversations</p>
        </div>
        
        {/* Sign-in card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <SignIn 
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
              },
              layout: {
                socialButtonsPlacement: 'top',
              },
            }}
            redirectUrl="/chat"
            signUpUrl="/sign-up"
          />
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            New to WhatsDown?{' '}
            <a href="/sign-up" className="text-gray-900 hover:text-gray-700 font-medium underline underline-offset-4 transition-colors">
              Create an account
            </a>
          </p>
        </div>

        {/* Features showcase */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div className="text-gray-500">
            <div className="w-8 h-8 mx-auto mb-3 text-gray-700">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-sm font-medium">Secure</p>
          </div>
          <div className="text-gray-500">
            <div className="w-8 h-8 mx-auto mb-3 text-gray-700">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-sm font-medium">Fast</p>
          </div>
          <div className="text-gray-500">
            <div className="w-8 h-8 mx-auto mb-3 text-gray-700">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <p className="text-sm font-medium">Real-time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
