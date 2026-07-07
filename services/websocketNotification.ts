import { awsWebSocketService } from './awsWebSocket';

/**
 * Send a booking notification to all admin users via the AWS WebSocket Lambda.
 * Uses batch send through the DynamoDB-backed connection store.
 */
export const sendBookingNotificationToAdmins = async (
  adminUserIds: string[],
  bookingDetails: {
    bookingId: string;
    guestName: string;
    guestEmail: string;
    hotelName: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
  },
  status: 'REQUESTED' | 'ACCEPTED' | 'REJECTED' = 'REQUESTED'
) => {
  const statusMessages = {
    REQUESTED: `New booking request from ${bookingDetails.guestName} (${bookingDetails.guestEmail}) for ${bookingDetails.roomName} at ${bookingDetails.hotelName} from ${new Date(bookingDetails.checkIn).toLocaleDateString()} to ${new Date(bookingDetails.checkOut).toLocaleDateString()}. Booking ID: ${bookingDetails.bookingId}`,
    ACCEPTED: `Booking ${bookingDetails.bookingId} has been accepted for ${bookingDetails.guestName} at ${bookingDetails.hotelName}`,
    REJECTED: `Booking ${bookingDetails.bookingId} has been rejected for ${bookingDetails.guestName} at ${bookingDetails.hotelName}`
  };

  const message = statusMessages[status];

  const result = await awsWebSocketService.sendNotificationToUsers(adminUserIds, {
    message,
    type: 'booking',
    data: {
      ...bookingDetails,
      status
    }
  });

  return result;
};

/**
 * Update all admins with a booking status change notification.
 */
export const updateBookingNotificationStatus = async (
  bookingId: string,
  status: 'ACCEPTED' | 'REJECTED',
  adminUserIds: string[],
  bookingDetails: {
    bookingId: string;
    guestName: string;
    guestEmail: string;
    hotelName: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
  }
) => {
  return sendBookingNotificationToAdmins(adminUserIds, bookingDetails, status);
};

/**
 * Send a booking status update to the guest user via WebSocket.
 */
export const sendBookingStatusUpdateToGuest = async (
  guestUserId: string,
  bookingDetails: {
    bookingId: string;
    guestName: string;
    hotelName: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
  },
  status: 'ACCEPTED' | 'REJECTED'
) => {
  const statusMessages = {
    ACCEPTED: `Great news! Your booking at ${bookingDetails.hotelName} has been confirmed. Booking ID: ${bookingDetails.bookingId}`,
    REJECTED: `We're sorry, but your booking request at ${bookingDetails.hotelName} has been declined. Booking ID: ${bookingDetails.bookingId}`
  };

  const message = statusMessages[status];

  const result = await awsWebSocketService.sendNotificationToUsers([guestUserId], {
    message,
    type: 'booking_status',
    data: {
      ...bookingDetails,
      status
    }
  });

  return result;
};
