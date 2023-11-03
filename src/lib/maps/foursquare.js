export function addTransitCheckins2022(geojson, map) {
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
export function addFoodCheckins2022(geojson, map) {
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
export function addShopCheckins2022(geojson, map) {
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
export function addOutdoorCheckins2022(geojson, map) {
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
export function addHistoricCheckins2022(geojson, map) {
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