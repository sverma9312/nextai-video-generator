import { fetchLatestFeed } from './consumer.js';

async function main() {
  const cards = await fetchLatestFeed();
  cards.forEach((c, idx) => {
    const text = (c.headline + ' ' + c.summary).toLowerCase();
    if (
      text.includes('claude') ||
      text.includes('anthropic') ||
      text.includes('meeting') ||
      text.includes('office') ||
      text.includes('whiteboard') ||
      text.includes('sheet') ||
      text.includes('decisions')
    ) {
      console.log(`[${idx}] ID: "${c.id}"`);
      console.log(`HEADLINE: ${c.headline}`);
      console.log(`SOURCE:   ${c.sourceName}`);
      console.log(`IMAGE:    ${c.imageUrl}`);
      console.log(`SUMMARY:  ${c.summary}\n-----------------------------------`);
    }
  });
}

main().catch(console.error);
