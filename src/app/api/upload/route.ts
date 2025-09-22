import type { NextRequest } from 'next/server';

export const GET = async (request: NextRequest) => {
  // implement your GET handler logic here
  return new Response('Auth GET endpoint');
};

// You can also export POST, PUT, etc. as needed