const { kafka } = require("./kafka.js");
const producer = require("./producer.js");

module.exports = { kafka, ...producer };