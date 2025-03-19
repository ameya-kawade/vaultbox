import axios from 'axios';

const API = axios.create({
  baseURL: '/', // API calls are sent to /api/...
});

const UserService = {
  searchUsers: async (query) => {
    // Ensure the query is provided and URL encoded
    if (!query) throw new Error("Query parameter is required");
    const response = await API.get(`/channels/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export default UserService;
