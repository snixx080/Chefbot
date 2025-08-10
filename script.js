// ChefBot script.js
// Frontend interacts with a serverless function at /api/generate
// IMPORTANT: Deploy this site to Netlify or another host that supports serverless functions.
// Set an environment variable OPENAI_API_KEY in your hosting dashboard (Netlify functions use process.env.OPENAI_API_KEY).

const generateBtn = document.getElementById('generateBtn');
const surpriseBtn = document.getElementById('surpriseBtn');
const ingredientsEl = document.getElementById('ingredients');
const dietEl = document.getElementById('diet');
const resultSection = document.getElementById('result');
const titleEl = document.getElementById('title');
const bodyEl = document.getElementById('body');
const metaEl = document.getElementById('meta');
const shareBtn = document.getElementById('shareBtn');
const saveBtn = document.getElementById('saveBtn');

function setLoading(state){
  if(state){
    generateBtn.textContent = 'Cooking...'; generateBtn.disabled = true;
    surpriseBtn.disabled = true;
  } else {
    generateBtn.textContent = 'Get Recipe'; generateBtn.disabled = false;
    surpriseBtn.disabled = false;
  }
}

// Basic client-side validation
function validateInput(ingredients){
  if(!ingredients || ingredients.trim().length < 1) return false;
  return true;
}

async function generateRecipe(ingredients, diet){
  setLoading(true);
  try{
    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ingredients, diet})
    });
    if(!resp.ok){
      const txt = await resp.text();
      throw new Error('Server error: ' + txt);
    }
    const data = await resp.json();
    // Expecting { title, time, difficulty, servings, instructions, notes }
    titleEl.textContent = data.title || 'ChefBot Recipe';
    metaEl.innerHTML = `<div>⏱ ${data.time || '—'}</div><div>🍽 ${data.servings || '—'}</div><div>⚙️ ${data.difficulty || '—'}</div>`;
    bodyEl.innerHTML = formatRecipe(data);
    resultSection.classList.remove('hidden');
    shareBtn.disabled = false;
    saveBtn.disabled = false;
  }catch(err){
    alert('Error generating recipe: ' + err.message);
    console.error(err);
  }finally{
    setLoading(false);
  }
}

function formatRecipe(data){
  let s = '';
  if(data.ingredients && data.ingredients.length){
    s += '**Ingredients:**\n';
    data.ingredients.forEach(it => s += '- ' + it + '\n');
    s += '\n';
  }
  if(data.instructions && data.instructions.length){
    s += '**Instructions:**\n';
    data.instructions.forEach((step, idx) => s += (idx+1) + '. ' + step + '\n');
    s += '\n';
  }
  if(data.notes) s += '**Notes:**\n' + data.notes + '\n';
  return s;
}

generateBtn.addEventListener('click', ()=>{
  const ingredients = ingredientsEl.value;
  const diet = dietEl.value;
  if(!validateInput(ingredients)){ alert('Please add at least one ingredient.'); return; }
  generateRecipe(ingredients, diet);
});

surpriseBtn.addEventListener('click', ()=>{
  const samples = [
    'eggs, cheese, spinach',
    'canned tuna, pasta, lemon',
    'rice, chickpeas, curry powder',
    'ground beef, onion, tomato, taco seasoning',
    'potato, egg, cheese'
  ];
  const pick = samples[Math.floor(Math.random()*samples.length)];
  ingredientsEl.value = pick;
  dietEl.value = '';
  generateBtn.click();
});

shareBtn.addEventListener('click', async ()=>{
  const txt = titleEl.textContent + '\n\n' + bodyEl.textContent;
  if(navigator.share){
    try{ await navigator.share({title: titleEl.textContent, text: txt}); }
    catch(e){ alert('Share cancelled'); }
  } else {
    // fallback: copy to clipboard
    try{
      await navigator.clipboard.writeText(txt);
      alert('Recipe copied to clipboard — paste where you want!');
    }catch(e){
      alert('Unable to share on this browser.');
    }
  }
});

// Save locally as JSON (simple local save for favorites)
saveBtn.addEventListener('click', ()=>{
  const recipe = {
    title: titleEl.textContent,
    body: bodyEl.textContent,
    savedAt: new Date().toISOString()
  };
  const cur = JSON.parse(localStorage.getItem('chefbot_saves') || '[]');
  cur.push(recipe);
  localStorage.setItem('chefbot_saves', JSON.stringify(cur));
  alert('Saved locally. You can access favorites in your browser storage.');
});

// On load, if user returns, place a small tip
window.addEventListener('load', ()=>{
  const tip = localStorage.getItem('chefbot_tip_seen');
  if(!tip){
    localStorage.setItem('chefbot_tip_seen','1');
  }
});