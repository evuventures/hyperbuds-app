import React, { useState } from 'react';
import { Search, Bell, Settings, Phone, Mail, MapPin, Eye, MessageCircle, Calendar, TrendingUp, Users, FileText, DollarSign } from 'lucide-react';

// Mock data
const mockData = {
  agent: {
    name: "Fred Johnson",
    role: "Agent at this platform",
    phone: "+1-702-555-0197",
    email: "fjohnson@email.com",
    location: "Los Angeles",
    company: "Horizon Realty Group"
  },
  stats: {
    totalListings: 1203,
    activeListings: 912,
    soldProperties: 320
  },
  leads: {
    new: 23,
    validation: 19,
    potential: 201
  },
  contacts: [
    { name: "Logan Davidson", type: "Buyer", time: "2 min ago", avatar: "LD" },
    { name: "Megan Pierce", type: "Seller", time: "5 min ago", avatar: "MP" },
    { name: "Marcus Reynolds", type: "New customer call", time: "15 min ago", avatar: "MR" }
  ],
  properties: [
    { id: 1, image: "/api/placeholder/200/150", type: "Multi", price: "$2.1M", beds: 4, baths: 3, sqft: "2,450 sq ft" },
    { id: 2, image: "/api/placeholder/200/150", type: "Single Family", price: "$850K", beds: 3, baths: 2, sqft: "1,800 sq ft" }
  ]
};

// Header Component
const Header = () => (
  <div className="flex items-center justify-between p-4 bg-white border-b">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">RH</span>
        </div>
        <span className="font-semibold">Realty Hub</span>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input 
          type="text" 
          placeholder="Search" 
          className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800" />
      <Settings className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800" />
      <span className="text-sm text-gray-600">Integration</span>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">FJ</span>
        </div>
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">M</span>
        </div>
      </div>
    </div>
  </div>
);

// Sidebar Component
const Sidebar = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'activity', icon: TrendingUp, label: 'My Activity' },
    { id: 'stats', icon: FileText, label: 'My Stats' },
    { id: 'overview', icon: Eye, label: 'Overview' }
  ];

  const leadItems = [
    { id: 'leads', icon: Users, label: 'Leads List' },
    { id: 'buyers', icon: Users, label: 'Buyers List' },
    { id: 'import', icon: FileText, label: 'Import' }
  ];

  const commItems = [
    { id: 'emails', icon: Mail, label: 'Emails' },
    { id: 'texts', icon: MessageCircle, label: 'Texts' },
    { id: 'chat', icon: MessageCircle, label: 'Live Chat' },
    { id: 'postcards', icon: FileText, label: 'Postcards' }
  ];

  return (
    <div className="w-64 bg-gray-50 h-screen p-4">
      <div className="mb-6">
        <button className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
          My Activity
        </button>
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="space-y-1">
            {menuItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-200 rounded cursor-pointer">
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-600 mb-2">Leads</h3>
          <div className="space-y-1">
            {leadItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-200 rounded cursor-pointer">
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-600 mb-2">Comms</h3>
          <div className="space-y-1">
            {commItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-200 rounded cursor-pointer">
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">FJ</span>
          </div>
          <div>
            <div className="font-medium text-sm">{mockData.agent.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Agent Profile Component
const AgentProfile = () => (
  <div className="bg-white rounded-lg p-6 shadow-sm">
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xl font-medium">FJ</span>
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-semibold">{mockData.agent.name}</h2>
        <p className="text-gray-600 mb-3">{mockData.agent.role}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{mockData.agent.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>{mockData.agent.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{mockData.agent.location}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Stats Component
const StatsCards = () => (
  <div className="grid grid-cols-3 gap-6 mb-6">
    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
      <div className="text-2xl font-bold mb-1">{mockData.stats.totalListings}</div>
      <div className="text-sm text-gray-600">Total Listings</div>
    </div>
    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
      <div className="text-2xl font-bold mb-1">{mockData.stats.activeListings}</div>
      <div className="text-sm text-gray-600">Active Listings</div>
    </div>
    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
      <div className="text-2xl font-bold mb-1">{mockData.stats.soldProperties}</div>
      <div className="text-sm text-gray-600">Sold Properties</div>
    </div>
  </div>
);

// Lead Summary Component
const LeadSummary = () => (
  <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold">My Summary</h3>
      <select className="border rounded px-3 py-1 text-sm">
        <option>This Month</option>
        <option>Last Month</option>
        <option>This Quarter</option>
      </select>
    </div>
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="text-xs text-gray-600 mb-1">New Leads</div>
        <div className="text-lg font-bold text-green-700">{mockData.leads.new}</div>
        <div className="text-xs text-green-600">▲ More this pm</div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-xs text-gray-600 mb-1">Validation Seller Leads</div>
        <div className="text-lg font-bold text-blue-700">{mockData.leads.validation}</div>
        <div className="text-xs text-blue-600">▲ More this pm</div>
      </div>
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="text-xs text-gray-600 mb-1">Potential Seller Leads</div>
        <div className="text-lg font-bold text-red-700">{mockData.leads.potential}</div>
        <div className="text-xs text-red-600">▲ 3 less this pm</div>
      </div>
    </div>
  </div>
);

// Live Feed Component
const LiveFeed = () => (
  <div className="bg-white rounded-lg shadow-sm">
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Live Feed</h3>
        <span className="text-green-500 text-sm">Now online (3)</span>
      </div>
    </div>
    <div className="p-4">
      <div className="mb-4">
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex gap-3">
            <div className="w-16 h-16 bg-gray-300 rounded"></div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">Single Family Residential</h4>
              <p className="text-xs text-gray-600 mb-2">In Address Not Disclosed, CA, USA</p>
              <div className="text-xs text-gray-500">Property Viewed</div>
              <div className="flex -space-x-2 mt-2">
                <div className="w-6 h-6 bg-blue-400 rounded-full border-2 border-white"></div>
                <div className="w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
                <div className="w-6 h-6 bg-red-400 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {mockData.contacts.map((contact, index) => (
          <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">{contact.avatar}</span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{contact.name}</div>
              <div className="text-xs text-gray-600">{contact.type}</div>
            </div>
            <div className="text-xs text-gray-500">{contact.time}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Property Listings Component
const PropertyListings = () => (
  <div className="bg-white rounded-lg p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold">New Objects (3)</h3>
      <select className="border rounded px-3 py-1 text-sm">
        <option>This Month</option>
        <option>Last Month</option>
      </select>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {mockData.properties.map(property => (
        <div key={property.id} className="border rounded-lg overflow-hidden">
          <div className="h-32 bg-gray-200"></div>
          <div className="p-3">
            <div className="text-xs text-gray-500 mb-1">{property.type}</div>
            <div className="font-semibold mb-2">{property.price}</div>
            <div className="text-xs text-gray-600">{property.beds} bd • {property.baths} ba • {property.sqft}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Main Dashboard Component
const RealtyDashboard = () => {
  const [activeTab, setActiveTab] = useState('activity');

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="col-span-2 space-y-6">
                <AgentProfile />
                <StatsCards />
                <LeadSummary />
                <PropertyListings />
              </div>
              
              {/* Right Column */}
              <div>
                <LiveFeed />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtyDashboard;