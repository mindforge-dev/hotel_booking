import { PrismaClient, RoomType, BookingStatus, NotificationStatus } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRoomImage(type: RoomType): string {
  switch (type) {
    case RoomType.SINGLE:  return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80'
    case RoomType.DOUBLE:  return 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80'
    case RoomType.TWIN:    return 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80'
    case RoomType.SUITE:   return 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80'
    case RoomType.FAMILY:  return 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80'
    default:               return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80'
  }
}

function getRoomSubImages(type: RoomType): string[] {
  const map: Record<RoomType, string[]> = {
    [RoomType.SINGLE]: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80',
    ],
    [RoomType.DOUBLE]: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80',
    ],
    [RoomType.TWIN]: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80',
    ],
    [RoomType.SUITE]: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80',
    ],
    [RoomType.FAMILY]: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80',
    ],
  }
  return map[type] ?? map[RoomType.SINGLE]
}

function getRoomPrice(type: RoomType): number {
  switch (type) {
    case RoomType.SINGLE:  return 100
    case RoomType.DOUBLE:  return 150
    case RoomType.TWIN:    return 130
    case RoomType.SUITE:   return 250
    case RoomType.FAMILY:  return 200
    default:               return 120
  }
}

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------

async function main() {
  // ---- Clear existing data (respect FK order) ----------------------------
  await prisma.verificationToken.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.bookingRoom.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.review.deleteMany()
  await prisma.room.deleteMany()
  await prisma.hotel.deleteMany()
  await prisma.destination.deleteMany()
  await prisma.city.deleteMany()
  await prisma.country.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // ========================================================================
  // 1. Countries (6)
  // ========================================================================
  const countries = await Promise.all([
    prisma.country.create({ data: { name: 'United States', code: 'US', image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80' } }),
    prisma.country.create({ data: { name: 'Canada',        code: 'CA', image: 'https://images.unsplash.com/photo-1504941214544-9c1c44559ab4?q=80' } }),
    prisma.country.create({ data: { name: 'France',        code: 'FR', image: 'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?q=80' } }),
    prisma.country.create({ data: { name: 'Japan',         code: 'JP', image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80' } }),
    prisma.country.create({ data: { name: 'Australia',     code: 'AU', image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80' } }),
    prisma.country.create({ data: { name: 'Brazil',        code: 'BR', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80' } }),
  ])

  // ========================================================================
  // 2. Cities (13)
  // ========================================================================
  const cities = await Promise.all([
    // US
    prisma.city.create({ data: { name: 'New York',      countryId: countries[0].id, image: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?q=80' } }),
    prisma.city.create({ data: { name: 'Los Angeles',   countryId: countries[0].id, image: 'https://images.unsplash.com/photo-1515896769750-31548aa180ed?q=80' } }),
    prisma.city.create({ data: { name: 'Chicago',       countryId: countries[0].id, image: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?q=80' } }),
    // Canada
    prisma.city.create({ data: { name: 'Toronto',       countryId: countries[1].id, image: 'https://images.unsplash.com/photo-1534235826755-84464d97b044?q=80' } }),
    prisma.city.create({ data: { name: 'Vancouver',     countryId: countries[1].id, image: 'https://images.unsplash.com/photo-1578640463869-80e0df0491e3?q=80' } }),
    // France
    prisma.city.create({ data: { name: 'Paris',         countryId: countries[2].id, image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?q=80' } }),
    prisma.city.create({ data: { name: 'Nice',          countryId: countries[2].id, image: 'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?q=80' } }),
    // Japan
    prisma.city.create({ data: { name: 'Tokyo',         countryId: countries[3].id, image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80' } }),
    prisma.city.create({ data: { name: 'Kyoto',         countryId: countries[3].id, image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80' } }),
    // Australia
    prisma.city.create({ data: { name: 'Sydney',        countryId: countries[4].id, image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80' } }),
    prisma.city.create({ data: { name: 'Melbourne',     countryId: countries[4].id, image: 'https://images.unsplash.com/photo-1545044846-351ba102b6d5?q=80' } }),
    // Brazil
    prisma.city.create({ data: { name: 'Rio de Janeiro', countryId: countries[5].id, image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80' } }),
    prisma.city.create({ data: { name: 'São Paulo',      countryId: countries[5].id, image: 'https://images.unsplash.com/photo-1544989164-31f6a2a0b65e?q=80' } }),
  ])

  // ========================================================================
  // 3. Destinations (6)
  // ========================================================================
  await Promise.all([
    prisma.destination.create({ data: { city: 'New York',      country: 'United States', image: cities[0].image, hotels: 12, rating: 4.7 } }),
    prisma.destination.create({ data: { city: 'Paris',         country: 'France',        image: cities[5].image, hotels: 8,  rating: 4.8 } }),
    prisma.destination.create({ data: { city: 'Tokyo',         country: 'Japan',         image: cities[7].image, hotels: 10, rating: 4.6 } }),
    prisma.destination.create({ data: { city: 'Sydney',        country: 'Australia',     image: cities[9].image, hotels: 7,  rating: 4.5 } }),
    prisma.destination.create({ data: { city: 'Rio de Janeiro', country: 'Brazil',       image: cities[11].image, hotels: 6, rating: 4.4 } }),
    prisma.destination.create({ data: { city: 'Vancouver',     country: 'Canada',        image: cities[4].image, hotels: 5,  rating: 4.6 } }),
  ])

  // ========================================================================
  // 4. Users (8 — 1 admin + 7 regular)
  // ========================================================================
  const users = await Promise.all([
    // Admin
    prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@hotelbooking.com',
        password: await hash('admin123', 10),
        role: 'ADMIN',
        emailVerified: new Date(),
        image: 'https://randomuser.me/api/portraits/men/75.jpg',
      },
    }),
    // Regular users
    prisma.user.create({
      data: { name: 'John Doe',      email: 'john@example.com',   password: await hash('password123', 10), role: 'USER', emailVerified: new Date(), image: 'https://randomuser.me/api/portraits/men/1.jpg' },
    }),
    prisma.user.create({
      data: { name: 'Jane Smith',     email: 'jane@example.com',   password: await hash('password123', 10), role: 'USER', emailVerified: new Date(), image: 'https://randomuser.me/api/portraits/women/1.jpg' },
    }),
    prisma.user.create({
      data: { name: 'Alex Johnson',   email: 'alex@example.com',   password: await hash('password123', 10), role: 'USER', emailVerified: new Date(), image: 'https://randomuser.me/api/portraits/men/2.jpg' },
    }),
    prisma.user.create({
      data: { name: 'Emily Davis',    email: 'emily@example.com',  password: await hash('password123', 10), role: 'USER', emailVerified: new Date(), image: 'https://randomuser.me/api/portraits/women/2.jpg' },
    }),
    prisma.user.create({
      data: { name: 'Michael Brown',  email: 'michael@example.com', password: await hash('password123', 10), role: 'USER', emailVerified: new Date(), image: 'https://randomuser.me/api/portraits/men/3.jpg' },
    }),
    prisma.user.create({
      data: { name: 'Sarah Wilson',   email: 'sarah@example.com',  password: await hash('password123', 10), role: 'USER', emailVerified: new Date(), image: 'https://randomuser.me/api/portraits/women/3.jpg' },
    }),
    prisma.user.create({
      data: { name: 'David Lee',      email: 'david@example.com',  password: await hash('password123', 10), role: 'USER', emailVerified: new Date(), image: 'https://randomuser.me/api/portraits/men/4.jpg' },
    }),
  ])

  // Accounts for NextAuth (credentials provider)
  await Promise.all(
    users.map((user) =>
      prisma.account.create({
        data: {
          userId: user.id,
          type: 'credentials',
          provider: 'email',
          providerAccountId: user.email!,
        },
      }),
    ),
  )

  // ========================================================================
  // 5. Hotels (12 — at least 1 per city)
  // ========================================================================
  const hotels = await Promise.all([
    // US — New York
    prisma.hotel.create({
      data: {
        name: 'Grand Plaza Hotel',
        description: 'Luxury hotel in the heart of Manhattan with stunning city views and world-class amenities.',
        cityId: cities[0].id,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80',
        rating: 4.8,
        featured: true,
        amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Fitness Center', 'Room Service', 'Concierge'],
        latitude: 40.7536,
        longitude: -73.9832,
      },
    }),
    // US — Los Angeles
    prisma.hotel.create({
      data: {
        name: 'Beachfront Resort',
        description: 'Beautiful beachfront property with ocean views and premium amenities on the Pacific coast.',
        cityId: cities[1].id,
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80',
        rating: 4.6,
        featured: true,
        amenities: ['Free WiFi', 'Pool', 'Beach Access', 'Restaurant', 'Bar', 'Valet Parking'],
        latitude: 34.0259,
        longitude: -118.7798,
      },
    }),
    // US — Chicago
    prisma.hotel.create({
      data: {
        name: 'Windy City Suites',
        description: 'Modern suites overlooking Lake Michigan in downtown Chicago, steps from the Magnificent Mile.',
        cityId: cities[2].id,
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80',
        rating: 4.3,
        featured: false,
        amenities: ['Free WiFi', 'Fitness Center', 'Restaurant', 'Bar', 'Business Center'],
        latitude: 41.8819,
        longitude: -87.6278,
      },
    }),
    // Canada — Toronto
    prisma.hotel.create({
      data: {
        name: 'Mountain View Lodge',
        description: 'Cozy lodge with breathtaking mountain views and outdoor activities near Niagara Falls.',
        cityId: cities[3].id,
        image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80',
        rating: 4.5,
        featured: false,
        amenities: ['Free WiFi', 'Parking', 'Restaurant', 'Hot Tub', 'Ski Storage'],
        latitude: 43.6532,
        longitude: -79.3832,
      },
    }),
    // Canada — Vancouver
    prisma.hotel.create({
      data: {
        name: 'Pacific Rim Hotel',
        description: 'Elegant waterfront hotel in Coal Harbour with panoramic views of the North Shore mountains.',
        cityId: cities[4].id,
        image: 'https://images.unsplash.com/photo-1578640463869-80e0df0491e3?q=80',
        rating: 4.7,
        featured: true,
        amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Fitness Center'],
        latitude: 49.2827,
        longitude: -123.1207,
      },
    }),
    // France — Paris
    prisma.hotel.create({
      data: {
        name: 'Parisian Elegance',
        description: 'Charming boutique hotel near the Eiffel Tower with classic Parisian style and modern comforts.',
        cityId: cities[5].id,
        image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?q=80',
        rating: 4.9,
        featured: true,
        amenities: ['Free WiFi', 'Concierge', 'Bar', 'Room Service', 'Laundry'],
        latitude: 48.8584,
        longitude: 2.2945,
      },
    }),
    // France — Nice
    prisma.hotel.create({
      data: {
        name: 'Côte d\'Azur Retreat',
        description: 'Mediterranean gem on the French Riviera with a private beach and stunning sea views.',
        cityId: cities[6].id,
        image: 'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?q=80',
        rating: 4.4,
        featured: false,
        amenities: ['Free WiFi', 'Pool', 'Beach Access', 'Restaurant', 'Air Conditioning'],
        latitude: 43.7102,
        longitude: 7.2620,
      },
    }),
    // Japan — Tokyo
    prisma.hotel.create({
      data: {
        name: 'Tokyo Skytree Hotel',
        description: 'Modern high-rise hotel with panoramic views of Tokyo\'s skyline and traditional Japanese hospitality.',
        cityId: cities[7].id,
        image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80',
        rating: 4.7,
        featured: true,
        amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Sky Bar', 'Onsen'],
        latitude: 35.7101,
        longitude: 139.8107,
      },
    }),
    // Japan — Kyoto
    prisma.hotel.create({
      data: {
        name: 'Kyoto Garden Inn',
        description: 'Traditional ryokan-style hotel surrounded by bamboo gardens and ancient temples.',
        cityId: cities[8].id,
        image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80',
        rating: 4.8,
        featured: false,
        amenities: ['Free WiFi', 'Onsen', 'Restaurant', 'Tea Ceremony Room', 'Garden'],
        latitude: 35.0116,
        longitude: 135.7681,
      },
    }),
    // Australia — Sydney
    prisma.hotel.create({
      data: {
        name: 'Sydney Harbour View',
        description: 'Iconic hotel with direct views of the Opera House and Harbour Bridge from every room.',
        cityId: cities[9].id,
        image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80',
        rating: 4.6,
        featured: true,
        amenities: ['Free WiFi', 'Pool', 'Restaurant', 'Bar', 'Fitness Center', 'Concierge'],
        latitude: -33.8568,
        longitude: 151.2153,
      },
    }),
    // Australia — Melbourne
    prisma.hotel.create({
      data: {
        name: 'Melbourne Lane Hotel',
        description: 'Boutique hotel hidden in Melbourne\'s famous laneways, known for its coffee culture and street art.',
        cityId: cities[10].id,
        image: 'https://images.unsplash.com/photo-1545044846-351ba102b6d5?q=80',
        rating: 4.2,
        featured: false,
        amenities: ['Free WiFi', 'Restaurant', 'Bar', 'Parking', 'Air Conditioning'],
        latitude: -37.8136,
        longitude: 144.9631,
      },
    }),
    // Brazil — Rio de Janeiro
    prisma.hotel.create({
      data: {
        name: 'Copacabana Palace',
        description: 'Legendary beachfront hotel on Copacabana beach with Art Deco elegance and carnival spirit.',
        cityId: cities[11].id,
        image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80',
        rating: 4.5,
        featured: true,
        amenities: ['Free WiFi', 'Pool', 'Beach Access', 'Restaurant', 'Bar', 'Spa', 'Fitness Center'],
        latitude: -22.9711,
        longitude: -43.1823,
      },
    }),
  ])

  // ========================================================================
  // 6. Rooms (12 hotels × 5 types = 60 rooms)
  // ========================================================================
  const roomConfigs = [
    { type: RoomType.SINGLE  as RoomType, total: 15, availabilityPercentage: 0.7  },
    { type: RoomType.DOUBLE  as RoomType, total: 20, availabilityPercentage: 0.8  },
    { type: RoomType.TWIN    as RoomType, total: 12, availabilityPercentage: 0.75 },
    { type: RoomType.SUITE   as RoomType, total: 8,  availabilityPercentage: 0.9  },
    { type: RoomType.FAMILY  as RoomType, total: 10, availabilityPercentage: 0.85 },
  ]

  for (const hotel of hotels) {
    for (const config of roomConfigs) {
      const total = config.total
      const available = Math.floor(total * config.availabilityPercentage)

      await prisma.room.create({
        data: {
          name: `${config.type} Room`,
          hotelId: hotel.id,
          roomType: config.type,
          total,
          available,
          image: getRoomImage(config.type),
          subImage: getRoomSubImages(config.type),
          price: getRoomPrice(config.type),
          amenities: ['Free WiFi', 'Air Conditioning', 'Private Bathroom', 'TV', 'Mini Bar'],
        },
      })
    }
  }

  // Fetch all rooms for booking connections
  const allRooms = await prisma.room.findMany()

  // ========================================================================
  // 7. Bookings (20 — covering all statuses)
  // ========================================================================
  const bookingDefs = [
    // -- CONFIRMED (6) --
    { hotelIdx: 0,  userIdx: 1, roomType: RoomType.DOUBLE, checkIn: '2026-07-10', checkOut: '2026-07-15', status: BookingStatus.CONFIRMED },
    { hotelIdx: 1,  userIdx: 2, roomType: RoomType.SUITE,  checkIn: '2026-07-20', checkOut: '2026-07-25', status: BookingStatus.CONFIRMED },
    { hotelIdx: 4,  userIdx: 4, roomType: RoomType.TWIN,   checkIn: '2026-08-01', checkOut: '2026-08-06', status: BookingStatus.CONFIRMED },
    { hotelIdx: 5,  userIdx: 5, roomType: RoomType.FAMILY, checkIn: '2026-08-10', checkOut: '2026-08-17', status: BookingStatus.CONFIRMED },
    { hotelIdx: 7,  userIdx: 6, roomType: RoomType.SINGLE, checkIn: '2026-09-05', checkOut: '2026-09-08', status: BookingStatus.CONFIRMED },
    { hotelIdx: 9,  userIdx: 7, roomType: RoomType.SUITE,  checkIn: '2026-10-01', checkOut: '2026-10-07', status: BookingStatus.CONFIRMED },

    // -- PENDING (4) --
    { hotelIdx: 0,  userIdx: 3, roomType: RoomType.SINGLE, checkIn: '2026-08-15', checkOut: '2026-08-20', status: BookingStatus.PENDING },
    { hotelIdx: 2,  userIdx: 5, roomType: RoomType.DOUBLE, checkIn: '2026-09-01', checkOut: '2026-09-04', status: BookingStatus.PENDING },
    { hotelIdx: 8,  userIdx: 7, roomType: RoomType.FAMILY, checkIn: '2026-10-10', checkOut: '2026-10-15', status: BookingStatus.PENDING },
    { hotelIdx: 11, userIdx: 1, roomType: RoomType.TWIN,   checkIn: '2026-11-01', checkOut: '2026-11-05', status: BookingStatus.PENDING },

    // -- COMPLETED (4) --
    { hotelIdx: 0,  userIdx: 2, roomType: RoomType.SUITE,  checkIn: '2026-05-01', checkOut: '2026-05-06', status: BookingStatus.COMPLETED },
    { hotelIdx: 3,  userIdx: 4, roomType: RoomType.DOUBLE, checkIn: '2026-05-10', checkOut: '2026-05-14', status: BookingStatus.COMPLETED },
    { hotelIdx: 7,  userIdx: 6, roomType: RoomType.TWIN,   checkIn: '2026-04-20', checkOut: '2026-04-25', status: BookingStatus.COMPLETED },
    { hotelIdx: 10, userIdx: 3, roomType: RoomType.SINGLE, checkIn: '2026-06-01', checkOut: '2026-06-03', status: BookingStatus.COMPLETED },

    // -- CANCELLED (3) --
    { hotelIdx: 1,  userIdx: 1, roomType: RoomType.FAMILY, checkIn: '2026-06-15', checkOut: '2026-06-20', status: BookingStatus.CANCELLED },
    { hotelIdx: 6,  userIdx: 3, roomType: RoomType.DOUBLE, checkIn: '2026-07-01', checkOut: '2026-07-05', status: BookingStatus.CANCELLED },
    { hotelIdx: 9,  userIdx: 5, roomType: RoomType.SINGLE, checkIn: '2026-08-20', checkOut: '2026-08-23', status: BookingStatus.CANCELLED },

    // -- REJECTED (3) --
    { hotelIdx: 2,  userIdx: 6, roomType: RoomType.SUITE,  checkIn: '2026-07-10', checkOut: '2026-07-12', status: BookingStatus.REJECTED },
    { hotelIdx: 5,  userIdx: 7, roomType: RoomType.FAMILY, checkIn: '2026-06-25', checkOut: '2026-06-30', status: BookingStatus.REJECTED },
    { hotelIdx: 8,  userIdx: 2, roomType: RoomType.DOUBLE, checkIn: '2026-09-15', checkOut: '2026-09-19', status: BookingStatus.REJECTED },
  ]

  const bookings: any[] = []
  const bookingRooms: { bookingId: string; roomId: string }[] = []

  for (const def of bookingDefs) {
    const hotel = hotels[def.hotelIdx]
    const user = users[def.userIdx]
    const room = allRooms.find(
      (r) => r.hotelId === hotel.id && r.roomType === def.roomType,
    )!

    const booking = await prisma.booking.create({
      data: {
        hotelId: hotel.id,
        userId: user.id,
        checkIn: new Date(def.checkIn),
        checkOut: new Date(def.checkOut),
        status: def.status,
      },
    })
    bookings.push(booking)
    bookingRooms.push({ bookingId: booking.id, roomId: room.id })
  }

  // Batch connect rooms to bookings
  await prisma.bookingRoom.createMany({ data: bookingRooms })

  // ========================================================================
  // 8. Reviews (15)
  // ========================================================================
  const reviewDefs = [
    { hotelIdx: 0,  userIdx: 1, rating: 5.0, comment: 'Absolutely fantastic stay! The service was impeccable and the room was beautiful. Central location made exploring NYC effortless.' },
    { hotelIdx: 0,  userIdx: 2, rating: 4.0, comment: 'Great location and comfortable rooms. Would definitely stay again. Breakfast could use more variety.' },
    { hotelIdx: 0,  userIdx: 4, rating: 4.5, comment: 'The Grand Plaza lived up to its name. Stunning views from the 30th floor. Concierge was extremely helpful.' },
    { hotelIdx: 1,  userIdx: 3, rating: 4.5, comment: 'Amazing ocean views and very friendly staff. The pool area was perfect for relaxing after a day at the beach.' },
    { hotelIdx: 2,  userIdx: 5, rating: 3.5, comment: 'Decent hotel near the loop. A bit dated but clean and well-maintained. Good value for the price.' },
    { hotelIdx: 3,  userIdx: 6, rating: 4.0, comment: 'Nice lodge near Toronto. The mountain views from the restaurant are breathtaking. Would recommend for nature lovers.' },
    { hotelIdx: 4,  userIdx: 7, rating: 4.8, comment: 'One of the best hotels I\'ve stayed at in Vancouver. The Pacific Rim location is unbeatable.' },
    { hotelIdx: 5,  userIdx: 1, rating: 5.0, comment: 'The most romantic hotel in Paris! Perfect for our anniversary trip. Eiffel Tower views at sunset were magical.' },
    { hotelIdx: 5,  userIdx: 3, rating: 4.5, comment: 'Classic Parisian elegance. The bar makes an incredible negroni. Walking distance to everything.' },
    { hotelIdx: 6,  userIdx: 4, rating: 4.0, comment: 'Beautiful location on the Riviera. Private beach was a wonderful touch. Rooms are a bit small though.' },
    { hotelIdx: 7,  userIdx: 5, rating: 4.5, comment: 'Tokyo Skytree Hotel is a gem. The onsen on the rooftop with city views is an unforgettable experience.' },
    { hotelIdx: 7,  userIdx: 6, rating: 4.0, comment: 'Very modern and clean. Great access to public transit. The sky bar is worth the visit even if you don\'t stay here.' },
    { hotelIdx: 8,  userIdx: 7, rating: 5.0, comment: 'Kyoto Garden Inn is pure magic. The traditional tea ceremony and garden views made it the highlight of our Japan trip.' },
    { hotelIdx: 9,  userIdx: 2, rating: null, comment: 'Sydney Harbour views are exactly as advertised. Woke up to the Opera House every morning. Simply stunning.' },
    { hotelIdx: 11, userIdx: null, rating: 4.5, comment: 'Copacabana Palace is the real deal. Art Deco charm meets Brazilian hospitality. Carnival was unforgettable!' },
  ]

  await Promise.all(
    reviewDefs.map((def) =>
      prisma.review.create({
        data: {
          hotelId: hotels[def.hotelIdx].id,
          userId: def.userIdx !== null ? users[def.userIdx].id : null,
          rating: def.rating ?? 4.0,
          comment: def.comment,
        },
      }),
    ),
  )

  // ========================================================================
  // 9. Notifications (12 — linked to bookings)
  // ========================================================================
  const notificationDefs = [
    // REQUESTED
    { userIdx: 3, bookingIdx: 6,  status: NotificationStatus.REQUESTED, message: 'New booking request received for Grand Plaza Hotel — Single Room, Jul 15–20.' },
    { userIdx: 5, bookingIdx: 7,  status: NotificationStatus.REQUESTED, message: 'New booking request received for Windy City Suites — Double Room, Sep 1–4.' },
    { userIdx: 7, bookingIdx: 8,  status: NotificationStatus.REQUESTED, message: 'New booking request received for Kyoto Garden Inn — Family Room, Oct 10–15.' },
    { userIdx: 1, bookingIdx: 9,  status: NotificationStatus.REQUESTED, message: 'New booking request received for Copacabana Palace — Twin Room, Nov 1–5.' },
    // ACCEPTED
    { userIdx: 1, bookingIdx: 0,  status: NotificationStatus.ACCEPTED,  message: 'Your booking at Grand Plaza Hotel has been confirmed. Check-in: Jul 10.' },
    { userIdx: 2, bookingIdx: 1,  status: NotificationStatus.ACCEPTED,  message: 'Your booking at Beachfront Resort has been confirmed. Check-in: Jul 20.' },
    { userIdx: 4, bookingIdx: 2,  status: NotificationStatus.ACCEPTED,  message: 'Your booking at Pacific Rim Hotel has been confirmed. Check-in: Aug 1.' },
    { userIdx: 5, bookingIdx: 3,  status: NotificationStatus.ACCEPTED,  message: 'Your booking at Parisian Elegance has been confirmed. Check-in: Aug 10.' },
    // REJECTED
    { userIdx: 6, bookingIdx: 16, status: NotificationStatus.REJECTED,  message: 'Your booking request at Windy City Suites was not approved. Please try a different date.' },
    { userIdx: 7, bookingIdx: 17, status: NotificationStatus.REJECTED,  message: 'Your booking request at Parisian Elegance was not approved due to limited availability.' },
    { userIdx: 2, bookingIdx: 18, status: NotificationStatus.REJECTED,  message: 'Your booking request at Kyoto Garden Inn was not approved. Peak season restrictions apply.' },
    // Extra REQUESTED for cancelled booking
    { userIdx: 1, bookingIdx: 12, status: NotificationStatus.REQUESTED, message: 'Booking cancellation received for Beachfront Resort — Family Room, Jun 15–20.' },
  ]

  await Promise.all(
    notificationDefs.map((def) =>
      prisma.notification.create({
        data: {
          userId: users[def.userIdx].id,
          bookingId: bookings[def.bookingIdx].id,
          status: def.status,
          message: def.message,
        },
      }),
    ),
  )

  // ========================================================================
  // 10. Verification Token (for testing)
  // ========================================================================
  await prisma.verificationToken.create({
    data: {
      identifier: 'test@example.com',
      token: 'test-token-123',
      expires: new Date(Date.now() + 3600000), // 1 hour from now
    },
  })

  // ---- Summary ----------------------------------------------------------
  console.log('✅ Database seeded successfully!')
  console.log(`   Countries:      ${countries.length}`)
  console.log(`   Cities:         ${cities.length}`)
  console.log(`   Hotels:        ${hotels.length}`)
  console.log(`   Users:          ${users.length}  (admin: admin@hotelbooking.com / admin123)`)
  console.log(`   Rooms:          ${allRooms.length}`)
  console.log(`   Bookings:       ${bookings.length}`)
  console.log(`   Reviews:        ${reviewDefs.length}`)
  console.log(`   Notifications: ${notificationDefs.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
