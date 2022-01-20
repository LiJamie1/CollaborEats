const tree = [
  // {
  //   id: 1,
  //   parent: null,
  //   path: [],
  // },
  {
    id: 2,
    parent: 1,
    path: [1], //if path.length == 1 then they are all children;
  },
  {
    id: 4,
    parent: 1,
    path: [1],
  },
  {
    id: 3,
    parent: 2,
    path: [1, 2],
  },
  {
    id: 7,
    parent: 4,
    path: [1, 4],
  },
  {
    id: 6,
    parent: 3,
    path: [1, 2, 3],
  },
  {
    id: 5,
    parent: 3,
    path: [1, 2, 3],
  },
];

const root = {
  name: '1',
  children: [],
};

const treeFormatter = (root, treeData) => {
  // index all nodes in all depths of the tree
  const depthIndex = {};

  //set up root
  depthIndex['0'] = [root.id]; //not id because its already in r3tree format
  treeData.forEach((node) => {
    if (!depthIndex[node.path.length]) {
      depthIndex[node.path.length] = [node._id];
    } else {
      depthIndex[node.path.length].push(node._id);
    }
  });

  // push root node into our data
  let data = [];
  data.push(root);

  for (let i = 0; i < treeData.length; i++) {
    // All nodes with depth = 1 is always children to root node
    // So just push to root node's children here
    if (treeData[i].path.length === 1) {
      data[0].children.push({
        // name: treeData[i]._id.toString(),
        name: treeData[i].title,
        children: [],
      }); //data[0] is always root
    } else {
      // r3treepath maps out the location we want to push to in the r3tree format
      // we have to do this because the location is DEEPLY nested
      let r3treepath = [];
      for (let j = 0; j < treeData[i].path.length; j++) {
        // We use the path AKA the array of ancestors to find the index of the parent
        // inside depth index we created in the beginning
        let node = treeData[i].path[j];
        let parentIndex = depthIndex[j].indexOf(node);
        r3treepath.push(parentIndex);
        r3treepath.push('children');
      }

      // Push to the correct nested location
      get(r3treepath, data).push({
        name: treeData[i].title,
        children: [],
      });
    }
  }

  return data;
};

const get = (p, o) => p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);

export default treeFormatter;