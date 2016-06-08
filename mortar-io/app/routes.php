<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/
Route::get('/','HomeController@angular');
Route::get('/recovery_password/{user}/{token}','HomeController@passwordRecovery');

Route::group(array('prefix'=>'api'),function(){
  //Route::put('user/{user}','UserController@editUser');    
  //Route::delete('user/{user}','UserController@deleteUser');
  Route::post('user/{user}/change_password','UserController@changePassword');
  Route::post('rpc/command/{command}','UserController@rpc');    
  Route::get('folder/{folder}/get_devices','FolderController@getDevices');
});
