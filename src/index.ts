import scraper from "./scraper";

async function main() {
  const url = "https://www.scrapethissite.com/pages";

  // const scraper = Scraper({
  //   delay: 20,
  //   throttle: 80,
  //   concurrency: 4
  // });

  const data = await scraper(url).data();

  console.log(data);
}

main();
