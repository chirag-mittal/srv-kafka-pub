import { Kafka } from "kafkajs";
import {
    awsIamAuthenticator,
    createMechanism,
    Type
  } from '@jm18457/kafkajs-msk-iam-authentication-mechanism';

const provider = awsIamAuthenticator({
    region: 'ap-south-1'
});

// console.log('Type', Type);
console.log('brokers:', process.env.KAFKA_BROKERS);

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: process.env.KAFKA_BROKERS?.split(",") || [],
  ssl: true,
  sasl: createMechanism({ region: process.env.KAFKA_REGION || 'ap-south-1' }),
//   sasl: {
//     mechanism: 'AWS_MSK_IAM',
//     authenticationProvider: awsIamAuthenticator(process.env.KAFKA_REGION || 'ap-south-1', 300)
//   },
  connectionTimeout: 3000
});

export {kafka};
