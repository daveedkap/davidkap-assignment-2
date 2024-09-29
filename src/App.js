import React, { useEffect, useState } from 'react';
import './App.css'; // Importing the main CSS file for styling
import Controls from './Controls'; // Controls component handles UI interactions for KMeans
import KMeans from './kmeans'; // KMeans algorithm logic
import PlotComponent from './PlotComponent'; // Component responsible for rendering data and clusters on the plot

// Function to generate a random dataset with a given number of points and a range for x and y coordinates
const generateRandomDataset = (numPoints = 100, range = 100) => {
  const data = [];
  for (let i = 0; i < numPoints; i++) {
    data.push({
      x: Math.random() * range, // Generate a random x-coordinate
      y: Math.random() * range  // Generate a random y-coordinate
    });
  }
  return data;
};

function App() {
  // State to store the dataset generated or manipulated
  const [data, setData] = useState([]);
  // State to hold the instance of the KMeans algorithm
  const [kmeans, setKMeans] = useState(null);
  // State to store the initialization method (e.g., random, KMeans++)
  const [initMethod, setInitMethod] = useState('random');
  // State to track the current step of the KMeans algorithm
  const [currentStep, setCurrentStep] = useState(0);
  // State to store the current positions of the centroids
  const [centroids, setCentroids] = useState([]);
  // State to store the clustering results
  const [clusters, setClusters] = useState([]);
  // State to handle whether the app is in manual mode for selecting centroids
  const [isManualMode, setIsManualMode] = useState(false);
  // State to store manually selected centroids (if manual initialization is used)
  const [manualCentroids, setManualCentroids] = useState([]);
  // State to define the number of clusters (k)
  const [numClusters, setNumClusters] = useState(3); // Default number of clusters is 3

  // useEffect hook to initialize the dataset and KMeans algorithm when initMethod or numClusters changes
  useEffect(() => {
    const initialData = generateRandomDataset(); // Generate a random dataset
    setData(initialData); // Set the dataset in state
    const km = new KMeans(initialData, numClusters, initMethod); // Create new KMeans instance
    if (initMethod !== 'manual') {
      km.initializeCentroids(); // Initialize centroids unless manual initialization is selected
    }
    setKMeans(km); // Set the KMeans instance in state
    setCentroids(km.centroids); // Store the initial centroids
    setClusters(km.clusters); // Store the initial clusters
    setCurrentStep(0); // Reset the step counter
    setIsManualMode(initMethod === 'manual'); // Enable manual mode if the initMethod is manual
    setManualCentroids([]); // Reset manual centroids
  }, [initMethod, numClusters]); // Triggered when initMethod or numClusters changes

  // Function to generate a new random dataset
  const generateDataset = () => {
    const newData = generateRandomDataset(); // Create new random dataset
    setData(newData); // Set the new dataset
    if (kmeans) {
      const km = new KMeans(newData, numClusters, initMethod); // Create a new KMeans instance with new data
      if (initMethod !== 'manual') {
        km.initializeCentroids(); // Initialize centroids unless manual mode
      }
      setKMeans(km); // Set the new KMeans instance
      setCentroids(km.centroids); // Update centroids
      setClusters(km.clusters); // Update clusters
      setCurrentStep(0); // Reset the step counter
      setManualCentroids([]); // Reset manual centroids if in manual mode
    }
  };

  // Function to perform one step of the KMeans algorithm
  const stepKMeans = () => {
    // If manual initialization is selected but centroids aren't fully set, show an alert
    if (initMethod === 'manual' && manualCentroids.length < numClusters) {
      alert(`Please select all ${numClusters} centroids.`);
      return;
    }

    if (kmeans) {
      const continueRunning = kmeans.step(); // Perform one step of the KMeans algorithm
      setCentroids([...kmeans.centroids]); // Update centroids after step
      setClusters([...kmeans.clusters]); // Update clusters after step
      setCurrentStep(kmeans.history.length); // Update the step count
      if (!continueRunning) {
        alert('KMeans has converged.'); // Alert the user if the algorithm has converged
      }
    }
  };

  // Function to run KMeans until convergence
  const runKMeans = () => {
    // Same check as above for manual initialization
    if (initMethod === 'manual' && manualCentroids.length < numClusters) {
      alert(`Please select all ${numClusters} centroids.`);
      return;
    }

    if (kmeans) {
      kmeans.runFull(); // Run the KMeans algorithm until convergence
      setCentroids([...kmeans.centroids]); // Update centroids after full run
      setClusters([...kmeans.clusters]); // Update clusters after full run
      setCurrentStep(kmeans.history.length); // Update step count
      alert('KMeans has converged.'); // Alert the user that the algorithm has converged
    }
  };

  // Function to reset the KMeans algorithm to its initial state
  const resetKMeans = () => {
    if (kmeans) {
      kmeans.reset(); // Reset the KMeans instance
      if (initMethod === 'manual') {
        setIsManualMode(true); // Enable manual mode
        setManualCentroids([]); // Clear manual centroids
      } else {
        kmeans.initializeCentroids(); // Re-initialize centroids if not in manual mode
        setCentroids([...kmeans.centroids]); // Update centroids
        setClusters([...kmeans.clusters]); // Update clusters
        setCurrentStep(kmeans.history.length); // Update the step count
        setIsManualMode(false); // Disable manual mode
      }
    }
  };

  // Function to handle clicks for selecting manual centroids on the plot
  const handlePointClick = (point) => {
    if (initMethod === 'manual') {
      if (manualCentroids.length < numClusters) {
        const updatedCentroids = [...manualCentroids, point]; // Add the selected point as a new centroid
        setManualCentroids(updatedCentroids); // Update the manual centroids

        if (updatedCentroids.length === numClusters) {
          // When enough centroids are selected, initialize the KMeans algorithm with them
          const km = new KMeans(data, numClusters, 'manual');
          km.setManualCentroids(updatedCentroids); // Set the manually selected centroids
          setKMeans(km); // Set the KMeans instance
          setCentroids([...km.centroids]); // Update centroids
          setClusters([...km.clusters]); // Update clusters
          setCurrentStep(km.history.length); // Update step count
          setIsManualMode(false); // Disable manual mode once centroids are set
        }
      }
    }
  };

  return (
    <div className="App">
      <h1>KMeans Clustering Visualization</h1> {/* Main header for the app */}

      {/* Input to control the number of clusters (k) */}
      <div>
        <label htmlFor="numClusters">Number of Clusters (k):</label>
        <input
          id="numClusters"
          type="number"
          value={numClusters}
          min="1"
          onChange={(e) => setNumClusters(Number(e.target.value))} // Update the number of clusters when changed
        />
      </div>

      {/* Controls component to handle user interactions like stepping through the algorithm */}
      <Controls
        initMethod={initMethod}
        setInitMethod={setInitMethod}
        generateDataset={generateDataset}
        stepKMeans={stepKMeans}
        runKMeans={runKMeans}
        resetKMeans={resetKMeans}
        isManualMode={isManualMode}
      />

      {/* Plot component to render the dataset, centroids, and clusters */}
      <PlotComponent
        data={data}
        centroids={centroids}
        clusters={clusters}
        onPointClick={handlePointClick} // Handles point clicks in manual mode
        mode={initMethod === 'manual' ? 'manual' : 'normal'} // Determines the mode (manual or normal)
      />

      {/* Instructions to select centroids if in manual mode */}
      {initMethod === 'manual' && isManualMode && (
        <p>Select {numClusters - manualCentroids.length} more centroid(s) by clicking on the plot.</p>
      )}
    </div>
  );
}

export default App;
