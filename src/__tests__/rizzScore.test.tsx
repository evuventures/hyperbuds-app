/**
 * Rizz Score Integration Test Example
 * 
 * This file demonstrates how to test the Rizz Score integration
 * Run with: npm test -- --testPathPattern=rizzScore
 */

// Mock the hook first
jest.mock('../hooks/useRizzScore');

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RizzScoreDisplay } from '../components/profile/RizzScoreDisplay';
import { useRizzScore } from '../hooks/useRizzScore';
import '@testing-library/jest-dom';

const mockUseRizzScore = useRizzScore as jest.MockedFunction<typeof useRizzScore>;

describe('Rizz Score Integration', () => {
   const mockRizzScore = {
      _id: '1',
      userId: 'user1',
      currentScore: 85,
      factors: {
         engagement: {
            avgLikes: 1000,
            avgComments: 150,
            avgShares: 75,
            avgViews: 5000,
            engagementRate: 12.5
         },
         growth: {
            followerGrowthRate: 15.2,
            contentFrequency: 5,
            consistencyScore: 8.5
         },
         collaboration: {
            successfulCollabs: 10,
            avgPartnerRating: 4.8,
            responseRate: 95,
            completionRate: 98
         },
         quality: {
            contentScore: 8.5,
            technicalQuality: 9,
            originality: 8
         }
      },
      trending: {
         isViral: false,
         trendingScore: 45,
         viralContent: []
      },
      lastCalculated: new Date().toISOString(),
      calculationVersion: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
   };

   beforeEach(() => {
      jest.clearAllMocks();
   });

   test('should display Rizz Score correctly', async () => {
      mockUseRizzScore.mockReturnValue({
         rizzScore: mockRizzScore,
         loading: false,
         error: null,
         recalculate: jest.fn(),
         refetch: jest.fn()
      });

      render(<RizzScoreDisplay />);

      await waitFor(() => {
         expect(screen.getByText('Rizz Score')).toBeInTheDocument();
         expect(screen.getByText('85')).toBeInTheDocument();
         expect(screen.getByText('Top Performer')).toBeInTheDocument();
      });
   });

   test('should show loading state', () => {
      mockUseRizzScore.mockReturnValue({
         rizzScore: null,
         loading: true,
         error: null,
         recalculate: jest.fn(),
         refetch: jest.fn()
      });

      render(<RizzScoreDisplay />);

      // Check for loading skeleton elements
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
   });

   test('should show error state', () => {
      mockUseRizzScore.mockReturnValue({
         rizzScore: null,
         loading: false,
         error: 'Unable to load Rizz Score data',
         recalculate: jest.fn(),
         refetch: jest.fn()
      });

      render(<RizzScoreDisplay />);

      expect(screen.getByText('Unable to load Rizz Score data')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
   });

   test('should handle recalculate button click', async () => {
      const mockRecalculate = jest.fn();
      mockUseRizzScore.mockReturnValue({
         rizzScore: mockRizzScore,
         loading: false,
         error: null,
         recalculate: mockRecalculate,
         refetch: jest.fn()
      });

      render(<RizzScoreDisplay />);

      const recalculateButton = screen.getByTitle('Recalculate your Rizz Score');
      fireEvent.click(recalculateButton);

      await waitFor(() => {
         expect(mockRecalculate).toHaveBeenCalledTimes(1);
      });
   });

   test('should display viral content alert', () => {
      const viralRizzScore = {
         ...mockRizzScore,
         trending: {
            isViral: true,
            trendingScore: 85,
            viralContent: ['Trending Video 1', 'Viral Post 2']
         }
      };

      mockUseRizzScore.mockReturnValue({
         rizzScore: viralRizzScore,
         loading: false,
         error: null,
         recalculate: jest.fn(),
         refetch: jest.fn()
      });

      render(<RizzScoreDisplay />);

      expect(screen.getByText('🔥 Viral Content Detected')).toBeInTheDocument();
      expect(screen.getByText('Viral Content Alert')).toBeInTheDocument();
   });
});
