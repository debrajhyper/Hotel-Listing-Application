export interface DestinationResponse {
  paginationFilterRequest: {
    paginationAction: 'INITIAL_PAGE'
    maxLimit: number
    sortingOrder: 'ASC' | 'DESC'
  }
  search: string | null
  fetchStaticDestination: boolean
}

export interface Country {
  id: number;
  name: string;
  countryCode: string;
}

export interface Destination {
  id: number;
  name: string;
  placeCode: string;
  country: Country;
  airportWithCodeList: any | null;
}

export interface DestinationSearchResponse {
  destinations: Destination[]
  total: number
}

export interface Occupancy {
  rooms: number;
  adults: number;
  children: number;
  paxes?: {
    type: 'CH';
    age: number;
  }[];
}

export interface HotelSearchRequest {
  stay: {
    checkIn: string;
    checkOut: string;
  };
  occupancies: Occupancy[];
  extrafilter?: {
    minRate?: number;
    maxRate?: number;
    minCategory?: number;
    maxCategory?: number;
  };
  reviews?: {
    maxRate: number;
    minRate: number;
    minReviewCount: number;
    type: 'TRIPADVISOR';
  }[];
  boards?: {
    board: string[];
    included: boolean;
  };
}

export interface BoardType {
  code: 'AI' | 'BB' | 'FB' | 'HB' | 'RO';
  name: string;
}

export const BOARD_TYPES: BoardType[] = [
  { code: 'AI', name: 'ALL INCLUSIVE' },
  { code: 'BB', name: 'BED AND BREAKFAST' },
  { code: 'FB', name: 'FULL BOARD' },
  { code: 'HB', name: 'HALF BOARD' },
  { code: 'RO', name: 'ROOM ONLY' }
];

export interface RoomResponse {
  boardNameResponse: Array<{
    roomCount: number;
    boardName: string;
    boardCode: string | null;
  }>;
  roomName: string;
  roomCode: string;
  roomId: number;
  rateKeyResponses: {
    rateKeys: Array<{
      cancellationPolicy: Array<{
        amount: string;
        from: string;
      }>;
      promotionResponses?: Array<{
        code: string;
        name: string;
        remark: string;
      }>;
      roomRateKey: string;
    }>;
    totalPrice: number;
  };
  facilityResponses: Array<{
    name: string;
    feeApplied: boolean;
    mandatory: boolean;
    facilityGroup: string;
  }>;
  roomImageUrl: string[];
  allotment: number;
  rooms: number;
  adults: number;
  children: number;
}

export interface Hotel {
  id: number;
  hotelName: string;
  hotelCode: string;
  segments: string[];
  hotelAccommodation: string;
  rating: string;
  roomResponses: RoomResponse[];
  hotelImageLinks: Array<{
    imageLink: string;
    imageType: string;
  }>;
  facilityResponses: Array<{
    name: string;
    feeApplied: boolean;
    mandatory: boolean;
    facilityGroup: string;
  }>;
  description: string;
  email: string;
  address: string;
  phoneResponses: Array<{
    phoneNumber: string;
    phoneType: string;
  }>;
  postalCode: string;
  interestPoints: Array<{
    pointName: string;
    distance: string;
  }>;
  website: string | null;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  type: string;
  reviewCount: number;
}
