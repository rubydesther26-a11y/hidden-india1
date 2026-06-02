/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { getMockDashboard, DEFAULT_PROFILE } from './src/data/mockData';
import { UserProfile } from './src/types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini AI SDK initialized successfully with API key.');
  } catch (error) {
    console.error('Failed to initialize Gemini AI SDK:', error);
  }
} else {
  console.warn('GEMINI_API_KEY is not defined. Hidden India AI will run in rich local demo mode.');
}

// REST API for Hidden India AI

/**
 * Generate highly personalized travel insights, hidden gems, and itineraries
 */
app.post('/api/profile-insights', async (req, res) => {
  const profile: UserProfile = req.body;
  
  if (!profile || !profile.name) {
    return res.status(400).json({ error: 'Valid user profile is required.' });
  }

  // If no API key is available, leverage our programmatic responsive fallback immediately
  if (!ai) {
    console.log('No Gemini API key defined. Serving programmatically tailored mock dataset.');
    const mockData = getMockDashboard(profile);
    return res.json({ ...mockData, demoMode: true });
  }

  try {
    const prompt = `
      You are Hidden India AI, a highly sophisticated local guide and architectural travel algorithm.
      Your primary task is to generate and organize authentic, safe, and culturally rich off-grid travel suggestions for India.
      DO NOT recommend standard globalized tourist traps (such as Taj Mahal, commercial Goa beaches, crowded temples, or five-star resorts).
      Instead, recommend hidden villages, remote waterfalls, secret trekking paths, local heritage crafts, home-cooking workshops, and historical regions.

      Analyze this highly specific user profile:
      - Name: ${profile.name}
      - Age: ${profile.age} years old
      - Budget: ${profile.budget}
      - Travel Style: ${profile.travelStyle} (solo/friends/family/couple)
      - Travel Experience: ${profile.travelExperience} (beginner/intermediate/experienced)
      - Specific Interests: ${profile.interests.join(', ')}
      - Travel Dates: ${profile.startDate} to ${profile.endDate}
      - Previously Visited in India: ${profile.previouslyVisited.join(', ') || 'None'}

      Respond with a single, perfectly structured JSON object conforming EXACTLY to the following TypeScript structure and boundaries:

      interface ResponseData {
        hiddenGems: Array<{
          id: string; // e.g. "gem_x"
          name: string; // descriptive name of the gem
          location: string; // state or sub-region in India
          description: string; // rich descriptive paragraph explaining its magic
          category: 'village' | 'waterfall' | 'trek' | 'market' | 'viewpoint' | 'cultural';
          matchedWhy: string; // 1-2 sentences explaining why this matches their specific interests (${profile.interests.join('/')})
          cost: string; // native currency estimate, e.g. "₹1,500 - ₹3,000 / day"
          bestTime: string; // local fine weather window
          crowdLevel: 'very low' | 'low' | 'moderate';
          safetyScore: number; // raw float/integer 1 to 10
          lat: number; // accurate latitude in India (e.g. between 8.0 and 35.0)
          lng: number; // accurate longitude in India (e.g. between 68.0 and 97.0)
        }>; // Exactly 5 or 6 items
        experiences: Array<{
          id: string;
          name: string; // village festival, local fair, native workshop, heritage dance performance
          location: string;
          date: string; // readable dates or ranges reflecting their travel window (${profile.startDate} to ${profile.endDate})
          distance: string; // descriptive distance, e.g., "30 km from nearest transit hub"
          description: string; // detailed event/tradition explanation, focusing on tribal/village roots
          matchScore: number; // value between 80 and 100
          explanation: string; // AI personal explanation tailored to user's parameters, e.g., "Because you enjoy photography and culture, the Yakshagana performance on August 17 is highly recommended."
          category: 'festival' | 'dance' | 'fair' | 'performance' | 'workshop';
          lat: number;
          lng: number;
        }>; // Exactly 4 items
        whyNow: {
          summary: string; // robust paragraph explaining why August/September or their exact timeline is magical (e.g. waterfalls in peak monsoon, harvest festival, coffee blossom)
          reasons: string[]; // exactly 4 highly exciting bullet points containing compelling reasons
        };
        safety: {
          safetyScore: number; // out of 10
          transportation: string; // quality of village roads, accessibility advice
          touristFriendliness: string; // local attitude, interaction tips
          familyFriendliness: string; // safety/hygiene indicators for family (if profile.travelStyle === "family")
          soloSuitability: string; // safety and ease of navigation for solo (especially if profile.travelStyle === "solo")
          details: string; // overall custom safety and cultural advice based on age (${profile.age}) and experience (${profile.travelExperience})
        };
        nextDestinations: {
          india: {
            name: string;
            description: string;
            why: string; // explanation based on interests (${profile.interests.join(',')})
          };
          international: {
            name: string;
            description: string;
            why: string; // international offbeat analog, e.g. if they love remote villages and green terraces, recommend Sapa (Vietnam)
          };
        };
        itinerary1Day: ItineraryPlan;
        itinerary3Day: ItineraryPlan;
        itinerary5Day: ItineraryPlan;
      }

      interface ItineraryPlan {
        durationDays: number;
        overallCost: string;
        notes: string;
        days: Array<{
          dayNum: number;
          morning: string; // activity with hidden gem, offbeat timings
          afternoon: string; // regional organic food recommendation & workshop
          evening: string; // bonfire, folk performance, story session
          foodSuggestion: string; // specific local dish and explanation
          estimatedCost: string; // e.g., "₹1,200"
        }>;
      }

      CRITICAL RESTRICTION: Do not return any leading/trailing markdown characters or prefix except the clear, parsable JSON data.
    `;

    console.log(`Querying Gemini (gemini-3.5-flash) for personalized insights for ${profile.name}...`);
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2, // low temperature for highly structured data adherence
      }
    });

    const textOutput = response.text?.trim() || '';
    
    // Safely parse the response
    const parsedData = JSON.parse(textOutput);
    
    // Ensure profile is correctly appended
    parsedData.profile = profile;
    
    return res.json({ ...parsedData, demoMode: false });
  } catch (err) {
    const errorString = String(err) + (err && typeof err === 'object' && 'message' in err ? ' ' + String((err as any).message) : '');
    const isLeaked = errorString.toLowerCase().includes('leaked') || errorString.toLowerCase().includes('api key') || errorString.toLowerCase().includes('403');
    
    if (isLeaked) {
      ai = null; // de-activate SDK
      console.warn('CRITICAL: Serviced API key is flagged as LEAKED by Gemini. Gracefully transitioning to rich local tribal engine.');
    } else {
      console.error('Gemini API call failed, falling back to mock engine:', err);
    }
    
    // Graceful fallback to avoid app crash
    const mockData = getMockDashboard(profile);
    const warning = isLeaked
      ? 'Your server-side Gemini API key has been flagged as leaked by Google AI Studio. Please configure a new, secure companion API key in the Settings > Secrets panel of your AI Studio app to reactivate live neural calculations. Running seamlessly in Curated Offline Native Mode.'
      : 'Gemini rate limits or connection issue. Showing local demo recommendations.';

    return res.json({ 
      ...mockData, 
      demoMode: true, 
      warning
    });
  }
});

/**
 * Localized AI chatbot companion route
 */
app.post('/api/chat', async (req, res) => {
  const { profile, messages, latestMessage } = req.body;

  if (!latestMessage) {
    return res.status(400).json({ error: 'latestMessage is required.' });
  }

  const userProfile = profile as UserProfile || DEFAULT_PROFILE;

  // Render quick local reply if Gemini is offline
  if (!ai) {
    let mockReply = `Hello ${userProfile.name}! I would love to tell you more about Hidden India. It looks like my server-side Gemini key is inactive, but as an on-site local guide, I highly recommend exploring the Living Root Bridges of Mawlynnong or participating in our mask weaving workshops in Majuli. Let me know if you would like me to detail these for you!`;
    
    if (latestMessage.toLowerCase().includes('safe') || latestMessage.toLowerCase().includes('safety')) {
      mockReply = `Safety in village circles of India (Ziro, Majuli, Mawlynnong) is exceptionally high due to close-knit community councils. Since you are traveling ${userProfile.travelStyle}, you will find genuine hospitality. Avoid night transits on mountainous single-lanes.`;
    } else if (latestMessage.toLowerCase().includes('eat') || latestMessage.toLowerCase().includes('food') || latestMessage.toLowerCase().includes('market')) {
      mockReply = `You mentioned loving ${userProfile.interests.join('/')}. You must try our hand-pounded rice steamed locally, fresh wild herb curries made in claypots, and bamboo-baked preparations. It is pure, organic, and incredibly unique.`;
    }

    return res.json({ text: mockReply, demoMode: true });
  }

  try {
    // Format conversation history
    const conversationHistory = (messages || [])
      .map((m: any) => `${m.sender === 'user' ? 'User' : 'Guide'}: ${m.text}`)
      .join('\n');

    const systemInstruction = `
      You are an authentic, wise, and exciting local Indian travel guide. Your name is 'Hidden India Companion'.
      You speak warmly, with native hospitality, and you possess a goldmine of insider knowledge about remote hamlets, sacred forests, village custom festivals, and safe mountain roads.
      You avoid tourists traps or corporate travel agent buzzwords ("pamper yourself", "unwind", "5-star luxury").
      You speak like a seasoned native who has walked every narrow mud trail in rural India.

      Here is the traveler you are guiding:
      - Name: ${userProfile.name}
      - Age: ${userProfile.age}
      - Style: ${userProfile.travelStyle} explorer
      - Experience level: ${userProfile.travelExperience}
      - Interests: ${userProfile.interests.join(', ')}
      - Budget: ${userProfile.budget}
      - Timeline: ${userProfile.startDate} to ${userProfile.endDate}
      - Previous locations: ${userProfile.previouslyVisited.join(', ') || 'No previous trips'}

      Keep your response concise (under 150 words), conversational, warm, and highly relevant to their profile.
      Always reference a real local hidden gem, specific tribal event, or culinary tip in your answer.
    `;

    const chatPrompt = `
      Conversation History:
      ${conversationHistory}
      
      User's New Question: ${latestMessage}
      
      Provide your response:
    `;

    console.log(`Querying Gemini chat for user question...`);
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: chatPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text?.trim() || "Namaste! I'm listening. Tell me what wonders you'd like to unlock.";
    return res.json({ text: reply, demoMode: false });
  } catch (err) {
    const errorString = String(err) + (err && typeof err === 'object' && 'message' in err ? ' ' + String((err as any).message) : '');
    const isLeaked = errorString.toLowerCase().includes('leaked') || errorString.toLowerCase().includes('api key') || errorString.toLowerCase().includes('403');

    if (isLeaked) {
      ai = null; // de-activate SDK
      console.warn('CRITICAL: Chat API key is flagged as LEAKED by Gemini. Gracefully transitioning to rich local tribal chatbot.');
    } else {
      console.error('Chat API failed:', err);
    }

    let text = "Namaste! I encountered a network issue, but as a local guide, I encourage you to keep questioning. My heart is in the mountains of Ziro and the craft houses of Chettinad, what else would you like to know?";
    if (isLeaked) {
      text = "Namaste! Your server-side Gemini API key has been reported as leaked by Google AI Studio. Please update your API key in the Setting > Secrets menu of AI Studio to re-enable live AI chat. In the meantime, I will continue to guide you perfectly under our curated offline local intelligence!";
    }

    return res.json({
      text,
      demoMode: true,
      isLeakedKey: isLeaked
    });
  }
});


/**
 * Destination Soul AI Route
 */
app.post('/api/soul-chat', async (req, res) => {
  const { destinationId, latestMessage, history } = req.body;

  if (!latestMessage) {
    return res.status(400).json({ error: 'latestMessage is required.' });
  }

  const destNames: Record<string, string> = {
    kyoto: 'Kyoto',
    coorg: 'Coorg',
    patagonia: 'Patagonia'
  };
  const destName = destNames[destinationId] || 'Coorg';

  let personalityInstruction = '';
  if (destinationId === 'kyoto') {
    personalityInstruction = 'wise, traditional, calm, deeply reflective, choosing slow poetic cadence.';
  } else if (destinationId === 'coorg') {
    personalityInstruction = 'warm, friendly, nature-loving, welcoming, storytelling like a local host over coffee.';
  } else {
    personalityInstruction = 'wild, adventurous, rugged, energetic, expressing windy freedom and cold glacial heights.';
  }

  const systemInstruction = `
    You are NOT an AI assistant, and you do NOT refer to yourself as one. 
    You are the physical, living, breathing spiritual DESTINATION of ${destName} itself. 
    You are speaking to a traveler. Speak always in the FIRST PERSON ("I am ${destName}", "In my hills", "My rivers").
    
    Character Rules:
    - Personality: You are ${personalityInstruction}
    - Character Loyalty: Stay fully in character at all times. Never break character.
    - Style: Rich, storytelling, travel-guide style, full of local colors, sensory detail (scents, sounds, weather), and emotional depth.
    - Topics: You must answer detailing hidden gems, food, festivals, culture, photography spots, outdoor safety, climate, and traditional folklore.
    - Never mention "I am an AI", "large language model", or "designed by Google". If asked irrelevant questions, bring them back to your valleys, streets, and mountains.
  `;

  // Offline/Fallback handler if ai is null or calls fail
  const handleOfflineFallback = (query: string) => {
    const q = query.toLowerCase();
    
    if (destinationId === 'kyoto') {
      if (q.includes('gem') || q.includes('spot') || q.includes('where') || q.includes('go')) {
        return "I am Kyoto. Seek my quietude in the emerald moss ripples of Saiho-ji temple, or wander the quiet bamboo lanes of Saga-Toriimoto at dawn, before the tourists awake. I am best felt in stillness.";
      }
      if (q.includes('eat') || q.includes('food') || q.includes('drink') || q.includes('tea')) {
        return "I am Kyoto. Savor my Kaiseki—a slow dining ritual honoring the micro-seasons on handmade wooden plates, or froth bitter green matcha in a tea ceremony that echoes the quiet splash of my garden springs.";
      }
      if (q.includes('fest') || q.includes('event')) {
        return "I have celebrated Gion Matsuri since 869 AD, when wooden floats decorated with sacred tapestry roll down my historic Shijo-dori with traditional flutes dancing to ward off summer plagues.";
      }
      if (q.includes('photo') || q.includes('camera') || q.includes('shoot')) {
        return "Catch me under rain at the Yasaka Pagoda when wet cobblestones reflect the crimson lantern lights, or stand in the scarlet tunnels of Fushimi Inari when the mountain shadows grow long.";
      }
      if (q.includes('safe') || q.includes('danger')) {
        return "I am a peaceful, traditional sanctuary. Take care to walk politely, respect my elderly, and you will find nothing but absolute safety and deep welcoming bows under my wooden eaves.";
      }
      // General
      return "I am Kyoto. I whisper in ancient wood and stone. My cherry blossoms and quiet temple bells are waiting for you to slow down and listen to the silent spaces between thoughts.";
    } 
    
    else if (destinationId === 'patagonia') {
      if (q.includes('gem') || q.includes('spot') || q.includes('where') || q.includes('go')) {
        return "I am Patagonia. My wildest soul sleeps at Paso del Viento overlooking the Southern Ice Field, and my hidden peaks in Cerro Castillo. Leave the souvenir shops behind and hike where only condors fly.";
      }
      if (q.includes('eat') || q.includes('food') || q.includes('drink') || q.includes('lamb')) {
        return "Taste the smoke of my lamb roasted slow over woodfires, Cordero al Palo, served with sweet wild calafate berries. Gauchos say if you eat my berries, you will surely return.";
      }
      if (q.includes('fest') || q.includes('event')) {
        return "In January, my valleys celebrate the Fiesta de la Esquila—where gauchos show their legendary horsemanship and sheepdog skills, keeping traditional folk songs active around giant bonfires.";
      }
      if (q.includes('photo') || q.includes('camera') || q.includes('shoot')) {
        return "Aim your lens at the granite towers of Torres del Paine at 5:00 AM when the glacial sun paints them in liquid copper, or record the roaring crack of Perito Moreno calving heights into the blue waters.";
      }
      if (q.includes('safe') || q.includes('danger') || q.includes('wind')) {
        return "My people are honest and safe, but my elements are savage. Respect the violent mountain gale, pack windproof layers, and never trek off-trail. My nature is gorgeous but unforgiving.";
      }
      // General
      return "I am Patagonia, untamed rock and infinite winds. I will clear your lungs and bend your shoulders under my storms, yet reward you with views that will haunt your heart forever.";
    } 
    
    else { // Coorg
      if (q.includes('gem') || q.includes('spot') || q.includes('where') || q.includes('go')) {
        return "I am Coorg. Walk past the coffee fields to Chelvara Falls or climb my tallest peak, Tadiandamol, where mist sleeps below your boots. My best secrets are surrounded by cardamom bushes.";
      }
      if (q.includes('eat') || q.includes('food') || q.includes('curry') || q.includes('drink') || q.includes('coffee')) {
        return "Savor my legendary Pandi Curry (black pork) cooked with wild Kachampuli vinegar, paired with Akki Roti. Wash it down with freshly brewed filter coffee picked right from my farms.";
      }
      if (q.includes('fest') || q.includes('event')) {
        return "In September, hear the gunshot celebrations of Kailpodh when Kodavas venerate their agricultural weapon tools, or join our Huttari in December, harvesting first golden paddy stalks in the mist.";
      }
      if (q.includes('photo') || q.includes('camera') || q.includes('shoot')) {
        return "Photograph the sun rising over Raja's Seat when valleys look like oceans of white milk, or capture my forest trails when the first monsoon showers turn every leaf an neon green.";
      }
      if (q.includes('safe') || q.includes('danger') || q.includes('night')) {
        return "My village assemblies are close-knit and extremely welcoming to visitors. Just take care near my forest limits at twilight, as wild elephants claim their historic migrations across the roads.";
      }
      // General
      return "I am Coorg. My hills are green velvet and my waterfalls sing endless tribal ballads. Come rest in my coffee estates and let the mountain breezes sweep your worries away.";
    }
  };

  if (!ai) {
    const text = handleOfflineFallback(latestMessage);
    return res.json({ text, demoMode: true });
  }

  try {
    const chatPrompt = `
      Current Destination Soul: I am ${destName}
      User query: ${latestMessage}
    `;

    console.log(`Querying Destination Soul AI for ${destName}...`);
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: chatPrompt,
      config: {
        systemInstruction,
        temperature: 0.85,
      }
    });

    const reply = response.text?.trim() || handleOfflineFallback(latestMessage);
    return res.json({ text: reply, demoMode: false });
  } catch (err) {
    const errorString = String(err) + (err && typeof err === 'object' && 'message' in err ? ' ' + String((err as any).message) : '');
    const isLeaked = errorString.toLowerCase().includes('leaked') || errorString.toLowerCase().includes('api key') || errorString.toLowerCase().includes('403');
    
    if (isLeaked) {
      ai = null; // de-activate SDK
      console.warn(`CRITICAL: Destination Soul API key for ${destName} is flagged as LEAKED by Gemini. Gracefully transitioning to rich local soul fallback.`);
    } else {
      console.error(`Destination Soul AI failed for ${destName}:`, err);
    }
    const text = handleOfflineFallback(latestMessage);
    return res.json({ text, demoMode: true });
  }
});


/**
 * Real-Time Weather Route
 */
app.get('/api/weather', async (req, res) => {
  const { lat, lng, name } = req.query;

  const latNum = parseFloat(lat as string);
  const lngNum = parseFloat(lng as string);
  const targetName = (name as string) || 'this sanctuary';

  // Reliable Fallback Generator in case of offline, timeouts, or API limits
  const generateLocalFallback = (destName: string) => {
    const n = destName.toLowerCase();
    
    // Default pleasant weather
    let temp = 22.4;
    let humidity = 78;
    let code = 2; // Partly Cloudy
    let advice = "Comfortable conditions for walking and photography. Pack light layers and your camera gear.";
    
    if (n.includes('ziro')) {
      temp = 18.5;
      humidity = 82;
      code = 3; // Overcast
      advice = "Cool mountain morning. Diffused silver lighting is perfect for terraced field shooting. Keep a light jacket handy.";
    } else if (n.includes('mawlynnong')) {
      temp = 24.2;
      humidity = 88;
      code = 80; // Heavy showers
      advice = "High moisture levels. The living root bridges look beautiful under rain. Watch your footing on wet rock steps.";
    } else if (n.includes('majuli')) {
      temp = 28.1;
      humidity = 85;
      code = 2; // Partly cloudy
      advice = "Warm river breezes. Ideal for the clay mask weaving workshops. Carry an umbrella for passing tropical showers.";
    } else if (n.includes('nohkalikai') || n.includes('sohra') || n.includes('cherrapunji')) {
      temp = 19.3;
      humidity = 94;
      code = 63; // Steady Rain
      advice = "Continuous downpours keeping the waterfall roaring at peak glory. Use robust waterproof covers for your camera.";
    } else if (n.includes('chettinad') || n.includes('karaikudi')) {
      temp = 32.6;
      humidity = 55;
      code = 0; // Clear sunny
      advice = "Vibrant sunshine bouncing off heritage mansion plaster. Drink plenty of tender coconut water; wear breathable cottons.";
    } else if (n.includes('landour')) {
      temp = 14.8;
      humidity = 70;
      code = 45; // Fog
      advice = "Sleepy alpine fog weave. Truly magical for pine forest walks. Legacy cafes are serving piping hot tea.";
    } else if (n.includes('kyoto')) {
      temp = 19.5;
      humidity = 68;
      code = 1; // Mainly clear
      advice = "Serene and crisp. Beautiful time to visit Zen stone gardens. Walk quietly with light walking shoes.";
    } else if (n.includes('coorg')) {
      temp = 21.8;
      humidity = 80;
      code = 51; // Drizzle
      advice = "Fragrant cardamon and coffee mist. Highly refreshing. Perfect time to stroll inside deep organic valleys.";
    } else if (n.includes('patagonia')) {
      temp = 7.5;
      humidity = 62;
      code = 3; // Overcast/Windy
      advice = "Wild, biting glacial headwind. Pack high-spec windbreakers and thermal undergarments. Avoid exposed peaks if gales increase.";
    }

    const getWeatherState = (c: number) => {
      if (c === 0) return { condition: "Sunny & Clear", icon: "Sun", desc: "Glorious golden sunshine, perfect for high-contrast photography." };
      if ([1, 2, 3].includes(c)) return { condition: "Partly Cloudy", icon: "CloudSun", desc: "Drifting cloud layers offering soft diffused natural light." };
      if ([45, 48].includes(c)) return { condition: "Misty & Foggy", icon: "CloudFog", desc: "Immersive mountain mist weaving between ancient trees." };
      if ([51, 53, 55].includes(c)) return { condition: "Light Drizzle", icon: "CloudDrizzle", desc: "Gentle refreshing moisture. Bring a light rain cover." };
      if ([61, 63, 65].includes(c)) return { condition: "Steady Rain", icon: "CloudRain", desc: "Healthy continuous downpours feeding the local valleys." };
      if ([80, 81, 82].includes(c)) return { condition: "Heavy Rain Showers", icon: "CloudRain", desc: "Dramatic cloudbursts clearing quickly to reveal hyper-green paths." };
      return { condition: "Overcast", icon: "Cloud", desc: "A cool and moody silver sky, pleasant for exploration." };
    };

    const state = getWeatherState(code);
    
    // Simulate 3-day forecast
    const forecast = [
      { day: "Tomorrow", tempMax: Math.round(temp + 2), tempMin: Math.round(temp - 3), condition: state.condition, icon: state.icon },
      { day: "Day 2", tempMax: Math.round(temp + 3), tempMin: Math.round(temp - 2), condition: "Partly Cloudy", icon: "CloudSun" },
      { day: "Day 3", tempMax: Math.round(temp + 1), tempMin: Math.round(temp - 4), condition: code > 50 ? "Scattered Showers" : "Mild & Fine", icon: code > 50 ? "CloudDrizzle" : "Sun" }
    ];

    return {
      current: {
        temp: parseFloat(temp.toFixed(1)),
        humidity,
        condition: state.condition,
        description: state.desc,
        icon: state.icon
      },
      forecast,
      advice,
      locationName: destName,
      isFallback: true
    };
  };

  if (isNaN(latNum) || isNaN(lngNum)) {
    return res.json(generateLocalFallback(targetName));
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latNum}&longitude=${lngNum}&current=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    console.log(`Fetching real-time weather from Open-Meteo for ${targetName} (${latNum}, ${lngNum})...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout for fast response

    const apiResponse = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!apiResponse.ok) {
      throw new Error(`Open-Meteo API returned status ${apiResponse.status}`);
    }

    const rawData = await apiResponse.json();
    
    if (!rawData.current || !rawData.daily) {
      throw new Error('Incomplete data received from weather provider');
    }

    // Decode Open-Meteo weather code
    const decodeWeatherCode = (c: number) => {
      if (c === 0) return { condition: "Sunny & Clear", icon: "Sun", desc: "Glorious golden sunshine, perfect for high-contrast photography." };
      if ([1, 2, 3].includes(c)) return { condition: "Partly Cloudy", icon: "CloudSun", desc: "Drifting white clouds offering soft diffused natural light." };
      if ([45, 48].includes(c)) return { condition: "Misty & Foggy", icon: "CloudFog", desc: "Immersive mist licking the hills, creating a dreamlike atmosphere." };
      if ([51, 53, 55].includes(c)) return { condition: "Light Drizzle", icon: "CloudDrizzle", desc: "Gentle refreshing moisture. Bring land-shield jackets." };
      if ([61, 63, 65].includes(c)) return { condition: "Steady Rain", icon: "CloudRain", desc: "Continuous downpours feeding local waterfalls and rivers." };
      if ([71, 73, 75, 77, 85, 86].includes(c)) return { condition: "Snowfall", icon: "Snowflake", desc: "Crisp white snow blanketing the higher peaks." };
      if ([80, 81, 82].includes(c)) return { condition: "Heavy Rain Showers", icon: "CloudRain", desc: "Dramatic cloudbursts clearing quickly to reveal hyper-green gardens." };
      if ([95, 96, 99].includes(c)) return { condition: "Thunderstorms", icon: "CloudLightning", desc: "Powerful lightning displays energizing the wild river canyons." };
      return { condition: "Overcast", icon: "Cloud", desc: "A cool, pleasant, and moody silver sky." };
    };

    const currentCode = rawData.current.weather_code ?? 2;
    const weatherDetails = decodeWeatherCode(currentCode);
    
    // Generate tailored advice based on current temperatures and conditions
    let dynamicAdvice = "Comfortable conditions. Bring your camera gear and walking shoes.";
    if (rawData.current.temperature_2m < 15) {
      dynamicAdvice = "Cool air active. Pack thermal layers, a fleece sweater, and enjoy hot local teas.";
    } else if (rawData.current.temperature_2m > 28) {
      dynamicAdvice = "Warm day. Seek high-cover shade, use breathable cotton cloth, and remain hydrated.";
    }
    
    if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(currentCode)) {
      dynamicAdvice += " Rain is falling. Paths could be slippery, carry a waterproof umbrella and deep-tread footwear.";
    } else if ([45, 48].includes(currentCode)) {
      dynamicAdvice += " Heavy fog weaves visible. Drive extremely cautiously, stay on known walking lanes.";
    }

    // Build the 3-day forecast
    const daysName = ["Tomorrow", "Day 2", "Day 3"];
    const forecast = [];
    
    for (let i = 1; i <= 3; i++) {
      const code = rawData.daily.weather_code[i] ?? 3;
      const decoded = decodeWeatherCode(code);
      forecast.push({
        day: daysName[i-1],
        tempMax: Math.round(rawData.daily.temperature_2m_max[i] ?? rawData.current.temperature_2m + 2),
        tempMin: Math.round(rawData.daily.temperature_2m_min[i] ?? rawData.current.temperature_2m - 2),
        condition: decoded.condition,
        icon: decoded.icon
      });
    }

    return res.json({
      current: {
        temp: rawData.current.temperature_2m,
        humidity: rawData.current.relative_humidity_2m,
        condition: weatherDetails.condition,
        description: weatherDetails.desc,
        icon: weatherDetails.icon
      },
      forecast,
      advice: dynamicAdvice,
      locationName: targetName,
      isFallback: false
    });

  } catch (error) {
    console.warn(`Open-Meteo call failed or timed out for ${targetName}. Rolling back to seamless microclimate simulation.`, error);
    return res.json(generateLocalFallback(targetName));
  }
});


// Express server and Vite integration configuration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    // Attach Vite middlewares
    app.use(vite.middlewares);
    
    // Fallback: load index.html during development
    app.use('*', async (req, res) => {
      try {
        const url = req.originalUrl;
        const indexHtml = path.resolve(process.cwd(), 'index.html');
        res.status(200).set({ 'Content-Type': 'text/html' }).sendFile(indexHtml);
      } catch (e) {
        res.status(500).end((e as Error).stack);
      }
    });
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`Hidden India AI Server running on PORT ${PORT}`);
    console.log(`Development Dev Link: http://0.0.0.0:${PORT}`);
    console.log(`=========================================`);
  });
}

startServer();
