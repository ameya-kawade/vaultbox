import app from './app.js';
import { connectToDB } from './db/db.js';
import http from 'http';
import cluster from 'cluster';
import { cpus } from 'os';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { messagesHandler } from './controllers/socketHandlers/messagesHandler.js';
import { channelsHandler, removeUserFromChannels, joinUserToChannels } from './controllers/socketHandlers/channelsHandler.js';
import { assignSocketId } from './controllers/socketHandlers/socketUtils.js';
import { exec } from 'child_process';

const numCPUs = cpus().length;

if (cluster.isPrimary) {
  
  console.log(`Master ${process.pid} is running`);
  
  const command = `mc alias set myminio https://minio:9000 ${process.env.MINIO_ROOT_USER} ${process.env.MINIO_ROOT_PASSWORD} --insecure`;
  exec(command, (error, stdout, stderr)=> {
    
    if(error){
      console.error(`Error setting up mc alias: ${stderr}`);
      process.exit(1);  
    }

    console.log('mc alias configured successfully.');
  
  });   

  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    worker.port = 3000 + i;
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    const newWorker = cluster.fork();
    newWorker.port = worker.port;
  });
} else {
  connectToDB()
    .then(() => {
      app.on('err', (err) => {
        console.log(err);
        process.exit(1);
      });
      const server = http.createServer(app);
      const io = new Server(server, {
        path: '/chat/socket.io/'
      });
      const redisHost = process.env.REDIS_HOST || 'redis';
      const redisPort = process.env.REDIS_PORT || 6379;
      const pubClient = new Redis(redisPort, redisHost);
      const subClient = pubClient.duplicate();
      io.adapter(createAdapter(pubClient, subClient));
      const redisAdapter = new Redis(redisPort, redisHost);

      io.on('connection', async (socket) => {
        try {
          const idAssigned = await assignSocketId(socket, redisAdapter);
          if (!idAssigned) {
            socket.disconnect(true);
            return;
          }
          await joinUserToChannels(socket);
          messagesHandler(io, socket, redisAdapter);
          channelsHandler(socket);
          socket.on('disconnect', async () => {
            const customId = await redisAdapter.hget('socket:custom', socket.id);
            await redisAdapter.hdel('socket:custom', socket.id);
            await redisAdapter.hdel('custom:socket', customId);
            await removeUserFromChannels(socket);
            console.log(`User with ${customId} left`);
          });
        } catch (error) {
          socket.emit('error', error.message);
          console.log(error);
          socket.disconnect(true);
        }
      });

      const PORT = parseInt(process.env.PORT) + cluster.worker.id;
      server.listen(PORT, () => {
        console.log(`Worker ${process.pid} started. Server is running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
}
