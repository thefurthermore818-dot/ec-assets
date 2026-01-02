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