import mongoose from "mongoose";
import eventServices from "../app/modules/eventModule/event.services";
import notificationServices from "../app/modules/notificationModule/notification.services";
import getNotificationRecipients from "../utils/getNotificationRecipient";
import isSameDate from "../utils/isSimilarDate";
import scheduleServices from "../app/modules/scheduleModule/schedule.services";

const notificationScheduleJob = async () => {
    console.log('Running notification cron job...');
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);

    const events = await eventServices.retriveAllEventsForCronJob();

    await Promise.all(events.map(async (event: any) => {
        const userId = event.creator.creatorId;
        const recipients = getNotificationRecipients(event);

        if (event.isCustomDate) {
            for (const dateObj of event.eventDates) {
                const eventDate = new Date(dateObj.date);
                if (isSameDate(eventDate, targetDate)) {
                    for (const recipient of recipients) {
                        await notificationServices.createNotification({
                            consumer: new mongoose.Types.ObjectId(recipient),
                            content: {
                                title: 'Event Notification',
                                message: `Your event "${event.name}" is about to start in 5 days.`,
                                source: {
                                    type: 'event',
                                    id: event._id,
                                },
                            },
                        });
                    }
                }
            }
        } else {
            const schedule = await scheduleServices.retrieveSpecificSchedule(event.schedule);
            if (schedule) {
                for (const dateObj of schedule.dates as any) {
                    const eventDate = new Date(dateObj.date);
                    if (isSameDate(eventDate, targetDate)) {
                        for (const recipient of recipients) {
                            await notificationServices.createNotification({
                                consumer: new mongoose.Types.ObjectId(recipient),
                                content: {
                                    title: 'Event Notification',
                                    message: `Your event "${event.name}" is about to start in 5 days.`,
                                    source: {
                                        type: 'event',
                                        id: event._id,
                                    },
                                },
                            });
                        }
                    }
                }
            }
        }
    }));
}

export default notificationScheduleJob;