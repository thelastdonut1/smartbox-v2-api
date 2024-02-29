/********************************************************************
*        Copyright (c) 2009-2016 Cisco Systems, Inc.
*        All rights reserved.
********************************************************************/
dojo.require("dojo.parser");
dojo.require("xwt.widget.form.ComboBox");
dojo.require("xwt.widget.form.TextButton");
dojo.require("dijit.layout.ContentPane");
dojo.require("xwt.widget.layout.TitlePane");
dojo.require("xwt.widget.form.UnifiedIPAddress");
dojo.require("xwt.widget.notification.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("xwt.widget.form.PasswordTextBox");
dojo.require("dojo.io.iframe");

var agentTableData;
var tableWidget;
var statusColor;
var adstatusColor;
var agentStatus;
var urlname;
var selected = null;
var rj45_images = new Array();
rj45_images = rj45Images();
var formImportDlg;
var formExportDlg;
var formAgentLogDlg;
var logDetail;
var slectedExportAgentDir;
var formAdapterDlg;
var adapterTableData;
var tableWidget1;

var agentData = {

		items : [{
				//"serNum" : "",
				"name" : "",
				"agentStatus" : ""//,
				//"adapterStatus" : "",
				//"action" : ""
			}
		]
	};


var agentLayout = [/*{
		label : "#",
		attr : 'serNum',
		sortable : false,
		width : 100

	}, */{
		label : "Agent",
		attr : 'name',
		sortable : true,
		sorted : 'ascending',
		width : 200
	}, {
		label : "Agent Status",
		attr : 'agentStatus',
		sortable : false,
		width : 200
	}/*, {
		label : "Adapter Status",
		attr : 'adapterStatus',
		sortable : false,
		width : 200
	}, {
		label : "Action",
		attr : 'action',
		sortable : false,
		width : 200
	}*/
];
var agentDataStore = new dojo.data.ItemFileReadStore({
		data : agentData
	});

var adapterData = {

		items : [{
				"adapterName" : "",
				"adapterStatus" : "",
				"agentName" : "",
				"host" : "",
				"port" : ""
			}
		]
	};

var adapterLayout = [{
           		label : "Adapter",
           		attr : 'adapterName',
           		sortable : true,
           		sorted : 'ascending',
           		width : 110
           	}, /*{
           		label : "Adapter Status",
           		attr : 'adapterStatus',
           		sortable : false,
           		width : 100
           	}, */{
           		label : "Agent Name",
           		attr : 'agentName',
           		sortable : false,
           		width : 100
           	},{
           		label : "IP Address",
           		attr : 'host',
           		sortable : false,
           		width : 100
           	},{
           		label : "Port",
           		attr : 'port',
           		sortable : false,
           		width : 60
           	}];

var adapterDataStore = new dojo.data.ItemFileReadStore({
	data : adapterData
});

function pcAgentStatus() {
	var serNum;
	var name;
	var agentStatus;
	var adapterStatus;
	var action;
}

function pcAdapterStatus() {
	var adapterName;
	var agentName;
	var adapterStatus;
	var host;
	var port;
}

dojo.addOnLoad(function () {
	adapterTableData = new Array();
	formValues();
	initAgentTable();
	initAdapterTable();
	cn_fileMgmtList_init();
	formExportDlg = dijit.byId("exportFileDialog");
	formAgentLogDlg = dijit.byId("agentLogDialog");
	formAdapterDlg = dijit.byId("adapterLogDialog");
	
	fillSouthBoundSetting();
	dojo.connect(dijit.byId("sbSubmit"), "onClick", onConfigure);
	
	dojo.connect(formExportDlg.buttonGroup.getItemAt(0), "onClick", "cn_fileMgmt_export");
	dojo.connect(formAgentLogDlg.buttonGroup.getItemAt(0), "onClick", function () {formAgentLogDlg.hide();});
	dojo.connect(formAdapterDlg.buttonGroup.getItemAt(0), "onClick", function () {formAdapterDlg.hide();});
	console.log("<<<-------------addOnLoad---------------->>>>");
	var actionIds = ["startButton", "stopButton", "importButton", "exportButton", "agentLogButton", "adapterViewButton", "adapterLogButton", "createaAgentButton"];
	controlUserAccess(actionIds);
	
});

function initAgentTable() {

	var agentTable2 = dojo.clone(agentTableData, true);
	var agentJson = new Array();
	agentJson.items = agentTable2;
	var newStore = new dojo.data.ItemFileWriteStore({
			data : agentJson
		});
	tableWidget = dijit.byId("agentTable");
	tableWidget.attr("store", newStore);
	tableWidget.render();
	tableWidget.refresh(true);
}

function formAdapterTableValues(agentDir) {
	var adapterData;
	var fileName = "";
	dojo.xhrGet({
		url : "fileList?dir=" + agentDir,
		content : {},
		sync : true,
		handleAs: "json",
		load : function (data, ioArgs) {
			for (i = 0; i < data.length; i++) {
				if (data[i].indexOf(".cfg") != -1) { 
					fileName = data[i];
					break;
				}
			}
			if (fileName != "") {
				dojo.xhrGet({
					url : "fileShow?filepath=" + agentDir + "/" + fileName,
					content : {},
					sync : true,
					load : function (data, ioArgs) {
						adapterTableData = new Array();
						data = data.substr(data.indexOf("Adapters"));
						var temp = data.substr(data.indexOf("Adapters"), data.lastIndexOf("Port =")+12);
						adapterData = new Array();
						while (temp.indexOf("Host =") != -1) {
							var obj = new pcAdapterStatus();
							obj.adapterName = "";
							obj.agentName = "";
							obj.adapterStatus = "";
							obj.host = "";
							obj.port = "";
							adapterTableData[adapterTableData.length] = obj;
							
							var tempDeviceVal = temp.substr(0, temp.indexOf("Port =")+12);
							var val = grep_string (/Device =/, tempDeviceVal);
							var deviceIndex = token_string ("Device =", 1, val);
							obj.adapterName = (deviceIndex != null) ? deviceIndex : "";
							val = grep_string (/Host =/, tempDeviceVal);
							obj.host = token_string ("Host =", 1, val);
							val = grep_string (/Port =/, tempDeviceVal);
							obj.port = token_string ("Port =", 1, val);
							obj.agentName = agentDir; 
							obj.adapterStatus = getPortStyleandStatus("", "");
							temp = temp.substr(temp.indexOf("Port = ")+12);
						}
						initAdapterTable();
					},
					error : function (response, ioArgs) {
						showToast(response,"toast");
					}
				});
			}
		},
		error : function (response, ioArgs) {
			showToast(response,"toast");
		}
	});
	
	
	/*adapterTableData = new Array();
	
	for (i = 0; i < 2; i++) {
		var obj = new pcAdapterStatus();
		obj.adapterName = "";
		obj.agentName = "";
		obj.adapterStatus = "";
		adapterTableData[adapterTableData.length] = obj;
		
		statusColor = getPortStyleandStatus("running","Test1");
		adstatusColor = getPortStyleandStatus("", "");
		agentStatus = "";//getPortStyleandStatus(resp[i].status.value,resp[i].dir.value);
		obj.adapterName = "Hello";
		obj.agentName = "demo1"; 
		obj.adapterStatus = adstatusColor;
	}*/
}

function initAdapterTable() {
	var adTable2 = dojo.clone(adapterTableData, true);
	var adJson = new Array();
	adJson.items = adTable2;
	var newStore = new dojo.data.ItemFileWriteStore({
			data : adJson
		});
	tableWidget1 = dijit.byId("adapterTable");
	tableWidget1.attr("store", newStore);
	tableWidget1.render();
	tableWidget1.refresh(true);
}

function formValues () {
	agentTableData = new Array();
	var form = document.forms["mtconnectForm"];
	var ioxip = form.IOX_IP_INT_DETAIL.value;
	if (ioxip) {
		urlname = "http://" + ioxip.trim().split(" ")[3] +":5010/"; 
	}
	
	dojo.xhrGet({
		url : "agentList",
		content : {},
		sync : true,
		handleAs: "json",
		load : function (data, ioArgs) {
			var resp = data;
			for (i = 0; i < resp.length; i++) {
				var obj = new pcAgentStatus();
				obj.serNum = "";
				obj.name = "";
				obj.agentStatus = "";
				obj.adapterStatus = "";
				obj.action = "";
				agentTableData[agentTableData.length] = obj;
				
				statusColor = getPortStyleandStatus(resp[i].status,resp[i].dir);
				adstatusColor = getPortStyleandStatus("", "");
				agentStatus = "";//getPortStyleandStatus(resp[i].status.value,resp[i].dir.value);
				obj.serNum = i+1;
				obj.name = resp[i].dir; 
				obj.agentStatus = statusColor;
				obj.adapterStatus = adstatusColor;
				obj.action = agentStatus;
			}
		},
		error : function (response, ioArgs) {
			showToast(response,"toast");
		}
	});
}

function startButton () {
	selected = tableWidget.selected();
	if (selected.length == 0){
		errorMessageNotification("Please select agents to start.", null);
		return;
	}
	for(var k=0; k < selected.length;k++)
	{
		var agentName = selected[k].name[0];
		
		dojo.xhrGet({
			url : "agentStart?agentdir=" + agentName,
			content : {},
			sync : true,
			handleAs: "json",
			load : function (data, ioArgs) {
				if (data.result.indexOf("success") != -1 || data.result.indexOf("Success") != -1) {
					showToast("Agent " + agentName + " started successfully","toast");
				} else {
					showToast("Failed to start agent " + agentName,"toast");
				}
				
			},
			error : function (response, ioArgs) {
				showToast("Failed to start agent " + agentName,"toast");
			}
		});
	}
	
	formValues();
	initAgentTable();
}

function stopButton () {
	selected = tableWidget.selected();
	if (selected.length == 0){
		errorMessageNotification("Please select agents to stop.", null);
		return;
	}
	for(var k=0; k < selected.length;k++)
	{
		var agentName = selected[k].name[0];
		
		dojo.xhrGet({
			url : "agentStop?agentdir=" + agentName,
			content : {},
			sync : true,
			handleAs: "json",
			load : function (data, ioArgs) {
				if (data.result.indexOf("success") != -1 || data.result.indexOf("Success") != -1) {
					showToast("Agent " + agentName + " stopped successfully","toast");
				} else {
					showToast("Failed to stop agent " + agentName,"toast");
				}
				
			},
			error : function (response, ioArgs) {
				showToast("Failed to stop agent " + agentName,"toast");
			}
		});
	}
	formValues();	
	initAgentTable();
}
function createaAgentButton() {
        dojo.xhrGet({
			url : "createAgents",
			content : {},
			sync : true,
			handleAs: "json",
			load : function (data, ioArg) {
				if (data.result.indexOf("success") != -1 || data.result.indexOf("Success") != -1) {
					showToast("Agent Successfully Created","toast");
				} else {
					showToast("Failed to create Agents","toast");
				}
				
			},
			error : function (response, ioArgs) {
				showToast("Error: Failed to create Agents","toast");
			}
		});
        /*errorMessageNotification("Agents already created.", null);*/
        formValues();
	initAgentTable();
}


function importButton () {
	selected = tableWidget.selected();
	if (selected.length < 1){
		errorMessageNotification("Please select an agent to import the file.", null);
		return;
	} else if (selected.length > 1){
		errorMessageNotification("Selected operation cannot be performed on multiple Agents.", null);
		return;
	}
	
	var agentDir = "";
	if (selected.length == 1){
		agentDir = selected[0].name[0];
		dijit.byId("dir").setAttribute("readOnly", true);
	}/*else {
		dijit.byId("dir").setAttribute("readOnly", false);
	}*/
	
	dijit.byId("importFileDialog").attr("title", "Upload Configuration ");
	dijit.byId("dir").attr("value", agentDir);
	formImportDlg.show();
	dojo.style('importFileDialog', 'top', '30px');
	return;
}

function exportButton () {
	selected = tableWidget.selected();
	if (selected.length < 1){
		errorMessageNotification("Please select an agent to export file.", null);
		return;
	}else if (selected.length > 1){
		errorMessageNotification("Selected operation cannot be performed on multiple Agents.", null);
		return;
	}
	
	slectedExportAgentDir = selected[0].name[0];
	
	dojo.xhrGet({
		url : "fileList?dir=" + slectedExportAgentDir,
		content : {},
		sync : true,
		handleAs: "json",
		load : function (data, ioArgs) {
			initExportDialog(data);
		},
		error : function (response, ioArgs) {
			showToast(response,"toast");
		}
	});
}

function initExportDialog(fileList) {
	var files = new Array();
	for (i = 0; i < fileList.length; i++) {
		files.push({
			value : fileList[i],
			label : fileList[i]
		});
	}
	
	dijit.byId("exportFileDialog").attr("title", "File Export ");
	dijit.byId("dirEx").attr("value", slectedExportAgentDir);
	dijit.byId("fileList").removeOption(dijit.byId(("fileList")).getOptions());
	dijit.byId("fileList").addOption(files);
	formExportDlg.show();
	dojo.style('exportFileDialog', 'top', '30px');
	return;
}

function agentLogButton () {
	selected = tableWidget.selected();
	if (selected.length < 1){
		errorMessageNotification("Please select an agent to view the agent log.", null);
		return;
	}else if (selected.length > 1){
		errorMessageNotification("Selected operation cannot be performed on multiple Agents.", null);
		return;
	}
	
	var agentDir = "";
	if (selected.length == 1){
		agentDir = selected[0].name[0];
	}
	getLogFile(agentDir);
	return;
}

function getLogFile(agentDir) {
	var fileName = "";
	logDetail = dijit.byId("agentLogDetail");
	dojo.xhrGet({
		url : "fileList?dir=" + agentDir,
		content : {},
		sync : true,
		handleAs: "json",
		load : function (data, ioArgs) {
			for (i = 0; i < data.length; i++) {
				if (data[i].indexOf(".log") != -1) {
					fileName = data[i];
					break;
				}
			}
			if (fileName != "") {
				dojo.xhrGet({
					url : "fileShow?filepath=" + agentDir + "/" + fileName,
					content : {},
					sync : true,
					load : function (data, ioArgs) {
						formAgentLogDlg.attr("title", "Agent Log View");
						if (formAgentLogDlg.buttonGroup.getItemAt(1)) {
							formAgentLogDlg.buttonGroup.removeChild(formAgentLogDlg.buttonGroup.getItemAt(1));
						}
						
						logDetail.attr("value", data);
						formAgentLogDlg.show();
						dojo.style('agentLogDialog', 'top', '30px');
					},
					error : function (response, ioArgs) {
						showToast(response,"toast");
					}
				});
			}
		},
		error : function (response, ioArgs) {
			showToast(response,"toast");
		}
	});
	
	return;
}

function adapterLogButton () {
	formAdapterDlg.attr("title", "Adapter Log View");
	if (formAdapterDlg.buttonGroup.getItemAt(1)) {
		formAdapterDlg.buttonGroup.removeChild(formAdapterDlg.buttonGroup.getItemAt(1));
	}
	
	formAdapterDlg.show();
	dojo.style('adapterLogDialog', 'top', '30px');
}

function adapterViewButton () {
	selected = tableWidget.selected();
	if (selected.length < 1){
		errorMessageNotification("Please select an agent to view the adapters.", null);
		return;
	}else if (selected.length > 1){
		errorMessageNotification("Selected operation cannot be performed on multiple Agents.", null);
		return;
	}
	
	var agentDir = "";
	if (selected.length == 1){
		agentDir = selected[0].name[0];
	}
	
	formAdapterTableValues(agentDir);
	//dijit.byId("adapterDetails").style.display = "block";
	//formAdapterDlg.attr("title", "Adapter View");
	//formAdapterDlg.show();
	//dojo.style('adapterDialog', 'top', '30px');
}

function getPortStyleandStatus(status, agentId) {
	  //SFP: 
	  /* gbic_lx_amber.gif, gbic_lx_blinkgreen.gif, gbic_lx_cyan.gif, gbic_lx_gray.gif, 
					   gbic_lx_green.gif, gbic_lx_green_amber.gif, gbic_lx_yellow.gif */
	  //RJ-45: 
	  /* amber.gif, blinkgreen_amber.gif, brown.gif, blinkgreen.gif, cyan.gif, green.gif, red.gif */
	  //notice it is returning 00BaseTx
	    //--SFP port does not show the brown colored empty port, this happens 
	    //when port is hard-coded to 'down' but no sfp is present
	    return getRJ45Status(GetStatusColor(status),agentId);
	    //return getSFPStatus(count,"Not Present");
}

function GetStatusColor(status) {
	  if (status.indexOf("Connected") != -1) return "GREEN";
	  else if (status.indexOf("Faulty") != -1) return "AMBER";
	  else if (status.indexOf("Notconnect") != -1) return "BLACK";
	  else if (status.indexOf("Err-disabled") != -1) return "YELLOW";
	  else if (status.indexOf("Disabled") != -1) return "BROWN";
	  else if (status.indexOf("running") != -1) return "GREEN";
	  else if (status.indexOf("stopped") != -1) return null;
	  else return null;
}
var port_color = "";

function getRJ45Status(port_color, agentId) {
  var rj45_images = new Array();
  rj45_images = rj45Images();
  var status = "";
    if (port_color == null) {
     status = "<image title='No Link'  src='" + rj45_images.img["BLACK"].src + "'>";
     status += " " + "<font size='1' face='Arial, Helvetica, sans-serif'></font>";
    }
    else
    if (port_color.indexOf("GREEN") != -1) {
     status = "<image   title='Agent is Running'  src='" + rj45_images.img["GREEN"].src + "'>";
     status += " " + "<font size='1' face='Arial, Helvetica, sans-serif'></font>";
    }
    else
   if (port_color == "BLACK") status = "<image  title='No Link' src='" + rj45_images.img["BLACK"].src + "'>";
    else
    if (port_color == "AMBER") {
     status = "<image title='Link Faulty'  height='5' width='5' src='" + rj45_images.img["AMBER"].src + "'>";
     status += " " + "<font size='1' face='Arial, Helvetica, sans-serif'></font>";
    }
    else
    if (port_color == "YELLOW") {
     status = "<image  title='Error Disabled' src='" + rj45_images.img["YELLOW"].src + "'>";
     status += " " + "<font size='1' face='Arial, Helvetica, sans-serif'></font>";
    }
    else
    if (port_color == "BROWN") {
     status = "<image  title='Link is Administratively Shutdown'  src='" + rj45_images.img["BROWN"].src + "'>";
     status += " " + "<font size='1' face='Arial, Helvetica, sans-serif'></font>";
    }
    else
    if (port_color == "START" || port_color == "STOP") {
     var lbl = "Start";
     if(port_color == "STOP") {
    	 lbl = "Stop";
     }
     status = "<div> <button id='btn_" + agentId + "'  dojoType='xwt.widget.form.TextButton' onClick='agentStateButton()'>" + lbl + "</button></div>";
    }
    /*else
    if (port_color == "STOP") {
    	status = "<div> <button id='stop_" + agentId + "'  dojoType='xwt.widget.form.TextButton' onClick='agentStateButton()'>Stop</button></div>";
    }*/
    //there is no yellow SFP port gif yet, need to create
    return status;
}

function rj45Images() {
	  var i = new portImages();
	  i.img["BLACK"].src = "images/nolink_bead.gif";
	  i.img["GREEN"].src = "images/linkup_bead.gif";
	  //i.img["CYAN"].src = "images/cyan_mm.gif"; //cyan not used at this point, but adding anyway
	  i.img["BROWN"].src = "images/admindown_bead.gif";
	  i.img["AMBER"].src = "images/faulty_bead.gif";
	  i.img["YELLOW"].src = "images/yellow_bead.gif";
	  i.img["BLINKGREEN"].src = "images/linkup_bead.gif";
	  i.img["ALT_GREEN_BLACK"].src = "images/linkup_bead.gif";
	  i.img["BLINKGREEN_AMBER"].src = "images/linkfaulty_bead.gif";
	  i.img["EMPTY"].src = "images/nolink_bead.gif";
	  /*i.img["START"].src = "images/fatal_error.gif";
	  i.img["STOP"].src = "images/normal.gif";*/
	  return i;
}

function portImages() {
	  this.img = new Array();
	  this.img["BLACK"] = new Image();
	  this.img["GREEN"] = new Image();
	  this.img["CYAN"] = new Image();
	  this.img["BROWN"] = new Image();
	  this.img["AMBER"] = new Image();
	  this.img["YELLOW"] = new Image();
	  this.img["BLINKGREEN"] = new Image();
	  this.img["ALT_GREEN_BLACK"] = new Image();
	  this.img["BLINKGREEN_AMBER"] = new Image();
	  this.img["EMPTY"] = new Image();
	  /*this.img["START"] = new Button();
	  this.img["STOP"] = new Button();*/
}

function cn_fileMgmtList_init() {
	formImportDlg = dijit.byId("importFileDialog");
	//formExportDlg = dijit.byId("exportFileDialog");
	dojo.connect(formImportDlg.buttonGroup.getItemAt(0), "onClick", "cn_deploy_fileMgmt");
	//dojo.connect(formImportDlg.buttonGroup.getItemAt(1), "onClick", dijit.byId('cn_fileMgmt_form' + '\''), 'reset');
	//dojo.connect(formExportDlg.buttonGroup.getItemAt(0), "onClick", "cn_fileMgmt_export");
	//dojo.connect(formExportDlg.buttonGroup.getItemAt(1), "onClick", dijit.byId('cn_fileExport_form' + '\''), 'reset');
}

function cn_deploy_fileMgmt() {
	var fname = dojo.byId('myFile').value;
	if (fname == "") {
		errorMessageNotification("Please select Application Archive file", null);
		return false;
	}
	
	dojo.io.iframe.send({
		url : "upload",
		contentType : "multipart/form-data",
		handleAs : "html",
		form : dojo.byId("cn_fileMgmt_form"),
		load: function (data) { 
			showToast("Successfully Deployed.","toast"); 
		},
		error: function (error) {
			showToast("Failed to upload file.\n","toast");
		}
	});
	
    var deployformDlg = dijit.byId('importFileDialog');
    deployformDlg.hide();
    formValues();	
	initAgentTable();
	dijit.byId("cn_fileMgmt_form").reset();
	
    return true;
}

function cn_fileMgmt_export() {
	var fileName = dijit.byId("fileList").attr("value");
	
	dojo.io.iframe.send({
		url : "download?filepath=" + slectedExportAgentDir + "/" + fileName,
		sync : true,
		timeout : 2000,
		load : function (data, ioArgs) {
			//showToast("File export successfull","toast");
		},
		error : function (response, ioArgs) {
			//showToast("Failed to download file.\n","toast");
		}
	});
	var deployformDlg = dijit.byId('exportFileDialog');
    deployformDlg.hide();
    
	return true;
}


function errorMessageNotification(message, focusElement) {
	var alertDlg = new xwt.widget.notification.Alert({
		messageType: "warning",
		buttons: [
			{
				label: "OK",
				baseClass: "defaultButton",
				onClick: function(){
				return;
				}
			}
		]
		});
	alertDlg.setDialogContent(message);
	if (focusElement != null) 
		document.getElementById(focusElement).focus();
};


function fillSouthBoundSetting() {
	dojo.xhrGet({
		url : "getSouthIp",
		content : {},
		sync : true,
		handleAs: "json",
		load : function (data, ioArgs) {
			if (data) {
		      dijit.byId("text_IpAddress_SouthBound").setIPValue(data.addr);
		      dijit.byId("text_IpAddress_SouthBound").setMaskValue(data.mask);
		      dijit.byId("text_IpAddress_SouthBound").defaultIp = data.addr;
		    } else {
		      dijit.byId("text_IpAddress_SouthBound").defaultIp = "";
		      dijit.byId("text_IpAddress_SouthBound").setIPValue("");
		      dijit.byId("text_IpAddress_SouthBound").setMaskValue("");
		    }
		},
		error : function (response, ioArgs) {
			showToast(response,"toast");
		}
	});
}

function onConfigure() {
	var newIP = dijit.byId("text_IpAddress_SouthBound").getIPValue();
	var newMaskValue = dijit.byId("text_IpAddress_SouthBound").getMaskValue();
	
	if(isEmpty(dijit.byId("text_IpAddress_SouthBound").getIPValue())){
		  showToast("Please enter a valid ipv4 address");
		  return;
	  }
	  
	  if(isEmpty(dijit.byId("text_IpAddress_SouthBound").getMaskValue())){
		  showToast("Please enter a valid ipv4 subnet mask");
		  return;
	  }
	
	  if(dijit.byId("text_IpAddress_SouthBound").isValid() == false){
		  showToast("IP Address entered is not a valid ipv4 address");
		  return;
	  }
	  
	/* if(!dijit.byId("text_IpAddress_SouthBound").isValid()){
		  showToast("IP Address entered is not a valid ipv4 address");
		  return;
	} */
	
	dojo.xhrGet({
		url : "setSouthIp?addr=" + newIP + "&mask=" + newMaskValue,
		content : {},
		sync : true,
		handleAs: "json",
		load : function (data, ioArgs) {
			if (data.result.indexOf("success") != -1 || data.result.indexOf("Success") != -1) {
				showToast("SouthBound settings configured successfully.","toast");		
			}else {
				showToast("SouthBound settings configured failed. Please enter valid IP address","toast");
			}
		},
		error : function (response, ioArgs) {
			showToast("Configuration failed.","toast");
		}
	});
}

function isEmpty(inputStr) {
    if ( inputStr == undefined || inputStr == "" || inputStr == null) {
        return true;
    }
    return false;
}
