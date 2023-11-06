import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import * as helpers from './map-helpers'
import * as convertMap from './map-convert-data'
import { addMapboxCountries } from './map-add-data'
import * as fsq from './foursquare'

const MB_TOKEN = import.meta.env.PUBLIC_MAPBOX_TOKEN
mapboxgl.accessToken = MB_TOKEN

export async function orchestrate(mapID, mapLayers, mapZoom, countries, cities, locations, customQuery) {
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
  if (customQuery) {
    await convertMap.convertQuery(customQuery, map, mapZoom)
  }
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
  helpers.placePopup(map, layers)
}

// temp to get 4sq working, come back to fold into main orchestrate
export async function orchestrateFoursquare(mapID, newShops, newTransit, newOutdoors, newFood, newHist) {
  const map = await initializeMap(mapID)
  await checkinInteractivity(map)

  await fsq.addShopCheckins2022(newShops, map)
  await fsq.addTransitCheckins2022(newTransit, map)
  await fsq.addOutdoorCheckins2022(newOutdoors, map)
  await fsq.addFoodCheckins2022(newFood, map)
  await fsq.addHistoricCheckins2022(newHist, map)
}
// temp to get 4sq working
export function checkinInteractivity(map, zoom) {
  const nav = new mapboxgl.NavigationControl({
    showCompass: false,
  })
  map.addControl(nav, 'top-left')
  helpers.resetZoom(map, zoom)

  const layers = ['food', 'cafes-bars', 'parks-plazas', 'historic-monuments', 'transit']
  helpers.cursorChange(map, layers)
  helpers.layerClick(map, layers)
  helpers.placePopup(map, layers)
  helpers.createTypeButtons(map, layers)
}