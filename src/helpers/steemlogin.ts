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

export default client;
