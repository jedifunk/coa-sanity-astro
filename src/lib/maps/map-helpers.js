import mapboxgl from "mapbox-gl";
import { setUpBBox } from "./map-setup";
export function mapButtons(text) {
  var output = text
    .replace(/-/g, ' / ')
  
    const words = output.split(" ");

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }

  var final = words.join(" ");

  return final
}

export function countryClick(map) {
  map.on('click', ['countries'], (e) => {

    if (e.features.length > 0) {
      let minLng = Infinity;
      let minLat = Infinity;
      let maxLng = -Infinity;
      let maxLat = -Infinity;
      
      // Function to update the bounds
      function updateBounds(coord) {
        let lng = coord[0];
        let lat = coord[1];
        minLng = Math.min(minLng, lng);
        minLat = Math.min(minLat, lat);
        maxLng = Math.max(maxLng, lng);
        maxLat = Math.max(maxLat, lat);
      }

      // Handling both polygon and multipolygon
      let feature = e.features[0];
      if (feature.geometry.type === 'Polygon') {
          for (let ring of feature.geometry.coordinates) {
              for (let coord of ring) {
                  updateBounds(coord);
              }
          }
      } else if (feature.geometry.type === 'MultiPolygon') {
          for (let polygon of feature.geometry.coordinates) {
              for (let ring of polygon) {
                  for (let coord of ring) {
                      updateBounds(coord);
                  }
              }
          }
      }

      // Calculate the bounding box
      let bounds = [minLng, minLat, maxLng, maxLat];
      // Adjust the map's view to fit the bounding box
      map.fitBounds(bounds, {
          padding: 20
      });
    }
  })
}

export function cityClick(map) {
  map.on('click', ['cities'], (e) => {
    var currentZoom = map.getZoom()
    const pointData = JSON.parse(e.features[0].properties.box)

    if (currentZoom >= 5) {
      map.fitBounds(pointData)     
    }
  })
}

export function cursorChange(map, layers) {
  // Change the cursor to a pointer when the it enters a feature in the 'circle' layer.
  map.on('mouseenter', layers, () => {
    map.getCanvas().style.cursor = 'pointer'
  })
  
  // Change it back to a pointer when it leaves.
  map.on('mouseleave', layers, () => {
    map.getCanvas().style.cursor = ''
  })
}

export function resetZoom(map, zoom) {
  if (zoom == 'true') {
    // get bounds from sessionStorage that was saved by setUpBBox function
    const bounds = sessionStorage.getItem('bounds')
    map.addControl(new ResetZoom(bounds), 'top-left')
  } else {
    map.addControl(new ResetZoom(), 'top-left')
  }
}

export function createTypeButtons(map, layers) {
  map.on('idle', () => {

    // create array from Set passed from placeTypes
    // If these layers were not added to the map, abort
    if (layers.some(layer => !map.getLayer(layer))) {return}

    // For each Place Type create a button
    for (const id of layers) {
      // Skip layers that already have a button set up.
      if (document.getElementById(id)) {
        continue;
      }
      
      // Create a link.
      const link = document.createElement('button');
      link.id = id;
      link.textContent = mapButtons(id);
      link.className = 'pill';
      
      // Show or hide layer when the toggle is clicked.
      link.onclick = function (e) {
        const clickedLayer = this.id;
        // e.preventDefault();
        // e.stopPropagation();
        
        const visibility = map.getLayoutProperty(
          clickedLayer,
          'visibility'
        );

        // Toggle layer visibility by changing the layout object's visibility property.
        if (visibility === 'visible') {
          map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.classList.add('inactive');
        } else {
          this.classList.remove('inactive');
          map.setLayoutProperty(
          clickedLayer,
            'visibility',
            'visible'
          );
        }
      }
      
      const layers = document.querySelector('[data-cat]')
      layers.appendChild(link);
    }
  })
}

class ResetZoom {
  // accept bounds from resetZoom above
  constructor(bounds) {
    this.bounds = bounds;
  }
  onAdd(map) {
    this._map = map
    let _this = this

    this._el = document.createElement('span')
    this._el.className = 'mapboxgl-ctrl-icon'

    this._btn = document.createElement('button')
    this._btn.className = 'mapboxgl-ctrl-reset'
    this._btn.type = "button"
    this._btn.title = "Reset Zoom"
    this._btn.appendChild(this._el)

    this._btn.onclick = (e) => {
      if (this.bounds) {
        // parse the JSON string and recreate the necessary LngLatBounds for use in fitBounds
        let bounds = JSON.parse(this.bounds)
        bounds = new mapboxgl.LngLatBounds(bounds._sw, bounds._ne)
        map.fitBounds(bounds, {padding: 20});
      } else {
        map.flyTo({zoom: 1})
      } 
    }

    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl-group mapboxgl-ctrl";
    this._container.appendChild(this._btn);
    return this._container;
  }
   
  onRemove() {
    this._container.parentNode.removeChild(this._container)
    this._map = undefined
  }
}