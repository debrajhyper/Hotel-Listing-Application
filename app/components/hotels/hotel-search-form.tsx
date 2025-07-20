import { useEffect, useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Destination } from '@/types/hotel';
import { setDestination, setDates, setOccupancy, setChildrenAges, setLoading } from '@/store/features/searchSlice';
import { Calendar } from '../ui/calendar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Baby, BedDouble, CalendarArrowDown, CalendarArrowUp, Calendar as CalendarIcon, MapPinHouse, Users } from 'lucide-react';
import { HotelService } from '../../services/hotel-service';
import { Combobox } from "@/components/elements/combobox"
import { Card, CardContent } from '../ui/card';
import { useDebounce } from '../../hooks/use-debounce';

interface SearchFormValues {
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
  checkIn: Date;
  checkOut: Date;
  rooms: number;
  adults: number;
  children: number;
  childrenAges: number[];
}

export function HotelSearchForm({ landingPage }: { landingPage?: boolean }) {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state.search);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const destinationState = useAppSelector(state => state.search.destination);
  const dateState = useAppSelector(state => ({
    checkIn: state.search.checkIn,
    checkOut: state.search.checkOut
  }));
  const occupancyState = useAppSelector(state => ({
    rooms: state.search.rooms,
    adults: state.search.adults,
    children: state.search.children,
    childrenAges: state.search.childrenAges
  }));

  const form = useForm<SearchFormValues>({
    defaultValues: {
      destination: destinationState || null,
      checkIn: dateState.checkIn ? new Date(dateState.checkIn) : new Date(),
      checkOut: dateState.checkOut ? new Date(dateState.checkOut) : new Date(),
      rooms: occupancyState.rooms,
      adults: occupancyState.adults,
      children: occupancyState.children,
      childrenAges: occupancyState.childrenAges,
    },
  });

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 400);

  // Debounced destination search effect
  useEffect(() => {
    if (debouncedQuery) {
      handleDestinationSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  const handleDestinationSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const result = await HotelService.searchDestinations(query);
      setDestinations(result.data || []);
    } catch (error) {
      console.error('Error searching destinations:', error);
      setDestinations([]);
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (values: SearchFormValues) => {
    if (!values.destination) return;

    dispatch(setLoading(true));
    try {
      // Update Redux state
      dispatch(setDestination(values.destination));
      dispatch(setDates({
        checkIn: format(values.checkIn, 'yyyy-MM-dd'),
        checkOut: format(values.checkOut, 'yyyy-MM-dd'),
      }));
      dispatch(setOccupancy({
        rooms: values.rooms,
        adults: values.adults,
        children: values.children,
      }));
      dispatch(setChildrenAges(values.childrenAges));

      const searchParams = {
        stay: {
          checkIn: format(values.checkIn, 'yyyy-MM-dd'),
          checkOut: format(values.checkOut, 'yyyy-MM-dd'),
        },
        occupancies: [{
          rooms: values.rooms,
          adults: values.adults,
          children: values.children,
          ...(values.children > 0 && {
            paxes: values.childrenAges.map(age => ({
              type: 'CH' as const,
              age,
            })),
          }),
        }],
      };

      // Navigate to results page with query params
      const queryParams = new URLSearchParams({
        destinationId: values.destination.id.toString(),
        destinationName: values.destination.name,
        destinationCountry: values.destination.country?.name || '',
        checkIn: format(values.checkIn, 'yyyy-MM-dd'),
        checkOut: format(values.checkOut, 'yyyy-MM-dd'),
        rooms: values.rooms.toString(),
        adults: values.adults.toString(),
        children: values.children.toString(),
        ...(values.children > 0 && {
          childrenAges: values.childrenAges.join(',')
        })
      });

      navigate(`/results?${queryParams}`);
    } catch (error) {
      console.error('Error submitting search:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    // Fetch destinations when the component mounts
    const fetchDestinations = async () => {
      try {
        const result = await HotelService.searchDestinations();
        setDestinations(result?.data || []);
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setDestinations([]);
      }
    };

    fetchDestinations();
  }, []);

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative grid grid-cols-12 gap-2 items-baseline">
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem className={`${landingPage ? 'col-span-6 max-sm:col-span-12' : 'col-span-3 max-xl:col-span-6 max-sm:col-span-12'}`}>
                  <FormLabel><MapPinHouse className="w-5 h-5" />Destination</FormLabel>
                  <FormControl>
                    <Combobox
                      options={destinations?.map(dest => ({
                        value: dest.id.toString(),
                        label: `${dest.name}${dest.country ? `, ${dest.country.name}` : ''}`
                      }))}
                      value={field.value ? field.value.id.toString() : ''}
                      onValueChange={(value) => {
                        const destination = destinations.find(dest => dest.id.toString() === value) || null;
                        field.onChange(destination);
                      }}
                      placeholder="Where would you like to go?"
                      searchPlaceholder="Search destinations..."
                      emptyMessage="No destinations found"
                      loading={isSearching}
                      onSearch={setSearchQuery}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checkIn"
              render={({ field }) => (
                <FormItem className={`flex flex-col ${landingPage ? 'col-span-3 max-sm:col-span-6' : 'col-span-2 max-xl:col-span-3 max-sm:col-span-6'}`}>
                  <FormLabel><CalendarArrowDown className="w-5 h-5" />Check-in</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal cursor-pointer",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checkOut"
              render={({ field }) => (
                <FormItem className={`flex flex-col ${landingPage ? 'col-span-3 max-sm:col-span-6' : 'col-span-2 max-xl:col-span-3 max-sm:col-span-6'}`}>
                  <FormLabel><CalendarArrowUp className="w-5 h-5" />Check-out</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal cursor-pointer",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < form.getValues('checkIn')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rooms"
              render={({ field }) => (
                <FormItem className={`${landingPage ? 'col-span-4' : 'col-span-1 max-xl:col-span-3 max-sm:col-span-4'}`}>
                  <FormLabel><BedDouble className="w-5 h-5" />Rooms</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adults"
              render={({ field }) => (
                <FormItem className={`${landingPage ? 'col-span-4' : 'col-span-1 max-xl:col-span-3 max-sm:col-span-4'}`}>
                  <FormLabel><Users className="w-5 h-5" />Adults</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="children"
              render={({ field }) => (
                <FormItem className={`${landingPage ? 'col-span-4' : 'col-span-1 max-xl:col-span-3 max-sm:col-span-4'}`}>
                  <FormLabel><Baby className="w-5 h-5" />Children</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} onChange={e => {
                      const value = parseInt(e.target.value);
                      field.onChange(value);
                      const currentAges = form.getValues('childrenAges');
                      if (value > currentAges.length) {
                        form.setValue('childrenAges', [...currentAges, ...Array(value - currentAges.length).fill(0)]);
                      } else {
                        form.setValue('childrenAges', currentAges.slice(0, value));
                      }
                    }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {landingPage && <ChildrenAges form={form} landingPage />}

            <div className={`grid gap-2 ${landingPage ? 'col-span-12' : 'col-span-2 max-xl:col-span-3 max-sm:col-span-12'}`}>
              <FormLabel></FormLabel>
              <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search Hotels'}
              </Button>
            </div>

            {!landingPage && <ChildrenAges form={form} />}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


const ChildrenAges = ({ form, landingPage }: { form: UseFormReturn<SearchFormValues, any, SearchFormValues>, landingPage?: boolean }) => {
  return form.watch('children') > 0 && (
    <div className="grid grid-cols-12 gap-4 col-span-12">
      {Array.from({ length: form.watch('children') }).map((_, index) => (
        <FormField
          key={index}
          control={form.control}
          name={`childrenAges.${index}`}
          render={({ field }) => (
            <FormItem className={landingPage ? 'col-span-3 max-sm:col-span-6' : 'col-span-2 max-xl:col-span-3 max-sm:col-span-6'}>
              <FormLabel><Baby className="w-5 h-5" /> Child {index + 1} Age</FormLabel>
              <FormControl>
                <Input type="number" min="0" max="17" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  )
}