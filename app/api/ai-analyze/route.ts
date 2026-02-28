// app/api/ai-analyze/route.ts
import { OpenAI } from "openai";
import { NextRequest } from "next/server";
import type { Profile } from "@/lib/schema/types";
import type { AnalysisResult } from "@/lib/engine/types";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

export async function POST(req: NextRequest) {
    try {
        const { profile, analysis } = await req.json() as {
            profile: Profile;
            analysis: AnalysisResult;
        };

        const prompt = buildPrompt(profile, analysis);

        const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a wardrobe auditor focused on cohesion and intention. Your role is to provide calm, constraint-based analysis. Prioritize bridge lanes and consolidate overlap over suggesting new purchases. Avoid hype, influencer language, and brand recommendations unless specifically asked."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            stream: true,
            temperature: 0.3,
            max_tokens: 600,
        });

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.choices[0]?.delta?.content || "";
                    if (text) {
                        controller.enqueue(encoder.encode(text));
                    }
                }
                controller.close();
            },
        });

        return new Response(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        });
    } catch (error) {
        console.error("AI Analysis error:", error);
        return new Response(
            JSON.stringify({ error: "Failed to generate AI insights" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

function buildPrompt(profile: Profile, analysis: AnalysisResult): string {
    const bootSummaries = profile.items.map((boot) => {
        const attrs = boot.attributes;
        return `- ${boot.displayName || "Unnamed"}: ${attrs.color} ${attrs.leatherType}, ${attrs.soleType} sole, ${attrs.height} height, ${attrs.weight} weight, formality ${attrs.formality}/5, rotation: ${boot.rotation}`;
    });

    return `You are analyzing a boot wardrobe. Here's the data:

**CONTEXT**
Environment: ${profile.context.primaryEnvironments.join(", ")}
Tops: ${profile.wardrobe.tops.join(", ")}
Bottoms: ${profile.wardrobe.bottoms.join(", ")}

**BOOT COLLECTION** (${profile.items.length} boots)
${bootSummaries.join("\n")}

**FORMALITY SCALE GUIDE**
- 1/5: Heavy work boots (thick lug soles, work-oriented, rugged, utilitarian)
- 2/5: Work-leaning (mini lug, work hybrids)
- 3/5: Versatile middle ground (can dress up or down)
- 4/5: Refined casual (leather soles, sleek profiles)
- 5/5: Dress-leaning (polished, formal-adjacent)

**ROTATION MEANINGS**
- Core: Heavy rotation, go-to boots worn frequently
- Regular: Medium use, worn situationally
- Occasional: Light use, worn rarely or seasonally

**WEIGHT GUIDE**
- Heavy: True work boots (10"+ shafts, substantial construction, heavy-duty use)
- Medium: Standard boots (balanced construction)
- Light: Sleek, refined boots (minimal construction, dress-leaning)

**DETERMINISTIC ANALYSIS (GROUND TRUTH)**
Identity: ${analysis.identity}
Structure: ${analysis.structure.join("; ")}
Observations: ${analysis.observations.join("; ")}
Suggestion: [${analysis.suggestion.type}] ${analysis.suggestion.message}

---

**YOUR TASK:**
Provide a brief audit commentary (250-400 words total):

1. **Summary** (1 sentence): Restate the deterministic suggestion in your own words
2. **Style Identity** (max 3 sentences): Their boot aesthetic and how it aligns with lifestyle
3. **Strengths** (3 bullets): What's working well, be specific
4. **Opportunities** (3 bullets): Thoughtful suggestions for evolution
5. **Styling Tips** (2 outfits): Use ONLY their existing tops/bottoms colors. Reference specific boots by name and rotation level (e.g., "your Core rotation [boot name]")

**RULES:**
- Use the deterministic analysis as ground truth — do not contradict it
- Before suggesting a gap, count what they have: heavy weight + heavy lug = work boot, formality 4-5 + leather sole = dress boot
- Do not suggest more than ONE new lane direction
- Do not recommend brands unless they're already in the collection
- Do not suggest categories the user didn't select (e.g., if not executive_formal, don't push dress boots)
- Do not propose "capsule completeness" or "you need X" language
- Only recombine existing wardrobe pieces in outfit suggestions — no new garments
- Keep tone calm, constraint-based, cohesion-focused
- Use bullets where appropriate; avoid long paragraphs`;
}
