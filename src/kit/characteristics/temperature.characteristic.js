const { request } = require('../../services/sinope.gateway');
const R = require('ramda');

function pickCharacteristic(Characteristic, loginPromise) {

  const features = [
    {
      uuid: (new Characteristic.CurrentTemperature()).UUID,
      set: setTemperature,
      get: getTemperature,
    },
    {
      uuid: (new Characteristic.TargetTemperature()).UUID,
      set: setTargetTemperature,
      get: getTargetTemperature,
    },
    {
      uuid: (new Characteristic.CurrentHeatingCoolingState()).UUID,
      get: getHeatingState,
    },
    {
      uuid: (new Characteristic.TargetHeatingCoolingState()).UUID,
      get: getTargetHeatingCoolingState,
      set: setTargetHeatingCoolingState,
    },
    {
      uuid: (new Characteristic.TemperatureDisplayUnits()).UUID,
      get: getTemperatureDisplayUnits,
      set: setTemperatureDisplayUnits,
    }
  ];

  return (characteristic, homebridgeAccessory) => {
    const uuid = 'uuid';
    const extractEvent = R.compose(R.dissoc(uuid),
                                   R.find(R.propEq(uuid, characteristic.UUID)));
     const event = extractEvent(features);
     R.map(action => {
          characteristic.on(action, callback => {
            event[action](callback, homebridgeAccessory, loginPromise);
          });
    }, R.keys(event));
  }
}

function getDevice(deviceId, loginPromise) {
  return loginPromise
  .then(authData => {
    const { session } = authData;
    return request({
      method: 'GET',
      path: ['device', deviceId, 'data'],
      sessionId: session,
    })
    .then(device => {
      console.log(device);
      return device;
    })
  });
}

function getTemperature(callback, { id }, loginPromise) {
  getDevice(id, loginPromise)
  .then(device => {
    callback(undefined, Math.round(device.temperature));
  });
}

function setTemperature(callback, { id }, loginPromise) {
  callback(undefined, 10.0);
}

function setTargetTemperature(callback, { id }, loginPromise) {
  //Characteristic.CurrentHeatingCoolingState.HEAT = 1;
  callback(undefined, 12.0);
}

function getTargetTemperature(callback, { id }, loginPromise) {
  getDevice(id, loginPromise)
  .then(device => {
    callback(undefined, Math.round(device.setpoint));
  });
}

function getHeatingState(callback, { id }, loginPromise) {
  //Characteristic.CurrentHeatingCoolingState.HEAT = 1;
  callback(undefined, 1)
}

function getTargetHeatingCoolingState(callback, { id }, loginPromise) {
  callback(undefined, 1);
/*
Characteristic.TargetHeatingCoolingState.OFF = 0;
Characteristic.TargetHeatingCoolingState.HEAT = 1;
Characteristic.TargetHeatingCoolingState.COOL = 2; // not supported
Characteristic.TargetHeatingCoolingState.AUTO = 3; no supported
*/
}

function setTargetHeatingCoolingState(callback, { id }, loginPromise) {
  callback(undefined, 1);
}

function getTemperatureDisplayUnits(callback, { id }, loginPromise) {
 callback(undefined, 0);
}

function setTemperatureDisplayUnits(callback, { id }, loginPromise) {
  callback(undefined, 1);
}

module.exports = {
  pickCharacteristic,
}
