export default function ForgotPasswordPage() {
   return (
      <div className="flex justify-center items-center px-4 py-12 min-h-screen bg-gray-50 sm:px-6 lg:px-8">
         <div className="space-y-8 w-full max-w-md">
            <div>
               <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
                  Forgot Password
               </h2>
               <p className="mt-2 text-sm text-center text-gray-600">
                  Enter your email address and we&apos;ll send you a link to reset your password.
               </p>
            </div>
            <form className="mt-8 space-y-6">
               <div>
                  <label htmlFor="email" className="sr-only">
                     Email address
                  </label>
                  <input
                     id="email"
                     name="email"
                     type="email"
                     autoComplete="email"
                     required
                     className="block relative px-3 py-2 w-full placeholder-gray-500 text-gray-900 rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                     placeholder="Email address"
                  />
               </div>
               <div>
                  <button
                     type="submit"
                     className="flex relative justify-center px-4 py-2 w-full text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                     Send Reset Link
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}
