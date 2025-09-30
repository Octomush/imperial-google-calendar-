# Google Sign-In Setup Instructions

To enable Google Sign-In functionality in this application, you need to obtain a Google Client ID from the Google Cloud Console.

## Steps to Setup:

1. **Go to the Google Cloud Console**

   - Visit: https://console.cloud.google.com/

2. **Create a new project or select an existing one**

   - Click on the project dropdown at the top
   - Create a new project or select an existing one

3. **Enable the Google Identity Services API**

   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google Identity Services API" or "Google+ API"
   - Click on it and click "Enable"

4. **Create credentials**

   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - If prompted, configure the OAuth consent screen first
   - Choose "Web application" as the application type
   - Add your domain to "Authorized JavaScript origins":
     - For development: `http://localhost:5173` (or your dev server port)
     - For production: `https://yourdomain.com`

5. **Copy your Client ID**

   - Once created, copy the Client ID (it looks like: `xxxxx.apps.googleusercontent.com`)

6. **Update the application**

   - Open `src/components/GoogleSignIn.tsx`
   - Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID

   Or pass it as a prop:

   ```tsx
   <GoogleSignIn clientId="your-actual-client-id.apps.googleusercontent.com" />
   ```

## Environment Variables (Recommended)

For better security, consider using environment variables:

1. Create a `.env.local` file in your project root:

   ```
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   ```

2. Update the GoogleSignIn component to use the environment variable:
   ```tsx
   clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}
   ```

## Testing

1. Start your development server: `npm run dev`
2. Open your browser and navigate to your application
3. You should see the Google Sign-In button
4. Click it to test the sign-in flow

## Troubleshooting

- **"Invalid client_id"**: Make sure your Client ID is correct
- **"Unauthorized JavaScript origin"**: Add your current domain/localhost to authorized origins
- **Button not showing**: Check browser console for JavaScript errors
- **CORS errors**: Ensure your domain is properly configured in Google Cloud Console

For more detailed information, visit: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
