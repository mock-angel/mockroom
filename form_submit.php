<?php
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if(!isset($_POST['submit']))
{
  echo '{"status":"error"}';
}
$full_name = $_POST['Name'];//$_POST[''];
$email = $_POST['Email'];//$_POST[''];

$timestamp = $_POST['Timestamp'];
$phone_number = $_POST['Number'];


if(!isset($_POST['Services']))
  $services = "None Selected";
else $services = $_POST['Services'];

if(!isset($_POST['know_us']))
  $how_did_ya_find_me = "None Selected";
else $how_did_ya_find_me = $_POST['know_us'];

$ideas_about_shoot = $_POST['shoot_ideas'];
$props = $_POST['Props'];
$chosen_location = $_POST['chosen_location'];


//Validate first
if(empty($full_name)||empty($email))
{ 
  
  echo '{"status":"error"}';
  
}

$email_from = "noreply";
$email_subject = "Mobocam WEB: $email has filled the form.";
$email_body = "<html><body>".
      "<h3>Form Data:</h3>\n".
      
      '<table rules="all" style="border-color: #666;" cellpadding="5">'.
      "<tr style='background: #eee;'><td><strong>Timestamp:</strong> </td><td>" . $timestamp . "</td></tr>".
      "<tr><td><strong>Full name:</strong> </td><td>" . $full_name . "</td></tr>".
      "<tr><td><strong>Email address*:</strong> </td><td>" . $email . "</td></tr>".
      "<tr><td><strong>Phone Number:</strong> </td><td>" . $phone_number . "</td></tr>".
      "<tr><td><strong>What service(s) are you interested in?:</strong> </td><td>" . $services . "</td></tr>".
      "<tr><td><strong>Already got some ideas about your shoot?:</strong> </td><td>" . $ideas_about_shoot . "</td></tr>".
      "<tr><td><strong>Have some interesting props?:</strong> </td><td>" . $props . "</td></tr>".
      "<tr><td><strong>Have a location in mind?:</strong> </td><td>" . $chosen_location . "</td></tr>".
      "<tr><td><strong>How did you hear about me?:</strong> </td><td>" . $how_did_ya_find_me . "</td></tr>".
      
      "</table>".
      "</body></html>";
      /*
      "\tTimestamp: $timestamp\n".
      "\tFull name: $full_name\n".
      "\tEmail address*: $email\n".
      "\tPhone Number: $phone_number\n".
      "\tWhat service(s) are you interested in?: $services \n".
      "\tAlready got some ideas about your shoot?: $ideas_about_shoot \n".
      "\tHave some interesting props?: $props \n".
      "\tHave a location in mind?: $chosen_location \n".
      "\tHow did you hear about me?: $how_did_ya_find_me \n";
      */
$allowedOrigins = array(
  //'(http(s)://)?(www\.)?my\-domain\.com',
  '*'
);
      
$headers = "From: $email_from \r\n".
        "MIME-Version: 1.0\r\n".
        "Content-Type: text/html; charset=ISO-8859-1\r\n";

$to = "sujakrishnar@gmail.com";
$to_main = "mobocamphotography@gmail.com";
//done. Redirect to thank you page.
//mail($to_main, $email_subject, $email_body, $headers);
mail($to, $email_subject, $email_body, $headers);

if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] != '') {

  foreach ($allowedOrigins as $allowedOrigin) {
      break;
      if (preg_match('#' . $allowedOrigin . '#', $_SERVER['HTTP_ORIGIN'])) {
        header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
        header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
        header('Access-Control-Max-Age: 1000');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        break;
      }
    }
}


//header('Access-Control-Max-Age: 86400');
//header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
//echo "exit body loop exiting";
echo '{"status":"error"}';
echo '{"body":"done!"}';
//var_dump($_POST);
