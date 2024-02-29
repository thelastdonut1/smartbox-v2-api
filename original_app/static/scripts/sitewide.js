/*
 *------------------------------------------------------------------
 * sitewide.js
 *
 * Copyright (c) 2003-2007, 2013-2015 by cisco Systems, Inc.
 * All rights reserved.
 *------------------------------------------------------------------
 */

var DLIM_WhSp = /[\s]+/;
var DLIM_WhSp_slash = /[\/\s]+/;
var DLIM_WhSp_comma = /[\,\s]+/;
var DLIM_WhSp_parens = /[\(\)\s]+/;
var DLIM_WhSp_colon = /[\:\s]+/;
var DLIM_newline = /[\r\n]+/;
var DLIM_nonword          = /[\W]+/;
var DLIM_nonword_period   = /[^a-zA-Z0-9_\.]+/;
var DLIM_nonword_colon    = /[^a-zA-Z0-9_:]+/;
var PORT_MaxCount_digit = /\d+/;

var re_sdcard_ConfMsg1 = "Notification: Switch configuration has been updated. Synchronize the new configuration between SD Card and Onboard Flash?";
var re_sdcard_ConfMsg2 = "Notification: Switch software has been updated. Synchronize the new software between SD Card and Onboard Flash?";
var re_sdcard_ConfMsg4 = "Notification: Switch configuration and software has been updated. Synchronize the new configuration and software between SD Card and Onboard Flash?";

var re_sdcard_WarMsg1 = "Warning: Switch configuration has been updated.Synchronize the new configuration between SD Card and Onboard Flash.";
var re_sdcard_WarMsg2 = "Warning: Switch software has been updated.Synchronize the new software between SD Card and Onboard Flash.";
var re_sdcard_WarMsg4 = "Warning: Switch configuration and software has been updated. Synchronize the new configuration and software between SD Card and Onboard Flash.";
var re_sdcard_WarMsg5 = "Warning: Another sync operation is in progress, Please try later.";

//disable right click
document.oncontextmenu = new Function("return false");

// method to Print the page
/*
function printPage(){  
	if (top.mainFrame.window.print) {
		top.mainFrame.window.focus();
	    top.mainFrame.window.print() ;  
	} else {
	    var WebBrowser = '<OBJECT ID="WebBrowser1" WIDTH=0 HEIGHT=0 CLASSID="CLSID:8856F961-340A-11D0-A96B-00C04FD705A2"></OBJECT>';
		document.body.insertAdjacentHTML('beforeEnd', WebBrowser);
	    WebBrowser1.ExecWB(6, 2);
		
	}
}
*/


/*
 * This function converts the short interface name to long interface names
 */
function toLongPortName(intName) {

 	var GIG_SHORT_PRE = "GI";
 	var FA_SHORT_PRE = "FA";
 	var LO_SHORT_PRE = "LO";
	var TE_SHORT_PRE = "TE";
   if (intName.toUpperCase().indexOf(GIG_SHORT_PRE)!= -1) {
		return ("GigabitEthernet" + intName.substring(GIG_SHORT_PRE.length,intName.length));
	}    if (intName.toUpperCase().indexOf(FA_SHORT_PRE)!= -1) {
		return ("FastEthernet" + intName.substring(FA_SHORT_PRE.length,intName.length));
	}    if (intName.toUpperCase().indexOf(LO_SHORT_PRE)!= -1) {
		return ("LongReachEthernet" + intName.substring(LO_SHORT_PRE.length,intName.length));
	}if (intName.toUpperCase().indexOf(TE_SHORT_PRE)!= -1) {
		return ("TenGigabitEthernet" + intName.substring(TE_SHORT_PRE.length,intName.length));
	}   
} 

/*
 * This function converts the long interface name to short interface names
 */
function toShortPortName(intName) {

 	var GIG_LONG_PRE = "GIGABITETHERNET";
 	var TEN_LONG_PRE = "TENGIGABITETHERNET";
 	var FA_LONG_PRE = "FASTETHERNET";
 	var LO_LONG_PRE = "LONGREACHETHERNET";
        if (intName.toUpperCase().indexOf(TEN_LONG_PRE)!= -1) {
		return ("Te" + intName.substring(TEN_LONG_PRE.length,intName.length));
	}    if (intName.toUpperCase().indexOf(GIG_LONG_PRE)!= -1) {
                return ("Gi" + intName.substring(GIG_LONG_PRE.length,intName.length));
	}    if (intName.toUpperCase().indexOf(FA_LONG_PRE)!= -1) {
		return ("Fa" + intName.substring(FA_LONG_PRE.length,intName.length));
	}    if (intName.toUpperCase().indexOf(LO_LONG_PRE)!= -1) {
		return ("Lo" + intName.substring(LO_LONG_PRE.length,intName.length));
	}
	return intName; 
}
//Getting Ip Address of the device
function getIPAddress() {
	try {
		var ipAddr = " ";
		 ipAddr = window.location.host; 
         if ((ipAddr != null) || (ipAddr != " ")){
				document.title = ipAddr;
         }
	    }catch (e) {
		  console.log(e);
	   }
}

// Calculate the netmask from the number of masked bits of an octet
function calcNetMaskField(numberOfBits) {
   if (numberOfBits <= 0) {
      return "0";
   } else if (numberOfBits >= 8) {
      return "255";
   } else if (numberOfBits == 7) {
      return "254";
   } else if (numberOfBits == 6) {
      return "252";
   } else if (numberOfBits == 5) {
      return "248";
   } else if (numberOfBits == 4) {
      return "240";
   } else if (numberOfBits == 3) {
      return "224";
   } else if (numberOfBits == 2) {
      return "192";
   } else if (numberOfBits == 1) {
      return "128";
   }
}


// calculate the netmask string from the masked number of bits
function calcNetMask_string(numberOfBits) {
   var subNetMask = "";
   subNetMask += calcNetMaskField(numberOfBits);
   subNetMask += ".";
   numberOfBits -= 8;
   subNetMask += calcNetMaskField(numberOfBits);
   subNetMask += ".";
   numberOfBits -= 8;
   subNetMask += calcNetMaskField(numberOfBits);
   subNetMask += ".";
   numberOfBits -= 8;
   subNetMask += calcNetMaskField(numberOfBits);
   return subNetMask;
}

// calculate the netmask
function calcNetMask(numberOfBits) {
   var str;
   if (numberOfBits) {
      if (numberOfBits == "undefined") {
         document.write("unassigned");
      } else {
         str = calcNetMask_string(numberOfBits);
         document.write(str);
      }
   } else {
      document.write("unassigned");
   }
}

/// to split the string with the specified delimiter
function split (delimiter, string) { 
   if(string=="" || string==null) return "";
   var localstring = string;
   var word = localstring.split(delimiter);
   if (word.length>1) {
      
      while ((word.length>1)&&(word[0]=="")) {
         localstring = localstring.substr(1);
         word = localstring.split(delimiter);
      }
      
      while ((word.length>1)&&word[word.length-1]=="") {
         localstring = localstring.substr(0,localstring.length-1);
         word = localstring.split(delimiter);
      }
   }
   return word;
}

// will return the token at the index specified,
// string will be splitted with the delimiter specified
function token_string (delimiter, index, string) {
	if(string=="" || string==null) return ""; 
    var tok = null;
	var index;
	var backindex;
    var word = split(delimiter, string);
    var last_token = word.length - 1;
    if (index >= 0) {
       if (index <= last_token) {
          tok = word[index]; 
       }
    } else {
       backindex = last_token + index + 1;
       if (backindex >= 0) {
          tok = word[backindex]; 
       }
    }
    return tok;
}

//trim_string method matches spaces at beginning and end of text and replace
//with null strings
function trim_string(string){ 
	if (string == null) return;
  return string.replace(/^\s+/,'').replace(/\s+$/,'');
} 

// compact_line method removes multiple spaces between words
// this will not remove the space at the start and end of the line
// for that pass the retunr value of this method to trim_string.
// O/p of the call compact_line("   The    line to   be compacted   "); will be
// " The line to be compacted "
function compact_line(line){ 
  return line.replace(/\s+/g,' ');
} 

// grep_string returns the first line that contains the pattern
function grep_string (pattern, string) {
   if(string=="" || string==null) return "";	
   var line = split(DLIM_newline, string);
   for (var curline = 0; curline < line.length; curline++) {
      if (-1 != line[curline].search(pattern)) {
          return line[curline];
      }
   }
}

// grep_string returns the first line that contains the pattern
function grep_string_patternArrray (pattern, string) {
   if(string=="" || string==null) return "";	
   var line = split(DLIM_newline, string);
   for (var curline = 0; curline < line.length; curline++) {
   	
   	  if (-1 != line[curline].search(pattern[0])) {
	  	var Found = CheckPatternArray(pattern,line[curline]);
		if(Found){
			return line[curline];
		}
          
      }
	  
   }
}
function CheckPatternArray(pattern,line){
	var fndIndex =0;
	for(var ptrnIndex=0;ptrnIndex<pattern.length;ptrnIndex++){
		if(line.search(pattern[ptrnIndex]) != -1){
			fndIndex++;
		}
	}
	if(fndIndex == pattern.length){
		return true;
	}
	return false;

}

// grep_string writes the first line that contains the pattern
function grep (pattern, string) {
   if(string=="" || string==null) return "";
   var line = grep_string(pattern, string);
   if (line) {
      document.write(line);
   }
}

// grep_string returns all the lines that contains the pattern
function multi_grep_string (pattern, string) {
   if(string=="" || string==null) return "";
   var result = new Array();
   var i = 0;
   var line = string.split(DLIM_newline);
   for (var curline = 0; curline < line.length; curline++) {
      if (-1 != line[curline].search(pattern)) {
         result[i] = line[curline];
         i += 1;
      }
   }
   return result;
}

// find_string finds the first line matching the pattern and then
// returns token at the specified index after splitting with the delimiter
function find_string (pattern, delimiter, index, string) {
   if(string=="" || string==null) return "";	
   var line = grep_string(pattern, string);
   if (line) {
      tok = token_string(delimiter, index, line);
      if (tok) {
          return tok;
      }
   }
}

// find_value finds the first line matching the pattern and then
// returns the port maximum count value
function find_portMaxCount (pattern, string) {
   var maxCount = "";
   if(string=="" || string==null) return "";	
   var line = grep_string(pattern, string);   
   if (line) {
      maxCount = parseInt(line.match(PORT_MaxCount_digit))*1024;
	  return maxCount;
   }
}

// find_value finds the first line matching the pattern and then
// returns the port number
function find_portNum (pattern, string) {
   var portNum = "";
   if(string=="" || string==null) return "";	
   var line = grep_string(pattern, string);   
   if (line) {
      portNum = parseInt(line.match(PORT_MaxCount_digit));
	  return portNum;
   }
}

// token_string_label_blank will return the string between the label and the end of line
function token_string_label_to_eol(label, string)
{
   if(string=="" || string==null) return "";	
   if (string) {
      match = string.search(label);
      if (-1 != match) {
         remainder = string.substring(match+label.length);
         tok = token_string(DLIM_newline, 0, remainder);
         if (tok)
            return tok;
      }
   }
}

// makeArray creates an array with the specified size.
function makeArray(n){
  this.length = n;
  return this;
}

function FAQ(faqTxt, faqTag) {
	return new Option(faqTxt, faqTag);
}

/*
 * This function extracts the port number from the interface name
 * parameters: intName - interface name, option - method to be used to extract the number
 * options: 1 - loop from end of the name, 2 - loop forward in the name, 3 - extract all numbers in a name, null - use option 1
 * enhanced to show and hide the quick tip.
 */
function getPortNumber(intName, option) {
	if(intName == null) {
		return;
	}
	intName = trim_string(intName);
	if(intName == "") {
		return;
	}
	var portNumber = "";
	if(option == 1 || option == null || option == "") {
		for(var i=intName.length-1; i>=0; i--) {
			var temp = intName.charAt(i);
			if(!isNaN(parseInt(temp))) {
				portNumber = temp + portNumber;
			}
			else {
				break;
			}
		}
	}
	else if(option == 2) {
		for(var i=0; i<intName.length; i++) {
			var temp = intName.charAt(i);
			if(!isNaN(parseInt(temp))) {
				portNumber += temp;
			}
			else {
				break;
			}
		}
	}
	else if(option == 3) {
		portNumber = intName.match(/[0-9]/g).join("");
	}
	
	return portNumber;
}

function replaceSpecialChars(str)
{
	if ( str == null ) return;
	return str.replace(/&/g,"&#38").replace(/</g, "&#60;").replace(/>/g, "&#62;");
}

function replaceParams(strToReplace, replacableStrArray) {
	if(strToReplace == null || replacableStrArray == null) {
		return null;
	}
	var paramSearch ;
	for(var i=0; i<replacableStrArray.length; i++) {
		paramSearch = "{" + i + "}";
		strToReplace = strToReplace.replace(paramSearch, replacableStrArray[i]);
	}
	return strToReplace;
}

function replaceString(strToReplace, replacableStr) {
	if(strToReplace == null || replacableStr == null) {
		return null;
	}
	var replacedStr;
	replacedStr = strToReplace.replace("{0}", replacableStr);
	return replacedStr;
}

function replaceTags(strToReplace, replacableStrArray) {
	if(strToReplace == null || replacableStrArray == null) {
		return null;
	}
	var re = /{[^}]+}/ig;
	var strMatch = strToReplace.match(re);
	for(var i=0; i<strMatch.length; i++) {
		if(replacableStrArray[i] != null)
			strToReplace = strToReplace.replace(strMatch[i], replacableStrArray[i].replace("><", ">" + strMatch[i].replace(/{|}/g, "") + "<"))
	}
	
	return strToReplace;
}

function doesStringHasUcodeChar(stringtoCheck)
{
	if (stringtoCheck==null) return;
	for (var index = 0; index< stringtoCheck.length; index++)
	{
		if ( stringtoCheck.charCodeAt(index) > 255 ) return true;
	}
	return false;
}
function localizeUptime(str)
{
        if (str==null ) return;
        var uptime = str.toLowerCase();
        var singularUnits = new Array("year", "week", "day", "hour", "minute");
        var singularResource = new Array(re_Uptime_year,re_Uptime_week,re_Uptime_day,re_Uptime_hour, re_Uptime_minute);
        var pluralUnits = new Array("years", "weeks", "days", "hours", "minutes");
        var pluralResource = new Array(re_Uptime_years,re_Uptime_weeks,re_Uptime_days,re_Uptime_hours, re_Uptime_minutes);
        for (var i=0; i<pluralUnits.length; i++)
        {
                        if (uptime.indexOf(pluralUnits[i]) != -1)
                        {
                                uptime = uptime.replace(pluralUnits[i], pluralResource[i])
                        }
                        else if (uptime.indexOf(singularUnits[i]) != -1)
                        {
                                uptime = uptime.replace(singularUnits[i], singularResource[i])
                        }
        }
        return uptime;
}

function StringBuffer() { 
   this.buffer = []; 
 } 

 StringBuffer.prototype.append = function append(string) { 
   this.buffer.push(string); 
   return this; 
 }; 

 StringBuffer.prototype.toString = function toString() { 
   return this.buffer.join(""); 
 }; 

 /*
 * This function set the embedded help text in a screen
 */
 
function setHelpText(helpText) {
	document.writeln('\
						<table border=0 cellspacing="0" cellpadding="0"> <tr>');
	document.writeln('\
						<td class="xpcontent">');						
	document.writeln(helpText);
	
	document.writeln('\
						</td> </tr> </table>');				
}

/*
 * initSdSync - It is used to get the sync up setting value 
 *
 * @checkIOSsync - this boolean flag, if it setted this will verify the IOS software status,  and it require sync then will start the sync operation based user configured way. 
 */

function initSdSync(checkIOSsync) {
    
	console.log('STARTED initSdSync');
	top.sync = {};
	top.sync.isCardPresent = false ;
	top.sync.iosSetup = "Prompt";
	top.sync.cfgSetup = "Prompt";
	
	dojo.xhrGet({
		url : "%24a%0A%24b%0A",
		content : {
			a : 'more flash:/syncsetup.txt',
			b : 'show boot | i BOOT path-list'
		},

		load : function(data, ioArgs) {

			if (data.indexOf('Error') == -1) {
				var IOSsyncAction = grep_string("IOS", data);
				var ConfsyncAction = grep_string("CONFIG", data);
				if (IOSsyncAction.indexOf('Prompt') != -1)
					top.sync.iosSetup = "Prompt";
				else if (IOSsyncAction.indexOf('Manual') != -1)
					top.sync.iosSetup = "Manual";
				else if (IOSsyncAction.indexOf('Auto') != -1)
					top.sync.iosSetup = "Auto";

				if (ConfsyncAction.indexOf('Prompt') != -1)
					top.sync.cfgSetup = "Prompt";
				else if (ConfsyncAction.indexOf('Manual') != -1)
					top.sync.cfgSetup = "Manual";
				else if (ConfsyncAction.indexOf('Auto') != -1)
					top.sync.cfgSetup = "Auto";

			} else {
				top.sync.iosSetup = "Prompt";
				top.sync.cfgSetup = "Prompt";
			}

			if (data.indexOf('sdflash:') == -1)
				top.sync.boot = "flash";
			else
				top.sync.boot = "sdflash";
			
			console.log("top.sync.boot	="+top.sync.boot);
				
        	dojo.xhrGet({
        		url : "%24a%0A%24b%0A",
        		content : {
        			a : 'show platform sdflash status',
        			b : ''
        		},
        
        		load : function(data, ioArgs) {
            		top.sync.isCardPresent = data.indexOf('Card Present') != -1 ? true : false;
					
					if(checkIOSsync != undefined  &&  checkIOSsync == true)
					{
						sdIosSync();
					}	
        		},
        		error : function(response, ioArgs) {
        		}
				
            });
		},
		error : function(response, ioArgs) {
		}
	});
	
	console.log('COMPLETED initSdSync');
}
	
function sdSync() {
/*unit test code*/
	if(top.sync == undefined){	
	    top.sync = {};
		top.sync.isCardPresent = true ;
		top.sync.iosSetup = "Prompt";
		top.sync.cfgSetup = "Manual";
	}
    var cmd = "";
    if(top.sync.isCardPresent == false  || (top.sync.boot == "sdflash" && (top.deviceType.indexOf("IE-5000") == 0 || top.deviceType.indexOf("IE-4000") == 0 || top.deviceType.indexOf("1783-HMS") == 0 || top.deviceType.indexOf("1783-IMS")==0)) ) 
        return;

    if(top.sync.boot == "sdflash")
    {
		if(top.sync.cfgSetup == "Prompt")
		{
           var formDlg1 = new xwt.widget.notification.Alert({
                messageType:"Infromation",
                buttons: [
                {
                        label: "Yes",
                        onClick: function(){
							cmd = "sync sdflash: flash: skip ios-image save-old-files \n";
                			dojo.xhrGet({
                			    url: "write%20memory%0A%24t%0A",
                			    content:
                			    {
                				  t:cmd
                			    },
								load : function(data, ioArgs) {
									if(data.indexOf("please try again later") != -1)
									{
										showToast(re_sdcard_WarMsg5);
									}
									else if(data.indexOf("Error") != -1){
										//%Error: Insufficient free space in destination
										  data=data.substr(data.indexOf("Error"));
							              if(data.indexOf("[SKIPPED]")!=-1){
							               data=data.substr(0,data.indexOf("[SKIPPED]"));
							               data=data.split("/");
                                           data=data[1].replace(" (No such file or directory)",""); 

                                           if(data.indexOf("sdflash")!=-1)
                                            showToast(data+" file not present in sdflash");
                                            else
                                            showToast(data+" file  not present in flash");

							              }else{
                                         showToast(data);
							            }
									}
								}
                			});	    
                        }                                
                },
                {
                       label: "No"
                },                        ]
        	});                                                     
        	formDlg1.setDialogContent(re_sdcard_ConfMsg1);			      
			
		}
		else if(top.sync.cfgSetup == "Auto")
		{
			cmd = "sync sdflash: flash: skip ios-image save-old-files \n";
			dojo.xhrGet({
			    url: "write%20memory%0A%24t%0A",
			    content:
			    {
				  t:cmd
			    }
		
			});	    
		}  
	  		  
	}											
    else
    {
		if(top.sync.cfgSetup == "Prompt")
		{
           var formDlg1 = new xwt.widget.notification.Alert({
                messageType:"Infromation",
                buttons: [
                {
                        label: "Yes",
                        onClick: function(){
						cmd = "sync flash: sdflash: skip ios-image save-old-files \n";
            			dojo.xhrGet({
            			    url: "write%20memory%0A%24t%0A",
            			    content:
            			    {
            				  t:cmd
            			    },
							load : function(data, ioArgs) {
								if(data.indexOf("please try again later") != -1)
								{
									showToast(re_sdcard_WarMsg5);
								}
								else if(data.indexOf("Error") != -1){
									//%Error: Insufficient free space in destination
									   data=data.substr(data.indexOf("Error"));
							           if(data.indexOf("[SKIPPED]")!=-1){
							           data=data.substr(0,data.indexOf("[SKIPPED]"));
							           data=data.split("/");
                                       data=data[1].replace(" (No such file or directory)",""); 

                                       if(data.indexOf("sdflash")!=-1)
                                       showToast(data+" file not present in sdflash");
                                        else
                                       showToast(data+" file not present in flash");

							           }else{
                                       showToast(data);
							          }
								}
							}
            		
            			});	    
                        }                                
                },
                {
                       label: "No"
                },                        ]
        	});                                                     
        	formDlg1.setDialogContent(re_sdcard_ConfMsg1);			      
		}
		else if(top.sync.cfgSetup == "Auto")
		{
			cmd = "sync flash: sdflash:  skip ios-image save-old-files \n";
			dojo.xhrGet({
			    url: "write%20memory%0A%24t%0A",
			    content:
			    {
				  t:cmd
			    }
		
			});	    

		}  
	  		  
	}											
}

function sdIosSync() {
	
	console.log('STARTED sdIOSsync');
	if ( top.priv == top.READONLY_PRIV || top.dmMode == top.EXPRES_SETUP_MODE || top.sync.isCardPresent == false || (top.sync.boot == "sdflash" && (top.deviceType.indexOf("IE-5000") == 0 || top.deviceType.indexOf("IE-4000") == 0 || top.deviceType.indexOf("1783-HMS") == 0 || top.deviceType.indexOf("1783-IMS")==0))) {
		return;
	}
	
	dojo.xhrGet({
        		url : "%24a%0A%24b%0A",
        		content : {
        			a : 'show sync status',
        			b : ''
        		},
        
        		load : function(data, ioArgs) {
            		
					// Stop the auto sync whether sync status output is Invalid 
					if(data.indexOf("Invalid input") == -1 )		
					{
						var syncStatus = grep_string("Sync status :", data);  
						var pre_syncStatus = grep_string("Previous sync status :", data);  
						
						var imageSyncStatus = syncStatus.indexOf("IOS not in sync") != -1 ? false : true;
						var configSyncStatus = syncStatus.indexOf("Configuration not in sync") != -1 ? false : true
						
						var isSyncFailed = syncStatus.indexOf('Failed') != -1 ? true : false;
						if(isSyncFailed)
						{
							imageSyncStatus  = pre_syncStatus.indexOf("IOS not in sync") != -1 ? false : true;
							configSyncStatus  = pre_syncStatus.indexOf("Configuration not in sync") != -1 ? false : true;
						}
						
						console.log("imageSyncStatus = "+imageSyncStatus);	
						console.log("data = "+data);	
						var cmd = "";
						if( configSyncStatus == false || imageSyncStatus == false )
						{
							if(top.sync.iosSetup == top.sync.cfgSetup)
							{
								if(top.sync.boot == "sdflash")
									cmd = "sync sdflash: flash: ";
								else
									cmd = "sync flash: sdflash: ";
							
								if(configSyncStatus == false && imageSyncStatus == false )
									cmd += "save-old-files \n";
								else if(configSyncStatus == false && imageSyncStatus == true )
									cmd += "skip ios-image save-old-files \n";
								else if(configSyncStatus == true && imageSyncStatus == false )
									cmd += "skip vlan.dat config.text save-old-files \n";
							}
							else if(top.sync.iosSetup != top.sync.cfgSetup)
							{
								//Code for perform the configuration sync only
								if(configSyncStatus == false)
								{
									if(top.sync.cfgSetup == "Manual") 
										showToast(re_sdcard_WarMsg1);
									else
										sdSync();
								}
								//Code for perform the IOS sync only
								if(imageSyncStatus == false)
								{
									if(top.sync.boot == "sdflash")
										cmd = "sync sdflash: flash: skip vlan.dat config.text save-old-files \n";
									else
										cmd = "sync flash: sdflash: skip vlan.dat config.text save-old-files \n";
								}
							}
						}
						
						//Code for perform the IOS & Config sync, if the both sync setting are equal
						//else will perform only IOS sync.
						if(cmd != "")
						{
							if (top.sync.iosSetup == "Prompt") 
							{
								var formDlg1 = new xwt.widget.notification.Alert({
									messageType: "Infromation",
									buttons: [{
										label: "Yes",
										onClick: function() {
											
											dojo.xhrGet({
													url: "write%20memory%0A%24t%0A",
													content:
													{
													  t:cmd
													},
													load : function(data, ioArgs) {
														if(data.indexOf("please try again later") != -1)
														{
															showToast(re_sdcard_WarMsg5);
														}
														else if(data.indexOf("Error") != -1){
															//%Error: Insufficient free space in destination
															  data=data.substr(data.indexOf("Error"));
							                                 if(data.indexOf("[SKIPPED]")!=-1){
							                                 data=data.substr(0,data.indexOf("[SKIPPED]"));
							                                 data=data.split("/");
                                                             data=data[1].replace(" (No such file or directory)",""); 

                                                            if(data.indexOf("sdflash")!=-1)
                                                            showToast(data+" file not present in sdflash");
                                                             else
                                                            showToast(data+" file  not present in flash");

							                                }else{
                                                            showToast(data);
							                               }
														}
													}
												});	 
										}

									}, {
										label: "No"
									}, ]
								});
								
								//formDlg1.setDialogContent( top.sync.boot == "sdflash" ? re_sdcard_ConfMsg4 : re_sdcard_ConfMsg2);
								if(top.sync.iosSetup == top.sync.cfgSetup)
									formDlg1.setDialogContent( (configSyncStatus == false && imageSyncStatus == false) ? re_sdcard_ConfMsg4 : (configSyncStatus == false ?re_sdcard_ConfMsg1 : re_sdcard_ConfMsg2));
								else 
									formDlg1.setDialogContent(re_sdcard_ConfMsg2);
							} 
							else if (top.sync.iosSetup == "Auto") 
							{
								dojo.xhrGet({
									url: "write%20memory%0A%24t%0A",
									content:
									{
									  t:cmd
									},
									load : function(data, ioArgs) {
							       if(data.indexOf("Error") != -1){
											//%Error: Insufficient free space in destination
									data=data.substr(data.indexOf("Error"));
							    if(data.indexOf("[SKIPPED]")!=-1){
							    data=data.substr(0,data.indexOf("[SKIPPED]"));
							    data=data.split("/");
                                data=data[1].replace(" (No such file or directory)",""); 

                                if(data.indexOf("sdflash")!=-1)
                                showToast(data+" file not present in sdflash");
                                else
                                showToast(data+" file  not present in flash");

							    }else{
                                showToast(data);
							    }
							    }
									}
							
								});	    
							}
							else if (top.sync.iosSetup == "Manual" && top.sync.cfgSetup == "Manual") 
							{
								showToast((configSyncStatus == false && imageSyncStatus == false) ? re_sdcard_WarMsg4 : (configSyncStatus == false ?re_sdcard_WarMsg1 : re_sdcard_WarMsg2));
							}
							else if(top.sync.iosSetup == "Manual")
							{
								showToast(re_sdcard_WarMsg2);
							}
						}
					}
					
				},
        		error : function(response, ioArgs) {
        		}
            });
	
}


function infoMessageNotification(message) {
	var infoDlg = new xwt.widget.notification.Alert({
		messageType: "informational",
	    	buttons: [ {
			label: "OK",
	    		baseClass: "defaultButton"
		}]
	});
	infoDlg.setDialogContent(message);

}

function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

/* parse cli based on fixed position , instead of space.
   good for cli like show interfaces status, which may contain space inside a colume
Port      Name               Status       Vlan       Duplex  Speed Type
Fa1/1     3                  disabled: TD 22           auto   auto 10/100BaseTX
   
   */
function parseAry(cli, pos_ary) {
	var ret_ary = new Array();
	var pos = 0;
	for(var i = 0; i < pos_ary.length; ++i){
		ret_ary[ret_ary.length] = trim_string(cli.substr(pos, pos_ary[i] - pos));
		pos = pos_ary[i];
	}
	return ret_ary;
}

function handleCliErrorResponse(cliData){
	var cliDataUpper = cliData.toUpperCase();
	if (cliData.search(/%\s*\S/) >= 0 || cliData.indexOf("Error") != -1 || cliData.indexOf("Invalid input detected at") != -1 || cliDataUpper.indexOf("COMMAND REJECTED") != -1
			|| cliDataUpper.indexOf("INVALID") != -1 || cliDataUpper.indexOf("INCONSISTENT") != -1 || cliDataUpper.indexOf("CONFIGURATION FAILED") != -1) {
		while(cliData.search(/to file \w.cli/) > 0){
			cliData = cliData.substr(cliData.search(/to file \w.cli/));
			cliData = cliData.substr("to file l.cli".length);
		}
		while(cliData.search(/%\s*\S/) >= 0){
			var index = cliData.search(/%\s*\S/);
			cliData = cliData.substr(0, index) + cliData.substr( index+1 , cliData.length)
		}
		
		cliData = cliData.substr(0, cliData.indexOf("bytes copied in"));
		var regValue = cliData.toUpperCase().search(/ERROR|COMMAND REJECTED|INVALID|INCONSISTENT|CONFIGURATION FAILED/);
		cliData.substr(regValue, cliData.length);
		while(cliData.indexOf("Invalid input detected at") != -1){
			var cliDataArray = split("\n" ,trim_string(cliData));
			for(var i = 0 ; i < cliDataArray.length ; i++){
				if(cliDataArray[i].indexOf("Invalid input detected at") != -1){
					cliDataArray.splice(i-2,3);
					break;
				}
			}
			if(cliData.indexOf("configuration may have partially or fully failed") == -1)
				cliDataArray.splice(cliDataArray.length-2,1,"\nInvalid input detected, configuration may have partially or fully failed");
			cliData = cliDataArray.join("\n");
		}
		if(cliData.length > 0){showToast(cliData, "toast")};
	}
}

function showToast(string,id ){ 
	if (string == null) return;
	if (id == null) id = "toast";
    string = string.replace(/\n/g,'<br>');
    if(string.indexOf("<br>") != -1)
    	string = string.substr(0, string.lastIndexOf('<br>'));
    dijit.byId(id).positionDirection="tr-down";
    dijit.byId(id).newMessage(string, "information", "");
} 

/*trim the string and conver the 1st char to upper*/
function trimUpper(string){ 
	if (string == null ) return string;
    string = trim_string(string);
	if (string == "") return string;
    string = string[0].toUpperCase() + string.slice(1);
    return string;
} 


function formatCheckBox(data,item,store) {
	if (data) 
	  	return "<div class='dijitReset dijitInline dijitCheckBox ' wairole='presentation' role='presentation' style='margin-top:2px;'> <input type='checkbox' checked  /> </div>"
	else	
	  	return "<div class='dijitReset dijitInline dijitCheckBox ' wairole='presentation' role='presentation' style='margin-top:2px;'> <input type='checkbox'   /> </div>"
}


function getSubnet(_ip, _mask) {
    var t1 = _ip.split(".");
    var t2 = _mask.split(".");
    var str = "";
    for (i = 0; i < t1.length; i++) t1[i] = (t1[i] & t2[i]);
    return t1.join(".");
}

function inSameSubnet(_ip1, _ip2, _mask) {
    return ((getSubnet(_ip1, _mask) == getSubnet(_ip2, _mask)) ? true : false);
}

function isReadOnlyMode(){
	return ( top.dataCache != undefined && top.dataCache.get("Home_Privilege").indexOf("ReadOnly") != -1 );
}

function disableActions(actionIds){
	if(isReadOnlyMode()){
		for(var i=0;i<actionIds.length;i++){
			dijit.byId(actionIds[i]).attr('disabled',true);
		}
	}
};

function controlUserAccess(actionIds){
	actionIds = (actionIds ? actionIds : []);
	if(isReadOnlyMode()){
		var readOnlyPanel = dojo.byId('readOnlyPanel'); 
		if(readOnlyPanel){
			readOnlyPanel.style.display='block';
			readOnlyPanel.style.visibility='visible';
			disableActions(actionIds);
		}	
	}
}

function isNonCryptoImage(){
	return ( top.dataCache != undefined && top.dataCache.get("ImageType") != null && top.dataCache.get("ImageType").indexOf("Non-Crypto") != -1 );
}


