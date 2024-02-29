/*
 *------------------------------------------------------------------
 * forms.js --  Form Utilities
 *
 *
 * Copyright (c) 2003-2004, 2006-2007, 2012-2013 by cisco Systems, Inc.
 * All rights reserved.
 *------------------------------------------------------------------
 */
 
//Global vars
var ConfigMsg = "WARNING:\nThe settings shown on this page will be updated.\nClick 'OK' to continue.";
var ClearLogMsg = "WARNING:\nThe Event Log will be cleared.\nClick 'OK' to continue.";
var RestoreMsg = "WARNING:\nYou have requested that ALL settings on this page be reverted to their Factory Defaults!\nClick 'OK' to continue.";
var TextDisableMsg = "DISABLED"

var netscape = (navigator.appName.indexOf("tscape") !=-1) ? true : false;	

// used to find the keyed in value's corresponding character
var _symbols = " !\"#$%&'()*+'-./0123456789:;<=>?@";
var loAZ = "abcdefghijklmnopqrstuvwxyz";
var upAZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
_symbols+= upAZ; //loAZ.toUpperCase();
_symbols+= "[\\]^_`";
_symbols+= loAZ;
_symbols+= "{|}~";


//display properties of a JS object
function dump_props(obj,obj_name)
{
  var result = ""
  for( var i in obj )
  {
    result += obj_name + "." + i + " = " + obj[i] + "\n"
  }
  return result
}

//Encode the IOS command string(s) in src
function encode(src)
{
 var     dst = "";
 var     c;
 var     i;
 for( i = 0 ; i < src.length ; i += 1 )
 {
  c = src.charAt(i);
  if( c >= 'A' && c <= 'Z' )
     dst += c;
  else if( c >= 'a' && c <= 'z' )
     dst += c;
  else if( c >= '0' && c <= '9' )
     dst += c;
  else if( c == ' ' )
     dst += '+';
  else if( c == '/' )
     dst += "%2f";
  else
     dst += escape(c);
 }
 return dst;
}

//Determine if a string is blank
function isBlank(testStr)
{
  if (testStr.search(/\S/) == -1)
    return true
  return false
}

function isCLIString(testStr)
{
  if (isBlank(testStr))
    return false
  //if (testStr.search(/[\t?"'$+\[]/) != -1)
  if (testStr.search(/[\t?"' \[]/) != -1)
    return false
  return true
}

//Determine if a password valid for CLI; like isCLIString, except 
//beginning ! # ; ARE allowed
function isCLIPasswd(testStr)
{
  if (isBlank(testStr))
    return false
  if (testStr.search(/[\t?"'$+\[]/) != -1)
    return false
  return true
}

//Determine if a string is a valid IP address
function isIP(testStr)
{
  var     dots = 0;
  for( var i = 0 ; i < testStr.length ; ++i )
  {
    if( testStr.charAt(i) >= '0' && testStr.charAt(i) <= '9') {
       continue;
    } else if( testStr.charAt(i) == '.' ) {
       ++dots;
       continue;
    } else {
       break;
    }
  }
  if (i==0 || i!=testStr.length || dots != 3)
    return false;
  
  var fieldArray = testStr.split(".")
  var octet1 = parseInt(fieldArray[0], 10)
  var octet2 = parseInt(fieldArray[1], 10)
  var octet3 = parseInt(fieldArray[2], 10)
  var octet4 = parseInt(fieldArray[3], 10)
  //make sure no blank fields
  if (isNaN(octet1) || isNaN(octet2) || isNaN(octet3) || isNaN(octet4))
    return false
  if (octet1 < 0 || octet1 > 255)
    return false;
  if (octet2 < 0 || octet2 > 255)
    return false;
  if (octet3 < 0 || octet3 > 255)
    return false;
  if (octet4 < 0 || octet4 > 255)
    return false;
  return true;
}

// Check whether the ip address is valid
function isValidHostIP(ipStr, netMask)
{
	if((isIP(ipStr) != true) || isIP(netMask) != true)
		return false;

	var fieldArray = ipStr.split(".");
	var maskArray = netMask.split(".");
	var octet = new Array();
	var mask = new Array();
	var network = 0;
	var hostID = 0;
	for(i = 0; i < 4; i++) {
		octet[i] = parseInt(fieldArray[i], 10);
		mask[i] = parseInt(maskArray[i], 10);
	}

	if(octet[0] < 1 || octet[0] > 223) {
		// the IP address is not a class A or B or C address
		return false;	
	}

	if(mask[0] < 128 || octet[3] > 254) {
		// the subnet mask is invalid
		return false;	
	}

// And the ip and mask to get the network.
// xor the ip and network address to get the host.
// if the sum of any host part octet and corrsponding
// mask is not <mask> or 255, it is valid
	var valid = false;
	for(i = 0; i < 4; i++) {
		network = octet[i] & mask[i];
		hostID = octet[i] ^ network;
		if(mask[i] != 255) {
			hostID += mask[i];
			if(hostID != mask[i] && hostID != 255)
				valid = true;
		}
	}
	return valid;
}

function getNetworkAddress(ipStr, netMask) {
	if(ipStr != null && netMask != null) {
		var fieldArray = ipStr.split(".");
		var maskArray = netMask.split(".");
		var octet = new Array();
		var mask = new Array();
		if(fieldArray.length == 4 && maskArray.length == 4) {
			for(i = 0; i < 4; i++) {
				octet[i] = parseInt(fieldArray[i], 10);
				mask[i] = parseInt(maskArray[i], 10);
			}
			var network = new Array();
			for(i = 0; i < 4; i++) {
				network[network.length] = octet[i] & mask[i];
			}
			return network.join(".");
		}
	}
	return null;
}

// Format the ip address. Clear preceeding zeros in ip address
function getFormattedIP(ipStr)
{
  var fieldArray = ipStr.split(".")
  var ip = parseInt(fieldArray[0], 10); 
  ip += "." + parseInt(fieldArray[1], 10);
  ip += "." + parseInt(fieldArray[2], 10);
  ip += "." + parseInt(fieldArray[3], 10);
  return ip;
}

// Check whether the ip1 and ip2 are in the same subnet
function isInSameSubnet(ip1, ip2, mask) {
	ip1Octets = split(".", ip1);
	ip2Octets = split (".", ip2);
	subnetOctets = split(".", mask);
	
	for (var i=0; i<4; i++) {
		if((parseInt(ip1Octets[i]) & parseInt(subnetOctets[i])) != (parseInt(ip2Octets[i]) & parseInt(subnetOctets[i])))  {
			return false;
		}   
	}
	return true;
}

//Determine if form object is at default value. Returns false if newly selected or de-selected.
function def(obj)
{
    if( obj.type == "text" || obj.type == "password")
    {
        //don't treat a blank field as unchanged, since page may interpret blank as delete
        if( obj.value == obj.defaultValue)
            return true;
    }
    else if( obj.type == "checkbox" || obj.type == "radio")
    {
        if( obj.checked == obj.defaultChecked )
            return true;
    }
    else if( obj.type == "select-one" )
    {
        var noSelectDefault = true;   //IE may have no select default at startup
        if (obj.selectedIndex < 0)
            return true
        for (i=0; i<obj.length; i++) {
            if (obj.options[i].defaultSelected == true)
                noSelectDefault = false
        }
        if( obj.options[obj.selectedIndex].selected == 
            obj.options[obj.selectedIndex].defaultSelected )
            return true;
        if (noSelectDefault)
            return true;
    }
    else if( obj.type == "select-multiple" )
    {
        for( i = 0 ; i < obj.length ; i += 1 )
            if( obj.options[i].selected != obj.options[i].defaultSelected )
                return false;
        return true;
    }
    else
        alert("def() does not know object type\n" + dump_props(obj,"obj"));
    return false;
}

//Determine if form object is modified. Returns true if newly selected.
function modified(obj)
{
    if( obj.type == "text" || obj.type == "password" )
    {
        //don't treat a blank field as unchanged, since page may interpret blank as delete
        if( obj.value != obj.defaultValue)
            return true;
    }
    else if( obj.type == "checkbox" )
    {
        if( obj.checked == true )
            if( obj.defaultChecked == false )
                return true;
    }
    else if( obj.type == "select-one")
    {
        if ( obj.selectedIndex >= 0 )
            if( obj.options[obj.selectedIndex].selected != obj.options[obj.selectedIndex].defaultSelected)
                return true;
    }
    else if( obj.type == "radio")
    {
        if ( obj.checked == true )
            if( obj.defaultChecked == false )
                return true;
    }
    else
        alert("modified() does not know object type=" + obj.type + "\n" + dump_props(obj,"obj"));
    return false;
}

function setFieldType(field, type) {
	if(field) {

		if(field.type == "text") {
			//  Register event for netscape.
			if (netscape) document.captureEvents(Event.KEYPRESS);

			if(type == 'INTEGER') {
				field.onkeypress = _checkForValidity;
				field["VALIDCHARS"] = "0123456789";
			}
			else if(type == "IP") {
				field.onkeypress = _checkForValidity;
				field["VALIDCHARS"] = "0123456789.";
			}
			return true;
		}
	}
	return false;
}

// Will block the characters specified in the invalidChars 
function setInvalidChars(field, invalidChars) {
	if(field) {
		if(field.type == "text") {
			//  Register event for netscape.
			if (netscape) document.captureEvents(Event.KEYPRESS);
			field.onkeypress = onKeyPressFn;
			field["INVALIDCHARS"] = invalidChars;
			return true;
		}
	}
	return false;
}

// Will allow only the characters specified in the validChars 
function setValidChars(field, validChars) {
	if(field) {
		if(field.type == "text") {
			//  Register event for netscape.
			if (netscape) document.captureEvents(Event.KEYPRESS);
			field.onkeypress = _checkForValidity;
			field["VALIDCHARS"] = validChars;
			return true;
		}
	}
	return false;
}

// private function
function _checkForValidity(e) {
	var key = (netscape) ? e.which : window.event.keyCode;
	var field = (netscape) ? e.target : window.event.srcElement;
	var charList = (field.VALIDCHARS != null)? field.VALIDCHARS : field.INVALIDCHARS;

	if(charList == null) {
		return true;
	}
	
	if(key < 32 || key > 126) {
		// non alpha-numeric!
		return true;
	}
	var newChar = _symbols.charAt(key - 32);
	var _ret = ((field.VALIDCHARS == null) ^ (charList.indexOf(newChar) > -1));

	// work around for netscape
	// if onKeyPress is not specified in the html, netscape will
	// not restrict/allow the character keyed in by the user according
	// to the return value. In this situation the character will be 
	// allowed in the field irrespective of the functionm return value.
	// To handle this, we remove the last character, if it is invalid from
	// the field value. One another work around is to add onKeyPress="" in 
	// html for the needed fields.
	if(netscape && _ret == 0) {
		var lastChar = field.value.charAt(field.value.length-1);
		if(newChar == lastChar) {
			field.value = field.value.substring(0, field.value.length-1);
		}
	}

	return (_ret == 1);
}

function onKeyPressFn(e) {
	return _checkForValidity(e);
}

//  will help to submit large set of CLIs
// form		- the form that should be used to submit.
// CLIs		- the large number of CLIs that should be executed in the device
// pre_CLIs	- the CLIs which needs to be executed before executing the 
//			- large set of CLIs specified
// post_CLIs- the CLIs which needs to be executed after executing the
//			  large set of CLIs specified.
// moreFilePath - path from which the moreFile.txt file should be read
//                work around for redirecting the page correctly in netscape
function submitBulkForm(form, CLIs, pre_CLIs, post_CLIs, moreFilePath, ieBackFile) {
	if(form == null)
		return;
	var filename = "a.cli";
	var name_str = "abcdefghijklmnopqrstuvwxyz";
	var CMD = "";
	if(form.method != "POST")
		form.method = "POST";
	var backFileName = "back.htm";
	if(ieBackFile != null) backFileName = ieBackFile;
	if(netscape) backFileName = "nsback.htm";
	
	if(form.send == null) {
		//add a hidden form variale 'send' and assign the value back.htm
		oInput = document.createElement("INPUT");
		oInput.type = "hidden";
		oInput.name = "send";
		oInput.value = backFileName;
		form.appendChild(oInput);
	}
	else { //if(isBlank(form.send.value)) {
		form.send.value = backFileName;
	}
	
	if(pre_CLIs != null) {
		CMD += pre_CLIs;
	}
	// create a random filename	
	var randomnumber=Math.floor(Math.random()*26);
	filename = name_str.charAt(randomnumber) + ".cli";

	// create the CLIS to store the exact CLIs to a file.
	var oInput = null;
	var index = 0;
	var i = 1;
	var maxLen = 75;
	var endIndex = 0;
	var subCommand = "";

	if(CLIs.length > 0) {
		if(netscape)
		{
			oInput = document.createElement("INPUT");
			oInput.type = "hidden";
			oInput.name = "moreField";
			if(moreFilePath.indexOf("\r\n") !=-1){
				moreFilePath=moreFilePath.split("\r\n")[0];
			}else if(moreFilePath.indexOf("\n") !=-1){
				moreFilePath=moreFilePath.split("\n")[0];
			}
			oInput.value = "more " + moreFilePath + "/more.txt";
			form.appendChild(oInput);
		}
			
		oInput = document.createElement("INPUT");
		oInput.type = "hidden";
		oInput.name = "a";
		oInput.value = 'cluster pref file ' + filename;;
		form.appendChild(oInput);

		oInput = document.createElement("INPUT");
		oInput.type = "hidden";
		oInput.name = "z";
		oInput.value = 'cluster pref file append ' + filename;
		form.appendChild(oInput);
		
		// add end as the last command if it is not there already
		if(CLIs.search(/end\n$/) == -1) {
			CLIs += '!\nend\n';
		}
		
	}

	while(index < CLIs.length) {
		endIndex = index + maxLen;
		if(endIndex > CLIs.length) {
			endIndex = CLIs.length;
		}
		subCommand = CLIs.substring(index, endIndex);
		oInput = document.createElement("INPUT");
		oInput.type = "hidden";
		oInput.name = "b" + i ;
		oInput.value = subCommand;
		form.appendChild(oInput);
		if(i == 1)
		{
			if(netscape)
				if(moreFilePath != undefined)
					CMD += '$moreField \n';
			CMD += '$a $b' + i + '\n';
		}
		else
			CMD += '$z $b' + i + '\n';
		index = endIndex;
		i += 1;
	}

	oInput = document.createElement("INPUT");
	oInput.type = "hidden";
	oInput.name = "c1";
	oInput.value = 'copy ' + filename + ' running-config\n';
	form.appendChild(oInput);

	oInput = document.createElement("INPUT");
	oInput.type = "hidden";
	oInput.name = "c2";
	oInput.value = 'delete /force ' + filename + '\n';
	form.appendChild(oInput);

	// Apply the configuration and delete the file
	CMD += '$c1\n$c2\n';

	if(post_CLIs != null) {
		CMD += post_CLIs;
	}
	form.action = escape(CMD);
	
	//Code for Auto Sync 
	
	if(top.globalSdCard && top.topFrame && top.topFrame.updateNotification)
		top.globalSdCard.runAutoSyncSetup('CONFIG'); 
		
	form.submit();
}


function splitCli(CLIs,pre_CLIs,post_CLIs) {
	
	var retValue = new Object()
	retValue.url = "";
	retValue.content = "";
	
	var content = new Object();
	
	var filename = "a.cli";
	var name_str = "abcdefghijklmnopqrstuvwxyz";
	
	var CMD = "";
	
	if(pre_CLIs != null) {
		CMD += pre_CLIs;
	}
	
	// create a random filename	
	var randomnumber=Math.floor(Math.random()*26);
	filename = name_str.charAt(randomnumber) + ".cli";
	
	// create the CLIS to store the exact CLIs to a file.
	var oInput = null;
	var index = 0;
	var i = 1;
	var maxLen = 75;
	var endIndex = 0;
	var subCommand = "";

	if(CLIs.length > 0) {
			
		content["a"] = 'cluster pref file ' + filename;
		content["z"] = 'cluster pref file append ' + filename;
		// add end as the last command if it is not there already
		if(CLIs.search(/end\n$/) == -1) {
		CLIs += '!\nend\n';
		}
	}

	while(index < CLIs.length) {
		endIndex = index + maxLen;
		if(endIndex > CLIs.length) {
			endIndex = CLIs.length;
		}
		subCommand = CLIs.substring(index, endIndex);
		content["b"+i] = subCommand; 
		
		if(i == 1)
			CMD += '$a $b' + i + '\n';
		else
			CMD += '$z $b' + i + '\n'; 
		
		index = endIndex;
		i += 1;
	}
	content["d1"] = 'copy ' + filename + ' running-config\n'; 
	content["d2"] = 'delete /force ' + filename + '\n';
	
	// Apply the configuration and delete the file
	CMD += '$d1\n$d2\n';
	
	if(post_CLIs != null) {
		CMD += post_CLIs;
	}
	
	retValue.url = escape(CMD);
	retValue.content = content;
	return retValue;
}

