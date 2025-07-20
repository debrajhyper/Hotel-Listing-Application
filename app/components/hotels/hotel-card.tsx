import { Card } from "../ui/card";
import type { Hotel } from "../../types/hotel";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { extractRating } from "@/lib/utils";

interface HotelCardProps {
    hotel: Hotel;
    onViewDetails: (hotel: Hotel) => void;
}

const DEFAULT_IMAGE = 'https://placehold.co/600x400?text=No+Image';

export function HotelCard({ hotel, onViewDetails }: HotelCardProps) {
    const images = hotel.hotelImageLinks?.length 
        ? hotel.hotelImageLinks 
        : [{ imageLink: DEFAULT_IMAGE, imageType: 'PLACEHOLDER' }];

    return (
        <Card className="group p-0 gap-0 flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-[16/9] overflow-hidden">
                <Carousel className="w-full h-full">
                    <CarouselContent>
                        {images.map((image, index) => (
                            <CarouselItem key={index}>
                                <img
                                    src={image.imageLink || DEFAULT_IMAGE}
                                    alt={`${hotel.hotelName} - Image ${index + 1}`}
                                    className="object-cover w-full h-full aspect-[16/9]"
                                    onError={(e) => {
                                        e.currentTarget.src = DEFAULT_IMAGE;
                                    }}
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {images.length > 1 && (
                        <>
                            <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-3xl cursor-pointer disabled:cursor-not-allowed" />
                            <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-3xl cursor-pointer disabled:cursor-not-allowed" />
                        </>
                    )}
                </Carousel>
                <div className="absolute top-2 right-2 bg-white/90 dark:bg-zinc-900/25 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
                    <span>{extractRating(hotel?.rating || "0")}</span>
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                                key={star}
                                className={`w-4 h-4 ${
                                    star <= extractRating(hotel.rating || "0")
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.2-6.3-4.8-6.3 4.8 2.3-7.2-6-4.6h7.6z" />
                            </svg>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex flex-col flex-1 p-4">
                <div className="flex-1 space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold leading-tight line-clamp-1">{hotel.hotelName}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{hotel.address}</p>
                    </div>

                    {hotel.facilityResponses?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {hotel.facilityResponses.slice(0, 5).map((facility, index) => (
                                <span
                                    key={index}
                                    className="text-xs bg-muted px-2 py-1 rounded-full"
                                >
                                    {facility.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-end mt-4 pt-4 border-t">
                    <div>
                        <p className="text-sm text-muted-foreground">From</p>
                        <p className="text-2xl font-bold">
                            {hotel.roomResponses?.[0]?.rateKeyResponses?.totalPrice 
                                ? `₹${hotel.roomResponses[0].rateKeyResponses.totalPrice.toLocaleString()}`
                                : 'Price on request'
                            }
                        </p>
                    </div>
                    <button
                        onClick={() => onViewDetails(hotel)}
                        className="bg-primary cursor-pointer text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </Card>
    );
}
