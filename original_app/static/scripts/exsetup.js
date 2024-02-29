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

var ntp;
// Constants
var CURRENT_STATE = "Current FSM state: ";
var STR_EXPRESS_SETUP = CURRENT_STATE + "EXPRESS SETUP";
var M_ES = 1;
// Express Setup Mode.
var M_DS = 2;
// Direct Setup Mode.
var M_DM = 3;
// Direct Mgmt Mode.
var M_MG = 4;
// Managed Mode.
// Global Variables
var currentSysName = "";
var devSetupMode = M_MG;
var vlanIdArr = new Array();
var vlanNameArr = new Array();

var expMgmtVlan = 1000;
var expMgmtInterface = null;
var ipAddress = "";
var subnetMask = "";
var cms_ip = "";
var ipInterfaces = null;
var activeInterface = null;
var isRockwell = false;
var cipVlan = -1;
var cmd1 = "";
var cipVlanIPAddress = "";
var cipVlanNetworkmask = "";
var exsetup_ind = false;
var profinetArr = "";
var temp1 = "";

var ports;
DLIM_WhSp = /[\s]+/;
DLIM_newline = /[\r\n]+/;

// general purpose function to see if an input value has been entered at all

function isEmpty(inputStr) {
    if ( inputStr == undefined || inputStr == "" || inputStr == null) {
        return true
    }
    return false
}

function onConfigure() {

  var deviceType = find_string(/bytes of memory./, " ", 1, document.forms["xsetupForm"].VERSION.value);
  var license = form.LICENSE.value;  
  var newIP = dijit.byId("text_ipAddress").getIPValue();
  var newGateway = dijit.byId("text_ipDefaultGateway").getIPValue
  var t_vlanid = parseInt(vlanbox.attr("value"), 10);
  var ntpIP = dijit.byId("text_ntp").getIPValue();
  var cmd = "";  
  var o = new Array();
  
  if (form.radio_ipAssignMode[0].checked){
	  if(!dijit.byId("text_ipAddress").isValid()){
		  showToast("IP Address entered is not a valid ipv4 address");
		  return;
	  }
  }
  if(!isEmpty(newGateway)){
	  if(!dijit.byId("text_ipDefaultGateway").isValid()){
		  showToast("Default Gateway entered is not a valid ipv4 address");
		  return;
	  }
  }
  if(!isEmpty(ntpIP)){
	  if(!dijit.byId("text_ntp").isValid()){
		  showToast("NTP Server entered is not a valid ipv4 address");
		  return;
	  }
  }
  if (!(deviceType.indexOf("IE-3010") != -1 || deviceType.indexOf("CGS-2520") != -1) ){
	  if(form.chk_enable_CIP_vlan.checked && (!form.chk_sameAsMvlan.checked)){
		  var cipIP = dijit.byId("text_cipipAddress").getIPValue();
		  var cipMask = dijit.byId("text_cipipAddress").getMaskValue();
		  if((!isEmpty(cipIP)) || (!isEmpty(cipMask))){
			  if(!dijit.byId("text_cipipAddress").isValid()){
				  showToast("CIP IP Address entered is not a valid ipv4 address");
				  return;
			  }
		  }
	  }
  }
  if (form.text_sysName.value.match(/^([a-zA-Z0-9-_.]{1,92})$/) == null) {
    showToast("Hostname contains one or more illegal characters or it is longer than 92 characters");
    return;
  }
  if (isNaN(t_vlanid) || t_vlanid < 1 || t_vlanid > 1001) {
    showToast("Management Vlan should be between 1 and 1001");
    return;
  }
  if (!form.radio_ipAssignMode[0].checked && !form.radio_ipAssignMode[1].checked) {
    showToast("Please select ip assignment mode");
    return;
  }
  if (newIP == "" && form.radio_ipAssignMode[0].checked) {
    showToast("Please input static ip ");
    return;
  }
  if (dijit.byId("id_cippwd").attr("value") != '' && dijit.byId("id_cippwd").attr("value") != dijit.byId("id_cippwd2").attr("value")) {
    showToast("CIP Password and Confirm Password fields don't match");
    return;
  }
  if (form.text_sysName.value.indexOf(' ') != -1 || form.text_sysName.value.indexOf('?') != -1) {
    showToast("Hostname can't contain space or ?");
    return;
  }
  if (!(deviceType.indexOf("IE-3010") != -1 || deviceType.indexOf("CGS-2520") != -1) ) {
    var t_vlanid2 = parseInt(cipvlanbox.attr("value"), 10);
    if (form.chk_enable_CIP_vlan.checked && (isNaN(t_vlanid2) || t_vlanid2 < 1 || t_vlanid2 > 1001)) {
      showToast("CIP Vlan should be between 1 and 1001");
      return;
    }
    if (form.chk_enable_CIP_vlan.checked && form.chk_sameAsMvlan.checked) {
      cipvlanbox.attr("value", vlanbox.attr("value"));
      dijit.byId("text_cipipAddress").setValue(dijit.byId("text_ipAddress").getValue());
    }
  }
  if (devSetupMode == M_ES) {
    if (dijit.byId("text_user").attr("value") == '') {
      showToast("Please input user ");
      return;
    }
    if (dijit.byId("id_pwd").attr("value") == '' || dijit.byId("id_pwd2").attr("value") == '') {
      showToast("Password and Confirm Password can't be empty");
      return;
    }
    if (dijit.byId("id_pwd").attr("value") != dijit.byId("id_pwd2").attr("value")) {
      showToast("Password and Confirm Password fields don't match");
      return;
    }
    if(vlanbox.attr("value") != '1'){
       cmd += "do clear tcp tcb * \n";
    }
    if (isRockwell) {
      cmd += "macro global apply ab-global $cip_vlan " + cipvlanbox.attr("value") + "\n";
      if (!(deviceType.indexOf("IE-4000") != -1 || deviceType.indexOf("1783-HMS") != -1 || deviceType.indexOf("1783-IMS") != -1 || deviceType.indexOf("IE-5000") != -1) && (license.trim() != "" && !(license.indexOf('lanlite') != -1))) {
        cmd += "macro global apply ab-qos-map-setup\n";
        cmd += "macro global apply ab-qos-queue-setup\n";
      }
    }
    if (dijit.byId("text_user").attr("value") != '') {
      cmd += 'username ' + dijit.byId("text_user").attr("value") + ' privilege 15 secret 0 ' + dijit.byId("id_pwd").attr("value") + '\n';
    }
  }
  cmd += '!\n';
if (!(deviceType.indexOf("IE-3010") != -1 || deviceType.indexOf("CGS-2520") != -1) ) {
  if (form.chk_enable_CIP_vlan.checked && (cipvlanbox.attr("value") != cipvlanbox.defaultValue || cipVlanIPAddress != dijit.byId("text_cipipAddress").getIPValue() || cipVlanNetworkmask != dijit.byId("text_cipipAddress").getMaskValue())) {
    if (cipvlanbox.defaultValue != undefined && cipvlanbox.defaultValue != String(-1)) {
      cmd += "!\ninterface Vlan" + cipvlanbox.defaultValue + "\n";
      cmd += "no cip enable\n";
      cmd += '!\n';
    }
    if (cipvlanbox.attr("value") != "") {
      cmd += "!\nvlan " + cipvlanbox.attr("value") + "\n";
      cmd += "state active\n";
      cmd += "!\ninterface Vlan" + cipvlanbox.attr("value") + "\n";
      cmd += "cip enable\n";
      if (dijit.byId("text_cipipAddress").getIPValue() != '') {
        if (cipVlanIPAddress != dijit.byId("text_cipipAddress").getIPValue() || cipVlanNetworkmask != dijit.byId("text_cipipAddress").getMaskValue()) cmd += "no ip address " + cipVlanIPAddress + " " + cipVlanNetworkmask + "\n";
        cmd += "ip address " + dijit.byId("text_cipipAddress").getIPValue() + " " + dijit.byId("text_cipipAddress").getMaskValue() + "\n";
      }
      cmd += '!\n';
    }
    cipvlanbox.defaultValue = cipvlanbox.attr("value");
  }
  if (!form.chk_enable_CIP_vlan.checked && cipVlan != -1) {
    cmd += "!\ninterface Vlan" + cipVlan + "\n";
    cmd += "no cip enable\n";
    cmd += '!\n';
  }
}
  if (isBlank(dijit.byId("text_ipDefaultGateway").getIPValue())) {
    cmd += "!\nno ip default-gateway\n";
  } else {
    cmd += "!\nip default-gateway " + dijit.byId("text_ipDefaultGateway").getIPValue() + "\n";
  }
  if (!isBlank(form.text_sysName.value)) {
    cmd += "!\nhostname " + form.text_sysName.value + "\n";
  } else {
    cmd += "!\nno hostname\n";
  }
    if (dijit.byId("text_ntp").defaultValue != dijit.byId("text_ntp").attr("value")) {
      if (dijit.byId("text_ntp").defaultValue != undefined && dijit.byId("text_ntp").defaultValue != "") cmd += "!\nno ntp server " + dijit.byId("text_ntp").defaultValue + "\n";
      if (!isBlank(dijit.byId("text_ntp").attr("value"))) {
        cmd += "!\nntp server " + dijit.byId("text_ntp").attr("value") + "\n";
      }
      dijit.byId("text_ntp").defaultValue = dijit.byId("text_ntp").attr("value");
    }
  if (devSetupMode == M_ES) {
    var mVlan = vlanbox.attr("value");
    if (mVlan != '1' || isRockwell) {
      for (var i = ports.length - 1; i >= 0; i--) {
        cmd += "int " + ports[i] + '\n';
        if (isRockwell) cmd += "macro apply none-automation\n";
        if (mVlan != '1') {
          cmd += ' switchport access vlan ' + mVlan + "\n";
          cmd += ' switchport trunk native vlan ' + mVlan + '\n';
        }
      }
    }
  }
  cmd += 'vlan ' + vlanbox.attr("value") + '\n';
  cmd += 'state active\n';
  cmd += "!\ninterface Vlan" + vlanbox.attr("value") + "\n"
  if (form.radio_ipAssignMode[0].checked) {
    cmd += "ip address " + newIP + " " + dijit.byId("text_ipAddress").getMaskValue() + "\n";
  } else if (!form.radio_ipAssignMode[1].defaultChecked) {
    cmd += "ip address dhcp \n";
  }
  form.radio_ipAssignMode[1].defaultChecked = form.radio_ipAssignMode[1].checked;
  cmd += "no shutdown\n!\n";
  if (devSetupMode == M_ES) {
    var pwdtmp;
    cmd += 'ip http authentication local\n';
    if (form.chk_samePwd.checked) {
      pwdtmp = dijit.byId("id_pwd").attr("value");
    } else pwdtmp = dijit.byId("id_cippwd").attr("value");
    if (isRockwell) cmd += "macro global apply ab-password $password " + pwdtmp + " $RO-password cisco\n";
    else {
      cmd += 'service password-encryption' + '\n';
      if(!(deviceType.indexOf("IE-3010") != -1 || deviceType.indexOf("CGS-2520") != -1))
        cmd += 'cip security password ' + pwdtmp + "\n";
      cmd += 'enable secret 0 ' + pwdtmp + "\n";
      cmd += 'line console 0\n';
      cmd += 'password 0 ' + pwdtmp + "\n";
      cmd += "login\n";
      cmd += 'line vty 0 15\n';
      cmd += 'password 0 ' + pwdtmp + "\n";
      cmd += "login\n";
      cmd += '!\n';
    }
  } else if (dijit.byId("id_cippwd").attr("value") != '') {
    var pwdtmp = dijit.byId("id_cippwd").attr("value");
    cmd += 'service password-encryption' + '\n';
      if(!(deviceType.indexOf("IE-3010") != -1 || deviceType.indexOf("CGS-2520") != -1))
        cmd += 'cip security password ' + pwdtmp + "\n";
    cmd += 'enable secret 0 ' + pwdtmp + "\n";
    cmd += 'line console 0\n';
    cmd += 'password 0 ' + pwdtmp + "\n";
    cmd += "login\n";
    cmd += 'line vty 0 15\n';
    cmd += 'password 0 ' + pwdtmp + "\n";
    cmd += "login\n";
    cmd += '!\n';
  }
  if (devSetupMode == M_ES) {
    var mVlan = vlanbox.attr("value");
    if (mVlan != '1') showToast(re_xSetup_ConfMsg15);
  } else {
    if (dijit.byId("text_ipAddress").defaultIp != dijit.byId("text_ipAddress").getIPValue() || form.radio_ipAssignMode[1].defaultChecked) {
      form.radio_ipAssignMode[1].defaultChecked = true;
      dijit.byId("text_ipAddress").defaultIp = dijit.byId("text_ipAddress").getIPValue();
      showToast(re_xSetup_Txt2);
    }
  }
  if(deviceType.indexOf("IE-2000")!=-1 || deviceType.indexOf("IE-3000")!=-1 || deviceType.indexOf("IE-4000")!=-1 || deviceType.indexOf("IE-5000")!=-1)
  {        
        var length = "";
		var frstIndPos = "";
		var lstIndPos = "";
		
		if((form.profinet_vlan_id.value != "" && form.profinet_vlan_id.value != null)){
			if(isNaN(form.profinet_vlan_id.value) || parseInt(form.profinet_vlan_id.value.trim()) < 1 || parseInt(form.profinet_vlan_id.value.trim()) > 4094){
				showToast("Invalid VLAN ID. Please enter a valid VLAN ID in the range 1 to 4094.");
				return;
			}
		}
		
		if(form.text_pid.value !=""){		
		   length = form.text_pid.value.trim().length;
		   frstIndPos = form.text_pid.value.trim().indexOf("-")+1;
           lstIndPos = form.text_pid.value.trim().lastIndexOf("-")+1;		   
		   if(frstIndPos == 1){
		      showToast("Hyphen '-' should not be a first character.");
			  return;
           }else if(lstIndPos == length){
		      showToast("Hyphen '-' should not be a last character.");
			  return;
		   }
         		   
        }
		if(form.text_pid.value !=""){	
		   frstIndPos = form.text_pid.value.trim().indexOf(".")+1;           		   
		   if(frstIndPos == 1){
		      showToast("Period '.' should not be a first character.");
			  return;
           }
         	   
        }
				
		if(form.text_pid.value !=""){
		    
			if (form.text_pid.value.match(/^([a-zA-Z0-9-_.]{1,240})$/) == null) {			    
				showToast("Profinet id contains one or more illegal characters or place period(.) for every 64 valid characters to reach up to maximum 240 characters or it is longer than 240 characters.");
				return;
			}
        }
		
		if(form.text_pid.value !=""){			
				var text = form.text_pid.value;
				var endChar = text.substr(text.length-1 , 1);
				if(endChar == "0"){
					showToast("Profinet id should not contain '0' as last character.");
					return;
					
				}
		}
		
		var formDlg1 = new xwt.widget.notification.Alert({
			messageType:"Information",
			buttons: [
			{
				label: "Yes",
				onClick: function(){
					exsetup_ind = true;
					submitProfinetValues();
					cmd += cmd+cmd1;
					execCli(cmd);
				}                                
			},
			{
				label: "No",
				onClick: function(){
					exsetup_ind = false;
                    submitProfinetValues();					
					execCli(cmd);
				} 
			},]
		});
		formDlg1.setDialogContent("Disabling Profinet or changes to Profinet ID, VLAN ID will distrupt Profinet Management tools such as STEP7, TIA Portal (Click OK to continue).");   		
	}else{
		cmd += "!\nend\n";
		execCli(cmd);
	}
}
function submitProfinetValues(){ 
        cmd1 = "";
		if(exsetup_ind){
			profinetArr = new Array();
			if(form.chk_enable_profinet.checked){
				cmd1 += "profinet\n";
				profinetArr[0] = true;
			}else{
				cmd1 += "no profinet\n";
				profinetArr[0] = false;
			}
			if(form.text_pid.value !=""){
                profinetArr[1] = form.text_pid.value.trim();				
				cmd1 += "profinet id "+form.text_pid.value.trim()+"\n";
			}
			else{
				profinetArr[1] = "";
				cmd1 += "no profinet id\n";
			}
			if(form.profinet_vlan_id.value != ""){
				profinetArr[2] = form.profinet_vlan_id.value;
				cmd1 += "profinet vlan "+form.profinet_vlan_id.value+"\n";				
			}else{				
				profinetArr[2] = "1";
				form.profinet_vlan_id.value = "1";
				cmd1 += "profinet vlan "+"1"+"\n";				
			}
			
		}else if(profinetArr.length > 0){
			form.chk_enable_profinet.checked = profinetArr[0];
			form.profinet_vlan_id.value = profinetArr[2];
			form.text_pid.value	= profinetArr[1];
		}else{
			getProfinetDetails();
		}
		
		if(profinetArr[1] != undefined){
		    var pid_value = profinetArr[1];
			if(pid_value.length < 64){
				temp1 = pid_value;
			}else if((pid_value.charAt(63) == ".") && (pid_value.charAt(127) == ".") && (pid_value.charAt(191) == ".") && (pid_value.length <= 240)) {
				temp1 = pid_value;
			}else if((pid_value.charAt(63) == ".") && (pid_value.charAt(127) == ".") && (pid_value.length < 192)) {
				temp1 = pid_value;
			}else if((pid_value.charAt(63) == ".") && (pid_value.length < 128)) {
				temp1 = pid_value;
			}
		}	
		cmd1 += "!\nend\n";
}

function execCli(cmd) {
  dijit.byId("fsubmit").attr("disabled", true);
  var splitedCli = splitCli(cmd, "", "write memory\n");
  var start = "";
  var end = "";
  var result = "";
  var textArr = "";
  var text = "";
  dojo.xhrPost({
    url: splitedCli.url,
    content: splitedCli.content,
    load: function(data, ioArgs) {
	  var errorData = data;
      try {
        var cliArr = split("\n", data);
        if (cliArr.length > 4) {
          var warning = "";
          for (var i = 1; i < cliArr.length - 3; i++) {
            if (cliArr[i].indexOf("Invalid input detected at") != -1) {
              if(i-2 >= 0) warning = warning  + cliArr[i-2] + "\n";
              if(i-1 >= 0) warning = warning  + cliArr[i-1] + "\n";
              warning = warning + cliArr[i] + "\n";
            }
          }
          if (warning != "") showToast(warning);
        }
      } catch (err) {
        console.log(err);
        if (devSetupMode != M_ES) document.location.reload();
      }	  
	  if(errorData.indexOf('Profinet device name') != -1){
		
		textArr = errorData.split(/\s+/);
		start = textArr.indexOf("Profinet");
		end = textArr.indexOf("requirements.");	
		for(var i=start; i<=end; i++){
			text = text+(textArr[i]+" ");							   
		}
        if((temp1 != undefined) || (temp1 != "")){
			form.text_pid.value = temp1;
		}else{
			form.text_pid.value = "";
		}
		showToast(text);
				
	  }
      dijit.byId("fsubmit").attr("disabled", false);
      if (devSetupMode == M_ES) {
        try {
          document.execCommand("ClearAuthenticationCache");
        } catch (exception) {
          console.log("ClearAuthenticationCache is not supported");
        };
        if (dojo.isFF != undefined) 
          showToast("Firefox user, please close all firefox and restart, otherwise it will be slow due to firefox can't cleanup http authentication without restart");
        top.location.href = 'homed.shtml';
      }else {
        //reset the flag 
        if (!form.chk_enable_CIP_vlan.checked) {
          cipVlan = -1;
          cipVlanIPAddress = "";
          cipVlanNetworkmask = "";
          cipvlanbox.attr("value", "");
          form.chk_sameAsMvlan.checked = false;
        } else {
          cipVlan = cipvlanbox.attr("value");
          cipVlanIPAddress = dijit.byId("text_cipipAddress").getIPValue();
          cipVlanNetworkmask = dijit.byId("text_cipipAddress").getMaskValue();
        }
        sdSync();
		
      }
	 },
     error: function(response, ioArgs) {
		showToast(response);
		dijit.byId("fsubmit").attr("disabled", false);
	 }
   });
}
function IpInterface(_name, _ip, _netmask, _state, _mode) {
  this.name = _name;
  this.ip = _ip;
  this.netmask = _netmask;
  this.state = _state;
  this.ipMode = _mode;
  return this;
}

function parseDHCPInterfaces(ints, ret) {
  var dhcpInt = new Array();;
  if (isBlank(ints)) return dhcpInt;
  var lines = split("\n", ints);
  var intName = "";
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf("ip address dhcp") != -1) {
      if (intName != "") {
        dhcpInt[dhcpInt.length] = new IpInterface(intName, "", "", true, "DHCP");
        intName = "";
      }
    } else {
      intName = trim_string(lines[i].substring(10));
      if (parseInt(intName.substring(4)) == expMgmtVlan) {
        intName = "";
      }
    }
  }
  for (var i = 0; i < dhcpInt.length; i++) {
    for (var j = 0; j < ret.length; j++) {
      if (ret[j].name == dhcpInt[i].name) {
        dhcpInt[i].ip = ret[j].ip;
        dhcpInt[i].netmask = ret[j].netmask;
        break;
      }
    }
  }
  return dhcpInt;
}

function getActiveInterface(interfaces) {
  var activeInterfaces = new Array();
  var ret = null;
  for (i = 0; i < interfaces.length; i++) {
    if (interfaces[i].state == true || (devSetupMode == M_DS || devSetupMode == M_DM)) {
      activeInterfaces[activeInterfaces.length] = interfaces[i];
    }
  }
  if (activeInterfaces.length > 1) {
    var i = 0;
    var doc_loc = "" + document.location;
    for (i = 0; i < activeInterfaces.length; i++) {
      if (doc_loc.indexOf(activeInterfaces[i].ip) != -1) {
        ret = activeInterfaces[i];
        break;
      }
      if (ret == null && activeInterfaces[i].name.toLowerCase().indexOf("vlan") != -1) {
        ret = activeInterfaces[i];
      }
    }
  } else if (activeInterfaces.length == 1) {
    ret = activeInterfaces[0];
  }
  if (ret == null) {
    ret = activeInterfaces[0];
  }
  return ret;
}

function extractIpDetails(temp) {
  var interfaces = new Array();
  var ret = new Array();
  if (temp) {
    var lines = split('\n', temp);
    var intNameLine = "";
    for (i = 0; i < lines.length; i++) {
      if (lines[i].indexOf('Internet address is') != -1) {
        interfaces[interfaces.length] = intNameLine + lines[i];
        intNameLine = "";
      } else if (lines[i].indexOf('Address determined') != -1) {
        interfaces[interfaces.length - 1] = interfaces[interfaces.length - 1] + lines[i];
      } else {
        intNameLine = lines[i];
      }
      var tmp = split(' ', lines[i]);
      if (lines[i].indexOf('FastEthernet') != -1) ports[ports.length] = tmp[0].replace('FastEthernet', 'Fa');
      else if (lines[i].indexOf('GigabitEthernet') != -1) ports[ports.length] = tmp[0].replace('GigabitEthernet', 'Gi');
    } //end of for
  }
  for (i = 0; i < interfaces.length; i++) {
    var tmp = token_string("Address determined by", 0, interfaces[i]);
    var words = split(' ', tmp);
    var interfaceName = trim_string(words[0]);
    if ((devSetupMode == M_DS || devSetupMode == M_DM || devSetupMode == M_ES) && parseInt(interfaceName.substring(4)) == expMgmtVlan) {
      var ipAddress = token_string('/', 0, words[words.length - 1]);
      var netMask = token_string('/', 1, words[words.length - 1]);
      netMask = calcNetMask_string(netMask);
      expMgmtInterface = new IpInterface(expMgmtVlan, ipAddress, netMask, true, "STATIC");
      continue;
    }
    var ipAddress = token_string('/', 0, words[words.length - 1]);
    var netMask = token_string('/', 1, words[words.length - 1]);
    netMask = calcNetMask_string(netMask);
    tmp = token_string("Address determined by", 1, interfaces[i]);
    words = split(' ', tmp);
    var ipMode = "DHCP";
    if (devSetupMode != M_ES) ipMode = "STATIC";
    if (words[0]) ipMode = ((words[0].indexOf("DHCP") != -1) ? "DHCP" : "STATIC");
    var status = false;
    if (interfaces[i].indexOf("line protocol is up") != -1) status = true;
    ret[ret.length] = new IpInterface(interfaceName, ipAddress, netMask, status, ipMode);
  }
  if (devSetupMode == M_DS || devSetupMode == M_DM) {
    var dhcpInts = parseDHCPInterfaces(document.forms[0].DHCP_INT.value, ret);
    for (var i = 0; i < dhcpInts.length; i++) {
      var arrUpdated = false;
      for (var j = 0; j < ret.length; j++) {
        if (ret[j].name == dhcpInts[i].name) {
          ret[j] = dhcpInts[i];
          arrUpdated = true;
          break;
        }
      }
      if (arrUpdated) continue;
      ret[ret.length] = dhcpInts[i];
    }
  }
  return ret;
}

function getVlans() {
  var vlanBrief = form.VLAN_BRIEF.value;
  vlanIdArr = new Array();
  vlanNameArr = new Array();
  // Create an array of rows by splitting the command output using \n as delimiter.
  var lines = split(DLIM_newline, vlanBrief);
  for (var i = 0; i < lines.length; i++) {
    if (i == 0 || i == 1) {
      continue;
      // Skip the first two rows as they are command output headers.
    }
    var line = lines[i];
    compact_line(line);
    // Squeeze the spaces.
    if (line.charAt(0) != ' ') { // Check for blank in the first position.
      var line_array = split(DLIM_WhSp, line);
      // Skip the default vlans 1002-1005.
      var id = parseInt(line_array[0]);
      var vlanName = line_array[1];
      if (id < 1002 || id > 1005) {
        var index = vlanIdArr.length;
        vlanIdArr[index] = id;
        vlanNameArr[index] = vlanName;
      }
    }
  }
}
function getProfinetDetails(){
	form = document.forms["xsetupForm"];
	var output= document.forms["xsetupForm"].PROFINET_STATUS.value
	var tempArray=split("\n",output);
	var temp="";
	for(var i=0;i<tempArray.length;i++){
		temp=trim_string(tempArray[i].substr(tempArray[i].indexOf(":")+1));
		temp=temp.toLowerCase().trim();
		if(tempArray[i].indexOf("State")!=-1){
			if(temp == "enabled"){
					form.chk_enable_profinet.checked = true;
			}else if(temp == "disabled"){
					form.chk_enable_profinet.checked = false;
			}
		}
		if(tempArray[i].indexOf("Vlan")!=-1){		    
			form.profinet_vlan_id.value=temp;	
		}
		if(tempArray[i].indexOf("Id")!=-1){
			form.text_pid.value=temp;
			temp1=temp;
		}
	}
}
function fillVlanField(vlanId, cipId) {
  var deviceType = find_string(/bytes of memory./, " ", 1, document.forms["xsetupForm"].VERSION.value);
  var table1 = new Array();
  for (i = 0; i < vlanIdArr.length; i++) {
    if (vlanIdArr[i] != vlanId) table1.push({
      value: String(vlanIdArr[i]),
      label: String(vlanIdArr[i])
    });
    else table1.push({
      value: String(vlanIdArr[i]),
      label: String(vlanIdArr[i]),
      selected: true
    });
  }
  vlanbox = new dijit.form.Select({
    options: table1,
    onChange: function(val) {
      onChangeVlan(val);
    },
    maxHeight: 100
  });
  vlanbox.placeAt('list_VLANID');
  var table2 = new Array();
  if (vlanIdArr.length > 0) table2.push({
    value: "",
    label: ""
  });
  for (i = 0; i < vlanIdArr.length; i++) {
    if (vlanIdArr[i] != cipId) table2.push({
      value: String(vlanIdArr[i]),
      label: String(vlanIdArr[i])
    });
    else table2.push({
      value: String(vlanIdArr[i]),
      label: String(vlanIdArr[i]),
      selected: true
    });
  }
if (!(deviceType.indexOf("IE-3010") != -1 || deviceType.indexOf("CGS-2520") != -1) ) {
  cipvlanbox = new dijit.form.Select({
    options: table2,
    onChange: function(val) {
      onChangeCipVlan(val);
    },
    maxHeight: 100
  });
  cipvlanbox.placeAt('list_VLANID_CIP');
  cipvlanbox.defaultValue = String(cipId);
}
  vlanbox.defaultValue = String(vlanId);
}

dojo.ready(function() {
  form = document.forms["xsetupForm"];
  var deviceType = find_string(/bytes of memory./, " ", 1, document.forms["xsetupForm"].VERSION.value);
  var brandName = trim_string(find_string(/SKU Brand Name/, ":", 1, form.VERSION.value));
  if ( brandName != undefined && brandName.indexOf("Rockwell") != -1) isRockwell = true;
  if (form.SETUP_MODE.value.indexOf(STR_EXPRESS_SETUP) != -1) devSetupMode = M_ES;
  else if (form.SETUP_MODE.value.indexOf("DIRECT SETUP") != -1) devSetupMode = M_DS;
  ports = new Array();
  //				isRockwell = false;
  	//			devSetupMode = M_ES;
  if(deviceType.indexOf("IE-2000")!=-1 || deviceType.indexOf("IE-3000")!=-1 || deviceType.indexOf("IE-4000")!=-1 || deviceType.indexOf("IE-5000")!=-1 )
  {
	 dojo.style(dojo.byId("profinet_details"), "display", "block");
	 form.chk_enable_profinet.checked = false;
     form.text_pid.value ="";
     form.profinet_vlan_id.value = "1";   
	 getProfinetDetails();
  }else {
    dojo.style(dojo.byId("profinet_details"), "display", "none");				
  }
  
  if (devSetupMode == M_ES) {
    dojo.style(dojo.byId("id_userpwd"), "display", "table-row");
    dojo.style(dojo.byId("id_userpwd"), "visibility", "visible");
    dojo.style(dojo.byId("id_chkpwd"), "display", "table-row");
    dojo.style(dojo.byId("id_chkpwd"), "visibility", "visible");
    vlanbox = dijit.byId("list_VLANID");
	if (!(deviceType.indexOf("IE-3010") != -1 || deviceType.indexOf("CGS-2520") != -1) ){
		cipvlanbox = dijit.byId("list_VLANID_CIP");
	}
    ipInterfaces = extractIpDetails(form.IP_INT_DETAIL.value);
	if (!(deviceType.indexOf("IE-3010") != -1 || deviceType.indexOf("CGS-2520") != -1) ){
		form.chk_sameAsMvlan.checked = true; 
		form.chk_enable_CIP_vlan.checked = true;
		cipvlanbox.attr("disabled", true);
		dijit.byId("text_cipipAddress").attr("disabled", true);
	}
    form.chk_samePwd.checked = true;
    dijit.byId("id_cippwd").attr("disabled", true);
    dijit.byId("id_cippwd2").attr("disabled", true);
    dijit.byId("text_user").attr("value", "admin");
    vlanbox.attr("value", "1");
	if (!(deviceType.indexOf("IE-3010") != -1 || deviceType.indexOf("CGS-2520") != -1) ){
		cipvlanbox.attr("value", "1"); 
	}
    form.radio_ipAssignMode[0].checked = true;
    dijit.byId("text_ipAddress").setMaskValue("255.255.255.0");
  } else {
    dojo.style(dojo.byId("id_userpwd"), "visibility", "hidden");
    dojo.style(dojo.byId("id_userpwd"), "display", "none");
    dojo.style(dojo.byId("id_chkpwd"), "visibility", "hidden");
    dojo.style(dojo.byId("id_chkpwd"), "display", "none");
    if (form.NTP.value.indexOf("ntp server ", 0) != -1) {
      var ntp = split("\n", form.NTP.value);
      for (var i = 0; i < ntp.length; i++) {
        if (ntp[i].indexOf("ntp server ", 0) == -1) continue;
        if (ntp[i].indexOf("ntp server ip ", 0) != -1) ntp = ntp[i].substr("ntp server ip ".length);
        else ntp = ntp[i].substr("ntp server ".length);
        dijit.byId("text_ntp").attr("value", ntp);
        dijit.byId("text_ntp").defaultValue = ntp;
        break;
      }
    }
    var tmpVlan = grep_string(/Selected mgmt vlan: /, form.SETUP_MODE.value);	
    expMgmtVlan = parseInt(token_string(":", 1, tmpVlan));	
    // Get the ES, DS, DM modes mgmt vlan.
    getVlans();
    // Get all the VLANs in the device.
    ipInterfaces = extractIpDetails(form.IP_INT_DETAIL.value);
    activeInterface = getActiveInterface(ipInterfaces);
    var vlanName = "";
    cms_ip = activeInterface.ip;
    subnetMask = activeInterface.netmask;
    cipVlan = parseInt(trim_string(form.CIP_VLAN.value).replace(/[Vlan :]/g, ""));	
    if (isNaN(cipVlan)) cipVlan = -1;
    // Fill the VLAN field.
    if (activeInterface.name.toLowerCase().indexOf("vlan") != -1) {
      var vlanId = activeInterface.name.substring(4);
    }

    fillVlanField(vlanId, cipVlan);
    ipAddress = cms_ip;
    if (activeInterface.ipMode == "DHCP") {
      form.radio_ipAssignMode[1].checked = true;
      form.radio_ipAssignMode[1].defaultChecked = true;
      form.radio_ipAssignMode[0].checked = false;
      form.radio_ipAssignMode[0].defaultChecked = false;
      dijit.byId("text_ipAddress").attr("disabled", true);
    } else {
      form.radio_ipAssignMode[0].checked = true;
      form.radio_ipAssignMode[0].defaultChecked = true;
      form.radio_ipAssignMode[1].checked = false;
      form.radio_ipAssignMode[1].defaultChecked = false;
      dijit.byId("text_ipAddress").attr("disabled", false);
    }
    if (ipAddress.indexOf(".") != -1) {
      dijit.byId("text_ipAddress").setIPValue(ipAddress);
      dijit.byId("text_ipAddress").setMaskValue(subnetMask);
      dijit.byId("text_ipAddress").defaultIp = ipAddress;
    } else {
      dijit.byId("text_ipAddress").defaultIp = "";
      dijit.byId("text_ipAddress").setIPValue("");
      dijit.byId("text_ipAddress").setMaskValue("");
    }

    if (cipVlan != -1) {
      for (i = 0; i < ipInterfaces.length; i++) {
        if (ipInterfaces[i].name == "Vlan" + cipVlan) {
          dijit.byId("text_cipipAddress").setIPValue(ipInterfaces[i].ip);
          dijit.byId("text_cipipAddress").setMaskValue(ipInterfaces[i].netmask);
          cipVlanIPAddress = trim_string(ipInterfaces[i].ip);
          cipVlanNetworkmask = trim_string(ipInterfaces[i].netmask);
          break;
        }
      }
      form.chk_enable_CIP_vlan.checked = true;
      dijit.byId("text_cipipAddress").attr("disabled", false);
      cipvlanbox.attr("disabled", false);
      dojo.attr("chk_sameAsMvlan", {
        "disabled": false
      });
    } else if(form.chk_enable_CIP_vlan != undefined){
      form.chk_enable_CIP_vlan.checked = false;
      dijit.byId("text_cipipAddress").attr("disabled", true);
      cipvlanbox.attr("disabled", true);
      dojo.attr("chk_sameAsMvlan", {
        "disabled": true
      });
    }
    if (cipVlan == vlanId) {
      form.chk_sameAsMvlan.checked = true;
      cipvlanbox.attr("disabled", true);
      cipvlanbox.attr("value", vlanbox.attr("value"));
      dijit.byId("text_cipipAddress").attr("disabled", true);
      dijit.byId("text_cipipAddress").setValue(dijit.byId("text_ipAddress").getValue());
    }
    if (form.DEFAULT_GATEWAY.value == "undefined" || form.DEFAULT_GATEWAY.value == "0.0.0.0") {
      form.DEFAULT_GATEWAY.value = "";
    }
    if (form.DEFAULT_GATEWAY.value.indexOf(".") != -1) {
      dijit.byId("text_ipDefaultGateway").setIPValue(form.DEFAULT_GATEWAY.value);
      dijit.byId("text_ipDefaultGateway").defaultValue = form.DEFAULT_GATEWAY.value;
    } else {
      dijit.byId("text_ipDefaultGateway").setIPValue("");
    }
    var line = grep_string(/uptime /, form.VERSION.value);
    var currentSysName = token_string(DLIM_WhSp, 0, line);
    if (currentSysName.length > 31) {
      currentSysName = currentSysName.substring(0, 31);
    }
    form.text_sysName.value = currentSysName;
    initSdSync();
  }
  //   				dijit.byId("text_cipipAddress").attr("disabled", true);
  dojo.connect(dijit.byId("fsubmit"), "onClick", onConfigure);
  dojo.byId("chk_sameAsMvlan").onclick = onClickSameMvlan;
  dojo.byId("chk_samePwd").onclick = onClickSamePwd;
});

function onClickHandlerForIpAssignMode(obj) {
  if (form.radio_ipAssignMode[1].checked) { // for DHCP
    dijit.byId("text_ipAddress").attr("disabled", true);
    dijit.byId("text_ipAddress").setMaskValue("");
    dijit.byId("text_ipAddress").setIPValue("");
  } else { // for Static IP
    dijit.byId("text_ipAddress").attr("disabled", false);
    //dijit.byId("text_ipAddress").setMaskValue("255.255.255.0");
  }
}



function onChangeVlan(newVal) {
  dijit.byId("text_ipAddress").setIPValue("");
  //				dijit.byId("text_ipAddress").setMaskValue("255.255.255.0");
  dijit.byId("text_ipAddress").setMaskValue("");
  form.radio_ipAssignMode[0].checked = false;
  form.radio_ipAssignMode[1].checked = false;
  dijit.byId("text_ipAddress").attr("disabled", false);
  for (i = 0; i < ipInterfaces.length; i++) {
    if (ipInterfaces[i].name == "Vlan" + newVal) {
      dijit.byId("text_ipAddress").setIPValue(ipInterfaces[i].ip);
      dijit.byId("text_ipAddress").setMaskValue(ipInterfaces[i].netmask);
      if (ipInterfaces[i].ipMode == "DHCP") {
        form.radio_ipAssignMode[1].checked = true;
        dijit.byId("text_ipAddress").attr("disabled", true);
      } else if (ipInterfaces[i].ip != '') form.radio_ipAssignMode[0].checked = true;
      break;
    }
  }
}

function onChangeCipVlan(newVal) {
  if (devSetupMode == M_ES) return;
  dijit.byId("text_cipipAddress").setIPValue("");
  dijit.byId("text_cipipAddress").setMaskValue("");
  for (i = 0; i < ipInterfaces.length; i++) {
    if (ipInterfaces[i].name == "Vlan" + newVal) {
      dijit.byId("text_cipipAddress").setIPValue(ipInterfaces[i].ip);
      dijit.byId("text_cipipAddress").setMaskValue(ipInterfaces[i].netmask);
      break;
    }
  }
}

function onClickHandlerEnableCIPVlan() {
  if (form.chk_enable_CIP_vlan.checked) {
    if (!form.chk_sameAsMvlan.checked) {
      dijit.byId("text_cipipAddress").attr("disabled", false);
      cipvlanbox.attr("disabled", false);
    }
    dojo.attr("chk_sameAsMvlan", {
      "disabled": false
    });
  } else {
    dijit.byId("text_cipipAddress").attr("disabled", true);
    cipvlanbox.attr("disabled", true);
    dojo.attr("chk_sameAsMvlan", {
      "disabled": true
    });
  }
}

function onClickSameMvlan() {
  if (form.chk_sameAsMvlan.checked) { //
    cipvlanbox.attr("disabled", true);
    dijit.byId("text_cipipAddress").attr("disabled", true);
    cipvlanbox.attr("value", vlanbox.attr("value"));
    dijit.byId("text_cipipAddress").setValue(dijit.byId("text_ipAddress").getValue());
  } else {
    cipvlanbox.attr("disabled", false);
    dijit.byId("text_cipipAddress").attr("disabled", false);
  }
}

function onClickSamePwd() {
  if (form.chk_samePwd.checked) { //
    dijit.byId("id_cippwd").attr("disabled", true);
    dijit.byId("id_cippwd2").attr("disabled", true);
  } else {
    dijit.byId("id_cippwd").attr("disabled", false);
    dijit.byId("id_cippwd2").attr("disabled", false);
  }
}
var vlanData = {
  items: [{
    name: "1",
    id: "1"
  }]
};
var vlantore = new dojo.data.ItemFileReadStore({
  data: vlanData
});


