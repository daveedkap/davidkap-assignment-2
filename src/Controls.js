
import React from 'react';

const Controls = ({
  initMethod,
  setInitMethod,
  generateDataset,
  stepKMeans,
  runKMeans,
  resetKMeans,
  isManualMode
}) => {
  return (
    <div className="controls">
      <div>
        <label htmlFor="init-method">Initialization Method: </label>
        <select
          id="init-method"
          value={initMethod}
          onChange={(e) => setInitMethod(e.target.value)}
        >
          <option value="random">Random</option>
          <option value="farthest">Farthest First</option>
          <option value="kmeans++">KMeans++</option>
          <option value="manual">Manual</option>
        </select>
      </div>
      <div>
        <button onClick={generateDataset}>Generate New Dataset</button>
        <button onClick={stepKMeans}>Step</button>
        <button onClick={runKMeans}>Run to Convergence</button>
        <button onClick={resetKMeans}>Reset</button>
      </div>
      {isManualMode && <p>Click on the plot to select initial centroids.</p>}
    </div>
  );
};

export default Controls;
