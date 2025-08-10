
ChefBot — AI Recipe Maker
------------------------

Files included:
- index.html
- style.css
- script.js
- netlify/functions/generate.js  (serverless function for Netlify that calls OpenAI)
- LICENSE (none included — you can add your own)

IMPORTANT: You must host the site on a platform that supports serverless functions (Netlify, Render, Vercel).
The function requires an environment variable OPENAI_API_KEY (your OpenAI API key) — do NOT put the key in client-side code.

Quick iPhone-friendly deploy steps (Netlify):
1. Create a free Netlify account at https://app.netlify.com/signup using Safari on your iPhone.
2. Create a new GitHub repo and upload the entire folder (or use Git from desktop). If you can't use GitHub on mobile, use the Netlify CLI on desktop or ask someone to help push the repo.
   - Alternative: sign into Netlify on a desktop later and drag the folder.
3. In Netlify, go to Sites -> New site -> Import from Git -> connect your GitHub repo.
4. In Site settings -> Build & deploy -> Environment -> Add variable: OPENAI_API_KEY = your_openai_api_key
5. Netlify auto-detects the functions folder. Deploy. After successful build, your site will be live.
6. Test: open the site on your iPhone, enter ingredients, and press 'Get Recipe'.

If you'd like, I can also provide a step-by-step walk-through for setting up GitHub from your iPhone and connecting to Netlify.
