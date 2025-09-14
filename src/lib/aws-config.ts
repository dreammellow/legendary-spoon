import AWS from 'aws-sdk'
import { Amplify } from 'aws-amplify'

const hasCredentials = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID && process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;

const awsCredentials = {
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'
};

let isAWSConfigured = false;
let isAmplifyConfigured = false;

export function configureAWS() {
  if (hasCredentials && !isAWSConfigured) {
    AWS.config.update({
      accessKeyId: awsCredentials.accessKeyId,
      secretAccessKey: awsCredentials.secretAccessKey,
      region: awsCredentials.region
    });
    isAWSConfigured = true;
  }
}

export function configureAmplify() {
  if (hasCredentials && !isAmplifyConfigured) {
    const amplifyConfig = {
      aws_project_region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      aws_cognito_region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      aws_cognito_identity_pool_id: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
      Auth: {
        region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
        identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID
      },
      FaceLiveness: {
        region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'
      }
    };
    Amplify.configure(amplifyConfig);
    isAmplifyConfigured = true;
  }
}

export function initializeAWS() {
  configureAWS();
  configureAmplify();
}

export { awsCredentials, hasCredentials };

declare global {
  interface Window {
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
    AWS_REGION?: string;
  }
}