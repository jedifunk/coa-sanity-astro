import mapboxgl from "mapbox-gl";
import * as turf from '@turf/turf'

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

export function layerClick(map, layers) {
  const data = Array.isArray(layers) ? layers : Object.keys(layers)
  map.on('click', data, (e) => {
    map.flyTo({
      center: e.features[0].geometry.coordinates,
      zoom: 13,
    })
  })
}

export function cursorChange(map, layers) {
  const data = Array.isArray(layers) ? layers : Object.keys(layers)
  // Change the cursor to a pointer when the it enters a feature in the 'circle' layer.
  map.on('mouseenter', data, () => {
    map.getCanvas().style.cursor = 'pointer'
  })
  
  // Change it back to a pointer when it leaves.
  map.on('mouseleave', data, () => {
    map.getCanvas().style.cursor = ''
  })
}

export function setUpBBox(map, source) {
  map.once('idle', () => {
    // get mapId to identify each map uniquely, use in creation of custom event
    const mapID = map._mapId
    const bounds = JSON.stringify(turf.bbox(source))
    map.fitBounds(turf.bbox(source), {padding: 20, animate: false});
    const event = new CustomEvent(`bboxSet-${mapID}`, { detail: bounds });
    window.dispatchEvent(event)
  })
}

export function resetZoom(map, zoom) {
  if (zoom == 'true') {
  // get mapId to match with mapId set in setUpBBox
  const mapID = map._mapId
    // get bounds from CustomEvent that was saved by setUpBBox function
    window.addEventListener(`bboxSet-${mapID}`, (event) => {
      map.addControl(new ResetZoom(event.detail), 'top-left')
    })
  } else {
    map.addControl(new ResetZoom(), 'top-left')
  }
}

export function clusterZoom(map, layers, source) {
  const data = Array.isArray(layers) ? layers : Object.keys(layers)
  // inspect a cluster on click
  map.on('click', data, (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: data });
    const clusterId = features[0].properties.cluster_id;
    map.getSource(source).getClusterExpansionZoom(
      clusterId,
      (err, zoom) => {
        if (err) return;
        
        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      }
    );
  });
}

export function createTypeButtons(map, layers) {
  if (!map.buttons) {
    map.buttons = [];
  }

  map.once('idle', () => {
    // If these layers were not added to the map, abort
    if (Array.isArray(layers) ? layers.some(layer => !map.getLayer(layer)) : Object.keys(layers).some(layer => !map.getLayer(layer))) {return}

    // For each Place Type layer create a button
    const layerKeys = Array.isArray(layers) ? layers : Object.keys(layers);
    for (const layer of layerKeys) {

      // Skip layers that already have a button set up.
      if (map.buttons.includes(layer)) {
        continue;
      }

      // Create a link.
      const link = document.createElement('button');
      link.id = layer;
      link.textContent = Array.isArray(layers) ? mapButtons(layer) : layers[layer].features[0].properties.placeTypeTitle
      link.className = 'pill';

      // Show or hide layer when the toggle is clicked.
      link.onclick = function (e) {
        const clickedLayer = this.id;
        
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
      const mapAttr = map._container.dataset.attr
      const nav = document.querySelector(`[data-attr=${mapAttr}]`)
      nav.appendChild(link);
      map.buttons.push(layer);
    }
  })
}

export function placePopup(map, layers) {

  // Create a popup, but don't add it to the map yet.
  const popup = new mapboxgl.Popup({
    //closeButton: false,
    closeOnClick: false,
    closeOnMove: true,
    className: 'map-popup',
  });

  const data = Array.isArray(layers) ? layers : Object.keys(layers)

  map.on('click', data, (e) => {
    let currentZoom = map.getZoom()

    if (currentZoom >= 5) {
      // Copy coordinates array.
      const coordinates = e.features[0].geometry.coordinates.slice();
      const favorite = e.features[0].properties.favorite == true ? `<div class="favorite"><svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.322 2.923c.126-.259.39-.423.678-.423.289 0 .552.164.678.423.974 1.998 2.65 5.44 2.65 5.44s3.811.524 6.022.829c.403.055.65.396.65.747 0 .19-.072.383-.231.536-1.61 1.538-4.382 4.191-4.382 4.191s.677 3.767 1.069 5.952c.083.462-.275.882-.742.882-.122 0-.244-.029-.355-.089-1.968-1.048-5.359-2.851-5.359-2.851s-3.391 1.803-5.359 2.851c-.111.06-.234.089-.356.089-.465 0-.825-.421-.741-.882.393-2.185 1.07-5.952 1.07-5.952s-2.773-2.653-4.382-4.191c-.16-.153-.232-.346-.232-.535 0-.352.249-.694.651-.748 2.211-.305 6.021-.829 6.021-.829s1.677-3.442 2.65-5.44z" fill-rule="nonzero"/></svg></div>` : '';
      const header = `<header><div><b>${e.features[0].properties.title ? e.features[0].properties.title : e.features[0].properties.name}</b></div>${favorite}</header>`;
      const description = e.features[0].properties.description != null ? `<p class="desc">${e.features[0].properties.description}</p>` : '';
      const website = e.features[0].properties.website != null ? `<p><a href="${e.features[0].properties.website}" target="_blank">Website</a></p>` : '';
      const content = `${header}${description}`

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      
      // Populate the popup and set its coordinates
      // based on the feature found.
      popup.setLngLat(coordinates).setHTML(content).addTo(map);
      console.log('click')
    }
  });
  // map.on('mouseleave', data, () => {
  //   popup.remove();
  // });
}

export function zoomAndPopup(map, layers) {
  // Create a popup, but don't add it to the map yet.
  const popup = new mapboxgl.Popup({
    //closeButton: false,
    closeOnClick: false,
    closeOnMove: true,
    className: 'map-popup',
  })

  const data = Array.isArray(layers) ? layers : Object.keys(layers)

  map.on('click', data, (e) => {
    let currentZoom = map.getZoom()
    if (currentZoom >= 5) {
      // Copy coordinates array.
      const coordinates = e.features[0].geometry.coordinates.slice();
      const favorite = e.features[0].properties.favorite == true ? `<div class="favorite"><svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.322 2.923c.126-.259.39-.423.678-.423.289 0 .552.164.678.423.974 1.998 2.65 5.44 2.65 5.44s3.811.524 6.022.829c.403.055.65.396.65.747 0 .19-.072.383-.231.536-1.61 1.538-4.382 4.191-4.382 4.191s.677 3.767 1.069 5.952c.083.462-.275.882-.742.882-.122 0-.244-.029-.355-.089-1.968-1.048-5.359-2.851-5.359-2.851s-3.391 1.803-5.359 2.851c-.111.06-.234.089-.356.089-.465 0-.825-.421-.741-.882.393-2.185 1.07-5.952 1.07-5.952s-2.773-2.653-4.382-4.191c-.16-.153-.232-.346-.232-.535 0-.352.249-.694.651-.748 2.211-.305 6.021-.829 6.021-.829s1.677-3.442 2.65-5.44z" fill-rule="nonzero"/></svg></div>` : '';
      const header = `<header><div><b>${e.features[0].properties.title ? e.features[0].properties.title : e.features[0].properties.name}</b></div>${favorite}</header>`;
      const description = e.features[0].properties.description != null ? `<p class="desc">${e.features[0].properties.description}</p>` : '';
      const website = e.features[0].properties.website != null ? `<p><a href="${e.features[0].properties.website}" target="_blank">Website</a></p>` : '';
      const content = `${header}${description}`

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Populate the popup and set its coordinates
      // based on the feature found.
      popup.setLngLat(coordinates).setHTML(content).addTo(map);
    } else {
      map.flyTo({
        center: e.features[0].geometry.coordinates,
        zoom: 13,
      })
    }

  })
}

export function sidebar(map, layers) {
  const wrapper = map._container
  let sidebar

  const data = Array.isArray(layers) ? layers : Object.keys(layers)

  map.on('click', data, (e) => {
    if (wrapper.contains(sidebar)){
      wrapper.removeChild(sidebar)
    }
    let currentZoom = map.getZoom()
      
    if (currentZoom >= 5) {
      const favorite = e.features[0].properties.favorite == true ? `<div class="favorite"><svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.322 2.923c.126-.259.39-.423.678-.423.289 0 .552.164.678.423.974 1.998 2.65 5.44 2.65 5.44s3.811.524 6.022.829c.403.055.65.396.65.747 0 .19-.072.383-.231.536-1.61 1.538-4.382 4.191-4.382 4.191s.677 3.767 1.069 5.952c.083.462-.275.882-.742.882-.122 0-.244-.029-.355-.089-1.968-1.048-5.359-2.851-5.359-2.851s-3.391 1.803-5.359 2.851c-.111.06-.234.089-.356.089-.465 0-.825-.421-.741-.882.393-2.185 1.07-5.952 1.07-5.952s-2.773-2.653-4.382-4.191c-.16-.153-.232-.346-.232-.535 0-.352.249-.694.651-.748 2.211-.305 6.021-.829 6.021-.829s1.677-3.442 2.65-5.44z" fill-rule="nonzero"/></svg></div>` : '';
      const header = `<header><div><b>${e.features[0].properties.title ? e.features[0].properties.title : e.features[0].properties.name}</b></div>${favorite}</header>`;
      const description = e.features[0].properties.description != null ? `<p class="desc">${e.features[0].properties.description}</p>` : '';
      const website = e.features[0].properties.website != null ? `<p><a href="${e.features[0].properties.website}" target="_blank">Website</a></p>` : '';
      const content = `${header}${description}${website}`

      sidebar = document.createElement('div')
      sidebar.className = 'map-sidebar'
      sidebar.innerHTML = content
      wrapper.appendChild(sidebar)
    }
  })
  map.on('move', () => {
    if (wrapper.contains(sidebar)){
      wrapper.removeChild(sidebar)
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

    this._btn.onclick = () => {
      if (this.bounds) {
        // parse the JSON string and recreate the necessary LngLatBounds for use in fitBounds
        let bounds = JSON.parse(this.bounds)
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