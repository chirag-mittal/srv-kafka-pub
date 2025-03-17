import { kafka } from './kafka.ts';
import * as _ from 'lodash';

export const producer = kafka.producer();
export const connect = async () => {
    await producer.connect();
    console.log('Connected to Kafka producer');
}

export const send = async ({topic, messages, ...args}:any) => {

    const _messages = _.map(messages, (m:any)=>{
        return {...m,
            value: JSON.stringify(m.value)
        };
    });

    return await producer.send({
        topic,
        messages:_messages,
        ...args
    });
}