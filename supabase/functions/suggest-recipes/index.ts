import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients } = await req.json();
    
    if (!ingredients || ingredients.trim() === '') {
      console.error('No ingredients provided');
      return new Response(
        JSON.stringify({ error: 'Please provide ingredients' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Generating recipe suggestions for:', ingredients);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('AI service configuration error');
    }

    const systemPrompt = `You are a creative chef assistant. Based on the ingredients provided by the user, suggest 1-3 practical Indian or global dishes they can prepare using only or mostly these ingredients.

For each dish, provide:
- Name of the dish
- A short description (1-2 sentences)
- Step-by-step recipe instructions (numbered list)
- If needed, list 1-2 optional or commonly available extra ingredients to enhance the recipe

Assume the user wants a quick, practical meal, not a gourmet dish. Be creative but realistic—avoid suggesting recipes that require unavailable ingredients.

Format your response as a JSON array of recipe objects with this structure:
[
  {
    "name": "Dish Name",
    "description": "Short description of the dish",
    "instructions": ["Step 1", "Step 2", "Step 3"],
    "optionalIngredients": ["Optional ingredient 1", "Optional ingredient 2"]
  }
]

Return ONLY the JSON array, no additional text.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `My ingredients: ${ingredients}` }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please try again in a moment.' }),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service limit reached. Please contact support.' }),
          { 
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in AI response');
      throw new Error('Failed to generate recipes');
    }

    // Parse the JSON response
    let recipes;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recipes = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse recipe suggestions');
    }

    console.log('Successfully generated recipes:', recipes.length);

    return new Response(
      JSON.stringify({ recipes }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in suggest-recipes function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
