import ApiService from './api';

class BookingService {
    async createBooking(bookingData) {
        return await ApiService.post('/bookings', bookingData);
    }

    async getBookings() {
        return await ApiService.get('/bookings');
    }
}

export default new BookingService();
