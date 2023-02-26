import {test} from '@playwright/test';
import {readFileSync} from 'fs';
import {Booking, markRowAsBooked} from '../utils';

const Courts = {
  1: "100000038",
  2: "100000039",
  3: "100000040",
  4: "100000042",
  5: "100000041",
}


test.describe('Booking courts', async () => {
  const file = readFileSync('./urls.json') as any as string;
  const bookings: Booking[] = JSON.parse(file);
  console.log(bookings.length ? bookings : "Nothing to book");

  bookings.forEach((booking, i) => {
    test(`Book Court, row: ${booking.index}`, async ({page}) => {
      const court = booking.court ? Courts[booking.court] : "";

      // go to homepage
      console.log("Navigating to page");
      await page.goto('https://clients.mindbodyonline.com/asp/adm/adm_appt_search.asp?studioid=937536&fl=true&tabID=103');

      // fill username, password and submit
      await page.locator("#su1UserName").fill(booking.player_username);
      await page.locator("#su1Password").fill(booking.player_password);
      await page.locator("#btnSu1Login").click();

      await page.waitForLoadState('networkidle');

      console.log("Logged in as ", booking.player_username);
      // enter squash booking
      await page.getByText("SINGLES SQUASH").click();

      // browse to schedule
      await page.locator("[name='apptSchedBut']").click();

      // navigate to date
      console.log("Changing date to ", booking.date);

      await page.locator("#txtDate").fill(booking.date);
      await page.locator("#txtDate").blur();

      // changing date...
      await page.waitForLoadState('networkidle');

      // find all links with the date and the time and court
      // prefix '=' to time to avoid 2:00:00 PM to match 12:00:00 PM
      // if court is empty, find any except squash lessons (which have id 100000005)
      const apptLocator = `a[href*='${booking.date}'][href*='=${booking.time}']${court ? `[href*='${court}']` : ":not([href*='100000005'])"}`;

      try {
        // click on appointment link
        await page.locator(apptLocator).first().click({timeout: 10000});
        console.log(`Slot requested is available, slot is for court ${court ? court : "N/A"} on ${booking.date} at ${booking.time} for ${booking.player_username}`);
      }

      catch (err) {
        console.log("Couldn't find time slot for booking at index ", booking.index);
        await page.screenshot({path: `screenshots/failed_booking_${booking.index}.png`, fullPage: true});
        return;
      }

      // confirm appt
      await page.locator("#apptBtn").click();
      await page.waitForLoadState('networkidle');

      await markRowAsBooked(booking.index);
      await page.screenshot({path: `screenshots/booking_${booking.index}.png`, fullPage: true});
      console.log('Booking successfully done');

    })
  });
});
