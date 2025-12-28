import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

const awsConfig = {
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_APPSYNC_ENDPOINT,
      region: import.meta.env.VITE_APPSYNC_REGION,
      defaultAuthMode: 'apiKey',
      apiKey: import.meta.env.VITE_APPSYNC_APIKEY
    }
  }
};

Amplify.configure(awsConfig);

export const client = generateClient();