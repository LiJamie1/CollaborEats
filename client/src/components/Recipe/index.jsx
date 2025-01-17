import React, { useState, useEffect } from 'react';
import Ingredients from './Ingredients';
import Instructions from './Instructions';
import { getRecipe } from '../../services/api';
import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';
import Modal from '../Modal';

export default function RecipeComponent({ recipeId }) {
  const [recipe, setRecipe] = useState({
    ownerId: {
      email: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function getRecipeData() {
      setLoading(true);
      const dbData = await getRecipe(recipeId);
      setLoading(false);
      setRecipe(dbData.data.recipe);
    }
    getRecipeData();
  }, [recipeId]);

  return (
    <>
      {loading && <div>Loading!!!</div>}
      {!loading && (
        <div className="flex-row mx-auto container mt-8">
          <>
            <header className="dark:text-neutral-200">
              <h2 className="text-6xl font-serif pl-4 w-10/12 break-words">{recipe.title}</h2>
              <h2 className="text-lg font-serif pl-4 w-10/12 break-words">
                Written by: {recipe.ownerId.name}
              </h2>
            </header>
            <div className="h-80 w-full rounded-t-md overflow-hidden overflow-y-scroll mt-6 scrollable-image hide-scrollbar">
              <img
                className="w-full object-cover"
                src={
                  recipe.photo
                    ? `${process.env.REACT_APP_API_URL}/image/${recipe.photo}`
                    : '/demo/default_image.jpg'
                }
                alt={recipe.title}
              />
            </div>

            <div className="flex justify-end h-0 relative bottom-4 pr-5 ">
              <button
                className="flex justify-center items-center px-4 py-2 mx-5 bg-primary-600 hover:bg-primary-700  rounded text-neutral-200 text-lg font-bold h-10 w-36"
                onClick={() => setShowModal(true)}
              >
                Fork
              </button>
              <button className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded text-neutral-200 text-lg font-bold h-10 w-36 ">
                <Link
                  to={`${ROUTES.VERSIONS}/${!recipe.parent ? recipe._id : recipe.path[0]}`}
                  className="w-full"
                >
                  Other Forks
                </Link>
              </button>
            </div>

            <div className="flex w-full px-12 justify-items-center bg-neutral-100 shadow-dark-500 shadow-sm  rounded-b-md py-9 dark:text-neutral-200 dark:bg-dark-500 dark:shadow-black dark:shadow-sm">
              <Ingredients ingredients={recipe.ingredients} />
              <Instructions instructions={recipe.instructions} description={recipe.description} />
            </div>
          </>
        </div>
      )}
      <>
        {showModal ? (
          <Modal recipe={recipe} title={`Forking ${recipe.title}`} setShowModal={setShowModal} />
        ) : null}
      </>
    </>
  );
}
