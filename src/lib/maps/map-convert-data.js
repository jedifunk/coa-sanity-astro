import * as mapAdd from './map-add-data'

export async function convertCities(cities, map, mapZoom) {
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
  //await mapAdd.addCities(geojson, map)
  if (mapZoom == 'true') {
    await mapAdd.addCitiesAndZoom(geojson, map)
  } else {
    await mapAdd.addCities(geojson, map)
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
        placeType: place.placeType && place.placeType.slug.current,
        favorite: place.favorite,
        box: [place.geometry.mapBounds.southwest, place.geometry.mapBounds.northeast] 
      }, 
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
    await mapAdd.addPlaceTypesAndZoom(geojson, map)
  } else {
    await mapAdd.addPlaceTypes(geojson, map)
  }
}

export async function convertQuery(query, map, mapZoom) {
  const features = []

// pull out the city from query, make that the click & zoom, then show places after zoom
  for (const place of query) {
    features.push({
      type: 'Feature',
      properties: { 
        name: place.name,
        description: place.description,
        website: place.website,
        placeType: place.placeType && place.placeType.slug.current,
        favorite: place.favorite,
        box: [place.geometry.mapBounds.southwest, place.geometry.mapBounds.northeast], 
      }, 
      geometry: {
        type: 'Point', 
        coordinates: [place.geometry.longitude, place.geometry.latitude]
      },
    })
  }
  const geojson = {
    type: 'FeatureCollection',
    features: features
  }

  if (mapZoom == 'true') {
    await mapAdd.addQueryAndZoom(geojson, map)
  } else {
    await mapAdd.addQuery(geojson, map)
  }
}