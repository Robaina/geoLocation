let map, current_marker, circle;

function initializeMap() {

  map = L.map('map', {
    minZoom: 14.5,
    zoomSnap: 0.1
  });
  let loc_coords = Object.entries(data).map(entry => entry[1].coords);
  let map_center = L.polygon(loc_coords).getBounds().getCenter();
  map.setView(map_center, 14.4);

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
    data[loc].showed = false;
    L.marker(data[loc].coords, {icon: greenIcon}).addTo(map);
  }

  map.locate({
    setView: false,
    minZoom: 14.5,
    watch: true,
    enableHighAccuracy: true
  });
  map.on('locationfound', updateMap);

  // Create text divs
  // let text_container = document.getElementById("text_container");
  // for (let loc of Object.keys(data)) {
  //   data[loc].showed = false;
  //   let div = document.createElement("div");
  //   div.setAttribute("class", "text-popup");
  //   div.setAttribute("id", loc);
  //   let title = document.createElement("h2");
  //   title.setAttribute("class", "text-title");
  //   title.innerHTML = data[loc].tag;
  //   div.appendChild(title);
  //   let img = document.createElement("img");
  //   img.setAttribute("class", "text-image");
  //   img.setAttribute("src", `images/${data[loc].img}`);
  //   div.appendChild(img);
  //   let p = document.createElement("p");
  //   p.innerHTML = data[loc].text;
  //   div.appendChild(p);
  //   text_container.appendChild(div);
  // }
  buildTextGrid();
}

function displayText(loc) {
  let div = document.getElementById("text_container");
  div.innerHTML = "";
  let title = document.createElement("h2");
  title.setAttribute("class", "text-title");
  title.innerHTML = data[loc].tag;
  div.appendChild(title);
  let img = document.createElement("img");
  img.setAttribute("class", "text-image");
  img.setAttribute("src", `images/${data[loc].img}`);
  div.appendChild(img);
  let p = document.createElement("p");
  p.innerHTML = data[loc].text;
  div.appendChild(p);
}

function updateMap(pos) {
  let accuracy_radius = pos.accuracy / 2; // meters
  let dist_limit = 30; // meters
  if (accuracy_radius < 100) {
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
      if (distance < dist_limit) {
        displayText(loc);
        if (!data[loc].showed) {
          // navigator.vibrate([200, 100, 200]);
        }
        data[loc].showed = true;
      }
    }
  }
}


// function displayText(current_coords, radius) {
//   let limit = 300000; // meters
//   let text_divs = document.getElementsByClassName("text-popup");
//   for (let text of text_divs) {
//     text.style.display = "none";
//   }
//
//   for (let loc of Object.keys(data)) {
//     // let distance = haversine(current_coords, data[loc].coords);
//     let distance = map.distance(current_coords, data[loc].coords);
//     if (distance < limit) {
//     // if ((distance - radius) < limit) {
//       if (!data[loc].showed) {
//         // navigator.vibrate([200, 100, 200]);
//       }
//       let div = document.getElementById(loc);
//       div.style.display = "block";
//       data[loc].showed = true;
//
//     }
//   }
// }

function openCollectedText(elem) {
  let loc = elem.target.id.split("_").pop();
  if (data[loc].showed) {
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
