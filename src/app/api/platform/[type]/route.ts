/**
 * Platform API Route
 * Server-side endpoint for fetching platform data from Backend API (SocialData.Tools)
 * Route: /api/platform/[type]?username=xxx
 * Supported platforms: tiktok, instagram, youtube, twitter, twitch
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchPlatformData } from '@/lib/api/platform.api';
import type { PlatformType } from '@/types/platform.types';

export async function GET(
   request: NextRequest,
   { params }: { params: Promise<{ type: string }> }
) {
   try {
      console.log('🔍 Platform API GET route called');
      
      const resolvedParams = await params;
      const { type } = resolvedParams;
      const { searchParams } = new URL(request.url);
      const username = searchParams.get('username');

      console.log(`🔍 Platform API called: ${type} with username: "${username}"`);
      console.log(`🔍 Full URL: ${request.url}`);

      // Validate platform type (backend supports: tiktok, instagram, youtube, twitter, twitch)
      const validPlatforms: PlatformType[] = ['tiktok', 'instagram', 'youtube', 'twitter', 'twitch'];
      if (!validPlatforms.includes(type as PlatformType)) {
         console.log(`❌ Invalid platform type: ${type}`);
         return NextResponse.json(
            { success: false, error: `Invalid platform type. Supported platforms: ${validPlatforms.join(', ')}` },
            { status: 400 }
         );
      }

      // Validate username
      if (!username || username.trim() === '') {
         console.log(`❌ Username is required but got: "${username}"`);
         return NextResponse.json(
            { success: false, error: 'Username is required' },
            { status: 400 }
         );
      }

      // Get auth token from request headers if available
      const authHeader = request.headers.get('authorization');
      const authToken = authHeader?.replace('Bearer ', '') || undefined;

      console.log(`📡 Calling fetchPlatformData for ${type} with username: ${username}`);
      console.log(`🔑 Auth token present: ${!!authToken}`);
      
      // Fetch platform data (pass auth token if available)
      const result = await fetchPlatformData(type as PlatformType, username.trim(), authToken);

      console.log(`📥 fetchPlatformData result:`, { success: result.success, hasData: !!result.data, error: result.error });

      if (!result.success) {
         // Return the actual error message - no mock data fallback
         const errorMessage = result.error || 'Failed to fetch platform data';
         console.error(`❌ Failed to fetch ${type} data for ${username}:`, errorMessage);
         
         return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 200 } // Return 200 to avoid frontend treating it as route error
         );
      }

      console.log(`✅ Successfully fetched ${type} data for ${username}`);
      
      return NextResponse.json({
         success: true,
         data: result.data,
         cached: false,
      });

   } catch (error) {
      console.error('❌ Platform API error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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

      // Get auth token from request headers if available (same as GET endpoint)
      const authHeader = request.headers.get('authorization');
      const authToken = authHeader?.replace('Bearer ', '') || undefined;

      console.log(`📡 Batch fetch for ${platforms.length} platforms`);
      console.log(`🔑 Auth token present: ${!!authToken}`);

      // Fetch data for all platforms (pass auth token if available)
      const results = await Promise.allSettled(
         platforms.map(({ type, username }: { type: PlatformType; username: string }) =>
            fetchPlatformData(type, username.trim(), authToken)
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
      console.error('❌ Platform batch API error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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

