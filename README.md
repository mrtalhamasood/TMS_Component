# TMS Component

React-based Proof of Delivery generator scaffold for the TMS platform. This project is set up with a reusable component and utility library so features can be shared across future apps.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
   Ensure Node.js 18+ is available. If npm is not installed, install Node first.

2. **Configure environment**
   Duplicate `.env.example` to `.env` and add your keys:
   ```bash
   cp .env.example .env
   ```
   Fill in Supabase and Azure app credentials.

3. **Run the dev server**
   ```bash
   npm run dev
   ```

## Project Structure

- `src/components/shared` – Reusable UI widgets (buttons, tables, signature canvas).
- `src/lib` – Domain logic (Supabase client, OneDrive auth/upload, PDF generation, sharing helpers).
- `src/config` – POD field mapping and constants.
- `src/components/pod/PodGenerator.tsx` – Primary POD workflow component scaffold.

## Next Steps

- Wire Supabase schema to expose completed moves and customer joins.
- Align `FIELD_MAP` coordinates with your scanned POD template.
- Consider moving OneDrive upload to a Supabase Edge Function for better security.
