import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { addDays, format } from 'date-fns';
import { HotelService } from '../../services/hotel-service';
import type { Hotel, HotelSearchRequest } from '@/types/hotel';

export interface FilterState {
    sortBy: 'price-asc' | 'price-desc' | undefined;
    propertyName: string;
    extrafilter: {
        minRate: number;
        maxRate: number;
        minCategory: number;
        maxCategory: number;
    };
    reviews: {
        type: 'TRIPADVISOR';
        minRate: number;
        maxRate: number;
        minReviewCount: number;
    };
    boards: {
        board: string[];
        included: boolean;
    };
}

export interface SearchState {
    destination: {
        id: number;
        name: string;
        placeCode: string;
        country: {
            id: number;
            name: string;
            countryCode: string;
        };
        airportWithCodeList: any | null;
    } | null;
    checkIn: string;
    checkOut: string;
    rooms: number;
    adults: number;
    children: number;
    childrenAges: number[];
    isLoading: boolean;
    hotels: Hotel[];
    error: string | null;
    searchParams: HotelSearchRequest | null;
    filters: FilterState;
    filteredHotels: Hotel[];
}

export interface SearchHotelsParams {
    searchParams: HotelSearchRequest;
    destinationId: number;
}

export interface SearchHotelsWithFiltersParams {
    searchParams: HotelSearchRequest;
    destinationId: number;
    filters: FilterState;
}

const initialState: SearchState = {
    destination: null,
    checkIn: format(new Date(), 'yyyy-MM-dd'),
    checkOut: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    rooms: 1,
    adults: 2,
    children: 0,
    hotels: [],
    isLoading: false,
    error: null,
    searchParams: null,
    childrenAges: [],
    filteredHotels: [],
    filters: {
        sortBy: undefined,
        propertyName: '',
        extrafilter: {
            minRate: 1000,
            maxRate: 100000,
            minCategory: 0,
            maxCategory: 0
        },
        reviews: {
            type: 'TRIPADVISOR',
            minRate: 0,
            maxRate: 0,
            minReviewCount: 1
        },
        boards: {
            board: [],
            included: true
        }
    }
};

export const fetchDestinationById = createAsyncThunk(
    'search/fetchDestinationById',
    async (destinationId: number) => {
        const response = await HotelService.searchDestinations(`id:${destinationId}`);
        if (!response.data?.[0]) {
            throw new Error('Destination not found');
        }
        return response.data[0];
    }
);

export const fetchHotels = createAsyncThunk(
    'search/fetchHotels',
    async (params: SearchHotelsParams) => {
        if (!params.destinationId) {
            throw new Error('Destination ID is required');
        }
        if (!params.searchParams) {
            throw new Error('Search parameters are required');
        }
        
        try {
            const response = await HotelService.searchHotels(params.searchParams, params.destinationId);
            return response.hotels || [];
        } catch (error) {
            console.error('Error in fetchHotels thunk:', error);
            throw error;
        }
    }
);

export const fetchHotelsWithFilters = createAsyncThunk(
    'search/fetchHotelsWithFilters',
    async (params: SearchHotelsWithFiltersParams) => {
        if (!params.destinationId) {
            throw new Error('Destination ID is required');
        }
        if (!params.searchParams) {
            throw new Error('Search parameters are required');
        }
        
        try {
            // Create enhanced search params with filters
            const enhancedSearchParams: any = {
                ...params.searchParams
            };

            // Only include extrafilter if it has meaningful values
            if (params.filters.extrafilter.minRate !== 1000 || params.filters.extrafilter.maxRate !== 100000) {
                enhancedSearchParams.extrafilter = {
                    minRate: params.filters.extrafilter.minRate,
                    maxRate: params.filters.extrafilter.maxRate
                };
            }

            // Only include star category if it's within valid range
            if (params.filters.extrafilter.minCategory >= 1 && params.filters.extrafilter.maxCategory <= 5) {
                if (!enhancedSearchParams.extrafilter) enhancedSearchParams.extrafilter = {};
                enhancedSearchParams.extrafilter.minCategory = params.filters.extrafilter.minCategory;
                enhancedSearchParams.extrafilter.maxCategory = params.filters.extrafilter.maxCategory;
            }

            // Only include reviews if it's within valid range
            if (params.filters.reviews.minRate >= 1 && params.filters.reviews.maxRate <= 5) {
                enhancedSearchParams.reviews = [{
                    maxRate: params.filters.reviews.maxRate,
                    minRate: params.filters.reviews.minRate,
                    minReviewCount: params.filters.reviews.minReviewCount,
                    type: 'TRIPADVISOR' as const
                }];
            }

            // Only include boards if there are selected board types
            if (params.filters.boards.board.length > 0) {
                enhancedSearchParams.boards = {
                    board: params.filters.boards.board,
                    included: params.filters.boards.included
                };
            }

            const response = await HotelService.searchHotels(enhancedSearchParams, params.destinationId);
            return response.hotels || [];
        } catch (error) {
            console.error('Error in fetchHotelsWithFilters thunk:', error);
            throw error;
        }
    }
);

export const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setDestination: (state, action: PayloadAction<SearchState['destination']>) => {
            state.destination = action.payload;
        },
        setDates: (state, action: PayloadAction<{ checkIn: string; checkOut: string }>) => {
            state.checkIn = action.payload.checkIn;
            state.checkOut = action.payload.checkOut;
        },
        setOccupancy: (state, action: PayloadAction<{ rooms: number; adults: number; children: number }>) => {
            state.rooms = action.payload.rooms;
            state.adults = action.payload.adults;
            state.children = action.payload.children;
        },
        updateFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
            state.filters = {
                ...state.filters,
                ...action.payload
            };
        },
        setChildrenAges: (state, action: PayloadAction<number[]>) => {
            state.childrenAges = action.payload;
        },
        setSearchParams: (state, action: PayloadAction<HotelSearchRequest>) => {
            state.searchParams = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        applyLocalFilters: (state) => {
            // Apply local filters (sort by price and property name search)
            let filteredHotels = [...state.hotels];

            // Apply property name filter
            if (state.filters.propertyName) {
                const searchTerm = state.filters.propertyName.toLowerCase();
                filteredHotels = filteredHotels.filter(hotel =>
                    hotel.hotelName.toLowerCase().includes(searchTerm)
                );
            }

            // Apply sorting
            if (state.filters.sortBy) {
                filteredHotels.sort((a, b) => {
                    const priceA = a.roomResponses?.[0]?.rateKeyResponses?.totalPrice || 0;
                    const priceB = b.roomResponses?.[0]?.rateKeyResponses?.totalPrice || 0;
                    
                    return state.filters.sortBy === 'price-asc'
                        ? priceA - priceB
                        : priceB - priceA;
                });
            }

            state.filteredHotels = filteredHotels;
        },
        updatePriceRange: (state, action: PayloadAction<{ minRate: number; maxRate: number }>) => {
            state.filters.extrafilter.minRate = action.payload.minRate;
            state.filters.extrafilter.maxRate = action.payload.maxRate;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDestinationById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDestinationById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.destination = action.payload;
                state.error = null;
            })
            .addCase(fetchDestinationById.rejected, (state, action) => {
                state.isLoading = false;
                state.destination = null;
                state.error = action.error.message || 'Failed to fetch destination';
            })
            .addCase(fetchHotels.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchHotels.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hotels = action.payload;
                state.filteredHotels = action.payload;
                state.error = null;
            })
            .addCase(fetchHotels.rejected, (state, action) => {
                state.isLoading = false;
                state.hotels = [];
                state.filteredHotels = [];
                state.error = action.error.message || 'Failed to fetch hotels';
            })
            .addCase(fetchHotelsWithFilters.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchHotelsWithFilters.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hotels = action.payload;
                state.filteredHotels = action.payload;
                state.error = null;
            })
            .addCase(fetchHotelsWithFilters.rejected, (state, action) => {
                state.isLoading = false;
                state.hotels = [];
                state.filteredHotels = [];
                state.error = action.error.message || 'Failed to fetch hotels with filters';
            });
    },
});

export const {
    setDestination,
    setDates,
    setOccupancy,
    setChildrenAges,
    setSearchParams,
    setLoading,
    updateFilters,
    applyLocalFilters,
    updatePriceRange,
} = searchSlice.actions;

export default searchSlice.reducer;
