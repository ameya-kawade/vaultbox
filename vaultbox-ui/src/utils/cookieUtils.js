// src/utils/cookieUtils.js
export const hasAuthCookie = () => {
    // Check if cookie exists without accessing its content
    return document.cookie.includes('authToken=');
  };