import mongoose from 'mongoose';
import config from './config';
import app from './app';
import http from 'http';
import { Server } from 'socket.io';
import configSocket from './app/socket/config.socket';
import cron from 'node-cron';
import eventServices from './app/modules/eventModule/event.services';
import notificationServices from './app/modules/notificationModule/notification.services';
import scheduleServices from './app/modules/scheduleModule/schedule.services';
import isSameDate from './utils/isSimilarDate';
import getNotificationRecipients from './utils/getNotificationRecipient';
import notificationScheduleJob from './scheduleTasks/notification';
// let server: any;

const server = http.createServer(app);

// Socket.io setup
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// call socket configuation function
configSocket(io);

// handle uncaught exception error
process.on('uncaughtException', (error) => {
  console.log('uncaughtException error', error);
  process.exit(1);
});

cron.schedule('*/5 * * * *', async () => {
  console.log('Running event cron job...')
  const events = await eventServices.retriveAllEventsForCronJob();
  await Promise.all(events.map(async (event: any) => {
    if (event.isCustomDate) {
      event.eventDates.forEach(async (date: any) => {
        if (date.date < new Date()) {
          event.status = 'expired';
          await event.save();
        }
      })
    } else {
      const schedule = await scheduleServices.retrieveSpecificSchedule(event.schedule)
      if (schedule) {
        const currentDate = new Date()
        schedule.dates.forEach(async (date: any) => {
          if (date.date < currentDate) {
            event.status = 'expired';
            await event.save();
          }
        })
      }
    }
  }))
})

// send notification to user before 5 days (every day at 8 AM)
cron.schedule('0 8 * * *', notificationScheduleJob);

const startServer = async () => {
  await mongoose.connect(config.database_url as string);
  console.log('\x1b[36mDatabase connection successfull\x1b[0m');

  server.listen(config.server_port || 5001, () => {
    console.log(`\x1b[32mServer is listening on port ${config.server_port || 5000}\x1b[0m`);
  });
};

// handle unhandled rejection
process.on('unhandledRejection', (reason, promise) => {
  console.log(`unhandle rejection at ${promise} and reason ${reason}`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// gracefull shoutdown on SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received.');
  server.close(() => {
    console.log('Server closed.');
  });
});

startServer();
