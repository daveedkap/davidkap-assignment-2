class KMeans {
  // Constructor to initialize the KMeans object with data, number of clusters (k), and initialization method
  constructor(data, k, initMethod = 'random') {
    this.data = data;           // The dataset to be clustered
    this.k = k;                 // Number of clusters (k)
    this.initMethod = initMethod; // Initialization method (random, farthest, kmeans++, manual)
    this.centroids = [];        // Array to hold the centroids
    this.clusters = [];         // Array to hold the cluster assignments
    this.history = [];          // Array to keep track of history (centroids and clusters over time)
  }

  // Initializes the centroids based on the selected method
  initializeCentroids() {
    if (this.initMethod === 'random') {
      this.centroids = this.randomInitialization(); // Random initialization of centroids
    } else if (this.initMethod === 'farthest') {
      this.centroids = this.farthestFirstInitialization(); // Farthest first initialization
    } else if (this.initMethod === 'kmeans++') {
      this.centroids = this.kMeansPlusPlusInitialization(); // KMeans++ initialization
    } else if (this.initMethod === 'manual') {
      // In manual mode, centroids will be set manually by the user
    }
    // Store the initial centroids in the history
    this.history.push({
      centroids: [...this.centroids],
      clusters: [] // Clusters are empty initially
    });
  }

  // Randomly selects 'k' centroids from the dataset
  randomInitialization() {
    const shuffled = [...this.data].sort(() => 0.5 - Math.random()); // Shuffle the data
    return shuffled.slice(0, this.k); // Take the first 'k' elements as centroids
  }

  // Farthest first initialization of centroids
  farthestFirstInitialization() {
    const centroids = [];
    // Randomly select the first centroid
    centroids.push(this.data[Math.floor(Math.random() * this.data.length)]);
    while (centroids.length < this.k) {
      let farthestPoint = null;
      let maxDistance = -1;
      // For each point, find the minimum distance to any centroid and select the farthest point
      this.data.forEach(point => {
        const minDist = Math.min(...centroids.map(c => this.distance(point, c)));
        if (minDist > maxDistance) {
          maxDistance = minDist;
          farthestPoint = point; // Update farthest point
        }
      });
      centroids.push(farthestPoint); // Add the farthest point as a new centroid
    }
    return centroids;
  }

  // KMeans++ initialization of centroids
  kMeansPlusPlusInitialization() {
    const centroids = [];
    // Randomly select the first centroid
    centroids.push(this.data[Math.floor(Math.random() * this.data.length)]);
    while (centroids.length < this.k) {
      // Calculate the squared distances to the nearest centroid for each point
      const distances = this.data.map(point =>
        Math.min(...centroids.map(c => this.distance(point, c))) ** 2
      );
      const total = distances.reduce((a, b) => a + b, 0); // Sum of all distances
      const probs = distances.map(d => d / total); // Calculate probabilities for selection
      let cumulative = 0;
      const r = Math.random(); // Random number for selection based on cumulative probabilities
      // Select a new centroid based on the cumulative probability distribution
      for (let i = 0; i < probs.length; i++) {
        cumulative += probs[i];
        if (r < cumulative) {
          centroids.push(this.data[i]); // Add the selected point as a new centroid
          break;
        }
      }
    }
    return centroids;
  }

  // Assigns each data point to the nearest centroid
  assignClusters() {
    this.clusters = this.data.map(point => {
      let minDist = Infinity;
      let cluster = -1;
      // Find the nearest centroid for each data point
      this.centroids.forEach((centroid, idx) => {
        const dist = this.distance(point, centroid);
        if (dist < minDist) {
          minDist = dist; // Update minimum distance
          cluster = idx;  // Assign the point to the nearest centroid (cluster index)
        }
      });
      return cluster; // Return the cluster assignment for this point
    });
  }

  // Recalculates the centroids based on the current cluster assignments
  updateCentroids() {
    const newCentroids = [];
    for (let i = 0; i < this.k; i++) {
      // Filter out points belonging to the current cluster
      const pointsInCluster = this.data.filter((_, idx) => this.clusters[idx] === i);
      if (pointsInCluster.length === 0) {
        // If no points are assigned to this cluster, randomly reinitialize the centroid
        newCentroids.push(this.data[Math.floor(Math.random() * this.data.length)]);
      } else {
        // Calculate the mean of the points in the cluster to update the centroid
        const meanX = pointsInCluster.reduce((sum, p) => sum + p.x, 0) / pointsInCluster.length;
        const meanY = pointsInCluster.reduce((sum, p) => sum + p.y, 0) / pointsInCluster.length;
        newCentroids.push({ x: meanX, y: meanY }); // New centroid is the mean of the points
      }
    }
    return newCentroids; // Return the updated centroids
  }

  // Checks if the centroids have converged (i.e., they don't move significantly)
  hasConverged(newCentroids) {
    for (let i = 0; i < this.k; i++) {
      // If the distance between any corresponding old and new centroids is too large, return false
      if (this.distance(this.centroids[i], newCentroids[i]) > 1e-4) {
        return false;
      }
    }
    return true; // If all centroids are sufficiently close, return true
  }

  // Performs one iteration (step) of the KMeans algorithm
  step() {
    this.assignClusters(); // Assign points to clusters based on current centroids
    const newCentroids = this.updateCentroids(); // Calculate the new centroids
    // Save the current state of centroids and clusters to history
    this.history.push({
      centroids: [...newCentroids],
      clusters: [...this.clusters]
    });
    // Check if the centroids have converged
    if (this.hasConverged(newCentroids)) {
      return false; // Return false if the algorithm has converged (no further changes)
    } else {
      this.centroids = newCentroids; // Update centroids for the next iteration
      return true; // Continue to the next iteration
    }
  }

  // Runs the KMeans algorithm until convergence
  runFull() {
    let continueRunning = true;
    while (continueRunning) {
      continueRunning = this.step(); // Keep running steps until the algorithm converges
    }
  }

  // Calculates the Euclidean distance between two points
  distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2); // Standard Euclidean distance formula
  }

  // Sets centroids manually (used in manual initialization mode)
  setManualCentroids(selectedCentroids) {
    this.centroids = selectedCentroids; // Set the manually selected centroids
    // Store the initial state in the history
    this.history.push({
      centroids: [...this.centroids],
      clusters: []
    });
  }

  // Resets the KMeans algorithm to its initial state
  reset() {
    this.centroids = [];    // Clear centroids
    this.clusters = [];     // Clear cluster assignments
    this.history = [];      // Clear history
  }
}

export default KMeans; // Export the KMeans class for use in other parts of the application
