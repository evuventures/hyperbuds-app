'use client';

import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import HyperBudsMarketplaceStorefront from '@/components/marketplace/HyperBudsMarketplaceStorefront';

export default function MarketplacePage() {
  return (
    <DashboardLayout>
      <HyperBudsMarketplaceStorefront />
    </DashboardLayout>
  );
}
