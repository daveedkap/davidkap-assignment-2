
import React from 'react';
const Controls = ({
  initMethod,         // The current initialization method (random, farthest, kmeans++, manual)
  setInitMethod,      // Function to set a new initialization method
  generateDataset,    // Function to generate a new dataset
  stepKMeans,         // Function to perform one step of the KMeans algorithm
  runKMeans,          // Function to run the KMeans algorithm until convergence
  resetKMeans,        // Function to reset the KMeans algorithm
  isManualMode        // Boolean indicating whether manual mode is enabled (for manual centroid selection)
}) => {
  return (
    <div className="controls">  {/* Container for all control elements */}
      <div>
        {/* Dropdown to select the initialization method for KMeans */}
        <label htmlFor="init-method">Initialization Method: </label>
        <select
          id="init-method"
          value={initMethod} // Binds the current initialization method to the dropdown value
          onChange={(e) => setInitMethod(e.target.value)} // Updates the init method when a new option is selected
        >
          {/* Options for different initialization methods */}
          <option value="random">Random</option>
          <option value="farthest">Farthest First</option>
          <option value="kmeans++">KMeans++</option>
          <option value="manual">Manual</option>
        </select>
      </div>
      <div>
        {/* Button to generate a new dataset */}
        <button onClick={generateDataset}>Generate New Dataset</button>
        {/* Button to step through the KMeans algorithm one step at a time */}
        <button onClick={stepKMeans}>Step</button>
        {/* Button to run the KMeans algorithm until convergence */}
        <button onClick={runKMeans}>Run to Convergence</button>
        {/* Button to reset the KMeans algorithm */}
        <button onClick={resetKMeans}>Reset</button>
      </div>
      {/* Instruction shown in manual mode to guide user to select centroids manually */}
      {isManualMode && <p>Click on the plot to select initial centroids.</p>}
    </div>
  );
};

export default Controls; // Exporting the Controls component for use in other parts of the app
