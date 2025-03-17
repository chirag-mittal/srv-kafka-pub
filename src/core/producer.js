const { kafka } = require('./kafka.js');
const _ = require('lodash');

producer = kafka.producer();
connect = async () => {
    await producer.connect();
    console.log('Connected to Kafka producer');
}

send = async ({topic, messages, ...args}) => {

    const _messages = _.map(messages, (m)=>{
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

module.exports = { producer, connect, send };