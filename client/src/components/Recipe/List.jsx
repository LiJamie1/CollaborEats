import React, { useState, useEffect } from 'react';
import ListComponent from './ListComponent';

export default function List({ ingredients, edit, ingredientList, setIngredientList }) {
  // initial render, shows fills ingredients if existing
  // Adds an "index" property for accessing place in component
  useEffect(() => {
    const formattedIngredients = ingredients.map((ingredient, index) => {
      return {
        ...ingredient,
        index,
      };
    });

    setIngredientList(formattedIngredients);
  }, [ingredients]);

  const onAddBtnClick = () => {
    const ingredient = {
      ingredient: null,
      amount: null,
      unitOfMeasure: null,
      index: ingredientList.length,
    };

    setIngredientList([...ingredientList, ingredient]);
  };

  const onRemoveBtnClick = (index) => {
    // removes targeted ingredient
    const filteredList = ingredientList.filter((ingredient) => {
      return ingredient.index !== index;
    });

    // Resets in indices of the ingredients
    const updatedList = filteredList.map((ingredient, index) => {
      return {
        ...ingredient,
        index,
      };
    });
    setIngredientList(updatedList);
  };

  // Allows ListComponent to update THIS component's state on change
  const addIngredient = (inputData) => {
    setIngredientList((prev) => {
      const newList = [...prev];
      newList[inputData.index] = inputData.ingredient;
      return newList;
    });
  };

  return (
    <div>
      {edit &&
        ingredientList.map((ingredient, index) => {
          return (
            <ListComponent
              index={index}
              key={index}
              item={ingredient}
              remove={() => onRemoveBtnClick(index)}
              addIngredient={addIngredient}
            />
          );
        })}
      <button type="button" onClick={onAddBtnClick}>
        Add an ingredient
      </button>
    </div>
  );
}