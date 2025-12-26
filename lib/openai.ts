import OpenAI from "openai";

export function getOpenAI(): OpenAI {
    const apiKey = process.env.OPENAI_API_KEY;

    console.log("🔑 Getting OpenAI client with key:", {
        exists: !!apiKey,
        length: apiKey?.length,
        prefix: apiKey?.substring(0, 20),
        suffix: apiKey?.substring(apiKey.length - 10),
    });

    if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    return new OpenAI({
        apiKey: apiKey,
    });
}

