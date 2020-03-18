let map, current_marker, circle;
let text_on_display = {};
let text_showed = {};
let markers = {};
const min_zoom = 14.5;


function initializeIntro() {
  let title_div = document.getElementById("title");
  title_div.innerHTML = `<h1>${data.title}</h1>`;
}

function openMenuSlider() {
  let menu_container = document.getElementById("menu_slider_container");
  menu_container.style["max-height"] = "40vh";
  let map_container = document.getElementById("map_container");
  map_container.style.height = "60vh";
  map.invalidateSize();
  let menu_buttons = document.getElementsByClassName("menu_button");
  for (let button of menu_buttons) {
    button.style.display = "inline-block";
  }
}

function closeMenuSlider() {
  let menu_container = document.getElementById("menu_slider_container");
  menu_container.style["max-height"] = "0vh";
  let map_container = document.getElementById("map_container");
  map_container.style.height = "100vh";
  map.invalidateSize();
  let menu_buttons = document.getElementsByClassName("menu_button");
  for (let button of menu_buttons) {
    button.style.display = "none";
  }
}

function displayAboutContainer() {
  let about_container = document.getElementById("about_container");
  about_container.style.display = "block";
  about_container.getElementsByTagName("article")[0].innerHTML = data.about;
}

function closeAboutContainer() {
  let about_container = document.getElementById("about_container");
  about_container.style.display = "none";
}

function closeTextContainer() {
  let loc_text_container = document.getElementById("loc_text_container");
  loc_text_container.style.display = "none";
  // let map_container = document.getElementById("map_container");
  // map_container.style.display = "block";
  hideText();
}

function displayTextContainer(loc) {
  let loc_text_container = document.getElementById("loc_text_container");
  loc_text_container.style.display = "block";
  // let map_container = document.getElementById("map_container");
  // map_container.style.display = "none";
  displayText(loc);
}

function closeTextGrid() {
  let text_grid_container = document.getElementById("text_grid_container");
  text_grid_container.style.display = "none";
  // let map_container = document.getElementById("map_container");
  // map_container.style.display = "block";
}

function displayTextGrid() {
  let text_grid_container = document.getElementById("text_grid_container");
  text_grid_container.style.display = "block";
  // let map_container = document.getElementById("map_container");
  // map_container.style.display = "none";
}

function openFullscreen() {
  let elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
}

function startGame() {
  openFullscreen();
  let intro_screen = document.getElementById("intro_screen");
  intro_screen.style.display = "none";
  let map_container = document.getElementById("map_container");
  map_container.style.display = "block";
  let menu = document.getElementById("circle_menu");
  menu.style.display = "block";
  initializeMap();
  buildTextGrid();
  if ("visited_places" in localStorage) {
    rememberVisitedPlaces();
  }
  updateVisitedPlaces();
}

function initializeMap() {
  const icons = {};
  map = L.map('map', {
    minZoom: min_zoom,
    zoomSnap: 0.1,
    zoomControl: false
  });
  new L.Control.Zoom({ position: 'topright' }).addTo(map);

  let loc_coords = Object.entries(data.loc_data).map(entry => entry[1].coords);
  let map_center = L.polygon(loc_coords).getBounds().getCenter();
  map.setView(map_center, min_zoom + 0.1);
  map.setMaxBounds(map.getBounds());

  let tile_urls = {
    regular: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    elegant: "https://d1jq292z4qvv72.cloudfront.net/osm/{z}/{x}/{y}.png",
    blackandwhite: "http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
  }

  L.tileLayer(tile_urls.blackandwhite, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);



  current_marker = L.marker([0, 0]).addTo(map);
  circle = L.circle([0, 0], {radius: 1}).addTo(map);

  // let greenIcon = new L.Icon({
  //   iconUrl: 'images/green_marker.png',
  //   shadowUrl: 'images/marker-shadow.png',
  //   iconSize: [25, 41],
  //   iconAnchor: [12, 41],
  //   popupAnchor: [1, -34],
  //   shadowSize: [41, 41]
  // });

  for (let loc of Object.keys(data.loc_data)) {

    let icon = new L.Icon({
      iconUrl: `images/${data.loc_data[loc].img}`,
      shadowUrl: 'images/marker-shadow.png',
      iconSize: [25, 30],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    text_showed[loc] = false;
    text_on_display[loc] = false;
    markers[loc] = L.marker(data.loc_data[loc].coords, {icon: icon}).addTo(map);
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
}

function hideText() {
  let div = document.getElementById("loc_text_div");
  div.innerHTML = "";
}

function displayText(loc) {
  let div = document.getElementById("loc_text_div");
  div.innerHTML = "";
  let title = document.createElement("h2");
  title.setAttribute("class", "text_title");
  title.innerHTML = data.loc_data[loc].tag;
  div.appendChild(title);
  let img = document.createElement("img");
  img.setAttribute("class", "text_image");
  img.setAttribute("src", `images/${data.loc_data[loc].img}`);
  div.appendChild(img);
  let text = document.createElement("div");
  text.innerHTML = data.loc_data[loc].text;
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
  if (accuracy_radius < 10000) {

    map.removeLayer(current_marker);
    map.removeLayer(circle);
    current_marker = L.marker(pos.latlng).addTo(map);
    circle = L.circle(pos.latlng, {radius: accuracy_radius}, {
        color: 'blue',
        fillColor: 'rgb(86, 155, 227)',
        fillOpacity: 0.5
      }).addTo(map);

    for (let loc of Object.keys(data.loc_data)) {

      let distance = map.distance(pos.latlng, data.loc_data[loc].coords);
      if (distance < dist_limit && !text_on_display[loc]) {

        // displayText(loc);

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
  updateVisitedPlaces();
}

function rememberVisitedPlaces() {
  let visited_places = localStorage.getItem("visited_places").split(",");
  for (let loc of visited_places) {
    text_showed[loc] = true;
  }
  updateVisitedPlaces();
}

function updateVisitedPlaces() {
  for (let loc of Object.keys(text_showed)) {
    if (text_showed[loc]) {
      // markers[loc]._icon.style["filter"] = "grayscale(0%)";
      markers[loc]._icon.classList.add("selected_icon");
      markers[loc]._icon.classList.remove("unselected_icon");
      let grid_item = document.getElementById(`grid_item_${loc}`);
      grid_item.classList.add("active_grid_item");
      let lock_img = grid_item.firstElementChild;
      lock_img.style.display = "none";
    } else {
      // markers[loc]._icon.style["filter"] = "grayscale(100%)";
      markers[loc]._icon.classList.add("unselected_icon");
      markers[loc]._icon.classList.remove("selected_icon");
      let grid_item = document.getElementById(`grid_item_${loc}`);
      grid_item.classList.remove("active_grid_item");
      let lock_img = grid_item.firstElementChild;
      lock_img.style.display = "block";
    }
  }
}

function forgetVisitedPlaces() {
  localStorage.removeItem("visited_places");
  for (let loc of Object.keys(text_showed)) {
    text_showed[loc] = false;
    markers[loc]._icon.classList.remove("selected_icon");
  }
  hideText(); // may be uneeded
  updateVisitedPlaces();
}

function openCollectedText(elem) {
  let loc = elem.target.id.split("_").pop();
  if (text_showed[loc]) {
    displayTextContainer(loc);
  }
}

function buildTextGrid() {
  let grid = document.getElementById("text_grid");
  for (let loc of Object.keys(data.loc_data)) {
    let grid_item = document.createElement("div");
    grid_item.setAttribute("class", "grid_item");
    grid_item.setAttribute("id", `grid_item_${loc}`);
    grid_item.setAttribute("name", loc);
    grid_item.style["background-image"] = `url(images/${data.loc_data[loc].img})`;
    grid_item.addEventListener("click", openCollectedText);
    let img = document.createElement("img");
    img.setAttribute("class", "grid_lock_image");
    img.setAttribute("src", "images/lock.png");
    grid_item.appendChild(img);
    grid.appendChild(grid_item);
  }
}
