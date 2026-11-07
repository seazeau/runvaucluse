<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/xml');

$url = 'https://top4running.fr/export/thirdpartyfeed.xml';

// Utilisation de cURL pour récupérer le flux
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
$data = curl_exec($ch);
curl_close($ch);

echo $data;
?>