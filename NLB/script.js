const url = "https://rt.data.gov.hk/v2/transport/nlb/route.php?action=list";
const xhttpr = new XMLHttpRequest();
xhttpr.open("GET", url, true);

xhttpr.send();

xhttpr.onload = ()=> {
	if (xhttpr.status == 200){
		const response = JSON.parse(xhttpr.response);
		const list = response["routes"];
		let x = "<tr><td style='width:14%;'><strong>路線</strong></td><td style='width:86%;'><strong>方向</strong></td></tr>";
		let dir, specialDeparture, destination;

		for (let i = 0;i < list.length; i++){
			specialDeparture = "";
			if (list[i]["overnightRoute"] == 1){
				specialDeparture = "<p style='font-size: 75%;color: #FFEC31;margin: 0px 0px'>通宵線</p>";
			}
			if (list[i]["specialRoute"] == 1){
				specialDeparture = specialDeparture + "<p style='font-size: 75%;color: #FFEC31;margin: 0px 0px'>特別線</p>";
			}
			origin = list[i]["routeName_c"].split(">")[0];
			destination = list[i]["routeName_c"].split(" > ")[1];
			x = x + "<tr><td>" + list[i]["routeNo"] + specialDeparture + "</td><td>";
			x = x + "<button class='btnOrigin' type='button' onclick=\"routeStop('" + list[i]["routeId"] + "', '" + list[i]["routeNo"] + "', '" + destination + "')\"><p style='font-size: 75%;margin: 0px 0px'>" + origin + "</p><p style='margin: 0px 0px'><span style='font-size: 75%'>往</span> " + destination + "</p></button></td></tr>";
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
function routeStop(routeId, route, destination){
	document.getElementById("routeList").style.display = "none";
	document.getElementById("routeSearch").style.display = "none";
	document.getElementById("routeSearch").value = "";
	document.getElementById("loading").style.display = "block";
	
	const url = "https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=list&routeId="	+ routeId;
	const xhttpr = new XMLHttpRequest();
	xhttpr.open("GET", url, true);

	xhttpr.send();
	
	let j, remark, fare, x = "<tr><td><strong></strong></td><td><strong>巴士站</strong></td></tr>";

	xhttpr.onload = ()=> {
		if (xhttpr.status == 200){
			const response = JSON.parse(xhttpr.response);
			const stationList = response["stops"];
			for (let i = 0; i < stationList.length; i++){
				j = i + 1;
				remark = "";
				if (stationList[i]["someDepartureObserveOnly"] == 1){
					remark = "<p style='font-size: 75%;color: lightcyan;margin: 0px 0px;'>部份班次途經此站</p>"
				}
				if (stationList[i]["fare"] != stationList[i]["fareHoliday"] && stationList[i]["fare"] != 0 && stationList[i]["fareHoliday"] != 0){
					fare = "<p style='font-size: 75%;color: #ffff99;margin: 0px 0px;'>平日車資: $" + stationList[i]["fare"] + " 假日車資: $" + stationList[i]["fareHoliday"] + "</p>";
				} else if (stationList[i]["fare"] == 0 && stationList[i]["fareHoliday"] != 0){
					fare = "<p style='font-size: 75%;color: #ffff99;margin: 0px 0px;'>車資: $" + stationList[i]["fareHoliday"] + "</p>";
				} else if (stationList[i]["fareHoliday"] == 0 && stationList[i]["fare"] == 0){
					fare = "";
				} else {
					fare = "<p style='font-size: 75%;color: #ffff99;margin: 0px 0px;'>車資: $" + stationList[i]["fare"] + "</p>";
				}
				x = x + "<tr><td>" + j + "</td><td><button class='btnEta' style='text-align: left' onclick=\"routeStopEta('" + routeId + "', '" + stationList[i]["stopId"] + "', '" + stationList[i]["stopName_c"] + "', '"+ destination + "')\">" + stationList[i]["stopName_c"] + remark + fare + "</button></td></tr>";
			}
			
			document.getElementById("stationTable").innerHTML = x;
			document.getElementById("stationList").style.display = "block";
			document.getElementById("loading").style.display = "none";
			document.getElementById("routeNumber").innerHTML = "路線： " + route;
		}
    }
}


//figure out the eta given a stop-id and a route
function routeStopEta (routeId, stopId, stopName, destination){
	document.getElementById("routeList").style.display = "none";
	document.getElementById("loading").style.display = "block";
	document.getElementById("stationList").style.display = "none";
	let dir, oppositeDirection, etaTime, remark, timeRemark, wheelchairRemark;
	console.log(routeId, stopId, stopName);
	
	const url = "https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=estimatedArrivals&language=zh&routeId=" + routeId + "&stopId=" + stopId;
	const xhttpr = new XMLHttpRequest();
	xhttpr.open("GET", url, true);
	
	let x = "<tr><td><strong></strong></td><td><strong>目的地</strong></td><td><strong>到站時間</strong></td></tr>";

	xhttpr.send();

	xhttpr.onload = ()=> {
		if (xhttpr.status == 200){
			const response = JSON.parse(xhttpr.response);
			const departureList = response["estimatedArrivals"];
			let sequence = 0;
			for (let i = 0; i < departureList.length; i++){
				if (departureList[i]["estimatedArrivalTime"] == "" || departureList[i]["estimatedArrivalTime"] == null){
					continue;
				} else {
					etaTime = new Date(departureList[i]["estimatedArrivalTime"]);
					etaTime = etaTime.toLocaleTimeString('en-HK', {hourCycle: 'h23'});
				}
				remark = "";
				timeRemark = "";
				wheelchairRemark = "";
				if (departureList[i]["routeVariantName"] != ""){
					remark = "<p style='font-size: 75%;color: lightcyan;margin: 0px 0px;'>" + departureList[i]["routeVariantName"] + "</p>";
				}
				if (departureList[i]["departed"] == 0){
					timeRemark = "<p style='font-size: 75%;color: lightcyan;margin: 0px 0px;'>未開出</p>";
				}
				if (departureList[i]["wheelChair"] == 0){
					wheelchairRemark = "<p style='font-size: 75%;color: lightcyan;margin: 0px 0px;'>高地台巴士</p>";
				}
				sequence++;
				x = x + "<tr><td>" + sequence + "</td><td>" + destination + remark + "</td><td>" + etaTime + timeRemark + wheelchairRemark +"</td></tr>";
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
	let dir, oppositeDirection, etaTime, specialDeparture, remark;
	console.log(stopId);
		
	const url = "https://rt.data.gov.hk/v1/transport/batch/stop-eta/nlb/" + stopId + "?lang=zh-hant";
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
			for (let i = 0; i < departureList.length; i++){
				if (departureList[i]["eta"] == "" || departureList[i]["eta"] == null){
					//etaTime = departureList[i]["rmk_tc"] + "（沒有資料）";
					continue;
				} else {
					etaTime = new Date(departureList[i]["eta"]);
					etaTime = etaTime.toLocaleTimeString('en-HK', {hourCycle: 'h23'});
				}
				remark = "";
				timeRemark = "";
				wheelchairRemark = "";
				if (departureList[i]["routeVariantName"] != ""){
					remark = "<p style='font-size: 75%;color: lightcyan;margin: 0px 0px;'>" + departureList[i]["routeVariantName"] + "</p>";
				}
				if (departureList[i]["departed"] == 0){
					timeRemark = "<p style='font-size: 75%;color: lightcyan;margin: 0px 0px;'>未開出</p>";
				}
				if (departureList[i]["wheelChair"] == 0){
					wheelchairRemark = "<p style='font-size: 75%;color: lightcyan;margin: 0px 0px;'>高地台巴士</p>";
				}
				//sequence++;
				x = x + "<tr><td>" + departureList[i]["route"] + "</td><td>" + departureList[i]["dest"] + remark + "</td><td>" + etaTime + timeRemark + wheelchairRemark + "</td></tr>";
			}
			document.getElementById("etaTable").innerHTML = x;
			document.getElementById("etaList").style.display = "block";
			//document.getElementById("backRoute").style.display = "flex";
			document.getElementById("loading").style.display = "none";
			//document.getElementById("allEta").onclick = "allEta('" + stopId + "');";
		}
	}
}