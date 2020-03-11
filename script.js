let map, current_marker, circle;

// function initialize() {
//   navigator.geolocation.getCurrentPosition(function(pos) {
//     let latitude = pos.coords.latitude;
//     let longitude = pos.coords.longitude;
//     let radius = pos.coords.accuracy;
//     renderMap(latitude, longitude, radius);
//
//     // let locate_options = {
//     //   "watch": true,
//     //   "setView": true,
//     //   "enableHighAccuracy": true
//     // }
//     // map.locate(locate_options);
//
//
//     displayText(latitude, longitude, radius);
//    }
//   );
//
//
//   let text_container = document.getElementById("text_container");
//   for (let key of Object.keys(data)) {
//     data[key].showed = false;
//     let div = document.createElement("div");
//     div.setAttribute("class", "text-popup");
//     div.setAttribute("id", key);
//     let title = document.createElement("h2");
//     title.setAttribute("class", "text-title");
//     title.innerHTML = data[key].tag;
//     div.appendChild(title);
//     let img = document.createElement("img");
//     img.setAttribute("class", "text-image");
//     img.setAttribute("src", data[key].img);
//     div.appendChild(img);
//     let p = document.createElement("p");
//     p.innerHTML = data[key].text;
//     div.appendChild(p);
//     text_container.appendChild(div);
//   }
// }


// function initialize() {
//
//   if (navigator.geolocation) {
//     navigator.geolocation.watchPosition(function(pos){
//       let latitude = pos.coords.latitude;
//       let longitude = pos.coords.longitude;
//       let radius = pos.coords.accuracy;
//       renderMap(latitude, longitude, radius);
//       displayText(latitude, longitude, radius);
//     });
//   } else {
//     alert("Geolocation is not supported by this browser.");
//   }
//
//   let text_container = document.getElementById("text_container");
//   for (let key of Object.keys(data)) {
//     data[key].showed = false;
//     let div = document.createElement("div");
//     div.setAttribute("class", "text-popup");
//     div.setAttribute("id", key);
//     let title = document.createElement("h2");
//     title.setAttribute("class", "text-title");
//     title.innerHTML = data[key].tag;
//     div.appendChild(title);
//     let img = document.createElement("img");
//     img.setAttribute("class", "text-image");
//     img.setAttribute("src", data[key].img);
//     div.appendChild(img);
//     let p = document.createElement("p");
//     p.innerHTML = data[key].text;
//     div.appendChild(p);
//     text_container.appendChild(div);
//   }
// }

function initializeMap() {

  map = L.map('map');

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  current_marker = L.marker([0, 0]).addTo(map);
  circle = L.circle([0, 0], {radius: 1}).addTo(map);

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

  map.locate({
    setView: false,
    maxZoom: 16,
    watch: true,
    enableHighAccuracy: true
  });
  map.on('locationfound', updateMap);

  // Create text divs
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

// function updateMap() {
//   navigator.geolocation.getCurrentPosition(function(pos) {
//
//     let latitude = pos.coords.latitude;
//     let longitude = pos.coords.longitude;
//     let radius = pos.coords.accuracy;
//     map.removeLayer(current_marker);
//     map.removeLayer(circle);
//
//     current_marker = L.marker([latitude, longitude]).addTo(map);
//     circle = L.circle([latitude, longitude], {radius: radius}, {
//         color: 'blue',
//         fillColor: 'rgb(86, 155, 227)',
//         fillOpacity: 0.5
//       }).addTo(map);
//
//     map.setView([latitude, longitude], 18);
//     displayText(latitude, longitude, radius);
//    }
//  );
// }

function updateMap(pos) {
  // console.log(pos.latlng);
  let radius = pos.accuracy / 2;
  map.removeLayer(current_marker);
  map.removeLayer(circle);

  current_marker = L.marker(pos.latlng).addTo(map);
  circle = L.circle(pos.latlng, {radius: radius}, {
  		color: 'blue',
  		fillColor: 'rgb(86, 155, 227)',
  		fillOpacity: 0.5
  	}).addTo(map);
  // map.setView(pos.latlng, 16);
  displayText(pos.latlng, radius);
}

// function UpdateLocation() {
//   if (navigator.geolocation) {
//     navigator.geolocation.watchPosition(updateMap);
//   } else {
//     x.innerHTML = "Geolocation is not supported by this browser.";
//   }
// }

function displayText(current_coords, radius) {
  let limit = 30; // meters
  let texts = document.getElementsByClassName("text-popup");
  for (let text of texts) {
    text.style.display = "none";
  }

  for (let key of Object.keys(data)) {
    // let distance = haversine(current_coords, data[key].coords);
    let distance = map.distance(current_coords, data[key].coords);
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

// function euclidean(x, y) {
//   return Math.sqrt((x[0] - y[0])**2 + (x[1] - y[1])**2)
// }

// function toRadians(degrees) {
//   return degrees * (Math.PI / 180);
// }
//
// function haversine(x, y) {
//   let R = 6371e3; // metres
//   let lat1 = x[0];
//   let lat2 = y[0];
//   let lon1 = x[1];
//   let lon2 = y[1];
//   let φ1 = toRadians(lat1);
//   let φ2 = toRadians(lat2);
//   let Δφ = toRadians(lat2 - lat1);
//   let Δλ = toRadians(lon2 - lon1);
//
//   let a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//           Math.cos(φ1) * Math.cos(φ2) *
//           Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//   let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   let distance_in_meters = R * c;
//   return distance_in_meters
// }

//setInterval(function(){ updateMap(); }, 5 * 1000);
