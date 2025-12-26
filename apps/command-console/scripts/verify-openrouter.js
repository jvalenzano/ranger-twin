
const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_API_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GOOGLE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// Helper for human-like delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function verifyOpenRouter() {
    console.log('🔍 Verifying Hybrid Architecture...');
    console.log('----------------------------------------');

    // --- CHECK KEYS ---
    if (!OPENROUTER_API_KEY) {
        console.error('❌ Error: VITE_OPENROUTER_API_KEY not found');
    } else {
        console.log(`✅ OpenRouter Key found: ${OPENROUTER_API_KEY.slice(0, 8)}...`);
    }

    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('EXAMPLE')) {
        console.warn('⚠️  VITE_GEMINI_API_KEY not found or invalid (Direct Google access may fail)');
    } else {
        console.log(`✅ Google API Key found: ${GEMINI_API_KEY.slice(0, 8)}...`);
    }
    console.log('----------------------------------------\n');

    // --- TEST 1: OPENROUTER (General Query) ---
    console.log('📡 Test 1: OpenRouter (General Query - "burned acres")');
    console.log('   Model: google/gemini-2.0-flash-exp:free');

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://ranger-demo.vercel.app',
                'X-Title': 'RANGER Verification Script',
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-exp:free',
                messages: [
                    { role: 'system', content: 'You are a test assistant.' },
                    { role: 'user', content: 'Hello' }
                ],
                max_tokens: 10,
            }),
        });

        if (response.status === 429) {
            console.warn('⚠️  Rate Limited (429) - This validates the endpoint is reachable but busy.');
        } else if (!response.ok) {
            console.error(`❌ Request failed: ${response.status}`);
        } else {
            console.log('✅ Success! Connection confirmed.');
        }
    } catch (err) {
        console.error('❌ Network Error:', err.message);
    }

    console.log('\n⏳ Sleeping 2s to be human-like...\n');
    await sleep(2000);

    // --- TEST 2: FALLBACK MODEL (Simulated) ---
    console.log('📡 Test 2: OpenRouter Fallback (Secondary Model)');
    console.log('   Model: google/gemma-2-9b-it:free');

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://ranger-demo.vercel.app',
                'X-Title': 'RANGER Verification Script',
            },
            body: JSON.stringify({
                model: 'google/gemma-2-9b-it:free',
                messages: [
                    { role: 'system', content: 'You are a test assistant.' },
                    { role: 'user', content: 'Hello' }
                ],
                max_tokens: 10,
            }),
        });

        if (!response.ok) {
            console.error(`❌ Request failed: ${response.status}`);
        } else {
            console.log('✅ Success! Fallback model confirmed.');
        }
    } catch (err) {
        console.error('❌ Network Error:', err.message);
    }

    console.log('\n⏳ Sleeping 2s...\n');
    await sleep(2000);

    // --- TEST 3: GOOGLE DIRECT (NEPA Query) ---
    console.log('📡 Test 3: Google Direct API (NEPA RAG Channel)');

    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('EXAMPLE')) {
        console.log('⏭️  Skipping Google Direct test (Key missing/invalid)');
    } else {
        try {
            const directUrl = `${GOOGLE_API_URL}?key=${GEMINI_API_KEY}`;
            const response = await fetch(directUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Hello" }] }]
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error(`❌ Google Direct failed: ${response.status}`, errData);
            } else {
                console.log('✅ Success! Direct Google connection confirmed.');
            }
        } catch (err) {
            console.error('❌ Network Error:', err.message);
        }
    }

    console.log('\n----------------------------------------');
    console.log('🎉 Verification Complete.');
}

verifyOpenRouter();
