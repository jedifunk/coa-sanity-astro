import mapboxgl, { LngLatBounds } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const MB_TOKEN = import.meta.env.PUBLIC_MAPBOX_TOKEN
mapboxgl.accessToken = MB_TOKEN

export async function initializeMap() {
  return new Promise(resolve => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      zoom: 1
    });

    map.on('load', () => resolve(map));
  });
}

export async function mapInteractivity(map) {
  const nav = new mapboxgl.NavigationControl({
    showCompass: false,
  })
  map.addControl(nav, 'top-left')

  // Change the cursor to a pointer when the it enters a feature in the 'circle' layer.
  map.on('mouseenter', ['countries', 'cities', 'places'], () => {
    map.getCanvas().style.cursor = 'pointer'
  })
  
  // Change it back to a pointer when it leaves.
  map.on('mouseleave', ['countries', 'cities', 'places'], () => {
    map.getCanvas().style.cursor = ''
  })

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

  map.on('click', ['cities'], (e) => {
    var currentZoom = map.getZoom()
    const pointData = JSON.parse(e.features[0].properties.box)

    if (currentZoom >= 5) {
      map.fitBounds(pointData)     
    }
  })

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
      const description = e.features[0].properties.description != null ? `<p>${e.features[0].properties.description}</p>` : '';
      const content = `<b>${e.features[0].properties.name}</b>${description}`

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

  // Reset Zoom level
  const resetZoom = document.createElement('button')
  resetZoom.id = 'reset'
  resetZoom.textContent = 'Reset Zoom'
  resetZoom.className = 'pill pill-dark'
  resetZoom.onclick = function(e) {
    map.flyTo({
      zoom: 1
    })
  }
  document.getElementById('map-toggles').appendChild(resetZoom)

}

export async function fetchCity(query) {
  try {
    const response = await fetch(query)
    const data = await response.json()

    return data
  } catch (error) {
    console.error('Error on Fetch:', error)
  }
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

export async function convertPlaces(places, map) {
  const features = []

  for (const place of places) {
    features.push({
      type: 'Feature', 
      properties: { 
        name: place.name, 
        description: place.description,
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

  await addPlaces(geojson, map)
}

export async function addPlaces(geojson, map) {

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
    layout: {
      visibility: 'visible'
    }
  })
}

export async function addCities(geojson, map) {
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