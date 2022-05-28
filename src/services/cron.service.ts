import cron, { ScheduledTask } from 'node-cron';
import NtModel from '../models/Nt.model';
const baseUrl = process.env.NT_SOURCE_URL as string;
const Nt = NtModel.Instance(baseUrl);
const tasks: ScheduledTask[] = [];

async function cachingNewManga() {
    //cache page 1,2,3
    await Nt.searchParams(-1, 15, 'undefined', 1);
    await Nt.searchParams(-1, 15, 'undefined', 2);
    await Nt.searchParams(-1, 15, 'undefined', 3);
}

async function cachingCompletedManga() {
    //cache page 1,2,3
    await Nt.getCompletedManga(1);
    await Nt.getCompletedManga(2);
    await Nt.getCompletedManga(3);
}

tasks.push(
    cron.schedule('*/5 * * * *', () => {
        console.log('caching new manga every 5 minutes');
        cachingNewManga();
    }),
);

tasks.push(
    cron.schedule('* */1 * * *', () => {
        console.log('caching completed manga every 1 hour');
        cachingCompletedManga();
    }),
);

tasks.push(
    cron.schedule('*/30 * * * * *', () => {
        console.log('service 3 running every 30 second');
    }),
);

export default tasks;
