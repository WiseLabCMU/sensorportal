<?php

class Device { 
/**
   * Uses mio to get the last value of a transducer
   * @param string $strTransducer transducer to get value from
   * @param  string $strUsername User username
   * @param  string $strPassword User password
   * @return array containig a message of either success or error
   * @author Jairo Diaz Montero <j.diaz@gbh.com.do>
   */
  public function getTransducers($strId,$strUsername,$strPassword) {
    $device = new self();
    $response = Mio::nodeMetaQuery($strId,$strUsername,$strPassword);
    if($response['error']){
      throw new Exception($response['message']);
    }
    $arrRawDevice = $response['output']['meta'];
    $arrDevice = $arrRawDevice['@attributes'];
    $device->id = $strId;
    $device->name = $arrDevice['name'];
    if(isset($arrRawDevice['transducer'])){
      if(is_array($arrRawDevice['transducer'])){
        if(isset($arrRawDevice['transducer']['@attributes'])){
          $arrRawDevice['transducer'] = array(0=>$arrRawDevice['transducer']);
        }
        $listTransducers = array();
        foreach ($arrRawDevice['transducer'] as $key => $arrTransducer) {
          $listTransducers[$arrTransducer['@attributes']['name']] = $key;
          $device->transducers[$key]=array(
            'name'=>isset($arrRawDevice['@attributes']['name']) ? $arrTransducer['@attributes']['name'] : '',
            'type'=>isset($arrTransducer['@attributes']['type']) ? $arrTransducer['@attributes']['type'] : '',
            'unit'=>isset($arrTransducer['@attributes']['unit']) ? $arrTransducer['@attributes']['unit'] : '',
            'lastValue'=>'',
            'isActuable'=>isset($arrTransducer['@attributes']['interface']) ? true : false
          );
          if(strtolower($arrTransducer['@attributes']['unit']) == 'enum'){
            $arrEnums = array();
            if(isset($arrTransducer['map'])){
              foreach($arrTransducer['map'] as $arrEnum){
                $arrEnums[] = array(
                  'value'=>$arrEnum['@attributes']['value'],
                  'name'=>$arrEnum['@attributes']['name']
                );
              }
            }
            $device->transducers[$key]['enum'] = $arrEnums;
          }else{
            $device->transducers[$key]['min'] =isset($arrTransducer['@attributes']['minValue']) ? $arrTransducer['@attributes']['minValue'] : null;
            $device->transducers[$key]['max'] =isset($arrTransducer['@attributes']['maxValue']) ? $arrTransducer['@attributes']['maxValue'] : null;
          }
        }
      }
    } else {
       $device -> transducers = array();
    }

    return $device->transducers;
  }

  public function getTransducersLastValue($strId,$strUsername,$strPassword){
    $arrTransducers = array();
    if (!isset($this->transducers))
        $this->transducers=Device::getTransducers($strId,$strUsername,$strPassword);
    $key="";
    foreach( $this->transducers as $transducer){
      $key .= "_" . $transducer['name'] . ",";
    }
    $key=substr($key,0,-1);
    $arrData = Mio::getTransducerLastValue($strId,$key,$strUsername,$strPassword);
    if($arrData['error']){
        return array('err'=>true,'message'=>'Could not retrieve value items');
    }
    if (!isset($arrData['data']['item'])) {
        return array('err'=>true,'message'=>'Could not retrieve value items');
    }
    foreach($arrData['data']['item'] as $tran_encoded) {
       if (!isset($tran_encoded[0])){
         if (isset($tran_encoded['transducerData']))
            $tran_info=$tran_encoded['transducerData']['@attributes'];
         else 
             continue;
       } else
            $tran_info=$tran_encoded[0]['@attributes'];
       $name = $tran_info['name'];
       $value = $tran_info['value'];
       $arrTransducers[] = array('id'=>$name,'lastValue'=>$value);
       foreach($this->transducers as $transducer) {
           if(strcmp($transducer['name'],$name) == 0) {
               $transducer['lastValue'] = $value;
               break;
           }
       }
    }

    return array('error'=>false,'transducers'=>$arrTransducers);
  }

  /**
   * Get device by id
   * @param  string $strDeviceId Device identifier
   * @param  string $strUsername User username
   * @param  string $strPassword User password
   * @return object devie
   */
  public static function getById($strDeviceId,$strUsername,$strPassword){
    $device = new self();
    $response = Mio::nodeMetaQuery($strDeviceId,$strUsername,$strPassword);
    if($response['error']){
      throw new Exception($response['message']);
    }
    $arrRawDevice = $response['output']['meta'];
    $arrDevice = $arrRawDevice['@attributes'];
    $device->id = $strDeviceId;
    $device->name = $arrDevice['name'];
    $device->info = isset($arrDevice['info']) ? $arrDevice['info'] :'';
    if(isset($arrRawDevice['geoloc'])){
      $device->location = array(
          'lat'=>isset($arrRawDevice['geoloc']['lat']) ? $arrRawDevice['geoloc']['lat'] : '',
          'lon'=>isset($arrRawDevice['geoloc']['lon']) ? $arrRawDevice['geoloc']['lon'] : '',
          'building'=>(isset($arrRawDevice['geoloc']['building']) && !empty($arrRawDevice['geoloc']['building'])) ? $arrRawDevice['geoloc']['building'] : '',
          'room'=>(isset($arrRawDevice['geoloc']['room']) && !empty($arrRawDevice['geoloc']['room'])) ? $arrRawDevice['geoloc']['room'] : '',
          'street'=>(isset($arrRawDevice['geoloc']['street']) && !empty($arrRawDevice['geoloc']['street'])) ? $arrRawDevice['geoloc']['street'] : '',
          'floor'=>(isset($arrRawDevice['geoloc']['floor']) && !empty($arrRawDevice['geoloc']['floor'])) ? $arrRawDevice['geoloc']['floor'] : '',
        );
    }
    if(isset($arrRawDevice['transducer'])){
      if(is_array($arrRawDevice['transducer'])){
        if(isset($arrRawDevice['transducer']['@attributes'])){
          $arrRawDevice['transducer'] = array(0=>$arrRawDevice['transducer']);
        }
        $listTransducers = array();
        foreach ($arrRawDevice['transducer'] as $key => $arrTransducer) {
          $listTransducers[$arrTransducer['@attributes']['name']] = $key;
          $device->transducers[$key]=array(
            'name'=>isset($arrRawDevice['@attributes']['name']) ? $arrTransducer['@attributes']['name'] : '',
            'type'=>isset($arrTransducer['@attributes']['type']) ? $arrTransducer['@attributes']['type'] : '',
            'unit'=>isset($arrTransducer['@attributes']['unit']) ? $arrTransducer['@attributes']['unit'] : '',
            'lastValue'=>'',
            'isActuable'=>isset($arrTransducer['@attributes']['interface']) ? true : false
          );
          if(strtolower($arrTransducer['@attributes']['unit']) == 'enum'){
            $arrEnums = array();
            if(isset($arrTransducer['map'])){
              foreach($arrTransducer['map'] as $arrEnum){
                $arrEnums[] = array(
                  'value'=>$arrEnum['@attributes']['value'],
                  'name'=>$arrEnum['@attributes']['name']
                );
              }
            }
            $device->transducers[$key]['enum'] = $arrEnums;
          }else{
            $device->transducers[$key]['min'] =isset($arrTransducer['@attributes']['minValue']) ? $arrTransducer['@attributes']['minValue'] : null;
            $device->transducers[$key]['max'] =isset($arrTransducer['@attributes']['maxValue']) ? $arrTransducer['@attributes']['maxValue'] : null;
          }
        }
      }
    } else {
       $device -> transducers = array();
    }
    if(isset($arrRawDevice['property'])){
      if(isset($arrRawDevice['property']['@attributes'])){
        $arrRawDevice['property'] = array(0=>$arrRawDevice['property']);
      }
      foreach($arrRawDevice['property'] as $arrProperty){
        $device->properties[$arrProperty['@attributes']['name']] = $arrProperty['@attributes']['value'];
      }
    }
    $return = Mio::getNodeReferences($device->id,$strUsername,$strPassword);
    if(!$return['error']){
      $arrReferences = $return['references'];
      foreach($arrReferences as $index => $node){
        if($node['relation'] == 'parent'){
          $device->parent = $arrReferences[$index];
        }
      }
    }
    if (!empty($device->transducers)) {
    $key="";
    foreach( $device->transducers as $transducer){
      $key .= "_" . $transducer['name'] . ",";
    }
    $key=substr($key,0,-1);
    $arrData = Mio::getTransducerLastValue($device->id,$key,$strUsername,$strPassword);
    if(!$arrData['error']){
    if (isset($arrData['data']['item'])) {
    foreach($arrData['data']['item'] as $tran_encoded) {
       if (!isset($tran_encoded[0])){
         if (isset($tran_encoded['transducerData']))
            $tran_info=$tran_encoded['transducerData']['@attributes'];
         else 
             continue;
       } else
            $tran_info=$tran_encoded[0]['@attributes'];
       $name = $tran_info['name'];
       $value = $tran_info['value'];
       foreach(array_keys($device->transducers) as $tran_key) {
           if(strcmp($device->transducers[$tran_key]['name'],$name) == 0) {
               $device->transducers[$tran_key]['lastValue'] = $value;
               break;
           }
       }
    }
    }
    }
    }
    return $device;
  }
  /**
   * Unsubscribe a user to a device
   * @param $strUsername user username
   * @param $strPassword user password
   * @return error bool variable and text message
   */
  public function subscribeUser($strUsername,$strPassword){
    $return = Mio::subscribe($this->id,$strUsername,$strPassword);
    return $return;
  }
  /**
   * Unsubscribe a user from a device
   * @param $strUsername user username
   * @param $strPassword user password
   * @return error bool variable and text message
   */
  public function unSubscribeUser($strUsername,$strPassword){
    $return = Mio::unSubscribe($this->id,$strUsername,$strPassword);
    return $return;
  }
  /**
   * Calls mio tools to edit node meta data
   * @param  string $strUsername
   * @param  string $strPassword
   * @return mixed array with error, on success array with success.
   * @todo call mio tool
   */
  public function edit($strUsername,$strPassword){
    $return = array('error'=>true,'message'=>'There is nothing to change');
    if(!empty($this->name) && !empty($this->info)){
      $return = Mio::editNode($this->id,$this->name,$strUsername,$strPassword,$this->info);
      if($return['error']){
        return array('error'=>true,'message'=>'Could not change the name of the node');
      }
    }
    if(isset($this->lon) && !is_null($this->lon) && isset($this->lat) && !is_null($this->lat)){
      $return = Mio::geoLocation($this->id,$this->lon,$this->lat,$strUsername,$strPassword,$this->street,$this->building,$this->floor,$this->room);
      if($return['error']){
        return array('error'=>true,'message'=>'Could not change the location');
      }
    }
    if(isset($this->image) && !empty($this->image) && !is_null($this->image)){
      $return=$this->addProperty('device_image',$this->image,$strUsername,$strPassword);
      if($return['error']){
        return array('error'=>true,'message'=>'Could not add the image property');
      }
    }
    return $return;
  }
  /**
   * Add a property to the device
   * @param string $strNameProperty Property name
   * @param string $strValue        Property value
   * @param string $strUsername     User username
   * @param string $strPassword     User password
   * @return array with boolean variable and text message
   */
  private function addProperty($strNameProperty,$strValue,$strUsername,$strPassword){
    $return = Mio::addProperty($this->id,$strNameProperty,$strValue,$strUsername,$strPassword);
    if($return['error']){
      return array('error'=>false,'message'=>'Could not save the'. $strNameProperty .' edit the device to add');
    }
    return $return;
  }
  /**
   * Get favorites folder of a device
   * @param  string $strUsername User username
   * @param  string $strPassword User password
   * @return array error boolean variable and mixed text message or object
   */
  public function getFavorites($strUsername,$strPassword){
    $return = Mio::getNodeReferences($this->id,$strUsername,$strPassword);
    if($return['error']){
      return $return;
    }
    $arrReferences = $return['references'];
    foreach($arrReferences as $index => $node){
      if($node['relation']== 'child'){
        unset($arrReferences[$index]);
      }
      if(strpos($node['id'],$strUsername) === false){
       unset($arrReferences[$index]); 
      }
    }
    return array('error'=>false,'favorites'=>$arrReferences);
  }

  public function getPermittedUsers($strUsername,$strPassword){
    $return = Mio::affiliationsQuery($this->id,$strUsername,$strPassword);
    if($return['error']){
      return $return;
    }
    $arrUsers = array();
    if(isset($return['affiliations']['affiliation'])){
      foreach($return['affiliations']['affiliation'] as $arrAffiliation){
        if($arrAffiliation['@attributes']['affiliation'] == 'publisher'){
          $username =explode('@',$arrAffiliation['@attributes']['jid']); 
          $arrUsers[] = array(
          'username'=>$username[0],
          'name'=>$username[0]
          );
        }
      }
    }
    return array('error'=>false,'users'=>$arrUsers);
  }
  /**
   * Uses mio to add device permission to a user
   * @param string $strPublisher user to add device permission (subscribe)
   * @param  string $strUsername User username
   * @param  string $strPassword User password
   * @return array containig a message of either success or error
   * @author Jairo Diaz Montero <j.diaz@gbh.com.do>
   */
  public function addDevicePermission($strPublisher,$strUsername,$strPassword){
    $return = Mio::addDevicePermission($strPublisher,$this->id,$strUsername,$strPassword);
    return $return;
  }

  /**
   * Uses mio to remove user from device
   * @param string $strPublisher user to remove (unsubscribe)
   * @param  string $strUsername User username
   * @param  string $strPassword User password
   * @return array containig a message of either success or error
   * @author Jairo Diaz Montero <j.diaz@gbh.com.do>
   */
  public function removeDevicePermission($strPublisher,$strUsername,$strPassword){
    $return = Mio::removeDevicePermission($strPublisher,$this->id,$strUsername,$strPassword);
    return $return;
  }
  
  /**
   * Uses mio to remove user from device
   * @param string $strPublisher user to remove (unsubscribe)
   * @param  string $strUsername User username
   * @param  string $strPassword User password
   * @return array containig a message of either success or error
   * @author Ignacio Cano <i.cano@gbh.com.do>
   */
  public function getStorageUrls($strUsername,$strPassword){
    $return = Mio::getStorageUrls($this->id,$strUsername,$strPassword);
    return $return;
  }
  /**
   * Get a list of device similar to giving device
   * @param  string $strUsername User username
   * @param  string $strPassword User password
   */
  public function getAutomap($strUsername,$strPassword){
    $arrDevicesData =array();
    $return = Mio::getAutomap($this->id,$strUsername,$strPassword);
    //get device data 
    foreach($return['devices'] as $strUuid){
      //@todo this is jut to check if work as expected
      // $strUuid = '208EF795-ED19-47E0-9965-F42F6EE7D175';
      
      $objDevice= null;
      try{
        $objDevice=Device::getById($strUuid,$strUsername,$strPassword);
        
      }catch(Exception $e){
        //no va return
        if($e->getMessage() != 'Undefined offset: 0'){
          try{
            $objDevice=Device::getById($strUuid,$strUsername,$strPassword);
          }catch(Exception $e){

          }
        }
      }
      try{
        $objDevice->parent['parent'] = Device::getById($objDevice->parent['id'],$strUsername,$strPassword)->parent;
      }catch(Exception $e){
        
      }
      if(is_null($objDevice)){
        continue;
      }
      $arrDevicesData [] = $objDevice;
    }
    //@todo get parent of parent validate if doesn't have of the parent just keep working
    return array('error'=>false,'devices'=>$arrDevicesData);
  }

  }
