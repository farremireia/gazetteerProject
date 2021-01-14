// MAP:

// Build Map
var Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 18,
    }),

    Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    }),

    googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3']
    });

var map = L.map('map', {center: [39.73, -104.99],zoom: 10,zoomControl: false, layers: [Esri_WorldGrayCanvas, googleSat, Esri_WorldStreetMap]});

L.control.zoom({position: 'topright'}).addTo(map);

var baseMaps = {
    'Satellite': googleSat,
    'StreetMap': Esri_WorldStreetMap,
    'Greyscale': Esri_WorldGrayCanvas,
};

L.control.layers(baseMaps).addTo(map);




// VARIABLES:

var border,
    bounds,
    circle,
    cities,
    corner1,
    corner2,
    countryBorders,
    countryCode,
    date,
    day,
    e,
    forecastDate,
    geojson,
    i,
    iso3,
    lat,
    latLong,
    lng,
    lon,
    lowerCode,
    marker,
    MarkerClusterGroup,
    markers,
    markers2,
    poi,
    popup,
    tabContent,
    tabLinks,
    unesco,
    width;

let countryDropdown = $('#dropdownCountry');

    countryDropdown.empty();
    countryDropdown.append('<option selected="true" disabled>Select a Country</option>');




// MARKERS:

var positionIcon = L.icon({
    iconUrl: 'libs/img/positionIcon.png',
    iconSize:[28.5, 28.25],
    iconAnchor:[14.25, 38.25],
    popupAnchor: [0, -40]
    }),

    poiIcon = L.icon({
    iconUrl: 'libs/img/poiIcon.png',
    iconSize:[38.5, 38.25],
    iconAnchor:[14.25, 38.25],
    popupAnchor: [0, -40]
    }),

    cityIcon = L.icon({
    iconUrl: 'libs/img/cityIcon.png',
    iconSize:[38.5, 38.25],
    iconAnchor:[14.25, 38.25],
    popupAnchor: [0, -40]
    }),

    unescoIcon = L.icon({
    iconUrl: 'libs/img/unescoIcon.png',
    iconSize:[38.5, 38.25],
    iconAnchor:[14.25, 38.25],
    popupAnchor: [0, -40]
    });




// EVENTS:

// Populate Select
$(document).ready(function () {

    $.ajax({  

        type: 'POST',  
        url: 'libs/php/getCountrySelect.php',
        dataType: 'json',
        data: {

            countryCode: 'country',

        },    

        success: function (result) {  
            
            map.on('locationfound', onLocationFound);
            map.on('locationerror', onLocationError);

            map.locate({setView: true, maxZoom: 5});

            $('#dropdownCountry').html('<option selected="true" disabled>Select a Country</option>');
            
            $.each(result.data, function(i) {

                $('#dropdownCountry').append($('<option>', {
                    text: result.data[i].name,
                    value: result.data[i].code,
                }));
                
            });

        },

        error: function(jqXHR, textStatus, errorThrown){
            alert(`${textStatus} error`);
        }

    });

});

// On change for the <select>
$('#dropdownCountry').on('change', function() {

    navigator.geolocation.getCurrentPosition(function(position) {
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        latLong = lat + ',' + lng;
        
        $.ajax({

            type: 'POST',
            url: 'libs/php/getCountryInfo.php',
            dataType: 'json',
            data: {

                countryCode: $('#dropdownCountry').val(),
                iso3: $('#dropdownCountry').val(),
                lat: position.coords.latitude,
                lng: position.coords.longitude,

            },

            success: function(result, weatherData, item, data){

                if(result.status.code == 200){
 
                    corner1 = L.latLng(result['data']['info'][0]['north'], result['data']['info'][0]['west']);
                    corner2 = L.latLng(result['data']['info'][0]['south'], result['data']['info'][0]['east']);
                    bounds = L.latLngBounds(corner1, corner2);
    
                    if(markers || countryBorders) {

                        markers.clearLayers()
                        countryBorders.clearLayers()

                    } 

                    markers = L.markerClusterGroup();
                    
                    // POI
                    poi = result['data']['searchResult']['searchResults'];
                    iso3 = result['data']['iso3'];

                    for (let i in poi) {

                        if (poi[i].origin == iso3) {

                        markers.addLayer(
                            L.marker(poi[i].shapePoints, {icon: poiIcon}).bindPopup(poi[i].fields.name).openPopup()
                        )
                        
                        }

                    }
                        
                    // Cities
                    cities = result['data']['geoDB']['data'];

                    for (let i in cities) {

                        markers.addLayer(
                            L.marker([cities[i].latitude, cities[i].longitude], {icon: cityIcon}).bindPopup(cities[i].name)
                        )

                    }
                    
                    map.addLayer(markers);

                    marker = L.marker([lat,lng], {icon: positionIcon}).addTo(map).bindPopup("You are here").openPopup();
    
                    marker = L.circle([lat,lng], 100000, {

                        color: '#778899',
                        fillColor: '#778899',
                        fillOpacity: 0.5

                    }).addTo(map);

                    // Borders
                    border = result['data'];
            
                    countryBorders = L.geoJSON(border, {

                        color: '#778899'

                    }).addTo(map);

                    map.flyToBounds(bounds, {padding: [50, 50]});

                    if (bounds){

                        map.fitBounds(bounds);

                    }

                    // Main Info
                    lowerCode = (result['data']['info'][0]['countryCode']).toLowerCase();
                    $('#flag').attr('src', 'https://www.countryflags.io/' + lowerCode + '/flat/64.png');
                    $('#countryName').html(result['data']['info'][0]['countryName']);
                    $('#continent').html(result['data']['info'][0]['continent']);
                    $('#currencyCode').html(result['data']['info'][0]['currencyCode']);
                    $('#capital').html(result['data']['info'][0]['capital']);
                    $('#languages').html(result['data']['info'][0]['languages']);
                    $('#population').html(formatPopulation(result['data']['info'][0]['population']));
                    $('#area').html(`${formatArea(result['data']['info'][0]['areaInSqKm'])}`);

                    // Weather
                    $('#todayW').attr('src', 'http://openweathermap.org/img/wn/' + result['data']['weatherData']['current']['weather'][0]['icon'] + '@2x.png');
                    $('#todayDescription').html(result['data']['weatherData']['current']['weather'][0]['description']).css('textTransform', 'capitalize');
                    $('#todayMaxTemp').html('Max: ' + kelvinToCelsius(result['data']['weatherData']['daily'][0]['temp']['max']) + ' °C');
                    $('#todayMinTemp').html('Min: ' + kelvinToCelsius(result['data']['weatherData']['daily'][0]['temp']['min']) + ' °C');
                    $('#todayHum').html('Hum: ' + result['data']['weatherData']['current']['humidity'] + '%');
                
                    $('#tomorrowW').attr('src', 'http://openweathermap.org/img/wn/' + result['data']['weatherData']['daily'][1]['weather'][0]['icon'] + '@2x.png');
                    $('#tomorrowDescription').html(result['data']['weatherData']['daily'][1]['weather'][0]['description']).css('textTransform', 'capitalize');
                    $('#tomorrowMaxTemp').html('Max: ' + kelvinToCelsius(result['data']['weatherData']['daily'][1]['temp']['max']) + ' °C');
                    $('#tomorrowMinTemp').html('Min: ' + kelvinToCelsius(result['data']['weatherData']['daily'][1]['temp']['min']) + ' °C');
                    $('#tomorrowHum').html('Hum: ' + result['data']['weatherData']['daily'][1]['humidity'] + '%');

                    $('#date3').html(getForecastDay3());

                    $('#tomorrowW3').attr('src', 'http://openweathermap.org/img/wn/' + result['data']['weatherData']['daily'][2]['weather'][0]['icon'] + '@2x.png');
                    $('#tomorrowDescription3').html(result['data']['weatherData']['daily'][2]['weather'][0]['description']).css('textTransform', 'capitalize');
                    $('#tomorrowMaxTemp3').html('Max: ' + kelvinToCelsius(result['data']['weatherData']['daily'][2]['temp']['max']) + ' °C');
                    $('#tomorrowMinTemp3').html('Min: ' + kelvinToCelsius(result['data']['weatherData']['daily'][2]['temp']['min']) + ' °C');
                    $('#tomorrowHum3').html('Hum: ' + result['data']['weatherData']['daily'][2]['humidity'] + '%');
                
                    $('#date4').html(getForecastDay4());

                    $('#tomorrowW4').attr('src', 'http://openweathermap.org/img/wn/' + result['data']['weatherData']['daily'][3]['weather'][0]['icon'] + '@2x.png');
                    $('#tomorrowDescription4').html(result['data']['weatherData']['daily'][3]['weather'][0]['description']).css('textTransform', 'capitalize');
                    $('#tomorrowMaxTemp4').html('Max: ' + kelvinToCelsius(result['data']['weatherData']['daily'][3]['temp']['max']) + ' °C');
                    $('#tomorrowMinTemp4').html('Min: ' + kelvinToCelsius(result['data']['weatherData']['daily'][3]['temp']['min']) + ' °C');
                    $('#tomorrowHum4').html('Hum: ' + result['data']['weatherData']['daily'][3]['humidity'] + '%');

                    // Neighbours
                    $('#neighbours').html(result['data']['neighbours'][0]['toponymName']);

                    // Unesco
                    $('#searchUnesco').dialog({

                        autoOpen: false,
                        width: 400,
                        title: "",
                        buttons: {

                            'Search': okHandler,
                            'Cancel': cancelHandler,
                            'Clear Markers': clearMarker

                        }

                    })

                    $('#btn1').click(showDialog);
  
                }

            },

            error: function(jqXHR, textStatus, errorThrown){
                alert(`${textStatus} error`);
            }

        });

    })

});

$('.closebtn').click(function() {

    document.getElementById('mySidebar').style.width = '0px';

    setTimeout( function(){

        document.getElementById('wiki').style.display = 'inline-block';

    },350);

});

$('.openbtn').click(function() {
    
    width = $(window).width();

    if(width >= 450) { 

        document.getElementById('mySidebar').style.width = '450px';

    } else {

        document.getElementById('mySidebar').style.width = '100%';

    }

    document.getElementById('wiki').style.display = 'none';

});




// FUNCTIONS:

function cancelHandler() {

    $('#searchUnesco').dialog('close');

}

function clearMarker() {

    markers.clearLayers();

}

function getUnesco() {

    $.ajax ({

        type: 'GET',
        url: 'libs/php/getUnesco.php',
        data: {

            category: $('#category').val(),

        },

        success: function (result, results, data) {  

            if(result.status.code == 200){

                unesco = result['data']['unesco']['records'];
        
                markers2 = L.markerClusterGroup();

                for (let i in unesco) {

                    markers2.addLayer(
            
                        L.marker([unesco[i].fields.latitude, unesco[i].fields.longitude], {icon: unescoIcon}).addTo(map).bindPopup(unesco[i].fields.name_en).openPopup()
                    )
                        
                }
    
                if (bounds){
    
                    map.fitBounds(bounds);
    
                }
                
                map.addLayer(markers2);
    
            }    

        },

        error: function(jqXHR, textStatus, errorThrown){
            alert(`${textStatus} error`);
        }

    });

}

function okHandler() {

    $('#searchUnesco').dialog(getUnesco());
    $('#searchUnesco').dialog('close');

}

// Error handler
function onLocationError() {

    alert(e.message);

}

function onLocationFound(e) {

    $.ajax({

        type: 'POST',
        url: 'libs/php/getCountryCode.php',
        dataType: 'json',
        data: {

            lat: e['latlng']['lat'],
            lng: e['latlng']['lng']

        },

        success: function(result){

            $('#dropdownCountry').val(result.data.countryCode).change();

        },

        error: function(jqXHR, textStatus, errorThrown){
            alert(`${textStatus} error`);
        }

    });

}

// Open and close tabs
function openTab(evt, section) {

    tabContent = document.getElementsByClassName('tabContent');
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = 'none';
    }

    tabLinks = document.getElementsByClassName('tablinks');
    for (i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(' active', '');
    }

    document.getElementById(section).style.display = 'block';
    evt.currentTarget.className += ' active';
}

function showDialog() {

    $('#searchUnesco').dialog('open');

}

// Misc functions
function formatArea(num, area){

    area = Number(num).toPrecision();

    if(area/1000000 > 1){

        return `${(area/1000000).toFixed(2)} mln`;

    }else if(area/1000 > 1) {

        return `${(area/1000).toFixed(2)} k`

    }else {

        return `${area}`;

    }

}

function formatPopulation(num, pop){

    pop = parseInt(num);

    if(pop/1000000 > 1){

        return `${(pop/1000000).toFixed(2)} mln`;

    }else if(pop/1000 > 1){

        return `${(pop/1000).toFixed(2)} k`;

    }else {

        return `${pop.toFixed()}`;

    }

}

function getForecastDay3() {

    date = new Date(date);
    forecastDate = new Date((new Date()).getTime() + (2 * 86400000));

    day = forecastDate.getDate().toString();

    switch (day) {

        case '1':
        case '21':
        case '31':
            return day + 'st';

        case '2':
        case '22':
            return day + 'nd';

        case '3':
        case '23':
            return day + 'rd';

        default:
            return day + 'th';

    }

}

function getForecastDay4() {

    date = new Date(date);
    forecastDate = new Date((new Date()).getTime() + (3 * 86400000));

    day = forecastDate.getDate().toString();

    switch (day) {

        case '1':
        case '21':
        case '31':
            return day + 'st';

        case '2':
        case '22':
            return day + 'nd';

        case '3':
        case '23':
            return day + 'rd';

        default:
            return day + 'th';

    }

}

function kelvinToCelsius(k) {

    return Math.round(k - 273.15);

}




document.getElementById('button1').onclick = function(event) {

    openTab(event, 'info');

}

document.getElementById('button2').onclick = function(event) {

    openTab(event, 'weather');

}