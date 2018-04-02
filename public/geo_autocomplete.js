
///////////////////////////////////////////////////
// GEOLOCATION WITH GOOGLE MAPS PLACES AUTOCOMPLETE
///////////////////////////////////////////////////
google.maps.event.addDomListener(window, 'load', function () {
    var places = new google.maps.places.Autocomplete(document.getElementById('txtPlaces'));
    google.maps.event.addListener(places, 'place_changed', function () {
        var place = places.getPlace();
        var address = place.formatted_address;
        var latitude = place.geometry.location.lat();
        var longitude = place.geometry.location.lng();
        document.getElementById('lat').value = latitude;
        document.getElementById('lng').value = longitude;
        var mesg = "Address: " + address;
        mesg += "\nLatitude: " + latitude;
        mesg += "\nLongitude: " + longitude;
        console.log(mesg);
    });
});