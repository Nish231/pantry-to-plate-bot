import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Sparkles } from 'lucide-react';

interface Recipe {
  name: string;
  description: string;
  instructions: string[];
  optionalIngredients?: string[];
}

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
}

export const RecipeCard = ({ recipe, index }: RecipeCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-soft)] border-2 hover:border-primary/50">
      <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10 border-b border-border">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-primary" />
              {recipe.name}
            </CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground">
              {recipe.description}
            </CardDescription>
          </div>
          <Badge variant="outline" className="shrink-0 border-primary/50 text-primary">
            Recipe {index + 1}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h4 className="font-semibold text-lg mb-3 flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-accent" />
            Instructions
          </h4>
          <ol className="space-y-2">
            {recipe.instructions.map((instruction, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </span>
                <span className="flex-1 pt-0.5 text-foreground">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>
        
        {recipe.optionalIngredients && recipe.optionalIngredients.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Optional Enhancements:</h4>
            <div className="flex flex-wrap gap-2">
              {recipe.optionalIngredients.map((ingredient, idx) => (
                <Badge key={idx} variant="outline" className="bg-muted/50">
                  {ingredient}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
