<?php
class Transducer {
  /**
   * Calls mio tool to execute a command
   * @param  int $intValue value to set the transducer to
   * @param  string $strUsername username of the user who is actuating
   * @param  string $strPassword password of the user who is actuating
   * @return mixed array with success or error and message.
   */
  public function actuate($intValue,$strUsername,$strPassword){
    return Mio::actuate($this->device,$this->name,$intValue,$strUsername,$strPassword);
  }
}