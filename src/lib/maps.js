import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const MB_TOKEN = import.meta.env.PUBLIC_MAPBOX_TOKEN
mapboxgl.accessToken = MB_TOKEN

export async function orchestrate(mapID, mapLayers, hasTypes, mapZoom, countries, cities, locations) {
  const map = await initializeMap(mapID)
  await mapInteractivity(map, mapLayers, mapZoom)

  if (mapLayers.includes('countries')) {
    await addMapboxCountries(countries, map)
  }
  if (mapLayers.includes('cities')) {
    await convertCities(cities, map)
  }
  if (mapLayers.includes('places')) {
    if (hasTypes) {
      await convertPlaceTypes(locations, map, mapZoom, mapLayers)
    } else {
      await convertPlaces(locations, map, mapZoom, mapLayers)
    }
  }
}

// temp to get 4sq working, come back to fold into main orchestrate
export async function orchestrateFoursquare(mapID, newShops, newTransit, newOutdoors, newFood, newHist) {
  const map = await initializeMap(mapID)
  await checkinInteractivity(map)
  await addShopCheckins2022(newShops, map)
  await addTransitCheckins2022(newTransit, map)
  await addOutdoorCheckins2022(newOutdoors, map)
  await addFoodCheckins2022(newFood, map)
  await addHistoricCheckins2022(newHist, map)
}

export async function initializeMap(id) {
  return new Promise(resolve => {
    const map = new mapboxgl.Map({
      container: id,
      style: 'mapbox://styles/mapbox/light-v10',
      zoom: 1,
    });

    map.on('load', () => resolve(map));
  });
}

export async function mapInteractivity(map, layers, zoom) {
  const nav = new mapboxgl.NavigationControl({
    showCompass: false,
  })
  map.addControl(nav, 'top-left')

  // Change the cursor to a pointer when the it enters a feature in the 'circle' layer.
  map.on('mouseenter', layers, () => {
    map.getCanvas().style.cursor = 'pointer'
  })
  
  // Change it back to a pointer when it leaves.
  map.on('mouseleave', layers, () => {
    map.getCanvas().style.cursor = ''
  })

  countryClick(map)
  cityClick(map)
  placePopup(map)
  resetZoom(map, zoom)

}

export async function convertCities(cities, map) {
  const features = []

  for (const city of cities) {
    features.push({
      type: 'Feature',
      properties: { 
        name: city.name, 
        box: [city.geometry.mapBounds.southwest, city.geometry.mapBounds.northeast], 
      }, 
      geometry: {
        type: 'Point', 
        coordinates: [city.geometry.longitude, city.geometry.latitude]
      },
    })
  }
  const geojson = {
    type: 'FeatureCollection',
    features: features
  }
  await addCities(geojson, map)
}

export async function convertPlaces(places, map, mapZoom, mapLayers) {
  const features = []

  for (const place of places) {
    features.push({
      type: 'Feature', 
      properties: { 
        name: place.name,
        description: place.description,
        website: place.website,
        box: [place.geometry.mapBounds.southwest, place.geometry.mapBounds.northeast] }, 
      geometry: { 
        type:'Point', 
        coordinates: [place.geometry.longitude, place.geometry.latitude]
      }
    })
  }
  const geojson = {
    type: 'FeatureCollection',
    features: features
  }

  if (mapZoom == 'true') {
    await addPlacesAndZoom(geojson, map)
  } else {
    await addPlaces(geojson, map)
  }
}

export async function convertPlaceTypes(places, map, mapZoom) {
  const features = []

  for (const place of places) {
    features.push({
      type: 'Feature', 
      properties: { 
        name: place.name,
        description: place.description,
        website: place.website,
        placeType: place.placeType && place.placeType.title,
        box: [place.geometry.mapBounds.southwest, place.geometry.mapBounds.northeast] }, 
      geometry: { 
        type:'Point', 
        coordinates: [place.geometry.longitude, place.geometry.latitude]
      }
    })
  }
  const geojson = {
    type: 'FeatureCollection',
    features: features
  }

  if (mapZoom == 'true') {
    await addPlaceTypesAndZoom(geojson, map)
  } else {
    await addPlaceTypes(geojson, map)
  }
}

function addPlaces(geojson, map) {

  map.addSource('places', {
    type: 'geojson',
    data: geojson
  })
  map.addLayer({
    id: 'places',
    type: 'circle',
    source: 'places',
    paint: {
      'circle-color': 'hsla(199, 100%, 20%, 1)',
      'circle-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7,0,
        9,1
      ],
    },
    minzoom: 8,
  })  
}

function addPlaceTypes(geojson, map) {
  // First, create a set of unique placeTypes
  const placeTypes = new Set(geojson.features.map(feature => feature.properties.placeType));

  // Then, for each unique placeType, create a layer
  placeTypes.forEach(placeType => {
    const filteredGeojson = {
      type: 'FeatureCollection',
      features: geojson.features.filter(feature => feature.properties.placeType === placeType)
    };

    map.addSource(placeType, {
      type: 'geojson',
      data: filteredGeojson
    });

    map.addLayer({
      id: placeType,
      type: 'circle',
      source: placeType,
      paint: {
        'circle-color': 'hsla(199, 100%, 20%, 1)',
        'circle-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7,0,
          9,1
        ],
      },
      minzoom: 8,
    });
  });
  createTypeButtons(map, placeTypes)
}

function addPlacesAndZoom(geojson, map) {

  map.addSource('places', {
    type: 'geojson',
    data: geojson
  })
  map.addLayer({
    id: 'places',
    type: 'circle',
    source: 'places',
    paint: {
      'circle-color': 'hsla(199, 100%, 20%, 1)',
    },
    layout: {
      visibility: 'visible'
    }
  })
  const layers = 'places'
  setUpBBox(map, layers)
  
}

function addPlaceTypesAndZoom(geojson, map) {
  // First, create a set of unique placeTypes
  const placeTypes = new Set(geojson.features.map(feature => feature.properties.placeType));

  // Then, for each unique placeType, create a layer
  placeTypes.forEach(placeType => {
    const filteredGeojson = {
      type: 'FeatureCollection',
      features: geojson.features.filter(feature => feature.properties.placeType === placeType)
    };

    map.addSource(placeType, {
      type: 'geojson',
      data: filteredGeojson
    });

    map.addLayer({
      id: placeType,
      type: 'circle',
      source: placeType,
      paint: {
        'circle-color': 'hsla(199, 100%, 20%, 1)',
      },
      layout: {
        visibility: 'visible'
      }
    });
  });
  createTypeButtons(map, placeTypes)
  const layers = placeTypes ? Array.from(placeTypes) : 'places'
  setUpBBox(map, layers);
}

function addCities(geojson, map) {
  map.addSource('cities', {
    type: 'geojson',
    data: geojson
  })
  map.addLayer({
    id: 'cities',
    source: 'cities',
    type: 'circle',
    paint: {
      'circle-color': 'hsla(199, 100%, 30%, .75)',
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        1, 3,
        5, 5,
      ],
      'circle-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7,1,
        9,0
      ],
    },
    minzoom: 2.5,
    maxzoom: 10,
  })
}

export async function addMapboxCountries(countries, map) {
  map.addSource('countries', {
    type: 'vector',
    url: 'mapbox://mapbox.country-boundaries-v1',
  })
  map.addLayer({
    id: 'countries',
    type: 'fill',
    source: 'countries',
    'source-layer': 'country_boundaries',
    paint: {'fill-color': 'hsla(199,100%,40%,.5)'},
    maxzoom: 5
  })
  // extract ISO from our cities Object
  const isos = [...new Set(countries.map(country => country.isoA3))]

  // create filter and spread the ISOs
  const filterExp = ['in', 'iso_3166_1_alpha_3', ...isos]
  map.setFilter('countries', filterExp)
}

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

function setUpBBox(map, layers) {
  return new Promise((resolve, reject) => {
    map.once('idle', function() {
      const features = map.queryRenderedFeatures({layers: layers})

      if (features.length > 0) {
        const bounds = features.reduce(function(bounds, feature) {
          return bounds.extend(feature.geometry.coordinates);
        }, new mapboxgl.LngLatBounds(features[0].geometry.coordinates, features[0].geometry.coordinates));

        map.fitBounds(bounds, {padding: 20, animate: false});
        resolve(bounds);
      } else {
        reject('No features found');
      }
    });
  });
}

function countryClick(map) {
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

function cityClick(map) {
  map.on('click', ['cities'], (e) => {
    var currentZoom = map.getZoom()
    const pointData = JSON.parse(e.features[0].properties.box)

    if (currentZoom >= 5) {
      map.fitBounds(pointData)     
    }
  })
}

function placePopup(map) {
  // Create a popup, but don't add it to the map yet.
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    closeOnMove: true,
    className: 'map-popup',
  });

  map.on('mouseenter', ['cities', 'places'], (e) => {
    let currentZoom = map.getZoom()
    if (currentZoom >= 5) {
      // Copy coordinates array.
      const coordinates = e.features[0].geometry.coordinates.slice();
      const header = `<p><b>${e.features[0].properties.name}</b></p>`
      const description = e.features[0].properties.description != null ? `<p>${e.features[0].properties.description}</p>` : '';
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
    }
  });
  map.on('mouseleave', ['cities', 'places'], () => {
    popup.remove();
  });
}

function resetZoom(map, zoom) {
  if (zoom == 'true') {
    //setUpBBox(map)
      // part of resetting to bounding box, needs to be fixed
      // .then(bounds => {
      //   addResetZoomControl(map, bounds)
      // })
      // .catch(error => {
      //   console.error(error);
      // });
  } else {
    map.addControl(new ResetZoom(), 'top-left')
  }
}

function addTransitCheckins2022(geojson, map) {
  map.addSource('transit', {
    type: 'geojson',
    data: geojson
  })
  map.addLayer({
    id: 'transit',
    source: 'transit',
    type: 'circle',
    paint: {
      'circle-color': 'hsla(199, 100%, 40%, .5)',
    },
    layout: {
      visibility: 'visible'
    }
  })
}
function addFoodCheckins2022(geojson, map) {
  map.addSource('food', {
    type: 'geojson',
    data: geojson
  })
  map.addLayer({
    id: 'food',
    source: 'food',
    type: 'circle',
    paint: {
      'circle-color': 'hsla(199, 100%, 25%, .5)',
    },
    layout: {
      visibility: 'visible'
    }
  })
}
function addShopCheckins2022(geojson, map) {
  map.addSource('cafes-bars', {
    type: 'geojson',
    data: geojson
  })
  map.addLayer({
    id: 'cafes-bars',
    source: 'cafes-bars',
    type: 'circle',
    paint: {
      'circle-color': 'hsla(199, 100%, 30%, .5)',
    },
    layout: {
      visibility: 'visible'
    }
  })
}
function addOutdoorCheckins2022(geojson, map) {
  map.addSource('pp', {
    type: 'geojson',
    data: geojson
  })
  map.addLayer({
    id: 'parks-plazas',
    source: 'pp',
    type: 'circle',
    paint: {
      'circle-color': 'hsla(199, 100%, 20%, .5)',
    },
    layout: {
      visibility: 'visible'
    }
  })
}
function addHistoricCheckins2022(geojson, map) {
  map.addSource('historic-monuments', {
    type: 'geojson',
    data: geojson
  })
  map.addLayer({
    id: 'historic-monuments',
    source: 'historic-monuments',
    type: 'circle',
    paint: {
      'circle-color': 'hsla(199, 100%, 15%, .5)',
    },

    layout: {
      visibility: 'visible'
    }
  })
}
function checkinInteractivity(map, zoom) {
  const nav = new mapboxgl.NavigationControl({
    showCompass: false,
  })
  map.addControl(nav, 'top-left')

  // Change the cursor to a pointer when the it enters a feature in the 'circle' layer.
  map.on('mouseenter', ['cafes-bars', 'parks-plazas', 'historic-monuments', 'transit', 'food'], () => {
    map.getCanvas().style.cursor = 'pointer'
  })
  
  // Change it back to a pointer when it leaves.
  map.on('mouseleave', ['cafes-bars', 'parks-plazas', 'historic-monuments', 'transit', 'food'], () => {
    map.getCanvas().style.cursor = ''
  })

  map.on('click', ['cafes-bars', 'parks-plazas', 'historic-monuments', 'transit', 'food'], (e) => {
    map.flyTo({
      center: e.features[0].geometry.coordinates,
      zoom: 13,
    })
  })

  // Create a popup, but don't add it to the map yet.
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  map.on('mouseenter', ['cafes-bars', 'parks-plazas', 'historic-monuments', 'transit', 'food'], (e) => {

    let currentZoom = map.getZoom()
    if (currentZoom >= 13) {
      // Copy coordinates array.
      const coordinates = e.features[0].geometry.coordinates.slice();
      const description = e.features[0].properties.title;
      
      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      
      // Populate the popup and set its coordinates
      // based on the feature found.
      popup.setLngLat(coordinates).setHTML(description).addTo(map);
    }
  });
  map.on('mouseleave', ['cafes-bars', 'parks-plazas', 'historic-monuments', 'transit', 'food'], () => {
    popup.remove();
  });

  map.on('idle', () => {
    // If these layers were not added to the map, abort
    if (
      !map.getLayer('cafes-bars') 
      || !map.getLayer('historic-monuments') 
      || !map.getLayer('transit')
      || !map.getLayer('parks-plazas')
      || !map.getLayer('food')
    ) {
      return;
    }

    // Enumerate ids of the layers.
    const toggleableLayerIds = ['food', 'cafes-bars', 'parks-plazas', 'historic-monuments', 'transit']
    // Set up the corresponding toggle button for each layer.
    for (const id of toggleableLayerIds) {
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
      
      const layers = document.querySelector('[data-attr="foursquare"]');
      layers.appendChild(link);
    }
  })
  resetZoom(map, zoom)
}

function createTypeButtons(map, placeTypes) {
  map.on('idle', () => {

    // create array from Set passed from placeTypes
    const typeArr = Array.from(placeTypes)
    // If these layers were not added to the map, abort
    if (typeArr.some(layer => !map.getLayer(layer))) {return}

    // For each Place Type create a button
    for (const id of typeArr) {
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
      
      const layers = document.querySelector('[data-cat="true"]')
      layers.appendChild(link);
    }
  })
}

// part of resetting to bounding box, needs to be fixed
// function addResetZoomControl(map, bounds) {
//   const resetZoom = new ResetZoom(bounds);
//   map.addControl(resetZoom, 'top-left');
// }

class ResetZoom {
  // for resetting to bounding box, needs to be fixed
  // constructor(bounds) {
  //   this.bounds = bounds;
  //   console.log('this.bounds: ', this.bounds)
  // }
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

    // Trying to reset to bounding box for pre-zoomed maps, come back to fix sometime
    // if (this.bounds) {
    //   this._btn.onclick = function(e) {
    //     map.fitBounds(this.bounds, {padding: 20, animate: false});
    //   }
    // } else {
    //   this._btn.onclick = function(e) {
    //     map.flyTo({
    //       zoom: 1
    //     })
    //   }
    // }

    // once above is working remove this
    this._btn.onclick = function(e) {
      map.flyTo({
        zoom: 1
      })
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