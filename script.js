
navigator.geolocation.getCurrentPosition(pos => renderMap(pos));

function renderMap(pos) {
  let latitude = pos.coords.latitude;
  let longitude = pos.coords.longitude;
  let radius = pos.coords.accuracy;
  console.log(latitude, longitude);

  let map = L.map('map').setView([latitude, longitude], 20);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  L.marker([latitude, longitude]).addTo(map);/*
      .bindPopup('You are here!.')
      .openPopup();*/

  L.circle([latitude, longitude], {radius: radius}, {
  		color: 'blue',
  		fillColor: 'rgb(86, 155, 227)',
  		fillOpacity: 0.5
  	}).addTo(map);//.bindPopup("I am a circle.");
}
