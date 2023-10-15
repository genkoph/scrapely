import scraper from "./scraper";

async function main() {
  const url = "https://www.scrapethissite.com/pages/simple";

  // const scraper = Scraper({
  //   delay: 20,
  //   throttle: 80,
  //   concurrency: 4
  // });

  const data = await scraper(url).scope(".country").set([{
    name: ".country-name",
    capital: ".country-capital",
    population: ".country-population",
    area: ".country-area",
  }]).data();

  console.log(data);
}

main();
