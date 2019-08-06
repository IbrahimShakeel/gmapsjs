
var map;

//Map style sourced from Snazzy Maps. https://snazzymaps.com/
var snazzy = [{"featureType":"water","stylers":[{"saturation":43},{"lightness":-11},{"hue":"#0088ff"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"hue":"#ff0000"},{"saturation":-100},{"lightness":99}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#808080"},{"lightness":54}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ece2d9"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#ccdca1"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#767676"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#b8cb93"}]},{"featureType":"poi.park","stylers":[{"visibility":"on"}]},{"featureType":"poi.sports_complex","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","stylers":[{"visibility":"simplified"}]}];
// Latitude and longitude to Male', Maldives adjusted to center the gold star to Male' Maldives.
var maldivesLatLng = {lat: 0.155496, lng: 73.509347};

function initialize() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    styles: snazzy,
    center: new google.maps.LatLng(5.175496, 76.509347), // Lat has been adjusted by 1.0 points to make sure Indonesia is
                                                        //visible on the screen when Maldives is on center(ish) of the screen
    mapTypeId: google.maps.MapTypeId.TERRAIN //becuase I like terrain view.
  });

  //Star has been copied from Google https://developers.google.com/maps/documentation/javascript/examples/icon-complex
  // or you could completely remove this part and use an actual image or icon marking the maldives.
  // On a totally serious note, I am actually marking Maldives because it is too small to see when the map is zoomed out -_-
  var mordisStar = {
    path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
    fillColor: 'gold',
    fillOpacity: 0.8,
    scale: 0.08,
    strokeColor: 'gold',
    strokeWeight: 2
  };

  var maldives = new google.maps.Marker({
    position: maldivesLatLng,
    animation: google.maps.Animation.DROP,
    draggable: false,
    map: map,
    icon: mordisStar
  });

  // Setting the USGS URL as the source.
  var usgsFeed = document.createElement('script');
  // Refer to http://earthquake.usgs.gov/fdsnws/event/1/ for more information on the data Feeds from USGS
  usgsFeed.src = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojsonp';
  document.getElementsByTagName('head')[0].appendChild(usgsFeed);
} 

var infowindow = new google.maps.InfoWindow({
  // just a placeholder in case something happens...
  content: "Sorry dude. I couldn't find any data"
});

// callback function from the jsonp source
window.eqfeed_callback = function(results) {
  var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';/* used to label the events such that it shows which is the oldest. 
  This is assuming something really bad doesn't happen to earth because we'll be in deep trouble if there were more 
  than 26 huge earthquakes in one day :( */
  var labelIndex = 0; // index to lable the markers

  // Do I need to explain this stuff?
  for (var i = 0; i < results.features.length; i++) {
    var coordinates = results.features[i].geometry.coordinates;
    var latLng = new google.maps.LatLng(coordinates[1],coordinates[0]);

    var marker = new google.maps.Marker({
      position: latLng,
      map: map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        strokeWeight: 0,
        strokeColor: '#fff',
        fillColor: '#fff',
        fillOpacity: 0.02,
        scale: Math.exp(results.features[i].properties.mag , 2)
      },
      label: labels[labelIndex++ % labels.length],
      zIndex: Math.floor(results.features[i].properties.mag )
    });

    // event properties / details for infowindow
    var props = "<b>Place: </b>" + results.features[i].properties.place + "</br>" +
    "<b>Magnitude: </b>" + results.features[i].properties.mag +  "</br>" +
    "<b>Status: </b>" + results.features[i].properties.status +  "</br>" +
    "<b>Tsunami: </b>" + results.features[i].properties.tsunami +  "</br>" +
    "<b>Depth: </b>" + results.features[i].geometry.Depth +  "</br>" +
    "<b>Mag Type: </b>" + results.features[i].properties.magType +  "</br>" +
    "<b>Felt: </b>" + results.features[i].properties.felt +  "</br>" +
    "<b>Date / Time: </b>" + new Date(parseInt(results.features[i].properties.time)) +  "</br>" +
    "<b>Last Updated: </b>" + new Date(parseInt(results.features[i].properties.updated)) +  "</br>" +
    "<b>Data Source: </b>" + "<a href=" + results.features[i].properties.url + "> USGS Earthquake Hazards Program </a>" +  "</br>"
    ;
    // stupid closure taking up all my life
    bindInfoWindow(marker, map, infowindow, props, latLng, results.features[i].properties.mag);
  }
}

/* Even a petty little map needs "closure" to move on from something */
function bindInfoWindow(marker, map, infowindow, description, latlng, mag) {
  marker.addListener('click', function() {
      infowindow.setContent(description);
      infowindow.open(map, marker);
  });

  /* marker colors:
  Green (RGB [50, 205, 50]) for earthquakes for Magnitude 1.0
  Crimson (Red) (RGB [185, 20, 60]) for earthquakes of Magnitude 7.0 or higer
  Anything in between 1.0  and 7.0 will be be calculted using an interpolate function
  */
  var low = [50, 205, 50];
  var high = [185, 20, 60];
  var minMag = 2.5;
  var maxMag = 7.0;

  // color interpolate function copied from Google API documentation
  
  var fraction = (Math.min(mag, maxMag) - minMag) / (maxMag - minMag);
  var color = interpolateHsl(low, high, fraction);
  function interpolateHsl(lowHsl, highHsl, fraction) {
      var color = [];
      for (var i = 0; i < 3; i++) {
        // Calculate color based on the fraction.
        color[i] = (highHsl[i] - lowHsl[i]) * fraction + lowHsl[i];
      }

      return 'hsl(' + color[0] + ',' + color[1] + '%,' + color[2] + '%)';
    }

  // WARNING!!!!!! This is not the actual radius of the impact zone, and I have no idea how to get that data
  var epicCenter = new google.maps.Circle({
    strokeColor: color,
    strokeOpacity: 0.85,
    strokeWeight: 1,
    fillColor: color,
    fillOpacity: 0.55,
    map: map,
    center: latlng,
    // the higher the Magnitude, the bigger the radius. That's all I can do for now.. sorry.
    radius: mag * 45000
  });
}
google.maps.event.addDomListener(window, 'load', initialize)
