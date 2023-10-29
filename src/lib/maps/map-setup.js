import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import * as helpers from './map-helpers'
import * as convertMap from './map-convert-data'
import { addMapboxCountries } from './map-add-data'
import * as fsq from './foursquare'

const MB_TOKEN = import.meta.env.PUBLIC_MAPBOX_TOKEN
mapboxgl.accessToken = MB_TOKEN

export async function orchestrate(mapID, mapLayers, hasTypes, mapZoom, countries, cities, locations) {
  const map = await initializeMap(mapID)
  await mapInteractivity(map, mapLayers, mapZoom)

  if (mapLayers.includes('countries')) {
    await addMapboxCountries(countries, map)
  }
  if (mapLayers.includes('cities')) {
    await convertMap.convertCities(cities, map)
  }
  if (mapLayers.includes('places')) {
    if (hasTypes == 'true') {
      await convertMap.convertPlaceTypes(locations, map, mapZoom, mapLayers)
    } else {
      await convertMap.convertPlaces(locations, map, mapZoom)
    }
  }
}

// temp to get 4sq working, come back to fold into main orchestrate
export async function orchestrateFoursquare(mapID, newShops, newTransit, newOutdoors, newFood, newHist) {
  const map = await initializeMap(mapID)
  //await mapInteractivity(map)

  await checkinInteractivity(map)
  await fsq.addShopCheckins2022(newShops, map)
  await fsq.addTransitCheckins2022(newTransit, map)
  await fsq.addOutdoorCheckins2022(newOutdoors, map)
  await fsq.addFoodCheckins2022(newFood, map)
  await fsq.addHistoricCheckins2022(newHist, map)
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

  helpers.cursorChange(map, layers)
  helpers.countryClick(map)
  helpers.cityClick(map)
  helpers.resetZoom(map, zoom)
  placePopup(map, layers)
}

export function setUpBBox(map,layers) {
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
    })
  })
}

export function placePopup(map, layers) {
  // Create a popup, but don't add it to the map yet.
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    closeOnMove: true,
    className: 'map-popup',
  });

  map.on('mouseenter', layers, (e) => {
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
  map.on('mouseleave', layers, () => {
    popup.remove();
  });
}

export function checkinInteractivity(map, zoom) {
  const nav = new mapboxgl.NavigationControl({
    showCompass: false,
  })
  map.addControl(nav, 'top-left')
  helpers.resetZoom(map, zoom)

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
    const toggleableLayerIds = ['food', 'cafes-bars', 'parks-plazas', 'historic-monuments', 'transit']
    // If these layers were not added to the map, abort
    // if (
    //   !map.getLayer('cafes-bars') 
    //   || !map.getLayer('historic-monuments') 
    //   || !map.getLayer('transit')
    //   || !map.getLayer('parks-plazas')
    //   || !map.getLayer('food')
    // ) {
    //   return;
    // }
    if (toggleableLayerIds.some(layer => !map.getLayer(layer))) {return}

    // Enumerate ids of the layers.
    
    // Set up the corresponding toggle button for each layer.
    for (const id of toggleableLayerIds) {
      // Skip layers that already have a button set up.
      if (document.getElementById(id)) {
        continue;
      }
      
      // Create a link.
      const link = document.createElement('button');
      link.id = id;
      link.textContent = helpers.mapButtons(id);
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
}