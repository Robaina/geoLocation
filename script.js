let map, current_marker, circle;

function initialize() {
  navigator.geolocation.getCurrentPosition(function(pos) {
    let latitude = pos.coords.latitude;
    let longitude = pos.coords.longitude;
    let radius = pos.coords.accuracy;
    renderMap(latitude, longitude, radius);

    // let locate_options = {
    //   "watch": true,
    //   "setView": true,
    //   "enableHighAccuracy": true
    // }
    // map.locate(locate_options);


    displayText(latitude, longitude, radius);
   }
  );
  let text_container = document.getElementById("text_container");
  for (let key of Object.keys(data)) {
    data[key].showed = false;
    let div = document.createElement("div");
    div.setAttribute("class", "text-popup");
    div.setAttribute("id", key);
    let title = document.createElement("h2");
    title.setAttribute("class", "text-title");
    title.innerHTML = data[key].tag;
    div.appendChild(title);
    let img = document.createElement("img");
    img.setAttribute("class", "text-image");
    img.setAttribute("src", data[key].img);
    div.appendChild(img);
    let p = document.createElement("p");
    p.innerHTML = data[key].text;
    div.appendChild(p);
    text_container.appendChild(div);
  }
}

function renderMap(latitude, longitude, radius) {

  map = L.map('map').setView([latitude, longitude], 15);

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
    iconUrl: 'images/green_marker.png',
    shadowUrl: 'images/marker-shadow.png',
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

    map.setView([latitude, longitude], 15);
    displayText(latitude, longitude, radius);
   }
 );
}

function displayText(latitude, longitude, radius) {
  let limit = 20; // meters
  let current_coords = [latitude, longitude];

  let texts = document.getElementsByClassName("text-popup");
  for (let text of texts) {
    text.style.display = "none";
  }

  for (let key of Object.keys(data)) {
    let distance = haversine(current_coords, data[key].coords);
    if (distance < limit) {
    // if ((distance - radius) < limit) {
      if (!data[key].showed) {
        navigator.vibrate([200, 100, 200]);
      }
      let div = document.getElementById(key);
      div.style.display = "block";
      data[key].showed = true;
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

setInterval(function(){ updateMap(); }, 5 * 1000);
