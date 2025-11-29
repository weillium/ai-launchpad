import dotenv from 'dotenv';

dotenv.config();

console.log('Worker started...');

setInterval(() => {
  console.log('Worker heartbeat...');
}, 5000);
