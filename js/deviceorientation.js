//from https://dev.opera.com/articles/w3c-device-orientation-usage/

log('k',false)

degtorad = Math.PI / 180; // Degree-to-Radian conversion
deviceOrientationData = null;
devicePos=null

if (typeof DeviceOrientationEvent.requestPermission === 'function') {
	DeviceOrientationEvent.requestPermission()
	  .then(permissionState => {
		if (permissionState === 'granted') {
			window.addEventListener('deviceorientation', function( event ) {
				deviceOrientationData = event;
			}, false);
		}
	  })
	  .catch(console.error);
  } else {
	// handle regular non iOS 13+ devices
  }



accData=[]

log('haloo')



var evtest=window.addEventListener("devicemotion", accelerometerUpdate, true);
log(evtest,true)

function accelerometerUpdate(event) {

   var aX = event.acceleration.x*10;
   var aY = event.acceleration.y*10;
   var aZ = event.acceleration.z*10;

accData.push(event.acceleration)
if(accData.length>3)accData.shift()

var accPos={
x:[],
y:[],
z:[]
}

accData.forEach(
 function(item,index){
  for(var key in accPos){
   accPos[key].push(item[key])
  }
})



var avgPos={x:0,y:0,z:0}

for(var key in accPos){
avgPos[key]=accPos[key].reduce(
function(total, amount, index, array){
  total += amount
  return total/array.length
}, 0);
}

devicePos={
x:avgPos.x
y:avgPos.y
z:avgPos.z
}


}



currentScreenOrientation = window.orientation || 0; // active default
window.addEventListener('orientationchange', function() {
	currentScreenOrientation = window.orientation;
}, false);
			

function getScreenTransformationQuaternion( screenOrientation ) {
	var orientationAngle = screenOrientation ? screenOrientation * degtorad : 0;
	var ang = orientationAngle;
	ang=0
	// Construct the screen transformation quaternion
	var q_s = [Math.cos( -ang/2 ),0,0,Math.sin( -ang/2 )];
	return q_s;
}

function getBaseQuaternion( alpha, beta, gamma ) {
	var _x = beta  ? beta * degtorad : 0; // beta value
	var _y = gamma ? gamma * degtorad : 0; // gamma value
	var _z = alpha ? alpha * degtorad : 0; // alpha value

	var cX = Math.cos( _x/2 );
	var cY = Math.cos( _y/2 );
	var cZ = Math.cos( _z/2 );
	var sX = Math.sin( _x/2 );
	var sY = Math.sin( _y/2 );
	var sZ = Math.sin( _z/2 );

	var w = cX * cY * cZ - sX * sY * sZ;
	var x = sX * cY * cZ - cX * sY * sZ;
	var y = cX * sY * cZ + sX * cY * sZ;
	var z = cX * cY * sZ + sX * sY * cZ;

	return [ w, x, y, z ];
}

function getWorldTransformationQuaternion() {
	var worldAngle = 90 * degtorad;
	var minusHalfAngle = - worldAngle / 2;
	// Construct the world transformation quaternion
	var q_w = [
		Math.cos( minusHalfAngle ),
		Math.sin( minusHalfAngle ),
		0,
		0
	];
	return q_w;
}

function quaternionMultiply( a, b ) {
	var w = a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3];
	var x = a[1] * b[0] + a[0] * b[1] + a[2] * b[3] - a[3] * b[2];
	var y = a[2] * b[0] + a[0] * b[2] + a[3] * b[1] - a[1] * b[3];
	var z = a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1];

	return [ w, x, y, z ];
}

function computeQuaternion() {

	var quaternion = getBaseQuaternion(
		deviceOrientationData.alpha,
		deviceOrientationData.beta,
		deviceOrientationData.gamma
	); // q
	
	var worldTransform = getWorldTransformationQuaternion(); // q_w
	var worldAdjustedQuaternion = quaternionMultiply( quaternion, worldTransform ); // q'_w
	var screenTransform = getScreenTransformationQuaternion( currentScreenOrientation ); // q_s
	var finalQuaternion = quaternionMultiply( worldAdjustedQuaternion, screenTransform ); // q'_s
	
	return finalQuaternion; // [ w, x, y, z ]
}

//p. ellul on stackoverflow https://stackoverflow.com/a/35448946

function Quat2Angle(w, x, y, z) {
	let pitch, roll, yaw;

	const test = x * y + z * w;
	// singularity at north pole
	if (test > 0.499) {
		yaw = Math.atan2(x, w) * 2;
		pitch = Math.PI / 2;
		roll = 0;
		return [yaw,pitch,roll]
	}

	// singularity at south pole
	if (test < -0.499) {
		yaw = -2 * Math.atan2(x, w);
		pitch = -Math.PI / 2;
		roll = 0;
		return [yaw,pitch,roll]
	}

	const sqx = x * x;
	const sqy = y * y;
	const sqz = z * z;

	yaw = Math.atan2((2 * y * w) - (2 * x * z), 1 - (2 * sqy) - (2 * sqz));
	pitch = Math.asin(2 * test);
	roll = Math.atan2((2 * x * w) - (2 * y * z), 1 - (2 * sqx) - (2 * sqz));

	return [yaw,pitch,roll]
}
