// @ts-ignore
import { Client } from 'steemlogin';

const customId = 'future';
const client = new Client({
  app: import.meta.env.VITE_STEEMLOGIN_APP,
  callbackURL: import.meta.env.VITE_STEEMLOGIN_CALLBACK_URL
});

client.customEvent = (author: any, payload: any, cb: any) =>
  client.broadcast(
    [
      [
        'custom_json',
        {
          id: customId,
          required_auths: [],
          required_posting_auths: [author],
          json: JSON.stringify(payload),
        },
      ],
    ],
    cb,
  );

// Add a function to handle opening steemlogin sign URL for operations that need active key
client.openSteemLoginSignUrl = (operation: string, payload: any) => {
  const baseUrl = 'https://steemlogin.com/sign/';
  const params = new URLSearchParams();
  
  // Add all payload fields as URL parameters
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        // Handle arrays by using JSON.stringify
        params.append(key, JSON.stringify(value));
      } else {
        params.append(key, String(value));
      }
    }
  });
  
  // Open the sign URL in a new window
  const signUrl = `${baseUrl}${operation}?${params.toString()}`;
  window.open(signUrl, '_blank');
  return signUrl;
};

export default client;
