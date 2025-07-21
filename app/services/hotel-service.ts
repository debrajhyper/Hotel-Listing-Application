import type { DestinationResponse, Hotel, HotelSearchRequest } from '@/types/hotel';

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


// export const dummyHotels: Hotel[] = [
//   {
//     id: 101,
//     hotelName: "Oceanview Paradise",
//     hotelCode: "OVP101",
//     segments: ["Leisure", "Romance"],
//     hotelAccommodation: "Resort",
//     rating: "5",
//     reviewCount: 278,
//     type: "Beachfront",
//     roomResponses: [
//       {
//         boardNameResponse: [
//           { roomCount: 2, boardName: "Breakfast Only", boardCode: "BBF" },
//           { roomCount: 1, boardName: "Half Board", boardCode: "HB" }
//         ],
//         roomName: "Deluxe Seaview Suite",
//         roomCode: "DSV01",
//         roomId: 5001,
//         rateKeyResponses: {
//           rateKeys: [
//             {
//               roomRateKey: "RK-OVP-5001-20250720",
//               cancellationPolicy: [
//                 { amount: "0", from: "2025-07-10T00:00:00Z" },
//                 { amount: "50", from: "2025-07-18T00:00:00Z" }
//               ],
//               promotionResponses: [
//                 { code: "SUMMER21", name: "Summer Special", remark: "10% off" }
//               ]
//             }
//           ],
//           totalPrice: 45000
//         },
//         facilityResponses: [
//           { name: "WiFi", feeApplied: false, mandatory: false, facilityGroup: "Connectivity" },
//           { name: "Mini-bar", feeApplied: true, mandatory: false, facilityGroup: "In-room" }
//         ],
//         roomImageUrl: [
//           "https://pics.example.com/ovp/rooms/deluxe1.jpg",
//           "https://pics.example.com/ovp/rooms/deluxe2.jpg"
//         ],
//         allotment: 3,
//         rooms: 1,
//         adults: 2,
//         children: 1
//       },
//       {
//         boardNameResponse: [
//           { roomCount: 1, boardName: "All Inclusive", boardCode: "AI" }
//         ],
//         roomName: "Family Beach Villa",
//         roomCode: "FBV02",
//         roomId: 5002,
//         rateKeyResponses: {
//           rateKeys: [
//             {
//               roomRateKey: "RK-OVP-5002-20250720",
//               cancellationPolicy: [
//                 { amount: "0", from: "2025-07-12T00:00:00Z" },
//                 { amount: "75", from: "2025-07-19T00:00:00Z" }
//               ]
//             }
//           ],
//           totalPrice: 75000
//         },
//         facilityResponses: [
//           { name: "Private Pool", feeApplied: true, mandatory: false, facilityGroup: "Leisure" },
//           { name: "Breakfast Buffet", feeApplied: false, mandatory: false, facilityGroup: "Dining" }
//         ],
//         roomImageUrl: [
//           "https://pics.example.com/ovp/rooms/villa1.jpg"
//         ],
//         allotment: 2,
//         rooms: 1,
//         adults: 4,
//         children: 2
//       }
//     ],
//     hotelImageLinks: [
//       { imageLink: "https://pics.example.com/ovp/exterior.jpg", imageType: "exterior" },
//       { imageLink: "https://pics.example.com/ovp/lobby.jpg", imageType: "interior" }
//     ],
//     facilityResponses: [
//       { name: "Spa", feeApplied: true, mandatory: false, facilityGroup: "Wellness" },
//       { name: "Gym", feeApplied: false, mandatory: false, facilityGroup: "Fitness" },
//       { name: "Valet Parking", feeApplied: true, mandatory: true, facilityGroup: "Transport" }
//     ],
//     description: "A luxury beachfront resort offering panoramic ocean views and world-class amenities. A luxury beachfront resort offering panoramic ocean views and world-class amenities. A luxury beachfront resort offering panoramic ocean views and world-class amenities. A luxury beachfront resort offering panoramic ocean views and world-class amenities. A luxury beachfront resort offering panoramic ocean views and world-class amenities. A luxury beachfront resort offering panoramic ocean views and world-class amenities. A luxury beachfront resort offering panoramic ocean views and world-class amenities.A luxury beachfront resort offering panoramic ocean views and world-class amenities.A luxury beachfront resort offering panoramic ocean views and world-class amenities.",
//     email: "stay@oceanviewparadise.com",
//     address: "123 Seaview Drive, Coast City",
//     phoneResponses: [
//       { phoneNumber: "+91-22-5555-0101", phoneType: "Reservation" },
//       { phoneNumber: "+91-22-5555-0202", phoneType: "Reception" }
//     ],
//     postalCode: "400050",
//     interestPoints: [
//       { pointName: "Coral Reef", distance: "0.5 km" },
//       { pointName: "Sunset Pier", distance: "1.2 km" }
//     ],
//     website: "https://oceanviewparadise.com",
//     coordinates: { latitude: 18.9219, longitude: 72.8340 }
//   },

//   {
//     id: 202,
//     hotelName: "Cityscape Central",
//     hotelCode: "CSC202",
//     segments: ["Business"],
//     hotelAccommodation: "Hotel",
//     rating: "4",
//     reviewCount: 145,
//     type: "Urban",
//     roomResponses: [
//       {
//         boardNameResponse: [{ roomCount: 1, boardName: "Room Only", boardCode: null }],
//         roomName: "Executive Twin",
//         roomCode: "EXT03",
//         roomId: 6003,
//         rateKeyResponses: {
//           rateKeys: [
//             {
//               roomRateKey: "RK-CSC-6003-20250720",
//               cancellationPolicy: [
//                 { amount: "0", from: "2025-07-15T00:00:00Z" }
//               ]
//             }
//           ],
//           totalPrice: 22000
//         },
//         facilityResponses: [
//           { name: "High-Speed Internet", feeApplied: false, mandatory: false, facilityGroup: "Connectivity" }
//         ],
//         roomImageUrl: ["https://pics.example.com/csc/rooms/executive1.jpg"],
//         allotment: 4,
//         rooms: 1,
//         adults: 2,
//         children: 0
//       }
//     ],
//     hotelImageLinks: [
//       { imageLink: "https://pics.example.com/csc/exterior.jpg", imageType: "exterior" }
//     ],
//     facilityResponses: [
//       { name: "Business Center", feeApplied: false, mandatory: false, facilityGroup: "Services" },
//       { name: "Breakfast Buffet", feeApplied: true, mandatory: false, facilityGroup: "Dining" }
//     ],
//     description: "Modern business hotel in the heart of downtown, steps from the financial district.",
//     email: "contact@cityscapecentral.com",
//     address: "456 Market Street, Metropolis",
//     phoneResponses: [
//       { phoneNumber: "+91-22-6666-0303", phoneType: "Front Desk" }
//     ],
//     postalCode: "400001",
//     interestPoints: [
//       { pointName: "Convention Center", distance: "0.3 km" },
//       { pointName: "Central Station", distance: "0.7 km" }
//     ],
//     website: null,
//     coordinates: { latitude: 19.0176, longitude: 72.8562 }
//   }
// ];

