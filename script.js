let map, current_marker, circle;
let text_on_display = {};
let text_showed = {};
let markers = {};

function initializeMap() {
  const icons = {};
  let min_zoom = 14.2;
  map = L.map('map', {
    minZoom: min_zoom,
    zoomSnap: 0.1
  });
  let loc_coords = Object.entries(data).map(entry => entry[1].coords);
  let map_center = L.polygon(loc_coords).getBounds().getCenter();
  map.setView(map_center, 14.1);
  map.setMaxBounds(map.getBounds());

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

    let icon = new L.Icon({
      iconUrl: `images/${data[loc].img}`,
      shadowUrl: 'images/marker-shadow.png',
      iconSize: [25, 35],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    text_showed[loc] = false;
    text_on_display[loc] = false;
    markers[loc] = L.marker(data[loc].coords, {icon: icon}).addTo(map);
    markers[loc].on("click", openCollectedText);
    markers[loc].id = `marker_${loc}`;
    // markers[loc]._icon.style.filter = "grayscale(100%)";
    markers[loc]._icon.classList.add("unselected_icon");

  }

  map.locate({
    setView: false,
    minZoom: min_zoom,
    watch: true,
    enableHighAccuracy: true
  });
  map.on('locationfound', updateMap);

  buildTextGrid();

  // Remember visited places for future sessions
  if ("visited_places" in localStorage) {
    rememberVisitedPlaces();
  }
}

function hideText() {
  let div = document.getElementById("text_div");
  div.innerHTML = "";
}

function displayText(loc) {
  let div = document.getElementById("text_div");
  div.innerHTML = "";
  let title = document.createElement("h2");
  title.setAttribute("class", "text-title");
  title.innerHTML = data[loc].tag;
  div.appendChild(title);
  let img = document.createElement("img");
  img.setAttribute("class", "text-image");
  img.setAttribute("src", `images/${data[loc].img}`);
  div.appendChild(img);
  let text = document.createElement("div");
  text.innerHTML = data[loc].text;
  div.appendChild(text);
}

function is_mobile() {
  return window.innerWidth < 600
}

function updateMap(pos) {

  if (Object.values(text_on_display).every(value => value === false)) {
    hideText();
  }

  let accuracy_radius = pos.accuracy / 2; // meters
  let dist_limit = 1500; // meters
  if (accuracy_radius < 1000000000) {

    map.removeLayer(current_marker);
    map.removeLayer(circle);
    current_marker = L.marker(pos.latlng).addTo(map);
    circle = L.circle(pos.latlng, {radius: accuracy_radius}, {
        color: 'blue',
        fillColor: 'rgb(86, 155, 227)',
        fillOpacity: 0.5
      }).addTo(map);

    for (let loc of Object.keys(data)) {

      let distance = map.distance(pos.latlng, data[loc].coords);
      if (distance < dist_limit && !text_on_display[loc]) {

        displayText(loc);

        if (is_mobile() && "vibrate" in navigator && !text_showed[loc]) {
          navigator.vibrate([200, 100, 200]);
        }

        text_showed[loc] = true;
        text_on_display[loc] = true;

       } else {
         text_on_display[loc] = false;
      }

    }
  }

  let showed_loc_str = Object.keys(text_showed).filter(key => text_showed[key]).join(",");
  localStorage.setItem("visited_places", showed_loc_str);
}

function rememberVisitedPlaces() {
  let visited_places = localStorage.getItem("visited_places").split(",");
  for (let loc of visited_places) {
    text_showed[loc] = true;
  }
  updateVisitedPlaces();
}

function updateVisitedPlaces() {
  let visited_places = Object.keys(text_showed).filter(loc => text_showed[loc]);
  for (let loc of visited_places) {
    // markers[loc]._icon.style["filter"] = "grayscale(0%)";
    markers[loc]._icon.classList.add("selected_icon");
    let grid_item = document.getElementById(`grid_item_${loc}`);
    grid_item.style.display = "flex";
  }
}

function forgetVisitedPlaces() {
  localStorage.removeItem("visited_places");
  for (let loc of Object.keys(text_showed)) {
    text_showed[loc] = false;
    markers[loc]._icon.classList.remove("selected_icon");
  }
  hideText();
  let grid_items = document.getElementsByClassName("grid_item");
  for (let item of grid_items) {
    item.style.display = "none";
  }
}

function openCollectedText(elem) {
  let loc = elem.target.id.split("_").pop();
  if (text_showed[loc]) {
    displayText(loc);
  }
}

function buildTextGrid() {
  let grid = document.getElementById("text_grid");
  for (let loc of Object.keys(data)) {
    let grid_item = document.createElement("div");
    grid_item.setAttribute("class", "grid_item");
    grid_item.setAttribute("id", `grid_item_${loc}`);
    grid_item.setAttribute("name", loc);
    grid_item.style["background-image"] = `url(images/${data[loc].img})`;
    grid_item.addEventListener("click", openCollectedText);
    grid.appendChild(grid_item);
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
