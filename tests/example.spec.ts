import {test} from '@playwright/test';
import {readFileSync, writeFileSync} from 'fs';


enum Courts {
  court1 = "100000038",
  court2 = "100000039",
  court3 = "100000040",
  court4 = "100000042",
  court5 = "100000041",
}

const path = "tests/booking.json";

test('Book Court', async ({page}) => {
  const bookings: {court: string, date: string, time: string}[] = JSON.parse(readFileSync(path, {encoding: "utf8"}));
  const firstBooking = bookings[0];
  if (!firstBooking) {
    return;
  }
  console.log(firstBooking);
  const yyyymmdd = firstBooking.date;
  const hmmssPM = firstBooking.time;
  const court = Courts[firstBooking.court];

  // go to homepage
  await page.goto('https://clients.mindbodyonline.com/asp/adm/adm_appt_search.asp?studioid=937536&fl=true&tabID=103');

  // fill username, password and submit
  await page.locator("#su1UserName").fill((<any>process.env)["email"]);
  await page.locator("#su1Password").fill((<any>process.env)["password"]);
  await page.locator("#btnSu1Login").click();

  await page.waitForLoadState('networkidle');

  // enter squash booking
  await page.getByText("SINGLES SQUASH").click();

  // browse to schedule
  await page.locator("[name='apptSchedBut']").click();

  // navigate to date
  await page.locator("#txtDate").fill(yyyymmdd);
  await page.locator("#txtDate").blur();

  // changing date...
  await page.waitForLoadState('networkidle');

  const apptLocator = `a[href*='${yyyymmdd}'][href*='${hmmssPM}'][href*='${court}']`;
  console.log(apptLocator);
  // click on appointment link
  await page.locator(apptLocator).click({timeout: 10000});

  // confirm appt
  await page.locator("#apptBtn").click();

  await page.waitForLoadState('networkidle');

  await page.screenshot({path: 'booking.png', fullPage: true});

  bookings.shift();

  try {
    writeFileSync(path, JSON.stringify(bookings), 'utf8');
    console.log('Booking successfully updated');
  } catch (error) {
    console.log('An error has occurred ', error);
  }

});
