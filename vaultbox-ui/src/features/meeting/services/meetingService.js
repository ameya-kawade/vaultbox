import axios from 'axios';

// Base URL for API calls
const API_URL = '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Create a new meeting
 * @param {string} roomName - The name of the meeting room
 * @returns {Promise} - Response with meeting details and token
 */
export const createMeeting = async (roomName) => {
  try {
    const response = await apiClient.post('/auth/create-meeting', { room: roomName });
    return response.data;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

/**
 * Join an existing meeting
 * @param {string} roomId - The ID of the meeting room to join
 * @param {string} username - The username of the person joining
 * @returns {Promise} - Response with joining details and token
 */
export const joinMeeting = async (roomId, username) => {
  try {
    // Simplify to just navigate directly to the meeting room
    // No need to verify with backend first
    return { roomId };
  } catch (error) {
    console.error('Error joining meeting:', error);
    throw error;
  }
};

/**
 * Delete a meeting
 * @param {string} roomName - The name of the meeting room to delete
 * @returns {Promise} - Response with deletion status
 */
export const deleteMeeting = async (roomName) => {
  try {
    const response = await apiClient.post('/auth/delete-meeting', { room: roomName });
    return response.data;
  } catch (error) {
    console.error('Error deleting meeting:', error);
    throw error;
  }
};

export default {
  createMeeting,
  joinMeeting,
  deleteMeeting
}; 