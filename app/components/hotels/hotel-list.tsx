import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchHotels, applyLocalFilters } from '@/store/features/searchSlice';
import { setDestination, setDates, setOccupancy, setChildrenAges } from '@/store/features/searchSlice';
import { HotelCard } from './hotel-card';
import { Dialog, DialogContent } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import type { Hotel, HotelSearchRequest } from '../../types/hotel';
import { RotateCcw } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { HotelService } from '../../services/hotel-service';

const DEFAULT_IMAGE = 'https://placehold.co/600x400?text=No+Image';

interface HotelListProps {
  searchParams: HotelSearchRequest;
}

export function HotelList({ searchParams }: HotelListProps) {
  const dispatch = useAppDispatch();
  const { hotels, filteredHotels, isLoading: loading, error, filters } = useAppSelector(state => state.search);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const destination = useAppSelector(state => state.search.destination);
  const location = useLocation();

  useEffect(() => {
    if (!destination || !searchParams) return;

    // Ensure we have all required fields
    const validatedSearchParams = {
      ...searchParams,
      stay: {
        checkIn: searchParams.stay.checkIn,
        checkOut: searchParams.stay.checkOut
      },
      occupancies: searchParams.occupancies.map(occ => ({
        rooms: occ.rooms,
        adults: occ.adults,
        children: occ.children,
        ...(occ.children > 0 && {
          paxes: occ.paxes
        })
      }))
    };

    dispatch(fetchHotels({
      searchParams: validatedSearchParams,
      destinationId: destination.id
    }));
  }, [dispatch, searchParams, destination]);

  // Apply local filters whenever filters change
  useEffect(() => {
    if (hotels.length > 0) {
      dispatch(applyLocalFilters());
    }
  }, [dispatch, hotels, filters.sortBy, filters.propertyName]);

  // Use filteredHotels for display
  const displayHotels = filteredHotels.length > 0 ? filteredHotels : hotels;

  if (error) {
    return (
      <div className="text-center mx-auto py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={async () => {
            // Parse query params
            const params = new URLSearchParams(location.search);
            const destinationId = params.get('destinationId');
            const checkIn = params.get('checkIn');
            const checkOut = params.get('checkOut');
            const rooms = params.get('rooms');
            const adults = params.get('adults');
            const children = params.get('children');
            const childrenAges = params.get('childrenAges');

            // Only restore if all required params are present
            if (destinationId && checkIn && checkOut && rooms && adults && children) {
              const destinationName = params.get('destinationName');
              const destinationCountry = params.get('destinationCountry');

              let dest = destination;
              if (!dest || dest.id.toString() !== destinationId) {
                // Fetch destination by ID if not present or mismatched
                try {
                  const result = await HotelService.searchDestinations(`id:${destinationId}`);
                  if (result.data && result.data[0]) {
                    dest = result.data[0];
                    dispatch(setDestination(dest));
                  } else if (destinationName) {
                    // Fallback: create a minimal destination object
                    dest = {
                      id: Number(destinationId),
                      name: destinationName,
                      placeCode: '',
                      country: { id: 0, name: destinationCountry || '', countryCode: '' },
                      airportWithCodeList: null
                    };
                    dispatch(setDestination(dest));
                  } else {
                    // fallback: just retry with current state
                    dispatch(fetchHotels({
                      searchParams,
                      destinationId: destination?.id ?? 0
                    }));
                    return;
                  }
                } catch (err) {
                  if (destinationName) {
                    // Fallback: create a minimal destination object
                    dest = {
                      id: Number(destinationId),
                      name: destinationName,
                      placeCode: '',
                      country: { id: 0, name: destinationCountry || '', countryCode: '' },
                      airportWithCodeList: null
                    };
                    dispatch(setDestination(dest));
                  } else {
                    // fallback: just retry with current state
                    dispatch(fetchHotels({
                      searchParams,
                      destinationId: destination?.id ?? 0
                    }));
                    return;
                  }
                }
              } else {
                dispatch(setDestination(dest));
              }
              dispatch(setDates({ checkIn, checkOut }));
              dispatch(setOccupancy({
                rooms: parseInt(rooms),
                adults: parseInt(adults),
                children: parseInt(children)
              }));
              dispatch(setChildrenAges(childrenAges ? childrenAges.split(',').map(Number) : []));

              // Build searchParams for fetchHotels
              const searchParamsObj: HotelSearchRequest = {
                stay: { checkIn, checkOut },
                occupancies: [{
                  rooms: parseInt(rooms),
                  adults: parseInt(adults),
                  children: parseInt(children),
                  ...(childrenAges ? {
                    paxes: childrenAges.split(',').map(age => ({ type: 'CH' as const, age: Number(age) }))
                  } : {})
                }]
              };

              dispatch(fetchHotels({
                searchParams: searchParamsObj,
                destinationId: dest?.id ?? Number(destinationId)
              }));
            } else {
              // fallback: just retry with current state
              dispatch(fetchHotels({
                searchParams,
                destinationId: destination?.id ?? 0
              }));
            }
          }}
          className="mt-4 mx-auto bg-primary text-primary-foreground px-4 py-2 flex items-center gap-2 rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <RotateCcw className='w-4 h-4' />
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="group p-0 gap-0 flex flex-col h-full overflow-hidden">
            {/* Image area with rating badge */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <Skeleton className="w-full h-full aspect-[16/9]" />
              <div className="absolute top-2 right-2 px-3 py-1.5 rounded-full flex items-center gap-1.5 bg-white/90 dark:bg-zinc-900/25 backdrop-blur-md">
                <Skeleton className="w-6 h-4 rounded" />
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="w-4 h-4 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
            {/* Card content */}
            <div className="flex flex-col flex-1 p-4">
              <div className="flex-1 space-y-4">
                <div>
                  <Skeleton className="h-5 w-3/4 mb-2" /> {/* Hotel name */}
                  <Skeleton className="h-4 w-1/2" /> {/* Address */}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="h-5 w-16 rounded-full" />
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-end mt-4 pt-4 border-t">
                <div>
                  <Skeleton className="h-4 w-10 mb-1" /> {/* From label */}
                  <Skeleton className="h-7 w-24" /> {/* Price */}
                </div>
                <Skeleton className="h-10 w-28 rounded-md" /> {/* Button */}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!displayHotels || displayHotels.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-muted-foreground">
          {destination ? 'No hotels found matching your criteria' : 'Please select a destination to search for hotels'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div>
        <h3 className='text-xl font-semibold mb-4'>{displayHotels.length} Hotels Found for {destination?.name} Destination</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayHotels?.map((hotel: Hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onViewDetails={setSelectedHotel}
            />
          ))}
        </div>
      </div>

      <Dialog open={!!selectedHotel} onOpenChange={() => setSelectedHotel(null)}>
        <DialogContent className="!max-w-4xl">
          {selectedHotel && (
            <ScrollArea className="max-h-[90vh]">
              <div className="space-y-6 p-2">
                {/* Image Gallery */}
                <div className="aspect-video relative overflow-hidden rounded-lg">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {(selectedHotel.hotelImageLinks?.length ? selectedHotel.hotelImageLinks : [{ imageLink: DEFAULT_IMAGE }]).map((image, index) => (
                        <CarouselItem key={index}>
                          <img
                            src={image.imageLink}
                            alt={`${selectedHotel.hotelName} - Image ${index + 1}`}
                            className="object-cover w-full h-full aspect-video rounded-lg overflow-hidden"
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_IMAGE;
                            }}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {selectedHotel.hotelImageLinks?.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2 cursor-pointer" />
                        <CarouselNext className="right-2 cursor-pointer" />
                      </>
                    )}
                  </Carousel>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-4xl font-bold mb-2">{selectedHotel.hotelName}</h2>
                  <p className="text-muted-foreground mb-2">{selectedHotel.address}</p>
                  {selectedHotel.description && (
                    <div className="mb-2">
                      <h3 className="font-semibold mb-1">Description</h3>
                      <p className={`text-base text-gray-700 dark:text-gray-300 ${descExpanded ? '' : 'line-clamp-3'}`}>{selectedHotel.description}</p>
                      {selectedHotel.description.length > 120 && (
                        <button
                          className="text-primary underline text-sm mt-1 cursor-pointer"
                          onClick={() => setDescExpanded(v => !v)}
                        >
                          {descExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Facilities */}
                {selectedHotel.facilityResponses?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Facilities</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedHotel.facilityResponses.map((facility, index) => (
                        <span
                          key={index}
                          className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-1"
                        >
                          {facility.name}
                          {facility.feeApplied && (
                            <span className="text-xs text-muted-foreground">(Fee)</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className='grid grid-cols-2 gap-4 justify-between items-start'>
                  {/* Contact Info */}
                  <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <ul className="space-y-2">
                      {selectedHotel.email && <li>Email: {selectedHotel.email}</li>}
                      {selectedHotel.website && (
                        <li>
                          Website:{' '}
                          <a href={selectedHotel.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Visit Website
                          </a>
                        </li>
                      )}
                      {selectedHotel.phoneResponses?.length > 0 && selectedHotel.phoneResponses.map((phone, index) => (
                        <li key={index}>
                          {phone.phoneType}: {phone.phoneNumber}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Points of Interest */}
                  {selectedHotel.interestPoints?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Points of Interest Nearby</h3>
                      <ul className="list-disc ml-4">
                        {selectedHotel.interestPoints.map((point, i) => (
                          <li key={i}>{point.pointName} ({point.distance})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Room Types & Rates */}
                {selectedHotel.roomResponses?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Available Rooms</h3>
                    <div className="gap-4 grid grid-cols-12">
                      {selectedHotel.roomResponses?.map?.((room, index) => (
                        <div key={index} className="border rounded-lg p-4 col-span-6 w-full">
                          <h4 className="font-medium mb-1">{room.roomName}</h4>
                          {room.boardNameResponse?.length > 0 && (
                            <p className="text-sm text-muted-foreground mb-1">
                              Board Options: {room.boardNameResponse.map(board => board.boardName).join(', ')}
                            </p>
                          )}
                          <p className="text-lg font-semibold mb-1">
                            ₹{room.rateKeyResponses?.totalPrice?.toLocaleString?.() || 'N/A'}
                          </p>
                          {/* Cancellation Policies */}
                          {room.rateKeyResponses?.rateKeys?.[0]?.cancellationPolicy?.length > 0 && (
                            <div className="text-xs text-gray-500 mb-1">
                              <span className="font-semibold">Cancellation Policy:</span>
                              <ul className="list-disc ml-4">
                                {room.rateKeyResponses.rateKeys[0].cancellationPolicy.map((policy, i) => (
                                  <li key={i}>
                                    {policy.amount === '0' ? 'Free cancellation' : `${policy.amount}% charge`} from {policy.from?.split('T')[0]}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {/* Promotions */}
                          {room?.rateKeyResponses?.rateKeys?.[0]?.promotionResponses &&
                            room.rateKeyResponses.rateKeys[0].promotionResponses.length > 0 && (
                            <div className="text-xs text-green-700 dark:text-green-400 mb-1">
                              <span className="font-semibold">Promotions:</span>
                              <ul className="list-disc ml-4">
                                {room.rateKeyResponses.rateKeys[0].promotionResponses.map((promo, i) => (
                                  <li key={i}>{promo.name} - {promo.remark}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
