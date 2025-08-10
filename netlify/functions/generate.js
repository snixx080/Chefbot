const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const body = JSON.parse(event.body || '{}');
    const { ingredients = '', diet = '' } = body;
    if(!ingredients || ingredients.trim().length === 0){
      return { statusCode: 400, body: 'No ingredients provided' };
    }

    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if(!OPENAI_KEY){
      return { statusCode: 500, body: 'Server misconfigured: missing API key (set OPENAI_API_KEY)' };
    }

    // Build a clear prompt asking the model to respond with JSON.
    const system = "You are ChefBot, an expert chef that returns a JSON object only. The JSON keys must be: title, time, difficulty, servings, ingredients (array of strings), instructions (array of strings), notes (string). Be concise, practical, and use the ingredients provided. Do not output any other text.";
    const user = `Ingredients: ${ingredients}\nDiet/Preference: ${diet}\nRespond with a JSON object as instructed.`;

    const payload = {
      model: "gpt-4o-mini", // change if needed
      messages: [
        {role: "system", content: system},
        {role: "user", content: user}
      ],
      temperature: 0.6,
      max_tokens: 700
    };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if(!res.ok){
      const txt = await res.text();
      return { statusCode: 500, body: 'OpenAI error: ' + txt };
    }

    const data = await res.json();
    // Extract content
    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    // Ensure the model returned parsable JSON.
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON inside the content (in case of extra text)
      const match = content.match(/\{[\s\S]*\}/);
      if(match) parsed = JSON.parse(match[0]);
      else throw new Error('Model did not return valid JSON');
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: String(err) };
  }
};
