'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NotFound = () => {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  useEffect(() => {
    // Update the timer every second
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Redirect to home when countdown hits 0
    const redirect = setTimeout(() => {
      router.push('/');
    }, 5000);

    // Cleanup timers if the user clicks away manually
    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>404 - Page Not Found</h1>
      <p>Oops! The page you are looking for doesn&apos;t exist yet.</p>
      <p>Redirecting you to the homepage in <strong>{countdown}</strong> seconds...</p>
      
      <Link href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
        Take me home now
      </Link>
    </div>
  );
};

export default NotFound;