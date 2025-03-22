import axios from 'axios';

const API = axios.create({
  baseURL: '/', // API calls are sent to /api/...
});

const ChatService = {
  getContacts: async () => {
    const response = await API.get('/chat_api/messages');
    return response.data;
  },
  getChannels: async () => {
    const response = await API.get('/chat_api/channels');
    return response.data;
  },
  getDirectMessages: async (chatId) => {
    const response = await API.get(`/chat_api/messages/getchat/${chatId}?page=1&limit=20`);
    return response.data;
  },
  getChannelMessages: async (chnlId) => {
    const response = await API.get(`/chat_api/channels/getChat/${chnlId}?page=1&limit=20`);
    return response.data;
  },
  uploadFileToDirect: async (chatId, file) => {
    console.log("Uploading file to direct message:", file.name, "for chat ID:", chatId);
    
    const formData = new FormData();
    formData.append('files', file);
    
    try {
      const response = await API.post(`/chat_api/messages/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: { userId: chatId }
      });
      console.log("Upload response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Upload error:", error.response?.data || error.message);
      throw error;
    }
  },
  uploadFileToChannel: async (chnlId, file) => {
    console.log("Uploading file to channel:", file.name, "for channel ID:", chnlId);
    
    const formData = new FormData();
    formData.append('files', file);
    
    try {
      const response = await API.post(`/chat_api/channels/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: { channelId: chnlId }
      });
      console.log("Upload response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Upload error:", error.response?.data || error.message);
      throw error;
    }
  },
  // Get files shared in a channel
  getChannelFiles: async (channelId) => {
    const response = await API.get(`/chat_api/channels/${channelId}/files`);
    return response.data;
  },
  // Get files shared in direct messages with a user
  getDirectMessageFiles: async (userId) => {
    const response = await API.get(`/chat_api/messages/files?userId=${userId}`);
    return response.data;
  },
  // New endpoints for channel functionality:
  getChannelMembers: async (channelId) => {
    const response = await API.get(`/chat_api/channels/${channelId}/members`);
    return response.data;
  },
  createChannel: async (data) => {
    const response = await API.post('/chat_api/channels/create', data);
    return response.data;
  },
  deleteChannel: async (channelId) => {
    const response = await API.delete(`/chat_api/channels/delete/${channelId}`);
    return response.data;
  },
  addMember: async (userId, channelId) => {
    const response = await API.post('/chat_api/channels/addMember', { userId, channelId });
    return response.data;
  },
  removeMember: async (userId, channelId) => {
    const response = await API.post('/chat_api/channels/removeMember', { userId, channelId });
    return response.data;
  },
  addMemberToContacts: async (userId, channelId) => {
    const response = await API.post('/chat_api/channels/addContact', { userId, channelId });
    return response.data;
  },
  searchUsers: async (query) => {
    if (!query) throw new Error("Query parameter is required");
    const response = await API.get(`/chat_api/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export default ChatService;
