import { NextRequest, NextResponse } from 'next/server';

// Mock data for now - replace with real database queries
const mockRecommendations = [
   {
      id: 1,
      name: "Alex Thompson",
      role: "Podcast Host",
      followers: "42K",
      overlap: "81%",
      synergy: "91%",
      img: "/images/icons-dashboard/user1.jpg",
      location: "Chicago, IL",
      responseTime: "< 1 hour",
      collaborationRate: "$400-1K",
      rizzScore: 89,
      verified: true,
      online: true,
      specialties: ["Podcasting", "Interviews", "Storytelling"],
      recentWork: "True Crime Series",
      passedAt: "5 days ago",
   },
   {
      id: 2,
      name: "Sophie Chen",
      role: "Art Director",
      followers: "19K",
      overlap: "75%",
      synergy: "88%",
      img: "/images/icons-dashboard/user2.jpg",
      location: "Portland, OR",
      responseTime: "< 2 hours",
      collaborationRate: "$300-800",
      rizzScore: 89,
      verified: true,
      online: false,
      specialties: ["Design", "Art", "Branding"],
      recentWork: "Brand Identity Project",
      passedAt: "3 days ago",
   },
   {
      id: 3,
      name: "Marcus Johnson",
      role: "Fitness Coach",
      followers: "35K",
      overlap: "68%",
      synergy: "82%",
      img: "/images/icons-dashboard/user3.jpg",
      location: "Austin, TX",
      responseTime: "< 30 min",
      collaborationRate: "$500-1.2K",
      rizzScore: 84,
      verified: false,
      online: true,
      specialties: ["Fitness", "Nutrition", "Wellness"],
      recentWork: "30-Day Challenge",
      passedAt: "1 week ago",
   },
   {
      id: 4,
      name: "Emily White",
      role: "Travel Vlogger",
      followers: "50K",
      overlap: "90%",
      synergy: "95%",
      img: "/images/icons-dashboard/slide-image.jpg",
      location: "Denver, CO",
      responseTime: "< 4 hours",
      collaborationRate: "$600-1.5K",
      rizzScore: 92,
      verified: true,
      online: true,
      specialties: ["Travel", "Vlogging", "Photography"],
      recentWork: "European Backpacking Series",
      passedAt: "2 weeks ago",
   },
   {
      id: 5,
      name: "Daniel Lee",
      role: "Software Engineer",
      followers: "10K",
      overlap: "70%",
      synergy: "80%",
      img: "/images/icons-dashboard/user1.jpg",
      location: "San Jose, CA",
      responseTime: "< 1 hour",
      collaborationRate: "$700-1.8K",
      rizzScore: 85,
      verified: false,
      online: true,
      specialties: ["Coding", "Tutorials", "AI"],
      recentWork: "Machine Learning Project",
      passedAt: "4 days ago",
   },
];

export async function GET(request: NextRequest) {
   try {
      // Get query parameters
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get('limit') || '10');
      const offset = parseInt(searchParams.get('offset') || '0');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filter and paginate recommendations
      const recommendations = mockRecommendations.slice(offset, offset + limit);
      const total = mockRecommendations.length;
      const hasMore = offset + limit < total;

      return NextResponse.json({
         success: true,
         data: {
            recommendations,
            total,
            hasMore,
            pagination: {
               limit,
               offset,
               totalPages: Math.ceil(total / limit),
               currentPage: Math.floor(offset / limit) + 1,
            }
         }
      });

   } catch (error) {
      console.error('Error fetching recommendations:', error);
      return NextResponse.json(
         {
            success: false,
            error: 'Failed to fetch recommendations',
            message: 'An error occurred while loading recommendations. Please try again.'
         },
         { status: 500 }
      );
   }
}
