const Start = new Date();
const OuroborosModule = {
  randomRandInt: function(low, high) {
    if (!Number.isInteger(low) || !Number.isInteger(high)) {
      throw new TypeError("Must be integer number");
    } return low + Math.floor(Math.random() * (high - low + 1));
  },

  randomRandChoice: function(collections) {
    if (!Array.isArray(collections) || collections.length === 0) {
      throw new TypeError("Must be a valid array");
    } let index = Math.floor(Math.random() * collections.length);
    return collections[index];
  },

  randomRandChoices: function(collections, weights) {
    if (!Array.isArray(collections) || !Array.isArray(weights)) {
      throw new TypeError("Arguments should be arrays");
    } if (collections.length !== weights.length) {
      throw new RangeError("Mismatched lengths between collections and weights");
    } if (collections.length === 0 || weights.length === 0) {
      throw new RangeError("Cannot choose from empty array(s)");
    } if (weights.some(w => typeof w !== "number" || w < 0 || isNaN(w))) {
      throw new TypeError("Weights must be positive numbers or 0");
    }

    const cumulativeWeights = collections.reduce((acc, item, index) => {
      const cumulativeWeight = (acc[index - 1] || 0) + weights[index];
      acc.push(cumulativeWeight); return acc;
    }, []);
    
    const totalWeight = cumulativeWeights[cumulativeWeights.length - 1];
    if (totalWeight <= 0) { throw new RangeError("Total of weights is invalid"); }
    const randomIndex = Math.random() * totalWeight;
    for (let i = 0; i < cumulativeWeights.length; i++) {
      if (randomIndex < cumulativeWeights[i]) {
        return collections[i]; }} return null;
  },

  arrayRemove: function(collections, element) {
    if (!Array.isArray(collections)) {
      throw new TypeError("Collections must be an array");
    } if (collections.length === 0) { return []; }
    const index = collections.indexOf(element);
    if (index >= 0) { collections.splice(index, 1); }
    return collections;
  },

  arrayIota: function(stop, start, iota) {
    if (!Number.isInteger(stop)) { throw new TypeError("Stop must be an integer."); }
    start = Number(start) || 0; iota = Number(iota) || 1; let collections = [];
    if (stop >= start) {
      for (let i = start; i <= stop; i += iota) { collections.push(i); }
    } else { for (let i = start; i >= stop; i -= iota) { collections.push(i); }
    } return collections;
  },
  
  getKey: function(find = {from: Object, target: Object}) {
    return Object.keys(find.from)
      .find(key => find.from[key] === find.target);
  }
}

const TIMEOUT_MS = 60 * 1000;
let ObjectImageDictionary = {};

async function fetchImageAsBase64(imageUrl) {
  const controller = new AbortController();
  const signal = controller.signal;
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const response = await fetch(imageUrl, { signal });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
    });
  }
  catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn("Image takes too long (Aborted).");
        throw new Error("Image takes too long.");
    } console.warn("An error occurred during fetch:", error);
    throw error;
  }
}

async function loadImage(link, style, init, onload) {
  return new Promise((resolve, reject) => {
    fetchImageAsBase64(link).then(base64String => {
      if (base64String) { console.log("Image as Base64 string:"
        + base64String.substring(0, 50) + "...");
        const img = document.createElement('img');
              img.src = base64String; img.id = init;
        Object.entries(style).forEach(([k, v]) => { img.style[k] = v; });
        ObjectImageDictionary[init] = img.src;
        onload(); resolve(img.src);
      } else { reject(new Error("Failed to convert image to Base64.")); }
    }).catch(error =>
    { if (error && error.message === "Image takes too long.")
      { console.warn("Image processing cancelled: Image takes too long."); }
      else if (error) { console.warn("An unhandled error occurred:", error.message); }
      reject(error);
    });
  });
};


const imageUrl = { Sprite$0: "https://i.postimg.cc/mkqX8ZcJ/Sprite$0.png" };

let Sprite$0 = loadImage(imageUrl.Sprite$0,
  {
    'height': '256px',
    'width': 'auto',
    'image-rendering': 'pixelated',
  }, 'Sprite$0', () =>
    { const enemyElement = document.getElementById('enemy');
      const imageElement = document.createElement('img');
      imageElement.src = ObjectImageDictionary.Sprite$0;
      const wrapperDiv = document.createElement('div');
      wrapperDiv.append(imageElement); // Put the image inside the new div
      enemyElement.append(wrapperDiv); // Put the new div inside the 'enemy' element
      
      wrapperDiv.style.backgroundColor = '#0F08';
      wrapperDiv.style.border = '2px solid #604D35';
      wrapperDiv.style.borderRadius = '6px';
    }
);