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

async function cachingRankingManga() {
    //cache page 1,2,3
    //default: https://www.nettruyenco.com/tim-truyen?status=-1&sort=10&page=1
    //genres: all, sort: all, page = this page
    await Nt.getRanking(10, -1, 1);
    await Nt.getRanking(10, -1, 2);
    await Nt.getRanking(10, -1, 3);
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
    cron.schedule('* */12 * * *', () => {
        console.log('caching ranking manga every 12 hours');
        cachingRankingManga();
    }),
);

export default tasks;
