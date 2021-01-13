<?php
	
	$executionStartTime = microtime(true) / 1000;

    //ini_set('display_errors', 'On');
    //error_reporting(E_ALL);


// Borders
	$countryBorders = json_decode(file_get_contents('countryBorders.geo.json'), true);
	
	$border = null;
    
    
    foreach ($countryBorders['features'] as $feature) {

        if ($feature['properties']['iso_a2'] ==  $_REQUEST['countryCode']) {

            $border = $feature;

            break;

        }

    }


	
// Geonames
	$url='http://api.geonames.org/countryInfoJSON?formatted=true&lang=en' . '&q=' . $_REQUEST['latLong'] . '&username=mireiafarre&style=full';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($curl);

	$decode = json_decode($result,true);



// Main Info
	$url='http://api.geonames.org/countryInfoJSON?formatted=true&lang=en' . '&country=' . $_REQUEST['countryCode'] . '&username=mireiafarre';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($curl);

	$info = json_decode($result,true);


	
// Neighbours
	$url='http://api.geonames.org/neighboursJSON?country=' . $_REQUEST['countryCode'] . '&username=mireiafarre';
    
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($curl);

	$neighbours = json_decode($result,true);



// Weather
	$url='api.openweathermap.org/data/2.5/onecall?lon=' . $_REQUEST['lng'] . '&lat=' . $_REQUEST['lat'] . '&APPID=104847e236e7d402da5f9f80092039d1';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($curl);

	$weatherData = json_decode($result,true);



// ISO 2 to 3
	$iso = json_decode(file_get_contents('iso2to3.json'), true);
	
	$iso3 = null;


	foreach ($iso[0] as $isoCode) {
    
        if ($isoCode['alpha-2'] == $_REQUEST['countryCode']) {

			$iso3 = $isoCode;

			break;

		}

    }	



// POI	
	$url = 'http://www.mapquestapi.com/search/v2/radius?key=ShawuJl1VJKqcbU7dTrx1imtETHXLYbO&maxMatches=20&units=m&radius=200&origin=' . $_REQUEST['iso3'];
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);
	
	$result=curl_exec($ch);	
	
	curl_close($curl);

	$searchResult = json_decode($result,true);

	

// Cities
    curl_setopt_array($ch, array(
        CURLOPT_URL => "https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=10&countryIds=" . $_REQUEST['countryCode'] ."&sort=-population&types=CITY",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "GET",
        CURLOPT_HTTPHEADER => array(
            "x-rapidapi-host: wft-geo-db.p.rapidapi.com",
            "x-rapidapi-key: ab434f9d3emsh47dfc8849c14190p1d38c6jsn8aefd3d1bed3"
        ),
    ));              

	$result = curl_exec($ch);

	curl_close($curl);

	$geoDBResult = json_decode($result,true);
	


	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['data'] = $border;
	$output['data']['geonames'] = $decode['geonames'];
	$output['data']['info'] = $info['geonames'];
	$output['data']['neighbours'] = $neighbours['geonames'];
	$output['data']['weatherData'] = $weatherData;
	$output['data']['iso3'] = $iso3;
	$output['data']['searchResult'] = $searchResult;
	$output['data']['geoDB'] = $geoDBResult;
	$output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>





