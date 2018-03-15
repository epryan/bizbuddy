var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 47.52593, lng: -122.226932},
    zoom: 10
  });
}
