var xhr; // XML HTTP Request;
var storeData;
var storeMarkers = [];

const load = () => {
  xhr = new XMLHttpRequest();

  if(!xhr) {
    alert('Couldn\'t create XHR Object');
    return false;
  }
  // XHR ReadyState
    /*
        0 request not initialized
        1 Server connected
        2 Request received by Server
        3 Server is processing
        4 Request finished or response is ready with Browser
    */
    xhr.onreadystatechange = renderContent;
    xhr.open('GET', '../store_discounts.json');
    xhr.send();

    function renderContent() {
        console.log(xhr.readyState);
        if(xhr.readyState === 4) {
            console.log('Received the data');
            if(xhr.status === 200) {
                // console.log(typeof xhr.responseText);
                // console.log(typeof JSON.parse(xhr.responseText));
                storeData = JSON.parse(xhr.responseText).storesNearMe;
                console.log(storeData);
            } else {
                console.error('Problem making AJAX request');
            }
        }
    }
}
window.onload = load;

document.getElementById('radius').addEventListener('change', getStores);
document.getElementById('category').addEventListener('input', getStores);

/***
 * 
 * getStores function is to plot the store marker accordingly, 
 * as per the retrieved form values of type radius and category selected by the user.
 *  
 ***/
function getStores() {
  if (storeMarkers !== null){
      for(var point of storeMarkers) {
          point.remove();
      }
  }
  if (map.getSource('route')) {
    map.removeLayer('route');
    map.removeSource('route');
  }
  let radius = document.getElementById('radius').value;
  let categoryData = document.getElementById('category').value;
  if(storeData) {
    var storesCount = 0;
    for (const {name, discount, coords, category} of storeData) {
      let distance = getDistanceFromLatLonInKm(currentLat, currentLng, coords.lat, coords.lng);
      if(distance < radius) {
        if(categoryData === 'All' || category===categoryData){
          storesCount++;
          // create a HTML element for each store
          const sl = document.createElement('div');
          sl.className = category;
          sl.tabIndex = 0;
          // make a marker for each feature and add it to the map
          var oneMarker = new mapboxgl.Marker(sl).setLngLat([coords.lng, coords.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
          .setHTML(`<div>
                      <h3>${name}</h3>
                      <p>${discount} Discount</p>
                      <button onclick="drawRoute(this.nextElementSibling.textContent)">Route</button>
                      <span style="display:none">${coords.lat}_${coords.lng}</span>
                  </div>`)
          ).addTo(map);
          storeMarkers.push(oneMarker);
        }
      }
    }
    if(storesCount === 0) {
      alert(`No Stores Available for ${categoryData} category !...`);
    }
  }
}

function drawRoute(coords){
  let coordinates = coords.split("_");
  let storeLat = parseFloat(coordinates[0]);
  let storeLng = parseFloat(coordinates[1]);
  let start = [currentLng, currentLat];
  let end = [storeLng, storeLat];
  getRoute(end);

      // create a function to make a directions request
    async function getRoute(end) {
      // make a directions request using cycling profile
      // an arbitrary start will always be the same
      // only the end or destination will change
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
        { method: 'GET' }
      );
      const json = await query.json();
      const data = json.routes[0];
      const route = data.geometry.coordinates;
      const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route
        }
      };
      // if the route already exists on the map, we'll reset it using setData
      if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
      }
      // otherwise, we'll make a new request
      else {
        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: geojson
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      }
    }
}