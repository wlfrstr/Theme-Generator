# Theme Generator

A web app that accepts a website URL, analyzes its CSS, and outputs four theme JSON objects:

- **BaseTheme :: Light** – base styling (colors, fonts, buttons, inputs, icons)
- **BaseTheme :: Dark** – dark variant of the base theme
- **InquiryTheme :: Light** – navbar, modal, logo, hosted flow
- **InquiryTheme :: Dark** – dark variant of the inquiry theme

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the API server and the frontend dev server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173), enter a URL (e.g. `https://example.com`), and click **Analyze CSS**.

The app fetches the page, collects linked stylesheets and inline styles, parses the CSS, and maps colors, fonts, and other properties into the theme structures. Results can be copied per card.

## Scripts

- `npm run dev` – run backend and frontend together
- `npm run server` – run only the Express API (port 3001)
- `npm run client` – run only the Vite dev server (port 5173)
- `npm run build` – build the frontend to `dist/`
- `npm run preview` – serve the built frontend

## API

- **POST** `/api/analyze`  
  Body: `{ "url": "https://example.com" }`  
  Returns: `{ baseThemeLight, baseThemeDark, inquiryThemeLight, inquiryThemeDark }`

## Notes

- Some sites block automated requests or use CORS; those URLs may fail to analyze.
- Theme extraction uses heuristics (e.g. most common colors, median font sizes). You may want to tweak the generated JSON manually.
