# AI Style Insights Setup

## Overview
The AI Style Insights feature provides deep, personalized analysis of your boot wardrobe using GPT-4o-mini.

## Setup

1. **Get an OpenAI API key**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy it

2. **Add to environment variables**
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Edit `.env.local` and add your actual key:
     ```
     OPENAI_API_KEY=sk-proj-...your-actual-key...
     ```

3. **Restart your dev server**
   ```bash
   npm run dev
   ```

## Usage

1. Fill out your boot profile and click "Analyze Profile"
2. After deterministic analysis appears, click "✨ Get AI Style Insights"
3. AI will stream personalized insights based on your collection

## Cost

- Uses GPT-4o-mini (~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens)
- Typical analysis costs $0.01-0.02
- Set usage limits in your OpenAI dashboard to control costs

## Features

The AI provides:
- **Style Identity**: Narrative description of your boot aesthetic
- **Strengths**: What's working well in your collection
- **Opportunities**: Thoughtful evolution suggestions
- **Styling Tips**: Specific outfit ideas using existing boots

## Privacy

- Profile data is sent to OpenAI for analysis
- No data is stored by BootLanes
- OpenAI's data usage policy: https://openai.com/policies/api-data-usage-policies
