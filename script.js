let map, current_marker, circle;

function initialize() {
  navigator.geolocation.getCurrentPosition(function(pos) {
    let latitude = pos.coords.latitude;
    let longitude = pos.coords.longitude;
    let radius = pos.coords.accuracy;
    renderMap(latitude, longitude, radius);
    displayText(latitude, longitude, radius);
   }
  );
}

function renderMap(latitude, longitude, radius) {

  map = L.map('map').setView([latitude, longitude], 20);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  current_marker = L.marker([latitude, longitude]).addTo(map);/*
      .bindPopup('You are here!.')
      .openPopup();*/

  circle = L.circle([latitude, longitude], {radius: radius}, {
  		color: 'blue',
  		fillColor: 'rgb(86, 155, 227)',
  		fillOpacity: 0.5
  	}).addTo(map);//.bindPopup("I am a circle.");

  let greenIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  for (let loc of Object.keys(data)) {
    L.marker(data[loc].coords, {icon: greenIcon}).addTo(map);
  }
}

function updateMap() {
  navigator.geolocation.getCurrentPosition(function(pos) {

    let latitude = pos.coords.latitude;
    let longitude = pos.coords.longitude;
    let radius = pos.coords.accuracy;
    map.removeLayer(current_marker);
    map.removeLayer(circle);

    current_marker = L.marker([latitude, longitude]).addTo(map);
    circle = L.circle([latitude, longitude], {radius: radius}, {
        color: 'blue',
        fillColor: 'rgb(86, 155, 227)',
        fillOpacity: 0.5
      }).addTo(map);

    displayText(latitude, longitude, radius);
   }
 );
}

function displayText(latitude, longitude, radius) {
  let limit = 50; // meters
  let current_coords = [latitude, longitude];

  let texts = document.getElementsByClassName("text-popup");
  for (let text of texts) {
    text.style.display = "none";
  }

  for (let key of Object.keys(data)) {
    let distance = haversine(current_coords, data[key].coords);
    if ((distance - radius) < limit) {
      let div = document.getElementById(key);
      div.style.display = "block";
    }
  }
}

function euclidean(x, y) {
  return Math.sqrt((x[0] - y[0])**2 + (x[1] - y[1])**2)
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function haversine(x, y) {
  let R = 6371e3; // metres
  let lat1 = x[0];
  let lat2 = y[0];
  let lon1 = x[1];
  let lon2 = y[1];
  let φ1 = toRadians(lat1);
  let φ2 = toRadians(lat2);
  let Δφ = toRadians(lat2 - lat1);
  let Δλ = toRadians(lon2 - lon1);

  let a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let distance_in_meters = R * c;
  return distance_in_meters
}

setInterval(function(){ updateMap(); }, 60 * 1000);
