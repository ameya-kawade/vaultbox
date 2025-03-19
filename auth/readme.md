<!-- packages installed  : 

npm install express@latest cookie-parser@latest rate-limiter-flexible@latest dotenv@latest jsonwebtoken@latest bcrypt@latest helmet@latest cors@latest morgan@latest winston@latest resend@latest otp-generator@latest -->

# VX-Auth Backend

This is the backend service for the VX-Auth project, providing authentication and OTP verification.

## Prerequisites

- Node.js (v14 or later)
- npm

## Setup

1. Clone the repository and navigate to the backend directory:
   ```
   cd vx-auth/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=3000
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRATION=1h
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   EMAIL_USER=your_gmail_address@gmail.com
   EMAIL_PASSWORD=your_gmail_app_password
   ```
   Replace the placeholder values with your actual credentials.

4. Set up Gmail for sending emails:
   - Go to your Google Account settings
   - Enable 2-Step Verification
   - Create an App Password for your application
   - Use this App Password as the EMAIL_PASSWORD in your .env file

3. Go to the authService.js change the email to your valid email & password according to you. :
   ```
   const users = [
   {
         id: '1',
         email: 'therushidesign@gmail.com',
         password: '', // et this after hashing
      }
   ];

   (async () => {
      users[0].password = await hashPassword('password123');
   })();

   ```
   

## Running the Server

Start the development server: node src\app.js

The server will start on http://localhost:3000.

## API Endpoints

- POST /api/auth/login: Login with email and password
- POST /api/auth/verify-otp: Verify OTP
- POST /api/auth/test-email: Test email sending (for development)

## Changing Email Service

The application uses Gmail to send OTP emails. To use a different email service:

1. Open `src/services/emailService.js`
2. Modify the `transporter` configuration to use your preferred email service
3. Update the .env file with the appropriate credentials for your email service

## Security Notes

- Ensure that your .env file is not committed to version control
- In production, use a more robust rate limiting solution and consider using a dedicated email service