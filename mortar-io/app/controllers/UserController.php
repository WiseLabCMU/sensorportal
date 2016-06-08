<?php

class UserController extends BaseController {

  /**
   * Authenticates the user against the xmpp, and tries retrieving the user data.
   * @return JSON user info, or error array
   */
  public function login() {
    $arrUser = Input::all();
    $user = new User;
    $user->username = $arrUser['username'];
    $user->password = $arrUser['password'];
    $response = $user->login();
    if($response['error']){
      return Response::json($response);
    }
    $response['user']['username'] = $user->username;
    $response['user']['request_token'] = Crypt::encrypt($user->username.':'.$user->password);
    return Response::json($response);
  }

  //public function rpc($user,$host,$password,$command) {
  //public function rpc($command,$args,$endpoint) {
  public function rpc() {
	  $arrData = Input::all(); 
	  Log::alert('decoded rpc',['response'=>$arrData]);
	  $args = $arrData['args'];
	  $command = $arrData['command'];
	  $endpoint = $arrData['connection'];
	  return Response::json($arrData);
	  $param = array("user"=>$user,"host"=>$host,"password"=>$password);
	  $request = xmlrpc_encode_request($command, $args, (array('encoding'=>'utf-8')));
	  $context = stream_context(create(array(
		  'http'=>array(
			  'method'=>"POST\r\n", 
			  'header'=>"User-Agent XMLRPC::Client mod_xmlrpc\r\n",
			  "Content-Type: text/xml\r\n" ,
			  "Response-Type: text/xml\r\n" ,
			  "Content-Length: ".strlen($request)."\r\n",
			  'Content: '=> $request))));
	  $file = file_get_contents($endpoint,true,$context);
	  //$file = file_get_contents("http://".$domain.":".$port."/RPC2",false,$context);
	  $response = xmlrpc_decode($file);

	  if (xmlrpc_is_fault($response)) {
		      return Result::json(create(array('error'=>true, 'message'=> $response[faultString])));
	  } else {
		      return Result::json(create(array('error'=>false, 'response'=> $response)));
		     // print_r($response);
	  }
	  //return Response::json(create(array('error'=>false,'response'=>json_encode($response))));
	  return Response::json(create(array('error'=>false,'message'=>"getting called")));
  }
  /**
   * Get list of registered users in the xmpp
   * @return JSON containing the users data
   */
  public function index(){
    $user = new User;
    $user->username = $this->user['username'];
    $user->password = $this->user['password'];
    $response = $user->index();
    return Response::json($response);
  }

  /**
   * Get the data of a user given its username
   * @param string $strUsername username of the user to retrieve 
   * @return JSON containing the user data or error array
   */
  public function displayUser($strUsername){
    $user = new User;
    $response = $user->displayUser($strUsername);
    return Response::json($response);
  }
  
  /**
   * Creates a new user using form data
   * @return json containig a message of either success or error
   */
  public function createUser(){
    $arrData = Input::all(); 
    try {
      $user = User::fromArrayAll($arrData);         
    } catch (Exception $e) {
       return Response::json(array('error'=>true,'message'=>$e->getMessage()));  
    }   
    $response = $user->createUser();
    return Response::json($response);
  }
  
  /**
   * Edits the data of an user
   * @param array $strUsername username of the user being edited.
   * @return json containig a message of either success or error 
   */
  public function editUser($strUsername){ 
    $arrData = Input::all();   
    $arrData['username'] = $strUsername;   
    try {
      $user = User::fromArray($arrData);         
    } catch (Exception $e) {
       return Response::json(array('error'=>true,'message'=>$e->getMessage()));  
    }   
    $response = $user->edit();
    return Response::json($response);
  }

  /**
   * Deletes an user
   * @param string $strUsername  username of the user being deleted
   * @return json containig a message of either success or error 
   */
  public function deleteUser($strUsername){
    $user = new User();
    $response = $user->deleteUser($strUsername);
    return Response::json($response);
  }

  /**
   * Gets the current users list of permitted(owner,publisher) devices and subscriptions
   * @return JSON list of permited devices
   */
  public function getPermittedDevices($isAllData=false){
    $user = new User;
    $isAllData = empty($isAllData) ? false : true;
    $response = $user->getPermittedDevices($this->user['username'],$this->user['password'],$isAllData);
    return Response::json($response);
  }
  
  /**
   * Creates a recovery token for a user, then sends an email so that the user can reset their password
   * @param  string $strUsername username to create a token for
   * @return array with error value and message.
   */
  public function passwordRecovery($strUsername){
    $arrUser = Mio::displayUser($strUsername);
    if($arrUser['error']){
      return Response::json($arrUser);
    }
    $arrToken = User::setRecoveryCode($strUsername);
    if($arrToken['error']){
      return Response::json($arrToken);
    }
    $strEmail = $arrUser['user']['email'];
    try{
      Mail::send('emails.password_recovery',array('user'=>$arrUser['user'],'token'=>$arrToken['token']),function($message) use ($strEmail){
        $message->to($strEmail)->subject('Mio password recovery');
      });
    }catch(Exception $e){
      return Response::json(array('error'=>true,'message'=>'Could not send email, please try again.','exception'=>$e->getMessage()));
    }
    return Response::json(array('error'=>false,'message'=>'An email was sent with instructions, please check your email'));
  }
  /**
   * Changes the user password if the passed token is valid.
   * @param string $strUsername username who's password must be reset
   * @return array with error value and message.
   */
  public function setPassword($strUsername){
    $arrInput = Input::all();
    $strPassword = $arrInput['password'];
    $strPasswordConfirm = $arrInput['password_confirm'];
    $strInputToken = $arrInput['token'];
    
    if(is_null($strInputToken)){
      return Response::json(array('error'=>true,'message'=>'No token given'));
    }
    $arrUserRecovery = User::getRecoveryCode($strUsername);
    if($arrUserRecovery['error']){
      return Response::json($arrUserRecovery);
    }
    if($strInputToken != $arrUserRecovery['token']){
      return Response::json(array('error'=>true, 'message'=>'Token is incorrect')); 
    }
    if(is_null($strPassword) || is_null($strPasswordConfirm)){
      return Response::json(array('error'=>true, 'message'=>'Missing passwords'));
    }
    if($strPassword != $strPasswordConfirm){
      return Response::json(array('error'=>true, 'message'=>'Passwords do not match'));
    }
    $arrValidPassword = User::validPassword($strPassword);
    if($arrValidPassword['error']){
      return Response::json($arrValidPassword);
    }
    $arrPasswordChange = User::changePassword($strUsername,$strPassword);
    if($arrPasswordChange['error']){
      return Response::json($arrPasswordChange);
    }
    $arrRemoveToken = User::setRecoveryCode($strUsername,true); //delete current token for the user
    if($arrRemoveToken['error']){
      return Response::json(array('error'=>false, 'message'=>'Password changed successfully, but couldn\'t remove the old token'));
    }
    return Response::json(array('error'=>false, 'message'=>'Password changed successfully'));
  }

  /**
   * changes an user's password
   * @param string $strUsername user to change password to
   * @return mixed array with error and message
   * @author Jairo Diaz Montero <jairo.diaz.montero.07@gmail.com>
   */
  public function changePassword($strUsername){
    $arrData = Input::all();
    if(!isset($arrData['password']) || empty($arrData['password'])){
      return Response::json(array('error'=>true,'message'=>'No password given'));
    }
    if(!isset($arrData['password_confirm']) || empty($arrData['password_confirm'])){
       return Response::json(array('error'=>true,'message'=>'No password confirmation given'));
    }
    $strPassword = $arrData['password'];
    $strPasswordConfirm = $arrData['password_confirm'];
    if($strPassword!==$strPasswordConfirm){
      return Response::json(array('error'=>true,'message'=>'Passwords do not match'));
    }
    $arrChangePassword = User::changePassword($strUsername,$strPassword);
    if($arrChangePassword['error']){
      return Response::json($arrChangePassword);
    }
    $arrTokenResponse = User::setRecoveryCode($strUsername);
    if($arrTokenResponse['error']){
      return Response::json($arrTokenResponse);
    }
    return Response::json($arrTokenResponse);
  } }
