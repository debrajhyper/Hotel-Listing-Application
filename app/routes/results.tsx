import type { Route } from '../+types/root';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setSearchParams, 
  setDates, 
  setOccupancy, 
  setChildrenAges,
  fetchDestinationById
} from '../store/features/searchSlice';
import { HotelSearchForm } from '../components/hotels/hotel-search-form';
import { HotelList } from '../components/hotels/hotel-list';
import { HotelFilters } from '../components/hotels/hotel-filters';
import type { HotelSearchRequest } from '../types/hotel';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Filter & Sort Hotel Listing Application | Debraj Karmakar" },
    { name: "description", content: "This application allows users to search and browse hotel properties based on destination, travel dates, and occupancy preferences. The result page presents a searchable and filterable list of hotels, and users can view detailed information about each property, including images, descriptions, facilities, room rates, and contact information. All data is fetched via predefined APIs, with support for dynamic filtering and sorting options." },
  ];
}

export default function ResultsPage() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { searchParams } = useAppSelector(state => state.search);

  const destination = useAppSelector(state => state.search.destination);
  const { checkIn, checkOut } = useAppSelector(state => ({
    checkIn: state.search.checkIn,
    checkOut: state.search.checkOut
  }));
  const { rooms, adults, children, childrenAges } = useAppSelector(state => ({
    rooms: state.search.rooms,
    adults: state.search.adults,
    children: state.search.children,
    childrenAges: state.search.childrenAges
  }));

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // If we don't have a destination in Redux but have an ID in URL, fetch it
    if (!destination && params.has('destinationId')) {
      const destinationId = parseInt(params.get('destinationId')!);
      dispatch(fetchDestinationById(destinationId));
      
      // Update other search parameters from URL
      if (params.has('checkIn')) dispatch(setDates({ 
        checkIn: params.get('checkIn')!,
        checkOut: params.get('checkOut')!
      }));
      
      if (params.has('rooms')) dispatch(setOccupancy({
        rooms: parseInt(params.get('rooms')!),
        adults: parseInt(params.get('adults')!),
        children: parseInt(params.get('children')!)
      }));
      
      if (params.has('childrenAges')) {
        const ages = params.get('childrenAges')!.split(',').map(Number);
        dispatch(setChildrenAges(ages));
      }
    }
  }, [dispatch, destination, location.search]);

  // Create and update search params when destination or other params change
  useEffect(() => {
    if (!destination) return;

    const searchRequest: HotelSearchRequest = {
      stay: {
        checkIn,
        checkOut,
      },
      occupancies: [{
        rooms,
        adults,
        children,
        ...(children > 0 && {
          paxes: childrenAges.map(age => ({
            type: 'CH' as const,
            age,
          }))
        })
      }]
    };

    dispatch(setSearchParams(searchRequest));
  }, [dispatch, destination, checkIn, checkOut, rooms, adults, children, childrenAges]);

  return (
    <div className="container mx-auto px-4 py-8">
      <HotelSearchForm />

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 mt-16">
          <aside>
            <HotelFilters />
          </aside>
          
          <main>
            {searchParams ? (
              <HotelList searchParams={searchParams} />
            ) : (
              <div className="text-center text-gray-400 dark:text-gray-300 py-12">
                Please enter your search criteria to see results.
              </div>
            )}
          </main>
        </div>
    </div>
  );
}
