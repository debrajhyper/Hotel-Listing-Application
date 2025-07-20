import { Card } from '@/components/ui/card';
import type { Route } from '../+types/root';
import { HotelSearchForm } from '../components/hotels/hotel-search-form';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Stay</h1>
          <p className="text-lg text-gray-600">
            Search thousands of hotels worldwide with our easy-to-use booking platform
          </p>
        </div>
        
        <HotelSearchForm landingPage />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mb-4">🌟</div>
            <h3 className="text-xl font-semibold mb-2">Best Rates</h3>
            <p className="text-gray-600">Find competitive prices for your stay</p>
          </div>
          <div className="text-center">
            <div className="mb-4">🏨</div>
            <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
            <p className="text-gray-600">Choose from thousands of properties</p>
          </div>
          <div className="text-center">
            <div className="mb-4">👍</div>
            <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
            <p className="text-gray-600">Simple and secure reservation process</p>
          </div>
        </div>
      </div>
    </div>
  );
}
