const url = "https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fopendata.mtr.com.hk%2Fdata%2Fmtr_bus_routes.csv";
const xhttpr = new XMLHttpRequest();
const stopList = [], routeList = [];
xhttpr.open("GET", url, true);

xhttpr.send();

xhttpr.onload = ()=> {
	if (xhttpr.status == 200){
		const response = xhttpr.response;
		const responseArr = response.split("\r\n");
		
		let x = "<tr><td style='width:14%;'><strong>路線</strong></td><td style='width:86%;'><strong>方向</strong></td></tr>";
		
		for (let i = 1; i < responseArr.length - 1; i++){
			stopList.push(responseArr[i].split(","));
			var a = responseArr[i].split(",");
			for (let j = 0; j < a.length; j++){
				a[j] = a[j].substring(1, a[j].length-1);
			}
			routeList.push({route: a[0], orig_tc: a[1].split("至")[0], dest_tc: a[1].split("至")[1], dir: "O"});
			if (a[1].slice(-5) != "(循環線)"){
				routeList.push({route: a[0], orig_tc: a[1].split("至")[1], dest_tc: a[1].split("至")[0], dir: "I"});
			}
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
		document.getElementById("routeTable").innerHTML = x;
		document.getElementById("routeList").style.display = "block";

		document.getElementById("waiting").style.display = "none";
	} else {
		//idk do sth
	}
}


function hptoHome(){
	document.getElementById("routeSearch").style.display = "block";
	document.getElementById("stationList").style.display = "none";
	document.getElementById("etaList").style.display = "none";
	document.getElementById("routeNumber").innerHTML = "";
	document.getElementById("stopName").innerHTML = "";
	searchRoute();
	document.getElementById("routeList").style.display = "block";
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
}

// find all stops of a route given the route and direction
function routeStop(route, direction, destination){
	document.getElementById("routeList").style.display = "none";
	document.getElementById("routeSearch").style.display = "none";
	document.getElementById("routeSearch").value = "";
	document.getElementById("loading").style.display = "block";
	
	const url = "https://res.data.gov.hk/api/get-download-file?name=https%3A%2F%2Fopendata.mtr.com.hk%2Fdata%2Fmtr_bus_stops.csv";
	const xhttpr = new XMLHttpRequest();
	xhttpr.open("GET", url, true);

	xhttpr.send();
	
	const stationNameList = [];
	let info = "", start, j;
	let x = "<tr><td><strong></strong></td><td><strong>巴士站</strong></td></tr>";

	xhttpr.onload = ()=> {
		if (xhttpr.status == 200){
			const response = xhttpr.response;
			const responseArr = response.split("\r\n");
			const stationList = [];
			for (let i = 1; i < responseArr.length; i++){
				stopList.push(responseArr[i].split(","));
				var a = responseArr[i].split(",");
				for (let j = 0; j < a.length; j++){
					a[j] = a[j].substring(1, a[j].length-1);
				}
				if (a[0] == route && a[1] == direction){
					start = true;
					stationList.push({name: a[6], id: a[3]});
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
			document.getElementById("stationTable").innerHTML = x;
			document.getElementById("stationList").style.display = "block";
			document.getElementById("loading").style.display = "none";
			document.getElementById("routeNumber").innerHTML = "路線： " + route;
		} else {
			// idk do sth
		}
    }
}

//figure out the eta given a stop-id and a route
function routeStopEta (stopId, route, direction, stopName, destination){
	document.getElementById("routeList").style.display = "none";
	document.getElementById("loading").style.display = "block";
	document.getElementById("stationList").style.display = "none";
	let etaTime, remark, stopSeq = 0, scheduled;
	console.log(stopId, route, direction);
	
	const url = "https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule";
	const xhttpr = new XMLHttpRequest();
	const params = JSON.stringify({
		language: "zh",
		routeName: route
	});
	xhttpr.open("POST", url, true);
	xhttpr.setRequestHeader("Content-type", "application/json");
	
	let x = "<tr><td><strong></strong></td><td><strong>目的地</strong></td><td><strong>到站時間</strong></td></tr>";

	xhttpr.send(params);

	xhttpr.onreadystatechange = ()=> {
		if (xhttpr.readyState === 4 && xhttpr.status == 200){
			const response = JSON.parse(xhttpr.response);
			const responseList = response["busStop"];
			for (let i = 0; i < responseList.length; i++){
				if (responseList[i]["busStopId"] == stopId){
					stopSeq = i;
					break;
				}
			}
			const departureList = responseList[stopSeq]["bus"];
			let sequence = 0;
			for (let i = 0; i < departureList.length; i++){
				if (departureList[i]["departureTimeInSecond"] == "" || departureList[i]["departureTimeInSecond"] == null){
					continue;
				} else {
					etaTime = new Date();
					etaTime.setTime(etaTime.getTime() + departureList[i]["departureTimeInSecond"] * 1000);
					etaTime = etaTime.toLocaleTimeString('en-HK', {hourCycle: 'h23'});
				}
				remark = "";
				if (departureList[i]["busRemark"] != "" && departureList[i]["busRemark"] != null){
					remark = "<br><p style='font-size: 75%;color: #FFEC31;margin: 0px 0px;'>" + departureList[i]["busRemark"] + "</p>";
				}
				scheduled = "";
				if (departureList[i]["isScheduled"] == 1){
					scheduled = "<br><p style='font-size: 75%;color: lightcyan;margin: 0px 0px'>預定班次</p>";
				}
				sequence++;
				x = x + "<tr><td>" + sequence + "</td><td>" + destination + remark + "</td><td>" + etaTime + scheduled + "</td></tr>";
			}
			if (x == "<tr><td><strong></strong></td><td><strong>目的地</strong></td><td><strong>到站時間</strong></td></tr>"){
				x = "<tr><td><strong>未來60分鐘沒有由此站開出的班次</strong></td><tr>";
			}
			document.getElementById("etaTable").innerHTML = x;
			document.getElementById("etaList").style.display = "block";
			document.getElementById("backRoute").style.display = "flex";
			document.getElementById("loading").style.display = "none";
			document.getElementById("stopName").innerHTML = "巴士站： " + stopName;
			document.getElementById("stopName").style.display = "block";
		}
    }
}

function searchRoute(){
	let input, filter, table, tr, td, i, txtValue;
	input = document.getElementById("routeSearch");
	filter = input.value.toUpperCase();
	table = document.getElementById("routeTable");
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

function backToStopList(){
	document.getElementById("stationList").style.display = "block";
	document.getElementById("etaList").style.display = "none";
	document.getElementById("stopName").style.display = "none";
	document.getElementById("backRoute").style.display = "none";
}



