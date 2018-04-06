
//////////////////////
// GEOLOCATION WITH IP
//////////////////////

function errorFunction(){
    console.log("Geocoder failed -> Go with IP");
    $.getJSON('http://ipinfo.io', function(data){
        console.log(data.city+', '+data.country)
        console.log(data.loc.split(',')[0]);
        console.log(data.loc.split(',')[1]);
        document.getElementById('txtPlaces').value = data.city+', '+data.country;
        document.getElementById('lat').value = data.loc.split(',')[0];
        document.getElementById('lng').value = data.loc.split(',')[1];
    });
}

////////////////////////////////////////////////
// GEOLOCATION WITH HTML5 -- use localhost:port!
////////////////////////////////////////////////

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
} else {
    console.log("Geolocation is not supported by this browser.");
}
//Get the latitude and the longitude;
function successFunction(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    codeLatLng(lat, lng)
}


function initialize() {
    console.log("Initialize")
}

function codeLatLng(lat, lng) {
    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
            console.log(results[1].formatted_address+"\n"+lat+"\n"+lng)
            document.getElementById('txtPlaces').value = results[1].formatted_address;
            document.getElementById('lat').value = lat;
            document.getElementById('lng').value = lng;
        }
        } else {
        console.log("Geocoder failed due to: " + status);
        }
    });
}
