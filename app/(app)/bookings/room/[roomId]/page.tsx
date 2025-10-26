import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Bed, Wifi, Car, Coffee, Tv, Bath } from "lucide-react";
import Link from "next/link";
import LightboxGallery from "@/components/LightboxGallery";

interface BookingDetailsPageProps {
    params: {
        bookingId: string;
    };
}

const amenityIcons: Record<string, any> = {
    wifi: Wifi,
    parking: Car,
    breakfast: Coffee,
    tv: Tv,
    bathroom: Bath,
    bed: Bed,
};

export default async function BookingDetailsPage({ params }: BookingDetailsPageProps) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">Please log in to view room details.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const bookingId = (params as any).bookingId ?? (params as any).roomId;
    if (!bookingId) return notFound();


    const booking: any = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            hotel: {
                include: {
                    city: { include: { country: true } }
                }
            },
            rooms: { include: { room: true } },
            user: true,
        }
    });

    if (!booking) return notFound();

    const isOwner = booking.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) return notFound();

    const firstRoom = booking.rooms?.[0]?.room;
    const images: string[] = (booking.rooms || []).flatMap((br: any) => [br.room?.image || "/placeholder-room.jpg", ...(br.room?.subImage || [])]);

    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

    const roomLines = (booking.rooms || []).map((br: any) => {
        const r = br.room;
        const price = r?.price || 0;
        const subtotal = price * nights;
        return {
            id: br.id,
            name: r?.name || 'Room',
            price,
            subtotal,
            image: r?.image,
        };
    });

    const total = roomLines.reduce((sum: number, l: any) => sum + l.subtotal, 0);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link href="/bookings">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Bookings
                    </Button>
                </Link>

                <h1 className="text-3xl font-bold mb-2">Booking #{booking.id.slice(-8)} — {firstRoom?.name || booking.hotel.name}</h1>
                <p className="text-muted-foreground">
                    {booking.hotel.name} • {booking.hotel.city?.name}, {booking.hotel.city?.country?.name}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <Card>
                        <CardContent className="p-0">
                            <div className="px-4 py-4">
                                <LightboxGallery images={images.length ? images : ["/placeholder-room.jpg"]} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Status</span>
                                <Badge variant={booking.status === 'CONFIRMED' ? 'default' : booking.status === 'PENDING' ? 'secondary' : 'destructive'}>{booking.status}</Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="font-medium">Check-in</span>
                                <span>{checkIn.toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="font-medium">Check-out</span>
                                <span>{checkOut.toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="font-medium">Nights</span>
                                <span>{nights}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase / Payment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                {roomLines.map((line: any) => (
                                    <div key={line.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src={line.image || '/placeholder-room.jpg'} alt={line.name} className="w-16 h-12 object-cover rounded-md" />
                                            <div>
                                                <div>{line.name}</div>
                                                <div className="text-muted-foreground">${line.price.toFixed(2)} / night</div>
                                            </div>
                                        </div>
                                        <div className="font-medium">${line.subtotal.toFixed(2)}</div>
                                    </div>
                                ))}

                                <div className="flex items-center justify-between border-t pt-2 font-semibold">
                                    <div>Total</div>
                                    <div>${total.toFixed(2)}</div>
                                </div>

                                <div className="mt-3 flex gap-2">
                                    {booking.status === 'PENDING' && (
                                        <Button>Proceed to Payment</Button>
                                    )}
                                    <Link href={`/bookings/${booking.id}`} className="ml-auto">
                                        <Button variant="ghost">View Booking Details</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}