import type { FeedCard } from '../feed/types.js';

export function buildScriptPrompt(card: FeedCard): string {
  return `You are an elite short-form video producer writing a viral, high-retention 26-to-28-second explainer script for YouTube Shorts and Instagram Reels.

Topic Data from Verified Source:
- Headline: "${card.headline}"
- Category: "${card.category}"
- Verified Briefing: "${card.summary}"
- Original Source: "${card.sourceName}"

Writing Rules:
1. Target length: EXACTLY 65 to 75 spoken words total of pure news content (pacing is 140 words/min = ~26-28 seconds). Do not rush or over-condense; explain the full story clearly.
2. The Hook (0-4 seconds): Bold, disruptive, curiosity-inducing statement. Do NOT start with "Did you know" or "In today's news". Jump straight into the jaw-dropping fact that captures anyone scrolling.
3. The Breakdown & Climax: Provide exactly 3 rich, distinct sentences in "corePoints":
   - Point 1: What just launched and why it matters to everyday people, workers, or tech enthusiasts.
   - Point 2: Concrete, exciting capabilities and how it transforms daily workflow, productivity, or lifestyle.
   - Point 3: Real-world availability, rollout details, or the mind-blowing future implication.
4. Accessibility & Virality: Speak in clear, punchy, everyday language. Avoid dry developer jargon (like token pricing, raw parameters, or obscure API benchmarks) unless translated into plain human benefits. Make it fascinating for general audiences so anyone scrolling will instantly understand, save, and share it with friends or coworkers.
5. NO Spoken Call-to-Action (CTA): End the script cleanly on the final news conclusion or mind-blowing takeaway. DO NOT include ANY spoken outro, such as "Read the full 60 words", "Read more", "Link in bio", or "Subscribe". The video MUST end immediately on the news ending.
6. Clean Speech: "fullSpokenText" must be clean English meant to be read aloud by Text-to-Speech. DO NOT include markdown, bullet points, asterisks (*), hashtags (#), emojis, or stage directions like [sound effect] or (laughs).
7. Title & Hashtags: Provide an irresistible viral title (under 60 characters with #Shorts) and 5 trending hashtags (#AI, #Claude, #TechNews, #Productivity, #Shorts).

You MUST respond ONLY with a valid JSON object matching this exact schema:
{
  "hook": "Single punchy hook sentence",
  "corePoints": [
    "First concrete breakthrough sentence",
    "Second concrete capability/benchmark sentence",
    "Third concrete availability/impact sentence"
  ],
  "fullSpokenText": "The complete hook and all three core points joined together as a single continuous natural spoken paragraph ending cleanly on the news takeaway.",
  "videoTitle": "Viral Title Under 60 Chars #Shorts",
  "videoDescription": "Engaging 2-3 sentence description with credit to ${card.sourceName} and link to https://aishort.nextai-apps.com/",
  "hashtags": ["#AI", "#TechNews", "#AIModels", "#Shorts", "#AIShort"]
}`;
}

