import {test, expect} from '@playwright/test';

enum Courts {
  court1 = "100000038",
  court2 = "100000039",
  court3 = "100000040",
  court4 = "100000042",
  court5 = "100000041",
}

test('Book Court', async ({page}) => {

  const yyyymmdd = "2023-02-22";
  const hmmssPM = "9:00:00 PM";
  const court = Courts.court5;

  // go to homepage
  await page.goto('https://clients.mindbodyonline.com/asp/adm/adm_appt_search.asp?studioid=937536&fl=true&tabID=103');

  // fill username, password and submit
  await page.locator("#su1UserName").fill("");
  await page.locator("#su1Password").fill("");
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

  // click on appointment link
  await page.locator(`a[href*='${yyyymmdd}'][href*='${hmmssPM}'][href*='${court}']`).click();

  // confirm appt
  await page.locator("#apptBtn").click();

  await page.waitForLoadState('networkidle');

  await page.screenshot({path: 'booking.png', fullPage: true});

});
