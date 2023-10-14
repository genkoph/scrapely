import scraper from "./scraper";

async function main() {
  const url = "https://www.scrapethissite.com/pages";

  const data = await scraper(url).data();

  console.log(data);
}

main();
