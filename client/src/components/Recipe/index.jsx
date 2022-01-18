import React from 'react';
import Ingredients from './Ingredients';
import Instructions from './Instructions';

export default function RecipeComponent(props) {
  return (
    <div className="flex justify-center">
      <Ingredients />
      <Instructions />
    </div>
  );
}