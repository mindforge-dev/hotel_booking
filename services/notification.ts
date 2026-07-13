import axios from "axios";

export const getNotifications = async (userId: string) => {
  try {
    const response = await axios.get('/api/dashboard/notifications', {
      params: { userId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    const response = await axios.delete(`/api/user/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

export const updateNotificationStatus = async (
  notificationId: string,
  status: 'REQUESTED' | 'ACCEPTED' | 'REJECTED'
) => {
  try {
    const response = await axios.patch(`/api/notifications/${notificationId}/status`, {
      status
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating notification status:", error);
    throw error;
  }
};

export const createBookingNotification = async (
  userId: string,
  message: string,
  bookingId: string,
  status: 'REQUESTED' | 'ACCEPTED' | 'REJECTED' = 'REQUESTED'
) => {
  try {
    const response = await axios.post('/api/notifications', {
      userId,
      message,
      bookingId,
      status
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating booking notification:", error);
    throw error;
  }
};

export const saveNotification = async (notificationData: {
  userId: string;
  message: string;
  action?: string;
  bookingId?: string;
  status?: 'REQUESTED' | 'ACCEPTED' | 'REJECTED';
  type?: string;
  data?: any;
}) => {
  try {
    const response = await axios.post('/api/notifications/save', notificationData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error saving notification:", error);
    throw error;
  }
};

export const saveNotificationToAdmins = async (notificationData: {
  message: string;
  action?: string;
  bookingId?: string;
  status?: 'REQUESTED' | 'ACCEPTED' | 'REJECTED';
  type?: string;
  data?: any;
}) => {
  try {
    const response = await axios.post('/api/notifications/save-to-admins', notificationData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error saving admin notifications:", error);
    throw error;
  }
};
