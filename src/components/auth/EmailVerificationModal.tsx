'use client'

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmailVerificationModalProps {
   isOpen: boolean;
   onClose: () => void;
   email: string;
}

export default function EmailVerificationModal({ isOpen, onClose, email }: EmailVerificationModalProps) {
   const router = useRouter();

   // Prevent body scroll when modal is open
   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = 'unset';
      }
      return () => {
         document.body.style.overflow = 'unset';
      };
   }, [isOpen]);

   const handleGoToLogin = () => {
      onClose();
      router.push('/auth/signin');
   };

   return (
      <AnimatePresence>
         {isOpen && (
            <>
               {/* Backdrop */}
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={onClose}
                  className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
               />

               {/* Modal */}
               <div className="flex fixed inset-0 z-50 justify-center items-center p-4">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.9, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9, y: 20 }}
                     transition={{ type: 'spring', duration: 0.5 }}
                     className="relative w-full max-w-md"
                  >
                     <div className="relative overflow-hidden bg-white rounded-2xl shadow-2xl">
                        {/* Gradient Header Background */}
                        <div className="absolute top-0 right-0 left-0 h-32 bg-linear-to-br from-purple-500 to-blue-500 opacity-10" />

                        {/* Close Button */}
                        <button
                           onClick={onClose}
                           className="absolute top-4 right-4 z-10 p-2 text-gray-400 rounded-lg transition-all hover:bg-gray-100 hover:text-gray-600"
                           aria-label="Close modal"
                        >
                           <X className="w-5 h-5" />
                        </button>

                        {/* Content */}
                        <div className="relative p-8">
                           {/* Success Icon */}
                           <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                              className="flex justify-center mb-6"
                           >
                              <div className="relative">
                                 <div className="flex justify-center items-center w-20 h-20 bg-linear-to-br from-purple-500 to-blue-500 rounded-full shadow-lg">
                                    <Mail className="w-10 h-10 text-white" />
                                 </div>
                                 <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.4, type: 'spring' }}
                                    className="flex absolute -right-1 -bottom-1 justify-center items-center w-8 h-8 bg-green-500 rounded-full border-4 border-white"
                                 >
                                    <CheckCircle className="w-5 h-5 text-white" />
                                 </motion.div>
                              </div>
                           </motion.div>

                           {/* Title */}
                           <motion.h2
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="mb-3 text-2xl font-bold text-center text-gray-900"
                           >
                              Check Your Email
                           </motion.h2>

                           {/* Description */}
                           <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="mb-6 space-y-3"
                           >
                    <p className="text-center text-gray-600">
                      We&apos;ve sent a verification link to:
                    </p>
                              <div className="p-3 text-center bg-purple-50 rounded-lg border border-purple-200">
                                 <p className="font-semibold text-purple-700">
                                    {email}
                                 </p>
                              </div>
                              <p className="text-sm text-center text-gray-600">
                                 Click the link in the email to verify your account and complete your registration.
                              </p>
                           </motion.div>

                           {/* Actions */}
                           <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 }}
                           >
                              <button
                                 onClick={handleGoToLogin}
                                 className="flex justify-center items-center gap-2 w-full h-12 font-semibold text-white bg-linear-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg transition-all duration-300 transform cursor-pointer hover:from-purple-700 hover:to-blue-700 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25 active:scale-[0.98]"
                              >
                                 Go to Login
                              </button>
                           </motion.div>

                  {/* Helper Text */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-4 text-xs text-center text-gray-500"
                  >
                    Didn&apos;t receive the email? Check your spam folder or contact support.
                  </motion.p>
                        </div>
                     </div>
                  </motion.div>
               </div>
            </>
         )}
      </AnimatePresence>
   );
}

