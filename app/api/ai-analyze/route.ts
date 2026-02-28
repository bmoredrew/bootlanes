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
                    content: "You are an expert menswear stylist specializing in boot wardrobes. Provide insightful, actionable advice based on the user's boot collection and context."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            stream: true,
            temperature: 0.7,
            max_tokens: 800,
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
        return `- ${boot.displayName || "Unnamed"}: ${attrs.color} ${attrs.leatherType}, ${attrs.soleType} sole, ${attrs.height} height, formality ${attrs.formality}/5, rotation: ${boot.rotation}`;
    });

    return `You are analyzing a boot wardrobe. Here's the data:

**CONTEXT**
Environment: ${profile.context.primaryEnvironments.join(", ")}
Tops: ${profile.wardrobe.tops.join(", ")}
Bottoms: ${profile.wardrobe.bottoms.join(", ")}

**BOOT COLLECTION** (${profile.items.length} boots)
${bootSummaries.join("\n")}

**DETERMINISTIC ANALYSIS**
Identity: ${analysis.identity}
Structure: ${analysis.structure.join("; ")}
Observations: ${analysis.observations.join("; ")}
Suggestion: [${analysis.suggestion.type}] ${analysis.suggestion.message}

---

Based on this wardrobe profile, provide:

1. **Style Identity** - A 2-3 sentence narrative describing their boot aesthetic and how it aligns with their lifestyle
2. **Strengths** - What's working well in their collection (be specific)
3. **Opportunities** - Thoughtful suggestions for evolution (not just "add more boots")
4. **Styling Tips** - 2-3 specific outfit ideas using their existing boots

Keep it conversational, insightful, and actionable. Avoid generic advice.`;
}
