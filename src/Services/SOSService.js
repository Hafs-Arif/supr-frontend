/**
 * SOS Service
 * Handles all SOS-related API calls
 */

import api from '../utils/api';

class SOSService {
  /**
   * Trigger SOS alert
   * @param {number} latitude - User latitude
   * @param {number} longitude - User longitude
   * @param {string} rideId - Optional ride ID
   * @returns {Promise} SOS alert data
   */
  static async triggerSOS(latitude, longitude, rideId = null) {
    try {
      const payload = {
        latitude,
        longitude,
      };

      if (rideId) {
        payload.rideId = rideId;
      }

      const response = await api.post('/sos/trigger', payload);
      console.log('✅ SOS triggered:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to trigger SOS:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  /**
   * Update SOS location
   * @param {string} sosAlertId - SOS alert ID
   * @param {number} latitude - User latitude
   * @param {number} longitude - User longitude
   * @returns {Promise} Update response
   */
  static async updateSOSLocation(sosAlertId, latitude, longitude) {
    try {
      const response = await api.post(`/sos/${sosAlertId}/location`, {
        latitude,
        longitude,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update SOS location:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  /**
   * Resolve SOS alert
   * @param {string} sosAlertId - SOS alert ID
   * @param {string} notes - Resolution notes
   * @returns {Promise} Resolution response
   */
  static async resolveSOSAlert(sosAlertId, notes = '') {
    try {
      const response = await api.post(`/sos/${sosAlertId}/resolve`, {
        notes,
      });
      console.log('✅ SOS resolved');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to resolve SOS:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  /**
   * Get active SOS alerts
   * @returns {Promise} List of active SOS alerts
   */
  static async getActiveSOSAlerts() {
    try {
      const response = await api.get('/sos/active');
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to get active SOS alerts:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  /**
   * Get SOS alert details
   * @param {string} sosAlertId - SOS alert ID
   * @returns {Promise} SOS alert details
   */
  static async getSOSAlertDetails(sosAlertId) {
    try {
      const response = await api.get(`/sos/${sosAlertId}`);
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to get SOS details:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  /**
   * Get all SOS alerts (paginated)
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Paginated SOS alerts
   */
  static async getAllSOSAlerts(page = 1, limit = 10) {
    try {
      const response = await api.get('/sos', {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to get SOS alerts:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  /**
   * Get current user location
   * @returns {Promise} Geolocation position
   */
  static getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(position);
        },
        (error) => {
          console.error('❌ Location error:', error.message);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Validate latitude and longitude
   * @param {number} latitude - Latitude value
   * @param {number} longitude - Longitude value
   * @returns {boolean} True if valid
   */
  static validateCoordinates(latitude, longitude) {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  /**
   * Format error message from API response
   * @param {Error} error - Error object
   * @returns {string} Formatted error message
   */
  static getErrorMessage(error) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.status === 400) {
      return 'Invalid request. Please check your input.';
    }
    if (error.response?.status === 401) {
      return 'Unauthorized. Please log in again.';
    }
    if (error.response?.status === 404) {
      return 'SOS alert not found.';
    }
    if (error.message === 'Network Error') {
      return 'Network error. Please check your connection.';
    }
    return error.message || 'An error occurred';
  }
}

export default SOSService;
