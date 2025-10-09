/**
 * Platform API Route
 * Server-side endpoint for fetching platform data from RapidAPI
 * Route: /api/platform/[type]?username=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchPlatformData } from '@/lib/api/platform.api';
import type { PlatformType } from '@/types/platform.types';

export async function GET(
   request: NextRequest,
   { params }: { params: Promise<{ type: string }> }
) {
   try {
      const resolvedParams = await params;
      const { type } = resolvedParams;
      const { searchParams } = new URL(request.url);
      const username = searchParams.get('username');

      // Validate platform type
      const validPlatforms: PlatformType[] = ['tiktok', 'twitter', 'twitch'];
      if (!validPlatforms.includes(type as PlatformType)) {
         return NextResponse.json(
            { success: false, error: 'Invalid platform type' },
            { status: 400 }
         );
      }

      // Validate username
      if (!username || username.trim() === '') {
         return NextResponse.json(
            { success: false, error: 'Username is required' },
            { status: 400 }
         );
      }

      // Check if RapidAPI key is configured
      const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
      if (!rapidApiKey) {
         // Return mock data for testing when RapidAPI key is not configured
         console.log(`🔧 Using mock data for ${type} (username: ${username}) - RapidAPI key not configured`);

         const mockData = {
            platform: type as PlatformType,
            username: username.trim(),
            displayName: username.trim(),
            profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(username.trim())}&background=random`,
            bio: `Mock bio for ${username.trim()}`,
            verified: false,
            followers: Math.floor(Math.random() * 10000) + 100, // Random followers between 100-10100
            following: Math.floor(Math.random() * 1000) + 10,
            totalContent: Math.floor(Math.random() * 100) + 5,
            totalEngagement: Math.floor(Math.random() * 5000) + 100,
            averageEngagement: Math.floor(Math.random() * 20) + 1,
            lastFetched: new Date(),
            raw: { mock: true, platform: type, username: username.trim() }
         };

         return NextResponse.json({
            success: true,
            data: mockData,
            cached: false,
            mock: true
         });
      }

      // Fetch platform data
      const result = await fetchPlatformData(type as PlatformType, username.trim());

      if (!result.success) {
         return NextResponse.json(
            { success: false, error: result.error },
            { status: 404 }
         );
      }

      return NextResponse.json({
         success: true,
         data: result.data,
         cached: false,
      });

   } catch (error) {
      console.error('Platform API error:', error);
      return NextResponse.json(
         {
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
         },
         { status: 500 }
      );
   }
}

// Optional: POST endpoint for batch fetching multiple platforms
export async function POST(
   request: NextRequest,
   { params }: { params: Promise<{ type: string }> }
) {
   try {
      const resolvedParams = await params;
      const { type } = resolvedParams;

      if (type !== 'batch') {
         return NextResponse.json(
            { success: false, error: 'Use GET for single platform or POST /api/platform/batch for multiple' },
            { status: 400 }
         );
      }

      const body = await request.json();
      const { platforms } = body;

      if (!Array.isArray(platforms) || platforms.length === 0) {
         return NextResponse.json(
            { success: false, error: 'Platforms array is required' },
            { status: 400 }
         );
      }

      // Fetch data for all platforms
      const results = await Promise.allSettled(
         platforms.map(({ type, username }: { type: PlatformType; username: string }) =>
            fetchPlatformData(type, username)
         )
      );

      const platformData: Record<string, unknown> = {};

      results.forEach((result, index) => {
         const platform = platforms[index].type;

         if (result.status === 'fulfilled' && result.value.success) {
            platformData[platform] = result.value.data;
         } else {
            platformData[platform] = null;
         }
      });

      return NextResponse.json({
         success: true,
         data: platformData,
      });

   } catch (error) {
      console.error('Platform batch API error:', error);
      return NextResponse.json(
         {
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
         },
         { status: 500 }
      );
   }
}

