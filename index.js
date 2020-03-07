import React from "react";
import ReactDOM from "react-dom";
import DeckGL from "@deck.gl/react";
import {ColumnLayer} from "@deck.gl/layers";
import StaticMap from "react-map-gl";

// Data source: https://data.humdata.org/dataset/highresolutionpopulationdensitymaps-egy
// Description: https://dataforgood.fb.com/docs/methodology-high-resolution-population-density-maps-demographic-estimates/
import data from "./population_egy_2018-10-01-aggregated.json";

const initialViewState = {
  latitude: 29,
  longitude: 29.5,
  zoom: 5.1,
  pitch: 30
};

let minPopulation = Number.POSITIVE_INFINITY;
let maxPopulation = Number.NEGATIVE_INFINITY;

data.forEach((item) => {
  minPopulation = Math.min(minPopulation, item.population);
  maxPopulation = Math.max(maxPopulation, item.population);
});

const rangePopulation = maxPopulation - minPopulation;

function getColor(population) {
  const ratio = (population - minPopulation) / rangePopulation;
  return [
    255 * ratio,
    255 - 255 * ratio,
    0
  ];
}

class App extends React.Component {
  constructor(props) {
    super(props);

    const layers = [
      new ColumnLayer({
        data,
        pickable: true,
        getPosition: item => [item.longitude, item.latitude],
        getFillColor: item => getColor(item.population),
        getElevation: item => item.population,
        elevationScale: 3,
        radius: 500,
        opacity: 0.005,
        onHover: info => this.setState({object: info.object, mouseX: info.x, mouseY: info.y})
      })
    ];

    this.state = {
      object: null,
      mouseX: 0,
      mouseY: 0,
      layers
    }

  }

  render() {
    let tooltip = null;
    if (this.state.object) {
      const style = {
        position: "absolute",
        zIndex: 999,
        pointerEvents: "none",
        top: this.state.mouseY,
        left: this.state.mouseX,
        backgroundColor: "white",
        padding: 5,
        borderRadius: 5
      };
      const {latitude, longitude, population} = this.state.object;
      tooltip = <div style={style}>
                  <div>
                    {Math.round(population)} people / km<sup>2</sup>
                  </div>
                  <div>
                  {`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
                  </div>
                </div>;
    }
    return (
      <div>
        { tooltip }
        <Info />
        <DeckGL controller={true} initialViewState={initialViewState} layers={this.state.layers}>
          <StaticMap mapboxAccessToken={process.env.MapboxAccessToken}/>
        </DeckGL>
      </div>
    );
  }
}

function Info() {
  const style = {
    position: "absolute",
    zIndex: 999,
    top: 20,
    left: 20,
    width: "30%",
    fontSize: 20,
    backgroundColor: "white",
    padding: 5,
    borderRadius: 5
  };

  return (
    <div style={style}>
      <div>
        Population density map of Egypt using <a href="https://deck.gl">deck.gl</a>. Data re-aggregated to 
        a 1000x1000 grid. Mouse over a column for details.
      </div>
      <div>
        <a href="https://data.humdata.org/dataset/highresolutionpopulationdensitymaps-egy">Data Source</a>
      </div>
    </div>
  );
}

ReactDOM.render(
  <App />,
  document.body
);
