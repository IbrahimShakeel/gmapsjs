# gmapsjs
A small javascript to load geojson data from USGS Earthquake Hazards Program and to display on Google Maps.
```
#Usage example on a rails app
#this is your view code 
<script src="//maps.google.com/maps/api/js?v=3.18&sensor=false&client=&key=&libraries=geometry&language=&hl=&region="></script>
<script>
    src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=visualization&callback=initMap">
</script>
<%= javascript_include_tag "gmapsjs" %>

<div style='width: 100%;'>
  <div id="map" style='width: auto; height:600px;'></div>
</div>
```
