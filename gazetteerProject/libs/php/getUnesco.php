<?php

    $executionStartTime = microtime(true);

    //ini_set('display_errors', 'On');
    //error_reporting(E_ALL);

 
    $url='https://examples.opendatasoft.com/api/records/1.0/search/?dataset=world-heritage-unesco-list&q=&rows=100&refine.category=' . $_REQUEST['category'];

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($curl);

	$unesco = json_decode($result,true);



    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['data']['unesco'] = $unesco;
    $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);

?>