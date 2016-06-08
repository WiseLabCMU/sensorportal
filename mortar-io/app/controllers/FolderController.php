<?php

class FolderController extends BaseController {
  /**
   * Add device to the current folder
   * @param string $strFolderId id of the folder that the devices will be added to.
   * @return json with bolean error and a text message
   */
  public function addDevice($strFolderId){
    $strDeviceId = Input::get('device_id', null);
    $boolTwoWay = Input::get('two_way', true);
    if(is_null($strDeviceId)){
      return Response::json(array('error'=>true,'message'=>'Device id is needed'));
    }
    $folder = new Folder;
    $folder->id = $strFolderId;
    $response = $folder->addDevice($strDeviceId,$this->user['username'],$this->user['password'],$boolTwoWay);
    return Response::json($response);
  }
  /**
   * Remove a device from a folder
   * @param string $strFolderId id of the folder the device is in
   * @param string $strDeviceId id of the device to remove from the folder
   * @return json with bolean error and text message
   */
  public function removeDevice($strFolderId,$strDeviceId){
    $folder = new Folder;
    $folder->id=$strFolderId;
    $response = $folder->removeDevice($strDeviceId,$this->user['username'],$this->user['password']);
    return Response::json($response);
  }
  /**
   * Returns list of devices and folders under the current folder
   * @param string $strFolderId id of the folder that we will get the children
   * @return mixed json folder data or json error and message
   */
  public function getChildren($strFolderId) {   
    $folder = new Folder;
    $folder->id = $strFolderId;
    $response = $folder->getChildren($this->user['username'],$this->user['password']);
    return Response::json($response);
  }
  /**
   * Set a parent to node, remove previous parent.
   * @param string $strFolderId id of the folder we are changing parents of
   * @return json with error variable and a text message
   */
  public function setParent($strFolderId){
    $strOldParent = Input::get('old_parent', null);
    $strNewParent = Input::get('new_parent', null);
    if(is_null($strNewParent)){
      return Response::json(array('error'=>true,'message'=>'Parent folder is needed'));
    }
    $folder=new Folder;
    $folder->id=$strFolderId;
    $response = $folder->setParent($strOldParent,$strNewParent,$this->user['username'],$this->user['password']);
    return Response::json($response);
  } 
  /**
   * Create a Folder
   * @return mixed return true or array with error adn message
   */
  public function createFolder(){
    $strFolderName = Input::get('folder_name',null);
    error_log($strFolderName);
    $strFolderParent = Input::get('folder_parent',null);
    $strMapUriUrl = Input::get('mapUri_url');
    $boolIsFavorite = Input::get('is_favorite',false);
    if(is_null($strFolderName) || is_null($strFolderParent)){
      return Response::json(array('error'=>true,'message'=>'Missing arguments'));
    }

    $folder = new Folder;
    $folder->id = UUID::generate(4)->string;
    $folder->name = $strFolderName;
    $folder->parent = $strFolderParent;
    $folder->isFavorite =$boolIsFavorite; 
    if(isset($strMapUriUrl) && !empty($strMapUriUrl)){
      $folder->mapUri = $strMapUriUrl;
    }else if(Input::hasFile('folder_mapUri')){
      $folder->mapUri= $this->uploadFile('folder_mapUri');
    }
    $response = $folder->createFolder($this->user['username'],$this->user['password']);
    if(!$response['error']){
      $response['folder_id'] =(string) $folder->id;
    }
    return Response::json($response);
  }
  /**
   * Upload a file
   * @param  strinf $strFile       Input file identifier
   * @return string or array with error boolean and message
   */
  private function uploadFile($strFile){  
    $file= Input::file($strFile);
    $fileName = UUID::generate(4)->string.'.'.$file->getClientOriginalExtension();
    if($file->move(public_path().'/img/folders/',$fileName) ){
      return '/img/folders/'.$fileName;
    }
    return null;
  }
  /**
   * Delete a folder
   * @param  string $strFolderId 
   * @return json with bolean error variable and text message             
   */
  public function deleteFolder($strFolderId){
    $folder=new Folder;
    if($strFolderId == 'root' || strpos($strFolderId,'_favorites') !== false){
      return Response::json(array('error'=>true,'message'=>'This folder cannot be deleted, they are part of the system'));
    }
    $folder->id = $strFolderId;
    $response = $folder->deleteFolder($this->user['username'],$this->user['password']);
    return Response::json($response); 
  }
  /**
   * Update folder name and the map uri
   * @param string $strFolderId 
   * @return json with bolean error variable and text message
   */
  public function editFolder($strFolderId){
    $strFolderName = Input::get('folder_name',null);
    $strOldParent = Input::get('old_parent',null);
    $strFolderParent = Input::get('folder_parent',null);
    $strMapUriUrl = Input::get('mapUri_url');
    if(is_null($strFolderName)){
      return Response::json(array('error'=>true,'message'=>'Missing arguments'));
    }
    $folder = new Folder;
    $folder->id=$strFolderId;
    $folder->name = $strFolderName;
    $folder->oldParent = $strOldParent;
    $folder->parent = $strFolderParent;
    if(isset($strMapUriUrl) && !empty($strMapUriUrl)){
      $folder->mapUri = $strMapUriUrl;
    }else if(Input::hasFile('folder_mapUri')){
      $folder->mapUri= $this->uploadFile('folder_mapUri');
    }
    $response = $folder->editFolder($this->user['username'],$this->user['password']);
    return Response::json($response);
  }
  /**
   * return a list of devices in the folder 
   * @param string $strFolderId id of the folder we are getting the devices from
   * @return mixed json folder data or json error and message
   */
  public function getDevices($strFolderId){
    $folder=new Folder;
    $folder->id=$strFolderId;
    $response=$folder->getDevices($this->user['username'],$this->user['password']);
    return Response::json($response);
  }
}
