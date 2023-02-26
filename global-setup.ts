import {writeFileSync} from 'fs';
import {Booking, getSheetRows} from './utils';

async function globalSetup() {
    console.log("Fetching sheets...");
    const bookingRows: (Booking & {rowIndex: number})[] = await getSheetRows();
    const now = new Date();
    const bookings = bookingRows
        // not yet booked and has username/pass and it's in the future
        .filter(b => {
            const d = new Date(b.date);
            //adjust timezone to un-assume UTC as "new Date" does
            d.setTime(d.getTime() + d.getTimezoneOffset() * 60 * 1000);

            return !b.booked_at &&
                b.player_username &&
                b.player_password &&
                d > now
        })
        // we must grab the minimum necessary to avoid circular dependencies when stringifying
        .map(b => ({
            player_username: b.player_username,
            player_password: b.player_password,
            court: b.court,
            date: b.date,
            time: b.time,
            booked_at: b.booked_at,
            index: b.rowIndex
        }));

    console.log("Writing Sheet rows to file. New Booking count:", bookings.length');
    writeFileSync('./urls.json', JSON.stringify(bookings), {encoding: 'utf-8'});
};
export default globalSetup;

