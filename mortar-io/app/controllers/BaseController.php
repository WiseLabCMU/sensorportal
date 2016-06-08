<?php

class BaseController extends Controller {

	protected $user = array();

	/**
	 * Base controller construct
	 * register before filter
	 */
	public function __construct(){
      // Always run csrf protection before the request when posting
			$this->beforeFilter('@setUserData',array('except' => array('login','angular','passwordRecovery','setPassword')));
	}

	/**
	 * Setup the layout used by the controller.
	 *
	 * @return void
	 */
	protected function setupLayout()
	{
		if ( ! is_null($this->layout))
		{
			$this->layout = View::make($this->layout);
		}
	}

	/**
	 * Gets user's username and password from headers
	 * @param RouteObject $route   laravels route object
	 * @param RequestObject $request current request
	 */
	public function setUserData($route,$request){
		$strToken = Request::header('Authorization');
		if($strToken){
			$arrUser = explode(':',Crypt::decrypt($strToken));
			$this->user = array(
					'username'=>$arrUser[0],
					'password'=>$arrUser[1]
				);
		}else{
			return Redirect::to('/');
		}
	}

}
