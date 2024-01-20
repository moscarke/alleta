function hpRoute(){
document.getElementById("stationList").style.display = "none";
document.getElementById("routeList").style.display = "none";

document.getElementById("routeList").style.display = "block";
document.getElementById("hph").style.display = "block";
}

function queryKmbRoute(){
// document.getElementById("stationList").style.display = "none";
document.getElementById("routeList").style.display = "none";
// document.getElementById("queryBtn").style.display = "none";
document.getElementById("loading").style.display = "block";

google.script.run.withSuccessHandler(
  function (a){
	document.getElementById("listTable").innerHTML = a;
	document.getElementById("routeList").style.display = "block";

	document.getElementById("loading").style.display = "none";
	document.getElementById("hph").style.display = "block";
  }
).kmbQueryHTML();
}

function depPlace(line){
	document.getElementById("pgOne").style.display = "none";
	document.getElementById("line").innerHTML = line;
	var divName = line + "Div";
	document.getElementById(divName).style.display = "block";

	if (line == "AEL"){
		var lin = "機場快線";
	} else if (line == "TCL"){
		var lin = "東涌線";
	} else if (line == "TKL"){
		var lin = "將軍澳線";
	} else if (line == "EAL"){
		var lin = "東鐵線";
	} else if (line == "TML"){
		var lin = "屯馬線";
	} else if (line == "SIL"){
		var lin = "南港島線";
	} else if (line == "TWL"){
		var lin = "荃灣線";
	} else if (line == "ISL"){
		var lin = "港島線";
	} else {
		var lin = "觀塘線";
	}

	document.getElementById("lin").innerHTML = lin;
}

function schQuery(station){
	var line = document.getElementById("line").innerHTML;
	document.getElementById("stat").style.display = "none";
	document.getElementById("loading").style.display = "block";
	var sta = mtrStationCode(station);
	document.getElementById("sta").innerHTML = sta;
	
	const name = line + "-" + station;
	
	const url = "https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=" + line + "&sta=" + station;
	const xhttpr = new XMLHttpRequest();
	xhttpr.open("GET", url, true);
	
	xhttpr.send();
	
	xhttpr.onload = ()=> {
		if (xhttpr.status == 200){
			const response = JSON.parse(xhttpr.response);
			const list = response["data"];
			const route = list[name];
			const up = route["UP"];
			const down = route["DOWN"];
			
			let len = "";
			let leng = "";
			if (up != null){
				len = up.length;
			}
			if (down != null){
				leng = down.length;
			}
			var x = "";
			
			if (len != ""){     
				var x = '<tr><td><strong>上行</strong></td></tr>';
				var x = x +'<tr><td><strong>抵站時間</strong></td><td><strong>月台</strong></td><td><strong>終點站</strong></td></tr>';

				for (i = 0; i < len; i++){
					var route2 = up[i];
					var platform = route2["plat"];
					var etaTime = route2["time"];
					var destination = route2["dest"];
	
					var outputDestination = mtrStationCode(destination);

					var platformNo = platform + "號月台";

					var etaDate = new Date(etaTime);
					var time = etaDate.toLocaleTimeString('en-HK', {hourCycle: 'h23'});

					var x = x + "<tr><td>" + time + "</td><td>" + platformNo + "</td><td>" + outputDestination + "</td></tr>";
				}
			}

			if (x == undefined){
				var x = "";
			}

			if (leng != ""){
				var x = x + '<tr><td><strong>下行</strong></td></tr>';
				var x = x + '<tr><td><strong>抵站時間</strong></td><td><strong>月台</strong></td><td><strong>終點站</strong></td></tr>';

				for (y = 0; y < leng; y++){
					var route2 = down[y];
					var platform = route2["plat"];
					var etaTime = route2["time"];
					var destination = route2["dest"];

					var outputDestination = mtrStationCode(destination);

					var platformNo = platform + "號月台";

					var etaDate = new Date(etaTime);
					var time = etaDate.toLocaleTimeString('en-HK', {hourCycle: 'h23'});

					var x = x + "<tr><td>" + time + "</td><td>" + platformNo + "</td><td>" + outputDestination + "</td></tr>";
				}
			}
			
			if (x == ""){
				var x = '<tr><td><strong>No information</strong></td></tr>';
			}
			document.getElementById("listTable").innerHTML = x;
			document.getElementById("routeList").style.display = "block";

			document.getElementById("loading").style.display = "none";
		} else {
			//idk do sth
		}
	}
}

function hptoHome(){
	window.location.reload();
}


function mtrStationCode(stationCode){
	var x;
	
	switch (stationCode) {		
		case "HOK":
			x = "香港";
			break;
		case "KOW":
			x = "九龍";
			break;
		case "TSY":
			x = "青衣";
			break;
		case "AIR":
			x = "機場";
			break;
		case "AWE":
			x = "機場博覽館";
			break;
		case "OLY":
			x = "奧運";
			break;
		case "LAK":
			x = "荔景";
			break;
		case "NAC":
			x = "南昌";
			break;
		case "SUN":
			x = "欣澳";
			break;
		case "TUC":
			x = "東涌";
			break;
		case "WKS":
			x = "烏溪沙";
			break;
		case "MOS":
			x = "馬鞍山";
			break;
		case "HEO":
			x = "恆安";
			break;
		case "TSH":
			x = "大水坑";
			break;
		case "SHM":
			x = "石門";
			break;
		case "CIO":
			x = "第一城";
			break;
		case "STW":
			x = "沙田圍";
			break;
		case "CKT":
			x = "車公廟";
			break;
		case "TAW":
			x = "大圍";
			break;
		case "HIK":
			x = "顯徑";
			break;
		case "DIH":
			x = "鑽石山";
			break;
		case "KAT":
			x = "啟德";
			break;
		case "SUW":
			x = "宋王臺";
			break;
		case "TKW":
			x = "土瓜灣";
			break;
		case "HOM":
			x = "何文田";
			break;
		case "HUH":
			x = "紅磡";
			break;
		case "ETS":
			x = "尖東";
			break;
		case "AUS":
			x = "柯士甸";
			break;
		case "MEF":
			x = "美孚";
			break;
		case "TWW":
			x = "荃灣西";
			break;
		case "KSR":
			x = "錦上路";
			break;
		case "YUL":
			x = "元朗";
			break;
		case "LOP":
			x = "朗屏";
			break;
		case "TIS":
			x = "天水圍";
			break;
		case "SIH":
			x = "兆康";
			break;
		case "TUM":
			x = "屯門";
			break;
		case "NOP":
			x = "北角";
			break;
		case "QUB":
			x = "鰂魚涌";
			break;
		case "YAT":
			x = "油塘";
			break;
		case "TIK":
			x = "調景嶺";
			break;
		case "TKO":
			x = "將軍澳";
			break;
		case "LHP":
			x = "康城";
			break;
		case "HAH":
			x = "坑口";
			break;
		case "POA":
			x = "寶琳";
			break;
		case "OCP":
			x = "海洋公園";
			break;
		case "ADM":
			x = "金鐘";
			break;
		case "EXC":
			x = "會展";
			break;
		case "MKK":
			x = "旺角東";
			break;
		case "KOY":
			x = "九龍塘";
			break;
		case "SHT":
			x = "沙田";
			break;
		case "FOT":
			x = "火炭";
			break;
		case "UNI":
			x = "大學";
			break;
		case "TAP":
			x = "大埔墟";
			break;
		case "TWO":
			x = "太和";
			break;
		case "FAN":
			x = "粉嶺";
			break;
		case "SHS":
			x = "上水";
			break;
		case "WCH":
			x = "黃竹坑";
			break;
		case "LET":
			x = "利東";
			break;
		case "SOH":
			x = "海怡半島";
			break;
		case "LOW":
			x = "羅湖";
			break;
		case "RAC":
			x = "馬場";
			break;
		case "LMC":
			x = "落馬洲";
			break;
		case "CEN":
			x = "中環";
			break;
		case "TST":
			x = "尖沙咀";
			break;
		case "JOR":
			x = "佐敦";
			break;
		case "YMT":
			x = "油麻地";
			break;
		case "MOK":
			x = "旺角";
			break;
		case "PRE":
			x = "太子";
			break;
		case "SSP":
			x = "深水埗";
			break;
		case "CSW":
			x = "長沙灣";
			break;
		case "LCK":
			x = "荔枝角";
			break;
		case "KWF":
			x = "葵芳";
			break;
		case "KWH":
			x = "葵興";
			break;
		case "TWH":
			x = "大窩口";
			break;
		case "TSW":
			x = "荃灣";
			break;
		case "ADM":
			x = "金鐘";
			break;
		case "CHW":
			x = "柴灣";
			break;
		case "HFC":
			x = "杏花邨";
			break;
		case "SKW":
			x = "筲箕灣";
			break;
		case "SWH":
			x = "西灣河";
			break;
		case "TAK":
			x = "太古";
			break;
		case "FOH":
			x = "炮台山";
			break;
		case "TIH":
			x = "天后";
			break;
		case "CAB":
			x = "銅鑼灣";
			break;
		case "WAC":
			x = "灣仔";
			break;
		case "SHW":
			x = "上環";
			break;
		case "SYP":
			x = "西營盤";
			break;
		case "HKU":
			x = "香港大學";
			break;
		case "KET":
			x = "堅尼地城";
			break;
		case "WHA":
			x = "黃埔";
			break;
		case "SKM":
			x = "石劍尾";
			break;
		case "LOF":
			x = "樂富";
			break;
		case "WTS":
			x = "黃大仙";
			break;
		case "CHH":
			x = "彩虹";
			break;
		case "KOB":
			x = "九龍灣";
			break;
		case "NTK":
			x = "牛頭角";
			break;
		case "KWT":
			x = "觀塘";
			break;
		case "LAT":
			x = "藍田";
			break;
	}
return x;
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

