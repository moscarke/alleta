const url = "https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fopendata.mtr.com.hk%2Fdata%2Flight_rail_routes_and_stops.csv";
const xhttpr = new XMLHttpRequest();
const stopList = [], routeList = [];
let currentRoute, currentDirection, startIndex = 1, endIndex = 1, responseArr;
xhttpr.open("GET", url, true);

xhttpr.send();

xhttpr.onload = ()=> {
	if (xhttpr.status == 200){
		const response = xhttpr.response;
		responseArr = response.split("\r\n");
		
		let x = "<tr><td style='width:14%;'><strong>路線</strong></td><td style='width:86%;'><strong>方向</strong></td></tr>";
		
		stopList.push(responseArr[0].split(","));
		for (let i = 1; i < responseArr.length; i++){
			stopList.push(responseArr[i].split(","));
			var a = responseArr[i].split(",");
			for (let j = 0; j < a.length; j++){
				a[j] = a[j].substring(1, a[j].length-1);
			}
			if ((a[0] != currentRoute || a[1] != currentDirection) && i != 1){
				endIndex = i - 1;
				routeList.push({route: stopList[endIndex][0].substring(1, stopList[endIndex][0].length-1), orig_tc: stopList[startIndex][4].substring(1, stopList[startIndex][4].length-1), dest_tc: stopList[endIndex][4].substring(1, stopList[endIndex][4].length-1), dir: stopList[endIndex][1].substring(1, stopList[endIndex][1].length-1)});
				startIndex = i;
			}
			currentRoute = a[0], currentDirection = a[1];
		}
		routeList.sort(function(a, b) {
			var routeA = String(a["route"]);
			var routeB = String(b["route"]);

			var numA = parseInt(routeA, 10);
			var numB = parseInt(routeB, 10);
			var alphaA = routeA.replace(numA, "");
			var alphaB = routeB.replace(numB, "");

			if (numA < numB) {
				return -1;
			} else if (numA > numB) {
				return 1;
			}

			if (alphaA < alphaB) {
				return -1;
			} else if (alphaA > alphaB) {
				return 1;
			}

			return 0;
		});
		for (let i = 0; i < routeList.length; i++){
			x = x + "<tr><td>" + routeList[i]["route"] + "</td><td>";
			x = x + "<button class='btnOrigin' type='button' onclick=\"routeStop('" + routeList[i]["route"] + "', '" + routeList[i]["dir"] + "', '" + routeList[i]["dest_tc"] + "')\"><p style='font-size: 75%;margin: 0px 0px'>" + routeList[i]["orig_tc"] + "</p><p style='margin: 0px 0px'><span style='font-size: 75%'>往</span> " + routeList[i]["dest_tc"] + "</p></button></td></tr>";
		}
		document.getElementById("listTable").innerHTML = x;
		document.getElementById("routeList").style.display = "block";

		document.getElementById("waiting").style.display = "none";
	} else {
		//idk do sth
	}
}


function hptoHome(){
	window.location.reload();
}

// find all stops of a route given the route and direction
function routeStop(route, direction, destination){
	document.getElementById("routeList").style.display = "none";
	document.getElementById("routeSearch").style.display = "none";
	document.getElementById("routeSearch").value = "";
	document.getElementById("loading").style.display = "block";
	
	const stationNameList = [];
	let info = "", start, j;
	let x = "<tr><td><strong></strong></td><td><strong>輕鐵站</strong></td></tr>";

	const stationList = [];
	for (let i = 1; i < responseArr.length; i++){
		var a = responseArr[i].split(",");
		for (let j = 0; j < a.length; j++){
			a[j] = a[j].substring(1, a[j].length-1);
		}
		if (a[0] == route && a[1] == direction){
			start = true;
			stationList.push({name: a[4], id: a[3]});
			continue;
		}
		if (start){
			break;
		}
	}
	for (let i = 0; i < stationList.length; i++){
		j = i + 1;
		x = x + "<tr><td>" + j + "</td><td><button class='btnEta' style='text-align: left' onclick=\"routeStopEta('" + stationList[i]["id"] + "', '" + route + "', '" + direction + "', '" + stationList[i]["name"] + "', '" +  destination + "')\">" + stationList[i]["name"] + "</button></td></tr>";
	}
	document.getElementById("listTable").innerHTML = x;
	document.getElementById("routeList").style.display = "block";
	document.getElementById("loading").style.display = "none";
	document.getElementById("routeNumber").innerHTML = "路線： " + route;
}

//figure out the eta given a stop-id and a route
function routeStopEta (stopId, route, direction, stopName, destination){
	document.getElementById("routeList").style.display = "none";
	document.getElementById("loading").style.display = "block";
	document.getElementById("stationList").style.display = "none";
	let etaTime, remark, stopSeq = 0, scheduled, departureList;
	console.log(stopId, route, direction);
	
	if (route == "705" || route == "706"){
		destination = "天水圍循環綫";
	}
	
	const url = "https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule?station_id=" + stopId;
	const xhttpr = new XMLHttpRequest();
	
	xhttpr.open("GET", url, true);
	
	let x = "<tr><td><strong></strong></td><td><strong>目的地</strong></td><td><strong>到站時間</strong></td></tr>";

	xhttpr.send();

	xhttpr.onload = ()=> {
		if (xhttpr.status == 200){
			const response = JSON.parse(xhttpr.response);
			const responseList = response["platform_list"];
			
			let sequence = 0;
			for (let i = 0; i < responseList.length; i++){
				departureList = responseList[i]["route_list"];
				for (let j = 0; j < departureList.length; j++){
					if (departureList[j]["route_no"] == route && departureList[j]["dest_ch"] == destination){
						etaTime = departureList[j]["time_ch"];
						remark = "<p style='font-size: 75%;color: lightcyan;margin: 0px 0px'>單卡</p>";
						if (departureList[j]["train_length"] == 2){
							remark = "<p style='font-size: 75%;color: lightcyan;margin: 0px 0px'>拖卡</p>";
						}
						sequence++;
						x = x + "<tr><td>" + sequence + "</td><td>" + destination + "</td><td>" + etaTime + remark + "</td></tr>";
					}
				}
			}
			if (x == "<tr><td><strong></strong></td><td><strong>目的地</strong></td><td><strong>到站時間</strong></td></tr>"){
				x = "<tr><td><strong>未來60分鐘沒有由此站開出的班次</strong></td><tr>";
			}
			document.getElementById("stationTable").innerHTML = x;
			document.getElementById("stationList").style.display = "block";
			document.getElementById("backRoute").style.display = "flex";
			document.getElementById("allEta").onclick = function () {allEta(responseList)};
			document.getElementById("loading").style.display = "none";
			document.getElementById("stopName").innerHTML = "輕鐵站： " + stopName;
			document.getElementById("stopName").style.display = "block";
		}
    }
}

function searchRoute(){
	let input, filter, table, tr, td, i, txtValue;
	input = document.getElementById("routeSearch");
	filter = input.value.toUpperCase();
	table = document.getElementById("listTable");
	tr = table.getElementsByTagName("tr");
	for (i = 1; i < tr.length; i++) {
		td = tr[i].getElementsByTagName("td")[0];
		if (td) {
		  txtValue = td.textContent || td.innerText;
		  if (txtValue.toUpperCase().indexOf(filter) == 0) {
			  tr[i].style.display = "";
		  } else {
			  tr[i].style.display = "none";
		  }
		}       
	}
}

function allEta(responseList){
	document.getElementById("stationList").style.display = "none";
	document.getElementById("backRoute").style.display = "none";
	document.getElementById("routeList").style.display = "none";
	document.getElementById("routeNumber").style.display = "none";
	document.getElementById("loading").style.display = "block";
	document.getElementById("stationList").style.display = "none";
	let dir, oppositeDirection, etaTime, platformNumber, remark, departureList;
	//const routeDepartList = [];
	let x = "<tr><td><strong>路線</strong></td><td><strong>目的地</strong></td><td><strong>到站時間</strong></td></tr>";
	
	let sequence = 0;
	for (let i = 0; i < responseList.length; i++){
		departureList = responseList[i]["route_list"];
		platformNumber = responseList[i]["platform_id"] + " 號月台";
		x = x + "<tr style='background-color: #003300'><td colspan='3'><strong>" + platformNumber + "</strong></td></tr>";
		for (let j = 0; j < departureList.length; j++){
			etaTime = departureList[j]["time_ch"];
			remark = "<p style='font-size: 75%;color: lightcyan;margin: 0px 0px'>單卡</p>";
			if (departureList[j]["train_length"] == 2){
				remark = "<p style='font-size: 75%;color: lightcyan;margin: 0px 0px'>拖卡</p>";
			}
			sequence++;
			x = x + "<tr><td>" + departureList[j]["route_no"] + "</td><td>" + departureList[j]["dest_ch"] + "</td><td>" + etaTime + remark + "</td></tr>";
		}
		sequence = 0;
	}
	if (x == "<tr><td><strong></strong></td><td><strong>目的地</strong></td><td><strong>到站時間</strong></td></tr>"){
		x = "<tr><td><strong>未來60分鐘沒有由此站開出的班次</strong></td><tr>";
	}
	document.getElementById("stationTable").innerHTML = x;
	document.getElementById("stationList").style.display = "block";
	//document.getElementById("backRoute").style.display = "flex";
	//document.getElementById("allEta").onclick = function () {allEta(responseList)};
	document.getElementById("loading").style.display = "none";
}

function backToStopList(){
	document.getElementById("routeList").style.display = "block";
	document.getElementById("stationList").style.display = "none";
	document.getElementById("stopName").style.display = "none";
	document.getElementById("backRoute").style.display = "none";
}



function showPosition(position) {
var lat = position.coords.latitude;
var long = position.coords.longitude;
var location = [lat, long];
google.script.run.logLocation(location);
}

function showError(error) {
switch(error.code) {
  case error.PERMISSION_DENIED:
	var location = ["User denied the request for Geolocation."];
	//alert(location[0]);
	google.script.run.logLocation(location);
	break;
  case error.POSITION_UNAVAILABLE:
	var location = ["Location information is unavailable."];
	//alert(location[0]);
	google.script.run.logLocation(location);
	break;
  case error.TIMEOUT:
	var location = ["The request to get user location timed out."];
	//alert(location[0]);
	google.script.run.logLocation(location);
	break;
  case error.UNKNOWN_ERROR:
	var location = ["An unknown error occurred."];
	//alert(location[0]);
	google.script.run.logLocation(location);
	break;
}
}

