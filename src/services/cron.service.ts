import cron, { ScheduledTask } from 'node-cron';
// import NtModel from '../models/Nt.model';
// const baseUrl = process.env.NT_SOURCE_URL as string;
// const Nt = NtModel.Instance(baseUrl);
import axios from 'axios';
const tasks: ScheduledTask[] = [];

async function notifyNewMana() {
    try {
        await axios.get('http://localhost:5001/api/notify/update');
    } catch (err) {
        console.log('loi update notify:: ', err);
    }
}

tasks.push(
    cron.schedule('*/59 * * * *', () => {
        console.log('update new chapter manga every 59m');
        notifyNewMana();
    }),
);

export default tasks;

// async function cachingNewManga() {
//     //cache page 1,2,3
//     await Nt.searchParams(-1, 15, 'undefined', 1);
//     await Nt.searchParams(-1, 15, 'undefined', 2);
//     await Nt.searchParams(-1, 15, 'undefined', 3);
// }

// async function cachingCompletedManga() {
//     //cache page 1,2,3
//     await Nt.getCompletedManga(1);
//     await Nt.getCompletedManga(2);
//     await Nt.getCompletedManga(3);
// }

// async function cachingRankingManga() {
//     //default: https://www.nettruyenco.com/tim-truyen?status=-1&sort=10&page=1
//     //cache page 1
//     //genres: manga-112
//     //sort: all, month, week, day
//     //page = this page
//     await Nt.getRanking(10, -1, 1, 'manga-112');
//     await Nt.getRanking(11, -1, 1, 'manga-112');
//     await Nt.getRanking(12, -1, 1, 'manga-112');
//     await Nt.getRanking(13, -1, 1, 'manga-112');
// }

// async function cachingNewUpdatedManga() {
//     //cache page 1,2,3
//     //default: https://www.nettruyenco.com/tim-truyen?status=-1&sort=10&page=1
//     //genres: all, sort: all, page = this page
//     await Nt.getNewUpdatedManga(1);
//     await Nt.getNewUpdatedManga(2);
//     await Nt.getNewUpdatedManga(3);
// }

// tasks.push(
//     cron.schedule('* */2 * * *', () => {
//         console.log('caching new UPDATED manga every 2 hours');
//         cachingNewUpdatedManga();
//     }),
// );

// tasks.push(
//     cron.schedule('* */2 * * *', () => {
//         console.log('caching new manga every 2 hours');
//         cachingNewManga();
//     }),
// );

// tasks.push(
//     cron.schedule('0 * * * *', () => {
//         console.log('caching completed manga every 1 hour');
//         cachingCompletedManga();
//     }),
// );

// tasks.push(
//     cron.schedule('* */12 * * *', () => {
//         console.log('caching ranking manga every 12 hours');
//         cachingRankingManga();
//     }),
// );
