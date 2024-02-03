const url = "https://data.etabus.gov.hk/v1/transport/kmb/route/";
const xhttpr = new XMLHttpRequest();
xhttpr.open("GET", url, true);

xhttpr.send();

xhttpr.onload = ()=> {
	if (xhttpr.status == 200){
		const response = JSON.parse(xhttpr.response);
		const list = response["data"];
		let x = "<tr><td style='width:14%;'><strong>路線</strong></td><td style='width:86%;'><strong>方向</strong></td></tr>";
		let dir, specialDeparture;

		for (let i = 0;i < list.length; i++){
			if (list[i]["bound"] == "I"){
				dir = "inbound";
			} else {
				dir = "outbound";
			}
			specialDeparture = "";
			if (list[i]["service_type"] != 1){
				specialDeparture = "<br><p style='font-size: 75%;color: #FFEC31;margin: 0px 0px'>特別班</p>";
			}
			x = x + "<tr><td>" + list[i]["route"] + specialDeparture + "</td><td>";
			x = x + "<button class='btnOrigin' type='button' onclick=\"routeStop('" + list[i]["route"] + "', '" + dir + "', '" + list[i]["service_type"] + "')\"><p style='font-size: 75%;margin: 0px 0px'>" + list[i]["orig_tc"] + "</p><p style='margin: 0px 0px'><span style='font-size: 75%'>往</span> " + list[i]["dest_tc"] + "</p></button></td></tr>";
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
function routeStop(route, direction, serviceType){
	document.getElementById("routeList").style.display = "none";
	document.getElementById("routeSearch").style.display = "none";
	document.getElementById("routeSearch").value = "";
	document.getElementById("loading").style.display = "block";
	
	const url = "https://data.etabus.gov.hk/v1/transport/kmb/route-stop/" + route + "/" + direction + "/" + serviceType;
	const xhttpr = new XMLHttpRequest();
	xhttpr.open("GET", url, true);

	xhttpr.send();
	
	const stationNameList = [];
	let info = "";

	xhttpr.onload = ()=> {
		if (xhttpr.status == 200){
			const response = JSON.parse(xhttpr.response);
			const stationList = response["data"];
			for (let i = 0; i < stationList.length; i++){
				stopInfo(stationList[i]["stop"], function(data){
					stationNameList.push({number: (i + 1), name: data["name_tc"], id: data["stop"]});
					if (stationNameList.length == stationList.length){
						finishRouteStop(stationNameList, route, direction, serviceType);
					}
				});
			}
			if (stationList.length == 0){
				let oppositeDirection;
				if (direction == "inbound"){
					oppositeDirection = "outbound";
				} else {
					oppositeDirection = "inbound";
				}
				let x = "<tr><td><strong>此路線沒有此方向</strong></td></tr><tr><td><input class='btnOrigin' type='button' value='按此搜尋相反方向' onclick=\"routeStop('" + route + "', '" + oppositeDirection + "')\"</td></tr>";
				document.getElementById("stationTable").innerHTML = x;
				document.getElementById("stationList").style.display = "block";
				document.getElementById("loading").style.display = "none";
				document.getElementById("routeNumber").innerHTML = "路線： " + route;
			}
		}
    }
}

function finishRouteStop(stationNameList, route, direction, serviceType){
	let x = "<tr><td><strong></strong></td><td><strong>巴士站</strong></td></tr>";
	stationNameList.sort(function(a, b) {
		var routeA = String(a["number"]);
		var routeB = String(b["number"]);

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

	for (let i = 0; i < stationNameList.length; i++){
		x = x + "<tr><td>" + stationNameList[i]["number"] + "</td><td><button class='btnEta' style='text-align: left' onclick=\"routeStopEta('" + stationNameList[i]["id"] + "', '" + route + "', '" + direction + "', '" + stationNameList[i]["name"] + "', '" + serviceType + "')\">" + stationNameList[i]["name"] + "</button></td></tr>";
	}

	document.getElementById("stationTable").innerHTML = x;
	document.getElementById("stationList").style.display = "block";
	document.getElementById("loading").style.display = "none";
	document.getElementById("routeNumber").innerHTML = "路線： " + route;
}

// returns the data of a stop when given a stop-id
function stopInfo(stopId, callback){
	const url = "https://data.etabus.gov.hk/v1/transport/kmb/stop/" + stopId;
	const xhttpr = new XMLHttpRequest();
	xhttpr.open("GET", url, true);

	xhttpr.onload = function() {
		if (xhttpr.status === 200) {
			const response = JSON.parse(xhttpr.responseText);
			callback(response["data"]);
		}
	};

	xhttpr.send();
}

//figure out the eta given a stop-id and a route
function routeStopEta (stopId, route, direction, stopName, serviceType){
	document.getElementById("routeList").style.display = "none";
	document.getElementById("loading").style.display = "block";
	document.getElementById("stationList").style.display = "none";
	let dir, oppositeDirection, etaTime, remark;
	console.log(stopId, route, direction, serviceType);
	
	if (direction == "inbound"){
		dir = "I";
		oppositeDirection = "outbound";
	} else {
		dir = "O";
		oppositeDirection = "inbound";
	}
	
	const url = "https://data.etabus.gov.hk/v1/transport/kmb/eta/" + stopId + "/" + route + "/" + serviceType;
	const xhttpr = new XMLHttpRequest();
	xhttpr.open("GET", url, true);
	
	let x = "<tr><td><strong></strong></td><td><strong>目的地</strong></td><td><strong>到站時間</strong></td></tr>";

	xhttpr.send();

	xhttpr.onload = ()=> {
		if (xhttpr.status == 200){
			const response = JSON.parse(xhttpr.response);
			const departureList = response["data"];
			let sequence = 0;
			departureList.sort(function(a, b) {
				return parseFloat(a["eta_seq"]) - parseFloat(b["eta_seq"]);
			});
			for (let i = 0; i < departureList.length; i++){
				if (departureList[i]["dir"] == dir){
					if (departureList[i]["eta"] == "" || departureList[i]["eta"] == null){
						//etaTime = departureList[i]["rmk_tc"] + "（沒有資料）";
						continue;
					} else {
						etaTime = new Date(departureList[i]["eta"]);
						etaTime = etaTime.toLocaleTimeString('en-HK', {hourCycle: 'h23'});
					}
					remark = "";
					if (departureList[i]["rmk_tc"] != ""){
						remark = "<br><p style='font-size: 75%;color: lightcyan;margin: 0px 0px;'>" + departureList[i]["rmk_tc"] + "</p>";
					}
					sequence++;
					x = x + "<tr><td>" + sequence + "</td><td>" + departureList[i]["dest_tc"] + "</td><td>" + etaTime + remark + "</td></tr>";
				}
			}
			if (x == "<tr><td><strong></strong></td><td><strong>目的地</strong></td><td><strong>到站時間</strong></td></tr>"){
				x = "<tr><td><strong>未來60分鐘沒有由此站開出的班次</strong></td><tr>";
			}
			document.getElementById("etaTable").innerHTML = x;
			document.getElementById("etaList").style.display = "block";
			document.getElementById("allEta").onclick = function () {allEta(stopId)};
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

function allEta(stopId){
	document.getElementById("stationList").style.display = "none";
	document.getElementById("backRoute").style.display = "none";
	document.getElementById("routeList").style.display = "none";
	document.getElementById("routeNumber").style.display = "none";
	document.getElementById("loading").style.display = "block";
	document.getElementById("etaList").style.display = "none";
	let dir, oppositeDirection, etaTime, specialDeparture, remark, skip = false;
	const routeDepartList = [];
	console.log(stopId);
	
	
	const url = "https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/" + stopId;
	const xhttpr = new XMLHttpRequest();
	xhttpr.open("GET", url, true);
	
	let x = "<tr><td><strong>路線</strong></td><td><strong>目的地</strong></td><td><strong>到站時間</strong></td></tr>";

	xhttpr.send();

	xhttpr.onload = ()=> {
		if (xhttpr.status == 200){
			const response = JSON.parse(xhttpr.response);
			const departureList = response["data"];
			departureList.sort(function(a, b) {
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
			setupTableLoop:
			for (let i = 0; i < departureList.length; i++){
				if (departureList[i]["eta"] == "" || departureList[i]["eta"] == null){
					//etaTime = departureList[i]["rmk_tc"] + "（沒有資料）";
					continue;
				} else {
					etaTime = new Date(departureList[i]["eta"]);
					etaTime = etaTime.toLocaleTimeString('en-HK', {hourCycle: 'h23'});
				}
				if (i != 0){
					if (departureList[i]["route"] != departureList[i - 1]["route"]){
						routeDepartList.splice(0, routeDepartList.length);
					}
				}
				for (let j = 0; j < routeDepartList.length; j++){
					if (routeDepartList[j] == etaTime){
						continue setupTableLoop;
					}
				}
				routeDepartList.push(etaTime);
				specialDeparture = "";
				if (departureList[i]["service_type"] != 1){
					specialDeparture = "<br><p style='font-size: 75%;color: #FFEC31;margin: 0px 0px'>特別班</p>";
				}
				remark = "";
				if (departureList[i]["rmk_tc"] != ""){
					remark = "<span style='font-size: 75%;color: lightcyan;margin: 0px 0px;'> - " + departureList[i]["rmk_tc"] + "</span>";
				}
				// merge rows if they are the same route and destination
				if (i == departureList.length - 1 && !skip){
					x = x + "<tr><td>" + departureList[i]["route"] + "</td><td>" + departureList[i]["dest_tc"] + "</td><td>" + etaTime + remark + "</td></tr>";
				} else if (skip){
					x = x + "<p style='font-size: 18px; margin: 0px 0px;'>" + etaTime + remark + "</p>";
					if (i == departureList.length - 1){
						x += "</td></tr>";
						continue;
					}
					if (departureList[i]["route"] != departureList[i + 1]["route"] || departureList[i]["dest_tc"] != departureList[i + 1]["dest_tc"]){
						skip = false;
						x += "</td></tr>";
					}
				} else if (departureList[i]["route"] == departureList[i + 1]["route"] && departureList[i]["dest_tc"] == departureList[i + 1]["dest_tc"]){
					x = x + "<tr><td>" + departureList[i]["route"] + "</td><td>" + departureList[i]["dest_tc"] + "</td><td>" + etaTime + remark;
					skip = true;
				} else {
					x = x + "<tr><td>" + departureList[i]["route"] + "</td><td>" + departureList[i]["dest_tc"] + "</td><td>" + etaTime + remark + "</td></tr>";
				}
				//x = x + "<tr><td>" + departureList[i]["route"] + specialDeparture + "</td><td>" + departureList[i]["dest_tc"] + "</td><td>" + etaTime + remark + "</td></tr>";
			}
			document.getElementById("etaTable").innerHTML = x;
			document.getElementById("etaList").style.display = "block";
			//document.getElementById("backRoute").style.display = "flex";
			document.getElementById("loading").style.display = "none";
			//document.getElementById("allEta").onclick = "allEta('" + stopId + "');";
		}
	}
}