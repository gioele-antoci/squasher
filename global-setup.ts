import {writeFileSync} from 'fs';
import {Booking, getSheetRows} from './utils';

async function globalSetup() {
    console.log("Fetching sheets at time:", new Date().toLocaleString());
    const bookingRows: (Booking & {rowIndex: number})[] = await getSheetRows();
    const now = new Date();
    const bookings = bookingRows
        // not yet booked and has username/pass and it's in the future
        .filter(b => {
            const bookingDate = new Date(b.date);
            //adjust timezone to un-assume UTC as "new Date" does
            bookingDate.setTime(bookingDate.getTime() + bookingDate.getTimezoneOffset() * 60 * 1000);

            // testing logic to in the future filter only bookable bookings
            const twoDaysFromNow = new Date();
            // 47hs instead of 48hs, just in case
            twoDaysFromNow.setTime(twoDaysFromNow.getTime() + 47 * 60 * 60 * 1000);
            console.log("Booking being evaluated is more than 2 days from now:", bookingDate > twoDaysFromNow);

            return !b.booked_at &&
                b.player_username &&
                b.player_password &&
                bookingDate > now
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

    console.log("Writing Sheet rows to file. New Booking count:", bookings.length);
    writeFileSync('./urls.json', JSON.stringify(bookings), {encoding: 'utf-8'});
};
export default globalSetup;

