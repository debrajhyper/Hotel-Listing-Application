import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateFilters, applyLocalFilters, fetchHotelsWithFilters } from '@/store/features/searchSlice';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BOARD_TYPES, type BoardType } from '../../types/hotel';
import { useDebounce } from '../../hooks/use-debounce';
import { getMinMaxPrices } from '../../utils/hotel-utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ArrowUpDown, BedDouble, Hotel, IndianRupee, RotateCcw, Star } from 'lucide-react';
import { Button } from '../ui/button';

export interface Filters {
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

interface HotelFiltersProps {
  onFilterChange?: (filters: Filters) => void;
  initialFilters?: Partial<Filters>;
  minPrice?: number;
  maxPrice?: number;
}

export function HotelFilters({ onFilterChange, initialFilters }: HotelFiltersProps) {
  const dispatch = useAppDispatch();
  const { filters, searchParams, destination, hotels, isLoading } = useAppSelector(state => state.search);

  // Calculate min/max prices from actual hotel data
  const [availableMinPrice, availableMaxPrice] = getMinMaxPrices(hotels);

  console.log('Available prices:', availableMinPrice, availableMaxPrice);

  // Use ref to track if price range has been initialized
  const priceRangeInitializedRef = useRef(false);

  // Track selected ratings for better UX
  const [selectedStarRatings, setSelectedStarRatings] = useState<number[]>([]);
  const [selectedTripAdvisorRatings, setSelectedTripAdvisorRatings] = useState<number[]>([]);
  const [selectedBoardTypes, setSelectedBoardTypes] = useState<string[]>([]);

  const [localFilters, setLocalFilters] = useState<Filters>({
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
    },
    ...(initialFilters || {}),
  });

  // Debounce dynamic filters to avoid too many API calls
  const debouncedExtrafilter = useDebounce(localFilters.extrafilter, 500);
  const debouncedReviews = useDebounce(localFilters.reviews, 500);
  const debouncedBoards = useDebounce(localFilters.boards, 500);

  // Initialize price range only once when hotels are first loaded
  useEffect(() => {
    if (hotels.length > 0 && !priceRangeInitializedRef.current && availableMinPrice > 0 && availableMaxPrice > 0) {
      console.log('Initializing price range:', availableMinPrice, availableMaxPrice);
      setLocalFilters(prev => ({
        ...prev,
        extrafilter: {
          ...prev.extrafilter,
          minRate: availableMinPrice,
          maxRate: availableMaxPrice
        }
      }));
      priceRangeInitializedRef.current = true;
    }
  }, [hotels, availableMinPrice, availableMaxPrice]);

  // Handle static filters (frontend-only)
  const handleStaticFilterChange = useCallback((key: keyof Filters, value: any) => {
    const newFilters = { ...localFilters };

    switch (key) {
      case 'sortBy':
      case 'propertyName':
        (newFilters as any)[key] = value;
        break;
      default:
        return; // Don't handle dynamic filters here
    }

    setLocalFilters(newFilters);
    dispatch(updateFilters(newFilters));

    // Apply local filters immediately
    dispatch(applyLocalFilters());

    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  }, [localFilters, dispatch, onFilterChange]);

  // Handle dynamic filters (API-triggered)
  const handleDynamicFilterChange = useCallback((key: keyof Filters, value: any) => {
    const newFilters = { ...localFilters };

    switch (key) {
      case 'extrafilter':
        newFilters.extrafilter = { ...newFilters.extrafilter, ...value };
        break;
      case 'reviews':
        newFilters.reviews = { ...newFilters.reviews, ...value };
        break;
      case 'boards':
        newFilters.boards = { ...newFilters.boards, ...value };
        break;
      default:
        return;
    }

    setLocalFilters(newFilters);
    dispatch(updateFilters(newFilters));

    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  }, [localFilters, dispatch, onFilterChange]);

  // Handle star category checkbox changes
  const handleStarCategoryChange = useCallback((rating: number, checked: boolean | string) => {
    const isChecked = checked === true;

    let newSelectedRatings: number[];

    if (isChecked) {
      // Add rating to selection
      newSelectedRatings = [...selectedStarRatings, rating];
    } else {
      // Remove rating from selection
      newSelectedRatings = selectedStarRatings.filter(r => r !== rating);
    }

    setSelectedStarRatings(newSelectedRatings);

    // Calculate min and max from selected ratings
    let newMin = 0;
    let newMax = 0;

    if (newSelectedRatings.length > 0) {
      newMin = Math.min(...newSelectedRatings);
      newMax = Math.max(...newSelectedRatings);
    }

    handleDynamicFilterChange('extrafilter', {
      minCategory: newMin,
      maxCategory: newMax
    });
  }, [selectedStarRatings, handleDynamicFilterChange]);

  // Handle TripAdvisor rating checkbox changes
  const handleTripAdvisorRatingChange = useCallback((rating: number, checked: boolean | string) => {
    const isChecked = checked === true;

    let newSelectedRatings: number[];

    if (isChecked) {
      // Add rating to selection
      newSelectedRatings = [...selectedTripAdvisorRatings, rating];
    } else {
      // Remove rating from selection
      newSelectedRatings = selectedTripAdvisorRatings.filter(r => r !== rating);
    }

    setSelectedTripAdvisorRatings(newSelectedRatings);

    // Calculate min and max from selected ratings
    let newMin = 0;
    let newMax = 0;

    if (newSelectedRatings.length > 0) {
      newMin = Math.min(...newSelectedRatings);
      newMax = Math.max(...newSelectedRatings);
    }

    handleDynamicFilterChange('reviews', {
      minRate: newMin,
      maxRate: newMax,
      type: 'TRIPADVISOR',
      minReviewCount: 1
    });
  }, [selectedTripAdvisorRatings, handleDynamicFilterChange]);

  // Check if a star rating is selected
  const isStarRatingSelected = useCallback((rating: number) => {
    return selectedStarRatings.includes(rating);
  }, [selectedStarRatings]);

  // Check if a TripAdvisor rating is selected
  const isTripAdvisorRatingSelected = useCallback((rating: number) => {
    return selectedTripAdvisorRatings.includes(rating);
  }, [selectedTripAdvisorRatings]);

  // Trigger API call when dynamic filters change
  useEffect(() => {
    if (!destination || !searchParams) return;

    // Create filters object with only changed values
    const changedFilters: any = {};

    // Check if price range has changed from initial state
    if (debouncedExtrafilter.minRate !== 1000 || debouncedExtrafilter.maxRate !== 100000) {
      changedFilters.extrafilter = {
        minRate: debouncedExtrafilter.minRate,
        maxRate: debouncedExtrafilter.maxRate
      };
    }

    // Check if star category has changed (only include if >= 1 and <= 5)
    if (debouncedExtrafilter.minCategory >= 1 && debouncedExtrafilter.maxCategory <= 5) {
      if (!changedFilters.extrafilter) changedFilters.extrafilter = {};
      changedFilters.extrafilter.minCategory = debouncedExtrafilter.minCategory;
      changedFilters.extrafilter.maxCategory = debouncedExtrafilter.maxCategory;
    }

    // Check if TripAdvisor rating has changed (only include if >= 1 and <= 5)
    if (debouncedReviews.minRate >= 1 && debouncedReviews.maxRate <= 5) {
      changedFilters.reviews = {
        minRate: debouncedReviews.minRate,
        maxRate: debouncedReviews.maxRate,
        type: 'TRIPADVISOR',
        minReviewCount: 1
      };
    }

    // Check if board types have changed
    if (selectedBoardTypes.length > 0) {
      changedFilters.boards = {
        board: selectedBoardTypes,
        included: true
      };
    }

    // Only make API call if there are actual changes
    if (Object.keys(changedFilters).length > 0) {
      const filtersWithChanges = {
        ...localFilters,
        ...changedFilters
      };

      dispatch(fetchHotelsWithFilters({
        searchParams,
        destinationId: destination.id,
        filters: filtersWithChanges
      }));
    }
  }, [debouncedExtrafilter, debouncedReviews, selectedBoardTypes, destination, searchParams, dispatch, localFilters]);

  // Sync non-price filters with Redux state (preserve price range)
  useEffect(() => {
    setLocalFilters(prev => ({
      ...prev,
      sortBy: filters.sortBy,
      propertyName: filters.propertyName,
      extrafilter: {
        ...prev.extrafilter, // Keep current price range
        minCategory: filters.extrafilter.minCategory,
        maxCategory: filters.extrafilter.maxCategory
      },
      reviews: filters.reviews,
      boards: {
        board: selectedBoardTypes,
        included: true
      }
    }));
  }, [filters.sortBy, filters.propertyName, filters.extrafilter.minCategory, filters.extrafilter.maxCategory, filters.reviews, selectedBoardTypes]);

  return (
    <div className="w-full max-w-xs">
      <div className="space-y-6">
        {/* Sort Options - Static Filter */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <ArrowUpDown className='w-4 h-4' />
              <Label className='text-lg font-semibold'>Sort By</Label>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleStaticFilterChange('sortBy', undefined)}
                  variant="ghost"
                  className="text-xs cursor-pointer"
                >
                  <RotateCcw />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select onValueChange={(value: string) => handleStaticFilterChange('sortBy', value as 'price-asc' | 'price-desc' | undefined)} value={localFilters.sortBy || ''}>
            <SelectTrigger className="w-full mt-2 cursor-pointer">
              <SelectValue placeholder="Select a sort option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc" className='cursor-pointer'>Price: Low to High</SelectItem>
              <SelectItem value="price-desc" className='cursor-pointer'>Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Property Name Search - Static Filter */}
        <div>
          <div className="flex items-center space-x-1">
            <Hotel className='w-4 h-4' />
            <Label className='text-lg font-semibold' htmlFor="propertyName">Property Name</Label>
          </div>
          <Input
            id="propertyName"
            value={localFilters.propertyName}
            onChange={(e) => handleStaticFilterChange('propertyName', e.target.value)}
            placeholder="Search by name..."
            className='mt-2'
          />
        </div>

        <Separator />

        {/* Price Range - Dynamic Filter */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <IndianRupee className='w-4 h-4' />
              <Label className='text-lg font-semibold'>Price Range</Label>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    setLocalFilters(prev => ({
                      ...prev,
                      extrafilter: {
                        ...prev.extrafilter,
                        minRate: availableMinPrice,
                        maxRate: availableMaxPrice
                      }
                    }));
                  }}
                  variant="ghost"
                  className="text-xs cursor-pointer"
                >
                  <RotateCcw />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset</p>
              </TooltipContent>
            </Tooltip>

          </div>
          <div className="pt-4">
            <Slider
              value={[localFilters.extrafilter.minRate, localFilters.extrafilter.maxRate]}
              min={availableMinPrice}
              max={availableMaxPrice}
              step={100}
              onValueChange={([min, max]) => {
                console.log('Slider changed:', min, max);
                handleDynamicFilterChange('extrafilter', { minRate: min, maxRate: max });
              }}
            />
            <div className="flex justify-between mt-2">
              <span>₹{localFilters.extrafilter.minRate.toLocaleString()}</span>
              <span>₹{localFilters.extrafilter.maxRate.toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Available: ₹{availableMinPrice.toLocaleString()} - ₹{availableMaxPrice.toLocaleString()}
            </div>
          </div>
        </div>

        <Separator />

        {/* Star Category - Dynamic Filter with Checkboxes */}
        <div>
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className='w-4 h-4' />
            <Label className='text-lg font-semibold'>Hotel Rating</Label>
          </div>
          <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    setLocalFilters(prev => ({
                      ...prev,
                      extrafilter: {
                        ...prev.extrafilter,
                        minCategory: 0,
                        maxCategory: 0
                      }
                    }));
                    setSelectedStarRatings([]);
                  }}
                  variant="ghost"
                  className="text-xs cursor-pointer"
                >
                  <RotateCcw />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-2 mt-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  id={`stars-${stars}`}
                  className="cursor-pointer"
                  checked={isStarRatingSelected(stars)}
                  onCheckedChange={(checked: boolean | string) => handleStarCategoryChange(stars, checked)}
                />
                <Label htmlFor={`stars-${stars}`} className="flex items-center space-x-1 cursor-pointer">
                  {Array(stars).fill(null).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.2-6.3-4.8-6.3 4.8 2.3-7.2-6-4.6h7.6z" />
                    </svg>
                  ))}
                </Label>
              </div>
            ))}
            {selectedStarRatings.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Selected: {selectedStarRatings.sort((a, b) => a - b).join(', ')} stars
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* TripAdvisor Rating - Dynamic Filter with Checkboxes */}
        <div>
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className='w-4 h-4' />
            <Label className='text-lg font-semibold'>Trip Advisor Rating</Label>
          </div>
          <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    setLocalFilters(prev => ({
                      ...prev,
                      reviews: {
                        ...prev.reviews,
                        minRate: 0,
                        maxRate: 0
                      }
                    }));
                    setSelectedTripAdvisorRatings([]);
                  }}
                  variant="ghost"
                  className="text-xs cursor-pointer"
                >
                  <RotateCcw />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-2 mt-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2 w-fit cursor-pointer">
                <Checkbox
                  id={`ta-${rating}`}
                  className="cursor-pointer"
                  checked={isTripAdvisorRatingSelected(rating)}
                  onCheckedChange={(checked: boolean | string) => handleTripAdvisorRatingChange(rating, checked)}
                />
                <Label htmlFor={`ta-${rating}`} className="flex items-center space-x-1 cursor-pointer">
                  {Array(rating).fill(null).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.2-6.3-4.8-6.3 4.8 2.3-7.2-6-4.6h7.6z" />
                    </svg>
                  ))}
                </Label>
              </div>
            ))}
            {selectedTripAdvisorRatings.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Selected: {selectedTripAdvisorRatings.sort((a, b) => a - b).join(', ')} rating
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Board Types - Dynamic Filter */}
        <div>
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <BedDouble className='w-4 h-4' />
            <Label className='text-lg font-semibold'>Board Type</Label>
          </div>
          <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    setLocalFilters(prev => ({
                      ...prev,
                      boards: {
                        ...prev.boards,
                        board: [],
                        included: true
                      }
                    }));
                    setSelectedBoardTypes([]);
                  }}
                  variant="ghost"
                  className="text-xs cursor-pointer"
                >
                  <RotateCcw />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-2 mt-2">
            {BOARD_TYPES.map((board) => (
              <div key={board.code} className="flex items-center space-x-2 cursor-pointer w-fit">
                <Checkbox
                  id={`board-${board.code}`}
                  checked={selectedBoardTypes.includes(board.code)}
                  className="cursor-pointer"
                  onCheckedChange={(checked: boolean | string) => {
                    const isChecked = checked === true;
                    let newSelectedBoardTypes: string[];
                    if (isChecked) {
                      newSelectedBoardTypes = [...selectedBoardTypes, board.code];
                    } else {
                      newSelectedBoardTypes = selectedBoardTypes.filter(code => code !== board.code);
                    }
                    setSelectedBoardTypes(newSelectedBoardTypes);
                    handleDynamicFilterChange('boards', { board: newSelectedBoardTypes, included: true });
                  }}
                />
                <Label htmlFor={`board-${board.code}`} className="cursor-pointer">{board.name}</Label>
              </div>
            ))}
            {selectedBoardTypes.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Selected: {selectedBoardTypes.map(code => BOARD_TYPES.find(b => b.code === code)?.name).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
