// app/provider/disclaimer/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrivateRoute } from '@/app/hooks/PrivateRoute';

const DisclaimerPage = () => {
  const [isChecked, setIsChecked] = useState(false);
  const router = useRouter();

  const handleAgreement = () => {
    if (isChecked) {
      // Store acceptance in session storage
      sessionStorage.setItem('disclaimerAccepted', 'true');
      router.push('/provider/starting');
    }
  };

  return (
    <PrivateRoute>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-100 p-4 rounded-full">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Data Protection Agreement</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: April 4, 2025</p>
        </div>

        <div className="prose prose-blue max-w-none border-y border-gray-200 py-8">
          <p className="text-gray-700 leading-relaxed">
            By proceeding with registration, you acknowledge and consent to the secure handling of your personal 
            data in accordance with India's Digital Personal Data Protection Act (DPDPA) 2023. All information 
            provided will be encrypted using AES-256 standards and stored in PCI DSS compliant systems.
          </p>

          <ul className="mt-6 space-y-4 text-gray-600">
            <li className="flex items-start">
              <svg className="flex-shrink-0 w-5 h-5 text-blue-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-3">Strict confidentiality of Aadhaar and PAN details</span>
            </li>
            <li className="flex items-start">
              <svg className="flex-shrink-0 w-5 h-5 text-blue-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-3">ISO 27001 certified data centers</span>
            </li>
            <li className="flex items-start">
              <svg className="flex-shrink-0 w-5 h-5 text-blue-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-3">Regular third-party security audits</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 space-y-6">
          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreement"
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreement" className="font-medium text-gray-700">
                I accept the Terms of Service and Privacy Policy
              </label>
              <p className="text-gray-500 mt-1">
                You acknowledge that you have read and understood our data handling practices.
              </p>
            </div>
          </div>

          <button
            onClick={handleAgreement}
            disabled={!isChecked}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              isChecked 
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue to Registration
          </button>
        </div>
      </div>
    </div>
    </PrivateRoute>
  );
};

export default DisclaimerPage;
