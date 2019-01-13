// User service UUID (Default)
const USER_SERVICE_UUID         = '91E4E176-D0B9-464D-9FE4-52EE3E9F1552';

//My generated service UUID
//const USER_SERVICE_UUID         = 'e39baf86-41f3-482d-a911-31add8a03b60';

const WRITE_CHARACTERISTIC_UUID = 'E9062E71-9E62-4BC6-B0D3-35CDCD9B027B';
const NOTIFY_CHARACTERISTIC_UUID = '62FBD229-6EDD-4D1A-B554-5C4E1BB29169';

const PSDI_SERVICE_UUID = 'E625601E-9E55-4597-A598-76018A0D293D';
const PSDI_CHARACTERISTIC_UUID = '26E2B12B-85F0-4F3F-9FDD-91D114270E6E';

const DEVICE_NAME = 'LINE-Things(RPI)';

const bleno = require('bleno');
const onoff = require('onoff');

const Characteristic = bleno.Characteristic;
const PrimaryService = bleno.PrimaryService;
const GPIO = onoff.Gpio;

let onOff = 0;
console.log(`${DEVICE_NAME} Ready!`);

const writeCharacteristic = new Characteristic({
	uuid: WRITE_CHARACTERISTIC_UUID,
	properties: ['write'],
	onWriteRequest: (data, offset, withoutResponse, callback) => {
		console.log(`onOff = ${data[0]}`)

		var led = new GPIO(12,'out');
		led.writeSync(data[0]);
		callback(Characteristic.RESULT_SUCCESS);
	}
});

const notifyCharacteristic = new Characteristic({
	uuid: NOTIFY_CHARACTERISTIC_UUID,
	properties: ['notify'],
	onSubscribe: (maxSize, callback) => {
		console.log('subscribe');
		setInterval(function(){
			onOff ^= 1;
			callback(new Buffer([onOff]));
		},2000);
	}
});

const psdiCharacteristic = new Characteristic({
	uuid: PSDI_CHARACTERISTIC_UUID,
	properties: ['read'],
	onReadRequest: (offset, callback) => {
		console.log('PSDI read');
		const result = Characteristic.RESULT_SUCCESS;
		const data = new Buffer.from('PSDI read');
		callback(result, data);
	}
});

bleno.on('stateChange', (state) => {
	console.log(`stateChange: ${state}`);
	if(state === 'poweredOn'){
		bleno.startAdvertising(DEVICE_NAME, [USER_SERVICE_UUID]);
	}else{
		bleno.stopAdvertising();
	}
});

bleno.on('advertisingStart', (error) => {
	console.log(`advertisingStart: ${(error ? 'ERROR' + error : 'SUCCESS')}`);
	if(error) return;

	const userService = new PrimaryService({
		uuid: USER_SERVICE_UUID,
		characteristics: [writeCharacteristic,notifyCharacteristic]
	});
	const psdiService = new PrimaryService({
		uuid: PSDI_SERVICE_UUID,
		characteristics: [psdiCharacteristic]
	});

	bleno.setServices([userService,psdiService]);
});
	
	


