mapboxgl.accessToken = 'pk.eyJ1IjoidmFydW5uYWdhdmVsbGkiLCJhIjoiY2t0YmMya24zMXVuMjJ4cGV3ZXJrZjM0ayJ9.xWxORkCd9zyY1RjOpydE8Q';

let map, currentLat, currentLng;

// get location coords 
navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
    enableHighAccuracy: true
})

function successLocation(position) {
    console.log(position);
    setupMap([position.coords.longitude, position.coords.latitude]);
    currentLat = position.coords.latitude;
    currentLng = position.coords.longitude;
}

function errorLocation() {
    currentLat = 18.003715;
    currentLng = 79.5725566;
    setupMap([currentLng, currentLat])
}

function setupMap(center) {
    // Create Map
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        // style: 'mapbox://styles/mapbox/light-v10',
        center: center,
        zoom: 13
    })

    // Set marker options.
    const hl = document.createElement('div');
    hl.className = 'homeMarker';
    hl.tabIndex = 0;
    const homemarker = new mapboxgl.Marker(hl).setLngLat(center)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(`<p>Your Current Location</p>`)
    ).addTo(map);

    // Set Map controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-left');
}

 //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
 function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

// Converts numeric degrees to radian
function deg2rad(deg) {
    return deg * (Math.PI/180)
}
