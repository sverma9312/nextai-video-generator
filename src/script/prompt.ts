import type { FeedCard } from '../feed/types.js';

export function buildScriptPrompt(card: FeedCard): string {
  return `You are an elite short-form video producer writing a viral, high-retention 35-second explainer script for YouTube Shorts and Instagram Reels.

Topic Data from Verified Source:
- Headline: "${card.headline}"
- Category: "${card.category}"
- Verified Briefing: "${card.summary}"
- Original Source: "${card.sourceName}"

Writing Rules:
1. Target length: EXACTLY 75 to 95 spoken words total (pacing is 140 words/min = ~35 seconds).
2. The Hook (0-4 seconds): Bold, disruptive, curiosity-inducing statement. Do NOT start with "Did you know" or "In today's news". Jump straight into the jaw-dropping fact.
3. The Breakdown (5-28 seconds): Exactly 2 or 3 punchy, concrete sentences. Mention specific numbers, capabilities, or why this changes AI. Speak like a smart tech insider talking to a friend.
4. The Call to Action (29-35 seconds): Exactly: "Read the full 60-word briefing on the AIShort app. Link in bio."
5. Clean Speech: "fullSpokenText" must be clean English meant to be read aloud by Text-to-Speech. DO NOT include markdown, bullet points, asterisks (*), hashtags (#), emojis, or stage directions like [sound effect] or (laughs).
6. Title & Hashtags: Provide a viral title (under 60 characters with #Shorts) and 5 trending hashtags (#AI, #ArtificialIntelligence, etc.).

You MUST respond ONLY with a valid JSON object matching this exact schema:
{
  "hook": "Single punchy hook sentence",
  "corePoints": [
    "First concrete takeaway sentence",
    "Second concrete takeaway sentence",
    "Third concrete takeaway sentence"
  ],
  "cta": "Read the full 60-word briefing on the AIShort app. Link in bio.",
  "fullSpokenText": "The complete hook, core points, and cta joined together as a single continuous natural spoken paragraph.",
  "videoTitle": "Viral Title Under 60 Chars #Shorts",
  "videoDescription": "Engaging 2-3 sentence description with credit to ${card.sourceName} and link to https://aishort.nextai-apps.com/",
  "hashtags": ["#AI", "#TechNews", "#AIModels", "#Shorts", "#AIShort"]
}`;
}
