import * as helpers from './map-helpers'
import { placePopup, setUpBBox } from './map-setup'

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

export function addCities(geojson, map) {
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

export function addPlaces(geojson, map) {

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

export function addPlaceTypes(geojson, map) {
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
      layout: {
        visibility: 'visible'
      },
      minzoom: 8,
    });
  });
  const layers = Array.from(placeTypes)
  helpers.cursorChange(map, layers)
  helpers.createTypeButtons(map, layers)
  placePopup(map, layers)
}

export function addPlacesAndZoom(geojson, map) {

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

}

export function addPlaceTypesAndZoom(geojson, map) {
  // First, create a set of unique placeTypes
  const placeTypes = new Set(geojson.features.map(feature => feature.properties.placeType))

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
  const layers = Array.from(placeTypes)
  setUpBBox(map, layers)
  helpers.createTypeButtons(map, layers)
  helpers.cursorChange(map, layers)
  placePopup(map, layers)
  //helpers.zoomReset(map, layers)
}