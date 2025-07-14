import ApiService from './api';

class TourService {
    async getTours(filters = {}) {
        return await ApiService.get('/tours', filters);
    }

    async getTourById(id) {
        return await ApiService.get(`/tours/${id}`);
    }

    async createTour(tourData) {
        return await ApiService.post('/tours', tourData);
    }
}

export default new TourService();
