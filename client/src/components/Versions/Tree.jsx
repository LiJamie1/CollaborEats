import React, { useState, useEffect } from 'react';
import Tree from 'react-d3-tree';
import treeFormatter from '../../helpers/treeFormatter';
import { useCenteredTree } from '../../helpers/centerTree';
import { getRecipe } from '../../services/api';
import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';
import Modal from '../Modal';

export default function OrgChartTree({ treeId }) {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [translate, containerRef] = useCenteredTree();
  const [showModal, setShowModal] = useState(false);
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    async function getAllData() {
      const dbData = await getRecipe(treeId);
      const root = {
        name: dbData.data.recipe.title,
        _id: dbData.data.recipe._id,
        parent: null,
        description: dbData.data.recipe.description,
        user: dbData.data.recipe.ownerId.name,
        recipe: dbData.data.recipe,
      };

      const treeArray = dbData.data.recipeTree;
      const formattedData = treeFormatter(root, treeArray);
      setTreeData(formattedData);
      setLoading(false);
    }
    setLoading(true);
    getAllData();
  }, [treeId]);

  const nodeSize = { x: 400, y: 400 };
  const foreignObjectProps = {
    width: nodeSize.x,
    height: nodeSize.y,
    x: 1,
  };

  const chevUp = (
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
        d="M5 11l7-7 7 7M5 19l7-7 7 7"
      />
    </svg>
  );

  const chevDown = (
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
        d="M19 13l-7 7-7-7m14-8l-7 7-7-7"
      />
    </svg>
  );

  const handleFork = (selectedRecipe) => {
    console.log('THE RECIPE IS SELECTED: ', selectedRecipe);
    setRecipe(selectedRecipe);
    setShowModal(true);
  };

  // Here we're using `renderCustomNodeElement` render a component that uses
  // both SVG and HTML tags side-by-side.
  // This is made possible by `foreignObject`, which wraps the HTML tags to
  // allow for them to be injected into the SVG namespace.
  const renderForeignObjectNode = ({ nodeDatum, toggleNode, foreignObjectProps }) => {
    return (
      <g>
        <circle r={15} fill={'white'}></circle>
        {/* `foreignObject` requires width & height to be explicitly set. */}
        <foreignObject {...foreignObjectProps}>
          <div className="mx-8 mt-11 rounded-lg hover:scale-105 hover:transition-all duration-300 dark:text-neutral-50">
            <div className="max-w-sm rounded-lg p-1 bg-stone-100 dark:bg-dark-200 dark:hover:bg-dark-50 dark:group-hover:transition-all duration-300 shadow-slate-500 dark:shadow-black shadow-md bgdar">
              <div className="px-6 py-4">
                <h3 className="font-semibold text-xl max-w-2xl underline ">
                  {nodeDatum.name || nodeDatum.title}
                </h3>
                <h4 className="font-semibold text-xs mb-2 max-w-2xl">
                  by: {nodeDatum.user || nodeDatum.ownerId.name}
                </h4>
                <p className="text-gray-800 line-clamp-6 py-2 dark:text-neutral-200 transition-all duration-300">
                  {nodeDatum.description}
                </p>
              </div>
              <div className="flex w-full justify-around">
                <Link
                  className="flex justify-center basis-1/3 grow rounded-bl-md hover:bg-stone-200 dark:hover:bg-dark-700 group-hover:transition-all duration-300"
                  to={`${ROUTES.RECIPE}/${nodeDatum.id || nodeDatum._id}`}
                >
                  <button className="flex py-2 ">
                    <span>Recipe</span>
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
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </button>
                </Link>

                <span
                  className={
                    nodeDatum.children
                      ? 'flex justify-center basis-1/3 grow border-stone-300  border-x hover:bg-stone-200 dark:hover:bg-dark-700 group-hover:transition-all duration-300'
                      : 'flex justify-center basis-1/3 grow border-stone-300  border-l rounded-br-md hover:bg-stone-200 dark:hover:bg-dark-700 group-hover:transition-all duration-300'
                  }
                  onClick={() => handleFork(nodeDatum.recipe)}
                >
                  <button className="flex py-2">
                    <span>Fork</span>

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
                        strokeWidth="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </span>
                {nodeDatum.children && (
                  <div className="flex justify-center basis-1/3 grow rounded-br-md hover:bg-stone-200 dark:hover:bg-dark-700 group-hover:transition-all duration-300">
                    <button onClick={toggleNode} className="flex py-2">
                      {nodeDatum.__rd3t.collapsed ? (
                        <>
                          {chevDown} <span>Show</span>
                        </>
                      ) : (
                        <>
                          {chevUp} <span>Less</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </foreignObject>
      </g>
    );
  };

  return (
    // `<Tree />` will fill width/height of its container; in this case `#treeWrapper`.
    <>
      {loading && <div>Loading!!!</div>}
      {!loading && (
        <div id="treeWrapper" style={{ width: '80vw', height: '75vh' }} ref={containerRef}>
          <Tree
            data={treeData}
            translate={translate}
            orientation={'vertical'}
            nodeSize={nodeSize}
            allowForeignObjects
            renderCustomNodeElement={(rd3tProps) =>
              renderForeignObjectNode({ ...rd3tProps, foreignObjectProps })
            }
            enableLegacyTransitions={true}
            transitionDuration={500}
            scaleExtent={{ min: 0.1, max: 3 }}
          />
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
