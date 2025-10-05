import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IngredientInput } from '@/components/IngredientInput';
import { RecipeCard } from '@/components/RecipeCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, UtensilsCrossed } from 'lucide-react';

interface Recipe {
  name: string;
  description: string;
  instructions: string[];
  optionalIngredients?: string[];
}

const Index = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    if (ingredients.length === 0) {
      toast({
        title: "No ingredients added",
        description: "Please add at least one ingredient to get recipe suggestions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setRecipes([]);

    try {
      const { data, error } = await supabase.functions.invoke('suggest-recipes', {
        body: { ingredients: ingredients.join(', ') }
      });

      if (error) {
        console.error('Error calling function:', error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.recipes && Array.isArray(data.recipes)) {
        setRecipes(data.recipes);
        toast({
          title: "Recipes generated!",
          description: `Found ${data.recipes.length} delicious ${data.recipes.length === 1 ? 'recipe' : 'recipes'} for you.`,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast({
        title: "Failed to get suggestions",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-soft)] mb-4">
            <UtensilsCrossed className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Recipe Suggester
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tell us what you have in your kitchen, and we'll suggest delicious recipes you can make right now!
          </p>
        </header>

        {/* Input Section */}
        <section className="mb-12 space-y-6">
          <div className="bg-card rounded-2xl shadow-[var(--shadow-soft)] p-8 border-2 border-border">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Ingredients</h2>
            <IngredientInput onIngredientsChange={setIngredients} />
            <Button
              onClick={handleGetSuggestions}
              disabled={isLoading || ingredients.length === 0}
              className="w-full mt-6 h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-[var(--shadow-soft)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Cooking up ideas...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Recipe Suggestions
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Results Section */}
        {recipes.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-primary" />
              Your Recipes
            </h2>
            <div className="grid gap-6">
              {recipes.map((recipe, index) => (
                <RecipeCard key={index} recipe={recipe} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!isLoading && recipes.length === 0 && ingredients.length > 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Click "Get Recipe Suggestions" to see what you can cook!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
