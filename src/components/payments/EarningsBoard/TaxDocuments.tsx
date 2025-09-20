"use client";

import React, { useState } from 'react';

interface TaxDocument {
   id: string;
   year: number;
   type: '1099' | 'W-9' | 'Tax Summary';
   status: 'available' | 'pending' | 'not_available';
   downloadUrl?: string;
   createdAt: string;
}

interface TaxDocumentsProps {
   className?: string;
}

export function TaxDocuments({ className = '' }: TaxDocumentsProps) {
   const [documents] = useState<TaxDocument[]>([
      {
         id: '1',
         year: 2024,
         type: 'Tax Summary',
         status: 'available',
         downloadUrl: '#',
         createdAt: '2024-01-15T00:00:00.000Z',
      },
      {
         id: '2',
         year: 2023,
         type: '1099',
         status: 'available',
         downloadUrl: '#',
         createdAt: '2023-01-31T00:00:00.000Z',
      },
      {
         id: '3',
         year: 2024,
         type: 'W-9',
         status: 'pending',
         createdAt: '2024-01-01T00:00:00.000Z',
      },
   ]);

   const getStatusColor = (status: string) => {
      switch (status) {
         case 'available':
            return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
         case 'pending':
            return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
         case 'not_available':
            return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
         default:
            return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
      }
   };

   const getStatusText = (status: string) => {
      switch (status) {
         case 'available':
            return 'Available';
         case 'pending':
            return 'Pending';
         case 'not_available':
            return 'Not Available';
         default:
            return status.charAt(0).toUpperCase() + status.slice(1);
      }
   };

   const getDocumentIcon = (type: string) => {
      switch (type) {
         case '1099':
            return (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
            );
         case 'W-9':
            return (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
               </svg>
            );
         case 'Tax Summary':
            return (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
               </svg>
            );
         default:
            return (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
            );
      }
   };

   const handleDownload = (document: TaxDocument) => {
      if (document.status === 'available' && document.downloadUrl) {
         // In a real implementation, this would trigger the actual download
         console.log('Downloading document:', document);
         alert(`Downloading ${document.type} for ${document.year}`);
      }
   };

   return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
         <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
               Tax Documents
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
               Download your tax documents and forms
            </p>
         </div>

         <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {documents.length === 0 ? (
               <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                     <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                     No Tax Documents
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                     Tax documents will appear here when available
                  </p>
               </div>
            ) : (
               documents.map((document) => (
                  <div key={document.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              {getDocumentIcon(document.type)}
                           </div>
                           <div>
                              <div className="flex items-center space-x-2">
                                 <h4 className="font-medium text-gray-900 dark:text-white">
                                    {document.type} - {document.year}
                                 </h4>
                                 <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(document.status)}`}>
                                    {getStatusText(document.status)}
                                 </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                 Created on {new Date(document.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                 })}
                              </p>
                           </div>
                        </div>

                        <div className="flex items-center space-x-2">
                           {document.status === 'available' ? (
                              <button
                                 onClick={() => handleDownload(document)}
                                 className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex items-center space-x-2"
                              >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                                 <span>Download</span>
                              </button>
                           ) : document.status === 'pending' ? (
                              <span className="px-4 py-2 text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-400 rounded-lg flex items-center space-x-2">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                 </svg>
                                 <span>Processing</span>
                              </span>
                           ) : (
                              <span className="px-4 py-2 text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 rounded-lg">
                                 Not Available
                              </span>
                           )}
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>

         <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-start space-x-3">
               <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                     Tax Information
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                     Tax documents are typically available by January 31st of each year.
                     If you need assistance with your tax documents, please contact our support team.
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
}

export default TaxDocuments;
