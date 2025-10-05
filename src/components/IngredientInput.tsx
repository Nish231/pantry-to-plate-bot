import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface IngredientInputProps {
  onIngredientsChange: (ingredients: string[]) => void;
}

export const IngredientInput = ({ onIngredientsChange }: IngredientInputProps) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addIngredient = (ingredient: string) => {
    const trimmed = ingredient.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      const newIngredients = [...ingredients, trimmed];
      setIngredients(newIngredients);
      onIngredientsChange(newIngredients);
      setInputValue('');
    }
  };

  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
    onIngredientsChange(newIngredients);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && ingredients.length > 0) {
      removeIngredient(ingredients.length - 1);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 rounded-lg border-2 border-border bg-card transition-all duration-200 focus-within:border-primary">
        {ingredients.map((ingredient, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {ingredient}
            <button
              onClick={() => removeIngredient(index)}
              className="ml-2 hover:text-destructive transition-colors"
              aria-label={`Remove ${ingredient}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={ingredients.length === 0 ? "Type ingredients (e.g., roti, dal, onion)..." : "Add more..."}
          className="flex-1 min-w-[200px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 bg-transparent"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Enter</kbd> to add ingredients
      </p>
    </div>
  );
};
