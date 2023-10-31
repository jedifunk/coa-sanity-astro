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
    await convertMap.convertPlaceTypes(locations, map, mapZoom, mapLayers)
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

        // save bounds as JSON string to sessionStorage for later use by ResetZoom
        sessionStorage.setItem('bounds', JSON.stringify(bounds))

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
      const favorite = e.features[0].properties.favorite == true ? `<div class="favorite"><svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.322 2.923c.126-.259.39-.423.678-.423.289 0 .552.164.678.423.974 1.998 2.65 5.44 2.65 5.44s3.811.524 6.022.829c.403.055.65.396.65.747 0 .19-.072.383-.231.536-1.61 1.538-4.382 4.191-4.382 4.191s.677 3.767 1.069 5.952c.083.462-.275.882-.742.882-.122 0-.244-.029-.355-.089-1.968-1.048-5.359-2.851-5.359-2.851s-3.391 1.803-5.359 2.851c-.111.06-.234.089-.356.089-.465 0-.825-.421-.741-.882.393-2.185 1.07-5.952 1.07-5.952s-2.773-2.653-4.382-4.191c-.16-.153-.232-.346-.232-.535 0-.352.249-.694.651-.748 2.211-.305 6.021-.829 6.021-.829s1.677-3.442 2.65-5.44z" fill-rule="nonzero"/></svg></div>` : '';
      const header = `<header><div><b>${e.features[0].properties.name}</b></div>${favorite}</header>`;
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