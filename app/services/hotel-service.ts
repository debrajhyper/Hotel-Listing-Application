import type { DestinationResponse, HotelSearchRequest } from '@/types/hotel';

const API_BASE_URL = 'https://staging.travelyatra.com/api/unsecure/dummy/hotels';
const HEADERS = {
  'x-tenant-id': 'pml',
  'Content-Type': 'application/json',
};

export const HotelService = {
  async searchDestinations(search: string | null = null, maxLimit: number = 10): Promise<any> {
    const payload: DestinationResponse = {
      paginationFilterRequest: {
        paginationAction: 'INITIAL_PAGE',
        maxLimit,
        sortingOrder: 'ASC',
      },
      search,
      fetchStaticDestination: search === null,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/places`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch destinations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching destinations:', error);
      throw error;
    }
  },

  async searchHotels(
    searchParams: HotelSearchRequest & {
      extrafilter?: {
        minRate?: number;
        maxRate?: number;
        minCategory?: number;
        maxCategory?: number;
      };
      reviews?: Array<{
        maxRate: number;
        minRate: number;
        minReviewCount: number;
        type: 'TRIPADVISOR';
      }>;
      boards?: {
        board: string[];
        included: boolean;
      };
    },
    destinationId: number
  ): Promise<any> {
    if (!destinationId) {
      throw new Error('Destination ID is required');
    }
    
    if (!searchParams) {
      throw new Error('Search parameters are required');
    }

    try {
      console.log('Making API call with:', {
        url: `${API_BASE_URL}?destinationId=${destinationId}`,
        params: searchParams
      });

      const response = await fetch(`${API_BASE_URL}?destinationId=${destinationId}`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to fetch hotels: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Success Response:', data);
      
      // Transform the API response into our expected format
      const hotels = (data.data || []).map((hotelData: any) => ({
        id: hotelData.id,
        hotelName: hotelData.hotelName || 'Unknown Hotel',
        hotelCode: hotelData.hotelCode || '',
        segments: hotelData.segments || [],
        hotelAccommodation: hotelData.hotelAccommodation || '',
        rating: hotelData.rating || '',
        roomResponses: hotelData.roomResponses?.map((room: any) => ({
          boardNameResponse: room.boardNameResponse || [],
          roomName: room.roomName || '',
          roomCode: room.roomCode || '',
          roomId: room.roomId,
          rateKeyResponses: {
            rateKeys: room.rateKeyResponses?.rateKeys || [],
            totalPrice: room.rateKeyResponses?.totalPrice || 0
          },
          facilityResponses: room.facilityResponses || [],
          roomImageUrl: room.roomImageUrl || [],
          allotment: room.allotment || 0,
          rooms: room.rooms || 0,
          adults: room.adults || 0,
          children: room.children || 0
        })) || [],
        hotelImageLinks: hotelData.hotelImageLinks?.map((img: any) => ({
          imageLink: img.imageLink || '',
          imageType: img.imageType || ''
        })) || [],
        facilityResponses: hotelData.facilityResponses || [],
        description: hotelData.description || '',
        email: hotelData.email || '',
        address: hotelData.address || '',
        phoneResponses: hotelData.phoneResponses || [],
        postalCode: hotelData.postalCode || '',
        interestPoints: hotelData.interestPoints || [],
        website: hotelData.website,
        coordinates: hotelData.coordinates || { longitude: 0, latitude: 0 }
      }));

      return {
        hotels,
        total: hotels.length
      };
    } catch (error) {
      console.error('Error fetching hotels:', error);
      throw error;
    }
  },
};
