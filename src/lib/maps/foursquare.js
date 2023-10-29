import { mapButtons } from "./map-helpers"

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
export function checkinInteractivity(map, zoom) {
  // const nav = new mapboxgl.NavigationControl({
  //   showCompass: false,
  // })
  // map.addControl(nav, 'top-left')

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
  // const popup = new mapboxgl.Popup({
  //   closeButton: false,
  //   closeOnClick: false
  // });

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
  //resetZoom(map, zoom)
}