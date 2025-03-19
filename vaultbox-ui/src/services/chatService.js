import axios from 'axios';

const API = axios.create({
  baseURL: '/', // API calls are sent to /api/...
});

const ChatService = {
  getContacts: async () => {
    const response = await API.get('/messages');
    return response.data;
  },
  getChannels: async () => {
    const response = await API.get('/channels');
    return response.data;
  },
  getDirectMessages: async (chatId) => {
    const response = await API.get(`/messages/getchat/${chatId}?page=1&limit=20`);
    return response.data;
  },
  getChannelMessages: async (chnlId) => {
    const response = await API.get(`/channels/getChat/${chnlId}?page=1&limit=20`);
    return response.data;
  },
  uploadFileToDirect: async (chatId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await API.post(`/upload/direct/${chatId}`, formData);
    return response.data;
  },
  uploadFileToChannel: async (chnlId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await API.post(`/upload/channel/${chnlId}`, formData);
    return response.data;
  },
  // New endpoints for channel functionality:
  getChannelMembers: async (channelId) => {
    const response = await API.get(`/channels/${channelId}/members`);
    return response.data;
  },
  createChannel: async (data) => {
    const response = await API.post('/channels/create', data);
    return response.data;
  },
  deleteChannel: async (channelId) => {
    const response = await API.delete(`/channels/delete/${channelId}`);
    return response.data;
  },
  addMember: async (userId, channelId) => {
    const response = await API.post('/channels/addMember', { userId, channelId });
    return response.data;
  },
  removeMember: async (userId, channelId) => {
    const response = await API.post('/channels/removeMember', { userId, channelId });
    return response.data;
  },
  addMemberToContacts: async (userId, channelId) => {
    const response = await API.post('/channels/addContact', { userId, channelId });
    return response.data;
  },
  searchUsers: async (query) => {
    if (!query) throw new Error("Query parameter is required");
    const response = await API.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export default ChatService;
