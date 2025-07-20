import { Card } from '@/components/ui/card';
import type { Route } from '../+types/root';
import { HotelSearchForm } from '../components/hotels/hotel-search-form';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hotel Listing Application | Debraj Karmakar" },
    { name: "description", content: "This application allows users to search and browse hotel properties based on destination, travel dates, and occupancy preferences. The result page presents a searchable and filterable list of hotels, and users can view detailed information about each property, including images, descriptions, facilities, room rates, and contact information. All data is fetched via predefined APIs, with support for dynamic filtering and sorting options." },
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
