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

// cron.schedule('*/5 * * * *', async () => {
//   console.log('Running event cron job...');
//   const events = await eventServices.retriveAllEventsForCronJob();
//   const currentDate = new Date();

//   for (const event of events) {
//     let shouldExpire = false;

//     if (event.hasOwnProperty('isCustomDate') && event.isCustomDate) {
//       for (const date of event.eventDates) {
//         if (date.date && date.date < currentDate) {
//           shouldExpire = true;
//           break;
//         }
//       }
//     } else {
//       const schedule = await scheduleServices.retrieveSpecificSchedule(event.schedule);
//       if (schedule) {
//         for (const date of schedule.dates) {
//           if (date.date && date.date < currentDate) {
//             shouldExpire = true;
//             break;
//           }
//         }
//       }
//     }

//     if (shouldExpire && event.status !== 'expired') {
//       event.status = 'expired';
//       await event.save(); // only one save per event
//     }
//   }
// });

cron.schedule('0 * * * *', async () => {
  console.log('Running hourly event cron job...');
  const events = await eventServices.retriveAllEventsForCronJob();
  const currentDate = new Date();

  for (const event of events) {
    let shouldExpire = false;

    if (event.isCustomDate) {
      if (event.eventDates.length > 0) {
        // expire only if ALL eventDates are past
        shouldExpire = event.eventDates.every(
          (d: any) => d.date && d.date <= currentDate,
        );
      }
    } else if (event.schedule) {
      const schedule = await scheduleServices.retrieveSpecificSchedule(
        event.schedule,
      );
      // console.log(schedule)
      if (schedule && schedule.dates.length > 0) {
        shouldExpire = schedule.dates.every(
          (d: any) => d.date && d.date <= currentDate,

        );
      }
    }

    if (shouldExpire && event.status !== 'expired') {
      event.status = 'expired';
      await event.save(); // single save per event
      console.log(`Event ${event._id} expired.`);
    }
  }
});


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
