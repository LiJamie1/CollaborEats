import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { validateInput } from '../../helpers/validation';
import { addFork, addRecipe, imageUpload, getSignedURL } from '../../services/api';
import IngredientInput from './IngredientInput';

const RecipeForm = ({ title, recipe, setShowModal }) => {
  recipe = recipe || {};
  const [recipeForm, setRecipeForm] = useState({
    title: recipe.title || '',
    description: recipe.description || '',
    instructions: recipe.instructions || '',
    ingredients: recipe.ingredients || [{ ingredient: '', amount: '', unitOfMeasure: '' }],
    tags: recipe.tags || [],
    photo: '',
  });

  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState({
    ingredients: recipeForm.ingredients.map((inputs) => ({
      ingredient: null,
      amount: null,
      unitOfMeasure: null,
    })),
  });

  const [input, setInput] = useState('');
  const [tags, setTags] = useState([]);

  const onInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    const trimmedInput = input.trim();
    if (e.key === ' ' && trimmedInput.length && !tags.includes(trimmedInput)) {
      setTags((prev) => [...prev, trimmedInput]);
      setInput('');
    }

    setRecipeForm({
      ...recipeForm,
      tags,
    });
  };

  const deleteTag = (index) => {
    setTags((prev) => prev.filter((tag, i) => i !== index));
  };

  const tagsArray = tags.map((tag, index) => (
    <div key={index} className="flex items-center bg-red-500 rounded-full px-3 py-1 mx-1 my-1">
      {tag}
      <button className="pl-1" onClick={() => deleteTag(index)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </div>
  ));

  const { user } = useContext(AuthContext);
  let history = useHistory();

  const editInput = (e) => {
    setRecipeForm({
      ...recipeForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileSelect = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newRecipe = { ...recipeForm };
    const newFormErrors = {};

    // All options for validation
    const validationOptions = {
      title: { characterCount: 35 },
      photo: { required: false },
      ingredients: {
        ingredient: { characterCount: 30 },
        amount: { characterCount: 5 },
        unitOfMeasure: { required: false },
      },
    };

    // Validations for title, description, and instructions
    for (const property in newRecipe) {
      const inputError = validateInput(newRecipe[property], validationOptions[property]);
      newFormErrors[property] = inputError;
    }

    // Validations for the ingredients section
    const ingredientErrors = newRecipe.ingredients.map(({ amount, ingredient, unitOfMeasure }) => {
      return {
        ingredient: validateInput(ingredient, validationOptions.ingredients.ingredient),
        amount: validateInput(amount, validationOptions.ingredients.amount),
        unitOfMeasure: validateInput(unitOfMeasure, validationOptions.ingredients.unitOfMeasure),
      };
    });
    newFormErrors.ingredients = ingredientErrors;

    setFormError(newFormErrors);

    // Iterate through error messages
    // The submitHandler will return when it reaches any error message
    for (const error in newFormErrors) {
      if (error === 'ingredients') {
        for (const ingredient of newFormErrors[error]) {
          if (Object.values(ingredient).some((el) => el !== null)) return;
        }
      } else {
        if (newFormErrors[error] !== null) return;
      }
    }

    // POST request after validations
    try {
      // only upload image when form validated
      if (file && !file.name.match(/.(jpg|jpeg|png)$/i && file.size < 5 * 1024 * 1024)) {
        const signedUrl = await getSignedURL();
        newRecipe.photo = await imageUpload(file, signedUrl);
      }

      // Only on fork
      if (recipe._id) {
        const result = await addFork(user._id, recipe._id, newRecipe);
        history.push(`/recipe/${result.data._id}`);
        return setShowModal(false);
      }

      const result = await addRecipe(user._id, newRecipe);
      history.push(`/recipe/${result.data._id}`);
      return setShowModal(false);
    } catch (error) {
      // TODO: render page depending on server error
      console.log(error);
    }
  };

  const IngredientsInputs = recipeForm.ingredients.map((ingredient, index) => {
    return (
      <IngredientInput
        key={index}
        {...ingredient}
        index={index}
        setRecipeForm={setRecipeForm}
        recipeForm={recipeForm}
        formError={formError}
        setFormError={setFormError}
      />
    );
  });

  const addIngredient = () => {
    const newIngredient = { ingredient: '', amount: '', unitOfMeasure: '' };
    setRecipeForm((prev) => {
      const ingredients = [...prev.ingredients];
      ingredients[ingredients.length] = newIngredient;
      return {
        ...prev,
        ingredients,
      };
    });

    setFormError((prev) => {
      const ingredients = [...prev.ingredients];
      ingredients[ingredients.length] = newIngredient;
      return {
        ...prev,
        ingredients,
      };
    });
  };

  return (
    <>
      <div className="flex flex-col justify-center p-5 rounded-t dark:bg-dark-500 dark:text-neutral-200 dark:border-black dark:border-lg">
        <img className="w-20 h-20 mb-2  mx-auto" src="/images/logo.svg" alt="" />
        <h3 className="text-2xl font-serif font-semibold mx-auto px-auto">{title}</h3>
      </div>
      {user ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-b px-8 flex flex-col dark:bg-dark-500 dark:text-neutral-200"
        >
          <div className="mx-3 flex flex-col mb-3">
            <label htmlFor="title" className="block text-lg font-semibold">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="e.g. Polish Burgers"
              className={
                formError.title
                  ? 'w-full px-4 py-2 border-2 mb-3 bg-red-50 border-red-500 rounded-sm outline-none text-red-900 focus:ring-red-500 focus:border-red-500 blockp-2.5 dark:bg-red-100 dark:border-red-400 font-serif'
                  : 'w-full px-4 py-2 border-2 mb-3 border-gray-300 rounded-sm outline-none dark:bg-dark-50 dark:border-dark-500 focus:border-blue-400  focus:bg-white transition duration-200 ease-in-out'
              }
              value={recipeForm.title}
              onChange={editInput}
            />
            <p className="text-red-900 dark:text-red-500">{formError.title}</p>
            <div className="w-full mb-0">
              <label htmlFor="description" className="block text-lg font-semibold">
                Description
              </label>
              <textarea
                name="description"
                placeholder="e.g. This recipe is a family favorite that was passed down over the generations..."
                className={
                  formError.description
                    ? 'w-full px-4 py-2 border-2 mb-3 bg-red-50 border-red-500 rounded-sm outline-none text-red-900 focus:ring-red-500 focus:border-red-500 blockp-2.5 dark:bg-red-100 dark:border-red-400 font-serif'
                    : 'w-full h-24 px-4 py-2 border-2 dark:bg-dark-50 dark:border-dark-500 border-gray-300 rounded-sm outline-none focus:border-blue-400 transition duration-200 ease-in-out'
                }
                value={recipeForm.description}
                onChange={editInput}
              ></textarea>
              <p className="text-red-900 dark:text-red-500">{formError.description}</p>
            </div>
          </div>
          <div className="mx-3 flex">
            <div className="w-full mb-0">
              <label htmlFor="instructions" className="block text-lg font-semibold">
                Instructions
              </label>
              <textarea
                name="instructions"
                placeholder="e.g. Instructions"
                className={
                  formError.instructions
                    ? 'w-full px-4 py-2 border-2 mb-3 bg-red-50 border-red-500 rounded-sm outline-none text-red-900 focus:ring-red-500 focus:border-red-500 blockp-2.5 dark:bg-red-100 dark:border-red-400 font-serif'
                    : 'w-full h-24 px-4 py-3 border-2 mb-2 border-gray-300 dark:bg-dark-50 dark:border-dark-500 rounded-sm outline-none focus:border-blue-400'
                }
                value={recipeForm.instructions}
                onChange={editInput}
              ></textarea>
              <p className="text-red-900 dark:text-red-500">{formError.instructions}</p>
            </div>
          </div>

          <label className="mx-3 block text-lg font-semibold mb-2">Tags</label>
          <div className="mx-3 flex">
            <input
              placeholder="e.g Burger"
              className="w-full px-4 py-2 border-2 mb-3 border-gray-300 rounded-sm outline-none dark:bg-dark-50 dark:border-dark-500 focus:border-blue-400  focus:bg-white transition duration-200 ease-in-out"
              value={input}
              onChange={onInputChange}
              onKeyDown={handleKeyPress}
            ></input>
          </div>
          <div className="mx-3 flex flex-wrap">{tagsArray}</div>

          <label className="mx-3 block text-lg font-semibold mb-2">Ingredients</label>
          {IngredientsInputs}
          <div className="mb-3 mx-3 w-8 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-9 hover:text-primary-400 transition duration-200 ease-in-out"
              onClick={addIngredient}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="mb-3 w-96">
            <input
              className="form-control block w-full px-3 mx-3 mt-2 py-1.5 text-base font-normal text-gray-700 dark:text-neutral-200 bg-white dark:bg-dark-50 bg-clip-padding border border-solid border-gray-300 dark:border-dark-900 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              type="file"
              name="file"
              id="file"
              onChange={handleFileSelect}
            />
          </div>
          <div className="flex items-center justify-end p-4 rounded-b">
            <button
              className="bg-transparent text-red-500 hover:bg-red-700 hover:text-white font-bold uppercase text-sm px-6 py-3 rounded  hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              type="button"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              className="bg-primary-700 hover:bg-primary-800 dark:bg-secondary-700 dark:hover:bg-secondary-800 text-neutral-200  font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              type="submit"
              value="Create"
            >
              Create
            </button>
          </div>
        </form>
      ) : (
        <p className="font-serif font-semibold text-3xl text-center p-7 rounded-b dark:bg-dark-500 dark:text-neutral-200">
          Please sign in to create recipes
        </p>
      )}
    </>
  );
};

export default RecipeForm;
