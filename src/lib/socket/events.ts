
import { io } from 'socket.io-client';

// const URL =  'http://localhost:4000';
const URL =  'https://app.hyperbuds.com';

export const socket = io(URL);
