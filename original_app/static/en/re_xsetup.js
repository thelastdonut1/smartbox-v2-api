/*
 *------------------------------------------------------------------
 * express setup resource file - includes express setup (incl. smartports info page), managed and recovery mode pages
 * Copyright (c) 2006-2008, 2010, 2013, 2015 by cisco Systems, Inc.
 * feature code - xSetup
 *------------------------------------------------------------------
*/

//macchiato
var re_xSetup_Ttl = "Express Setup";

var re_xSetup_LblMgmtIntMach = "Management Interface (VLAN)";
var re_xSetup_LblIPMode = "IP Assignment Mode";
var re_xSetup_LblIPModeStatic = "Static";
var re_xSetup_LblIPModeDHCP = "DHCP";
var re_xSetup_LblIPAddress = "IP Address";
var re_xSetup_LblSubnet = "Subnet Mask";
var re_xSetup_LblDefGateway = "Default Gateway";
var re_xSetup_LblUsrName = "Username";
var re_xSetup_LblPwd = "Password";
var re_xSetup_LblConfPwd = "Confirm Password";
var re_xSetup_LblHostName = "Host Name";
var re_xSetup_LblSysDate = "System Date {(DD/MMM/YYYY)}";
var re_xSetup_LblSysTime = "System Time {(HH:MM)}";
var re_xSetup_LblTimeZone = "Time Zone";
var re_xSetup_LblDST = "Daylight Saving Time";
var re_xSetup_LblEnable = "Enable";
var re_xSetup_LblProfinetEnable = "Enable Profinet"; 
var re_xSetup_LblProfinetId = "Profinet ID"; 
var re_xSetup_LblProfinetVlanId = "Profinet VLAN ID";

var re_xSetup_Grp1Ttl = "Network Settings";
var re_xSetup_Grp1Tt2 = "Optional Settings";

var re_xSetup_Txt2 = "Please use the new ip address to launch the device manager if the ip changed.";

var re_xSetup_ErrMsg1 = "Enter a VLAN ID from 1 to 1001.";
var re_xSetup_ErrMsg2 = "Error:\n\nEnter an IP address for the switch.";
var re_xSetup_ErrMsg4 = "Error:\n\nThe IP address for the switch and the default gateway must belong to the same subnet.";
var re_xSetup_ErrMsg9 = "Error:\n\nThe host name cannot contain a ?, a space, or a tab.";
var re_xSetup_ErrMsg18 = "Error:\n\nThe IP address for the switch and the default gateway cannot be the same.";
var re_xSetup_ErrMsg21 = "Error:\n\n\"{0}\" is not a valid IP Address. Enter an IP address in the x.x.x.x format, where x can be 0 to 255.";
var re_xSetup_ErrMsg22 = "Error:\n\n{0} is not a valid IP address.";
var re_xSetup_ErrMsg23 = "Error:\n\n\"{0}\" is not a valid IP address for the default gateway.\nEnter the IP address in the x.x.x.x format, where x can be 0 to 255.";
var re_xSetup_ErrMsg25 = "Error:\n\nEnter a number from 0 to {0} in this field";
var re_xSetup_ErrMsg26 = "Error:\n\n\"{0}\" is not a valid IP address for the default gateway.";

var re_xSetup_ConfMsg2 = "Warning:\n\nThe IP address of this device will be changed. Express Setup will attempt\nto connect to this device by using this new IP address {0}.\nIf your PC IP address is not in the same subnetwork as this new IP address,\nconnectivity to this device will be lost. Click OK to proceed and to apply\nthe new IP address. Click Cancel to not apply the new IP address.";
var re_xSetup_ConfMsg3 = "Warning:\n\nThe default gateway does not have an IP address specified. Do you want to continue?";
var re_xSetup_ConfMsg6 = "Warning:\n\nThe management interface {0} will be configured with this\nIP Address {1}.\n\nDo you want to proceed?";
var re_xSetup_ConfMsg7 = "Warning:\n\nThe management interface {0} will be configured with this\nIP Address {1}.\n\nTo communicate with the switch, at least one switch port must\nbe assigned to the new management VLAN.\n\nDo you want to proceed?";

var re_xSetup_ConfMsg8 = "Warning:\n\nThe management interface {0} will be configured with the\nIP address assigned by the DHCP server.\n\nDo you want to proceed?";
var re_xSetup_ConfMsg9 = "Warning:\n\nThe management interface {0} will be configured with the\nIP address assigned by the DHCP server.\n\nTo communicate with the switch, at least one switch port must\nbe assigned to the new management VLAN.\n\nDo you want to proceed?";
var re_xSetup_ConfMsg10 = "Information:\n\nThe DHCP server will renegotiate the switch IP address. As a result,\nthe IP address might change. If the IP address changes, you must\nuse the new address to launch the device manager.\n\nDo you want to continue?";

//express setup mode info page
var re_xSetup_InfoTxt1 = "The initial configuration of the switch is complete.";
var re_xSetup_InfoTxt2 = "Before connecting any devices, you can optimize switch performance by assigning Smartports port roles to switch ports. Port roles provide enhanced security, reliability, and performance by enabling port features based on the device that the port connects to. You can assign port roles one at a time or enable a standard Smartports configuration. For this switch, a standard Smartports configuration would assign the following port roles:";
var re_xSetup_InfoTxt3 = "You can also assign port roles for routers, IP telephones and other devices.";
var re_xSetup_InfoTxt4 = "Ports 1 to 24 - Desktops and computers";
var re_xSetup_InfoTxt5 = "High-speed ports 1 and 2 - Ethernet switches";
var re_xSetup_InfoTxt6 = "Ports 1 to 24 - IP phones";
var re_xSetup_InfoTxt7 = "High-speed ports 1 and 2 - Ethernet switches";
var re_xSetup_InfoTxt8 = "Ports 1 to 4 - Access points";
var re_xSetup_InfoTxt9 = "Ports 5 to 24 - Desktops and computers";
var re_xSetup_InfoTxt10 = "High-speed ports 1 and 2 - Ethernet switches";
var re_xSetup_InfoTxt11 = "High-speed ports 1 to 8 - Servers";
var re_xSetup_InfoTxt12 = "High-speed ports 9 to 12 - Ethernet switches";

var re_xSetup_InfoChkBox1 = "Yes, enable the port roles and display the Smartports dialog";
var re_xSetup_InfoChkBox2 = "No, Thanks";

var re_xSetup_InfoErrMsg1 = "You have clicked on Submit without selecting an option";
var re_xSetup_InfoPageTtl = "Smartports Information";

//recovery mode page
var re_xSetup_RecTtl = "Software Recovery";
var re_xSetup_RecRadio1 = "Erase system configuration.";
var re_xSetup_RecRadio2 = "Boot with the factory default IOS image.";
var re_xSetup_RecRadio3 = "Erase system configuration and Boot with the factory default IOS image.";

var re_xSetup_RecConfMsg1 = "This will delete all customized switch settings, including the IP address, but will restart by using the existing software version. Click OK to continue.";
var re_xSetup_RecConfMsg2 = "This will retain all customized switch settings (including the IP address), and will restart the switch by using the factory default software. Click OK to continue.";
var re_xSetup_RecConfMsg3 = "This will delete all customized switch settings (including the IP address), and will restart by using the factory default software. Click OK to continue.";
var re_xSetup_RecConfMsgTtl = "Warning";

var re_xSetup_RecTxt1 = "The switch will be restarted. Use Express Setup to assign an IP address to the switch. Refer to the getting started guide for procedures.";
var re_xSetup_RecTxt2 = "The switch will be restarted. Enter the switch IP address in a browser session to display the device manager.";

//non-macchiato
var re_xSetup_LblMgmtInt = "Management Interface (VLAN ID)";
var re_xSetup_LblSwPwd = "Switch Password";
var re_xSetup_LblConfirmSwPwd = "Confirm Switch Password";
var re_xSetup_LblTelnet = "Telnet Access";
var re_xSetup_LblTelnetPwd = "Telnet Password";
var re_xSetup_LblConfTelnetPwd = "Confirm Telnet Password";
var re_xSetup_LblSnmp = "SNMP";
var re_xSetup_LblSnmpRead = "SNMP Read Community";
var re_xSetup_LblSnmpWrite = "SNMP Write Community";
var re_xSetup_LblSysContact = "System Contact";
var re_xSetup_LblSysLocation = "System Location";
var re_xSetup_LblDisable = "Disable";

var re_xSetup_Txt1 = "Redirecting to the new IP Address....";

var re_xSetup_ErrMsg3 = "Error:\n\nThe IP Addresses 10.0.0.1 and 10.0.0.3 cannot be used in Express Setup mode.";
var re_xSetup_ErrMsg5 = "Error:\n\nThe switch password cannot have spaces at the beginning or end.";
var re_xSetup_ErrMsg6 = "Error:\n\nThe telnet password cannot have spaces at the beginning or end.";
var re_xSetup_ErrMsg7 = "Error:\n\nThe switch password can start with a number, is case sensitive,\nand allows embedded spaces. It cannot contain a ? or a tab or a single digit.";
var re_xSetup_ErrMsg8 = "Error:\n\nEnter the same password in the Switch Password and Confirm Switch Password fields.";
var re_xSetup_ErrMsg10 = "Error:\n\nThe system contact name cannot contain a ? or a tab.";
var re_xSetup_ErrMsg11 = "Error:\n\nThe system location cannot contain a ? or a tab.";
var re_xSetup_ErrMsg12 = "Error:\n\nYou must enter a Telnet password if you enable Telnet access. The telnet password\ncannot contain a ? or a tab.";
var re_xSetup_ErrMsg13 = "Error:\n\nThe telnet password can start with a number, is case sensitive,\nand allows embedded spaces. It cannot contain a ? or a tab.";
var re_xSetup_ErrMsg14 = "Error:\n\nEnter the same password in the Telnet Password and Confirm Telnet Password fields.";
var re_xSetup_ErrMsg15 = "Error:\n\nYou must enter a community string in at least one of the SNMP community fields if you enable SNMP.";
var re_xSetup_ErrMsg16 = "Error:\n\nEnter an SNMP community string that does not contain a ?, a space, or a tab.";
var re_xSetup_ErrMsg17 = "Error:\n\nThe SNMP Read and Write community strings cannot be the same.";
var re_xSetup_ErrMsg19 = "Error:\n\nThe switch password can be up to 25 alphanumeric characters.";
var re_xSetup_ErrMsg20 = "Error:\n\nThe telnet password can be up to 25 alphanumeric characters.";
var re_xSetup_ErrMsg24 = "Error:\n\n{0} is not a valid default gateway IP address.";

var re_xSetup_WngMsg1 = "Warning:\n\nYou must enable Telnet access before setting a Telnet password.";
var re_xSetup_WngMsg2 = "Warning:\n\nYou must enable SNMP before setting the read/write community strings.";
var re_xSetup_WngMsg3 = "Warning:\n\nYou must enable SNMP before setting the system contact/location.";

var re_xSetup_ConfMsg1 = "Warning:\n\nThe IP address of this device will be changed.\nYou may loose connectivity to the device.\nDo you want to continue ?";
var re_xSetup_ConfMsg4 = "Warning:\n\nThe switch does not have a password assigned. Do you want to continue?";
var re_xSetup_ConfMsg5 = "Warning:\n\nThe IP Address {0} is conflicting with already \nconfigured Ip address of the following interface(s)\n\nInterface \tIP Address \tNetmask\n{1}\nIp address of the above interface(s) will be removed to configure \nthe IP Address {2} on the interface vlan {3}.\n\nDo you want to proceed?";


//new strings
var re_xSetup_Grp1Tt3 = "Wireless Controller Settings";
var re_xSetup_LblCtrllerStackNumber = "Stack{\n}Number";
var re_xSetup_LblCtrllerVlan = "Management{\n}VLAN ID";

var re_xSetup_ErrMsg27 = "Error:\n\nEnter an IP address for the controller.";
var re_xSetup_ErrMsg28 = "Error:\n\nEnter a default gateway for the controller.";
var re_xSetup_ErrMsg29 = "Error:\n\nThe IP address for the controller and the default gateway cannot be the same.";
var re_xSetup_ErrMsg30 = "Error:\n\nThe IP address for the controller and the default gateway must belong to the same subnet.";
var re_xSetup_ErrMsg31 = "Error:\n\nEnter a VLAN ID for the controller from 1 to 1001.";
var re_xSetup_ErrMsg32 = "Error:\n\nEnter a VLAN ID for the controller {0} from 1 to 1001.";
var re_xSetup_ErrMsg33 = "Error:\n\nEnter a VLAN ID for the controller {0} from 1 to 1001.";
var re_xSetup_ErrMsg34 = "Error:\n\nEnter an IP address for the controller {0}.";
//var re_xSetup_ErrMsg35 = "Error:\n\n\"{0}\" is not a valid IP Address. Enter an IP address in the x.x.x.x format, where x can be 0 to 255.";
var re_xSetup_ErrMsg36 = "Error:\n\n{0} is not a valid IP address.";
var re_xSetup_ErrMsg37 = "Error:\n\nEnter a default gateway for the controller {0}.";
//var re_xSetup_ErrMsg38 = "Error:\n\n\"{0}\" is not a valid IP address for the default gateway.\nEnter the IP address in the x.x.x.x format, where x can be 0 to 255.";
var re_xSetup_ErrMsg39 = "Error:\n\nThe IP address for the controller {0} and the default gateway cannot be the same.";
var re_xSetup_ErrMsg40 = "Error:\n\nThe IP address for the controller {0} and the default gateway must belong to the same subnet.";
//var re_xSetup_ErrMsg41 = "Error:\n\n{0} is not a valid default gateway IP address.";

var re_xSetup_ErrMsg42 = "Error:\n\nThe IP Addresses in the {0} network cannot be configured on this switch.";
var re_xSetup_ErrMsg43 = "Error:\n\nA username is assigned to the switch, but not a password. Enter a password."
var re_xSetup_ErrMsg44 = "Error:\n\nA password is assigned to the switch, but not a username. Enter a username."
var re_xSetup_ErrMsg45 = "Warning:\n\nThe switch does not have a username and password assigned.\nDo you want to continue?";
var re_xSetup_ErrMsg46 = "Error:\n\nThe password cannot have spaces at the beginning or end.";
var re_xSetup_ErrMsg47 = "Error:\n\nEnter a username. The name can have up to 64 alphanumeric characters.\nIt cannot contain a ?, a space, or a tab."
var re_xSetup_ErrMsg48 = "Error:\n\nThe password can start with a number, is case sensitive, and allows embedded spaces.\nIt cannot contain a ? or a tab or a single digit.";
var re_xSetup_ErrMsg49 = "Error:\n\nEnter the same password in the Password and Confirm Password fields.";
var re_xSetup_ErrMsg50 = "Error:\n\nThe password can be up to 25 alphanumeric characters.";
var re_xSetup_ErrMsg51 = "Error:\n\nVLAN {0} is not available. Enter a different VLAN ID.";
var re_xSetup_ErrMsg52 = "Will be negotiated by DHCP";

//additional strings - 03/06/06
var re_xSetup_ErrMsg53 = "The username cannot contain non-English letters.";
var re_xSetup_ErrMsg54 = "The password cannot contain non-English letters.";
var re_xSetup_ErrMsg55 = "The hostname cannot contain non-English letters.";
var re_xSetup_ErrMsg56 = "The telnet password cannot contain non-English letters.";
var re_xSetup_ErrMsg57 = "The SNMP community string cannot contain non-English letters.";
var re_xSetup_ErrMsg58 = "The system contact cannot contain non-English letters.";
var re_xSetup_ErrMsg59 = "The system location cannot contain non-English letters.";

var re_xSetup_ErrMsg60 = "Error:\n\nThe IP Address {0} is conflicting with already \nconfigured Ip address of the following interface:\n\nInterface \tIP Address \tNetmask\n{1}";

//pixar strings
var re_xSetup_tab_Lbl1 = "Basic Settings";
var re_xSetup_tab_Lbl2 = "Advanced Settings";
var re_xSetup_Grp1Tt4 = "Ethernet Management Port Settings";
var re_xSetup_Ttl2 = "Express Setup: Add";
var re_xSetup_BtnAdd = "Add";
var re_xSetup_BtnDel = "Delete";
var re_xSetup_TblHdrInterface = "Interface";
var re_xSetup_TblHdrIPv6Address = "IPv6 Address";
var re_xSetup_TblHdrPrefixLength = "Prefix{0}Length";
var re_xSetup_TblHdrEUI = "EUI-64";
var re_xSetup_TblHdrSelect = "Select";
var re_xSetup_ErrMsg61 = "Select at least one IPv6 address to delete.";
var re_xSetup_ErrMsg62 = "{0} is not a valid IPv6 unicast address. Enter an IPv6 unicast address in the x:x:x:x:x:x:x:x format, where x can be 0 to 9 and A to F. Each x field can contain up to 4 characters.";
var re_xSetup_ErrMsg63 = "This is an IPv6 multicast address. You can configure this address on the switch through Network Assistant or the CLI. You can configure only IPv6 unicast addresses through the device manager. Enter an IPv6 unicast address in the x:x:x:x:x:x:x:x format, where x can be 0 to 9 and A to F. Each x field can contain up to 4 characters.";
var re_xSetup_ErrMsg64 = "This is an IPv6 site local address. You can configure this address on the switch through Network Assistant or the CLI. You can configure only IPv6 unicast addresses through the device manager. Enter an IPv6 unicast address in the x:x:x:x:x:x:x:x format, where x can be 0 to 9 and A to F. Each x field can contain up to 4 characters.";
var re_xSetup_ErrMsg65 = "The IPv6 unicast address {0} is already assigned to the subnet. Enter an IPv6 unicast address in the x:x:x:x:x:x:x:x format, where x can be 0 to 9 and A to F. Each x field can contain up to 4 characters.";
var re_xSetup_ErrMsg66 = "The IPv6 unicast address {0} is already assigned to the subnet. Enter an IPv6 unicast address in the x:x:x:x:x:x:x:x format, where x can be 0 to 9 and A to F. Each x field can contain up to 4 characters.";

var re_xSetup_ErrMsg67 = "Please wait. The switch is restarting.";
var re_xSetup_ErrMsg68 = "This x field can contain up to 4 characters, where x can be 0 to 9 and A to F.";

var re_xSetup_LblEnableIPv6 = "Enable IPv6";

var re_xSetup_ConfMsg11 = "The switch will restart to enable IPv6. Do you want to continue?";
var re_xSetup_ConfMsg12 = "The switch will restart to disable IPv6. Do you want to continue?";

var re_xSetup_ReloadMsg = "Please wait. The switch is restarting. It might take a few minutes for the process to complete.";
var re_xSetup_ReloadWaitMsg = "Please wait. The switch has not completed the restart process.";

var re_xSetup_VlanIPBalloonHelp = "If your management station is connected to a network port, enter an IP address for the VLAN management interface (VLAN ID {0}).";
var re_xSetup_Fa0IPBalloonHelp = "If your management station is connected through the Ethernet management (Fa0) port, enter an IP address for the port.";
var re_xSetup_Fa0IPBalloonHelp_lightsabre="IP address for the Ethernet management (Fa0) port.";
var re_xSetup_IPv6BalloonHelp = "Enabling or disabling IPv6 restarts the switch.";

//xmen2 error message - 030207
var re_xSetup_ErrMsg69 = "Error:\n\nEnter a password. The password for the switch can have up to 63 alphanumeric characters, can start with a number, is case sensitive, and can have embedded spaces. The password cannot be a single digit, it cannot contain a ? or a tab, and it cannot begin or end with a space.";
//xmen2 error message - 040307
var re_xSetup_ErrMsg70 = "Error:\n\nEnter a read-ony password. The password can be up to 25 alphanumeric characters and can start with a number, is case sensitive, and allows embedded spaces. It cannot contain a ? or a tab.";
var re_xSetup_ErrMsg71 = "Error:\n\nThe read-only password cannot have spaces at the beginning or end.";
var re_xSetup_ErrMsg72 = "Error:\n\nThe read-only password can start with a number, is case sensitive, and allows embedded spaces.\nIt cannot contain a ? or a tab.";
var re_xSetup_ErrMsg73 = "The read-only password cannot contain non-English letters.";
var re_xSetup_ErrMsg74 = "Error:\n\nEnter the same password in the Read-Only Password and Confirm Read-Only Password fields.";
var re_xSetup_ErrMsg75 = "Error:\n\nThe read-only password can be up to 25 alphanumeric characters.";
var re_xSetup_LblRWPwd = "Read-Write Password";
var re_xSetup_LblRWConfPwd = "Confirm Read-Write Password";
var re_xSetup_LblROPwd = "Read-Only Password";
var re_xSetup_LblROConfPwd = "Confirm Read-Only Password";

//Halberd message - 050407
var re_xSetup_ConfMsg13 = "Warning:\n\nThe switch will be configured with this IP address {0}. Express Setup\nwill attempt to connect to this device by using this new IP address. If connectivity\nbetween your PC and the switch is lost, a follow up page explains how to assign\na PC IP address in the same subnetwork as the switch IP address. Then, to manage\nthe switch, use either the Cisco Configuration Assistant or the device manager.";

//New error message for hostname and username and password fields.
var re_xSetup_ErrMsg76 = "Error:\n\nEnter a username. The name can have up to 64 alphanumeric characters.\nIt can contain only A-Z, a-z, 0-9, hyphen, underscore and dot characters.";
var re_xSetup_ErrMsg77 = "Error:\n\nThe password can start with a number, is case sensitive.\nIt can contain only A-Z, a-z, 0-9, hyphen, underscore and dot characters.";
var re_xSetup_ErrMsg78 = "Error:\n\nThe hostname can contain only A-Z, a-z, 0-9, hyphen, underscore and dot characters.";


//stiletto strings - 100507
var re_xSetup_ErrMsg79 = "Error:\n\nThe Management Interface (VLAN ID) and the Primary VLAN ID cannot be the same.";
var re_xSetup_Grp1Tt5 = "Primary VLAN Settings";
var re_xSetup_LblVlan = "VLAN ID";
var re_xSetup_ConfMsg14 = "Warning:\n\nAssigning a new Telnet password overwrites the existing local or TACACS login for Telnet. Do you want to continue?";

//Common to all platforms - 03/18/2008
var re_xSetup_ErrMsg80 = "Error:\n\n {0} is not a valid password. The password for the switch can have up to 63 alphanumeric characters, can start with a number, is case sensitive, and can have embedded spaces. The password cannot be a single digit, it cannot contain a ? or a tab, and it cannot begin or end with a space.";

//xmen2 - 040908
var re_xSetup_ConfMsg15 = "You have chosen not to use the default VLAN 1. After you click Submit, The connection between the switch and your laptop or PC ends. To manage the switch through the device manager, enter the switch IP address from a browser session. Make sure that the switch and your management station are in the same subnetwork.";

//for cip vlan field
var re_xSetup_ErrMsg81 = "Error:\n\nEnter a CIP VLAN ID from 1 to 1001.";
var re_xSetup_ErrMsg82 = "Error:\n\nVLAN {0} is not available. Enter a different CIP VLAN ID.";
var re_xSetup_LblCipVlan = "CIP VLAN";
var re_xSetup_Grp1Tt6 = "CIP VLAN Settings";
var re_xSetup_ErrMsg83 = "Error:\n\nEnter an IP address for the CIP VLAN.";
var re_xSetup_ErrMsg84 = "Error:\n\nThe Management VLAN and CIP VLAN cannot be in the same subnet.";

//for PSIRT
var re_xSetup_ErrMsg85 = "Enter a username. It can have up to 64 alphanumeric characters. The name cannot contain a ?, a space, or a tab.";
var re_xSetup_ErrMsg86 = "The username cannot be the same as the default username.";
var re_xSetup_ErrMsg87 = "Enter a switch password. The switch password can start with a number, is case sensitive,\nand allows embedded spaces. It cannot contain a ? or a tab or a single digit.";
var re_xSetup_ErrMsg88 = "The switch password cannot be the same as the default password.";

//for mtu
var re_xSetup_LblMtu = "MTU";
var re_xSetup_LblMtuJumbo = "Jumbo MTU";
var re_xSetup_LblMtuRouting = "Routing MTU";
var re_xSetup_ErrMsg89 = "Enter a valid MTU size in the range {0} to {1}.";
var re_xSetup_ErrMsg90 = "Enter a valid Jumbo MTU size in the range {0} to {1}.";
var re_xSetup_ErrMsg91 = "Enter a valid Routing MTU size in the range {0} to {1}.";
var re_xSetup_ConfMsg16 = "The changed MTU size will not take effect until the next reload is done. Do you want to continue?";
var re_xSetup_ConfMsg17 = "The changed Jumbo MTU size will not take effect until the next reload is done. Do you want to continue?";

//Added for Surge
var re_xSetup_ErrMsg92 = "Error:\n\nEnter a password. The password for the switch can have up to 25 alphanumeric characters, can start with a number, is case sensitive, and can have embedded spaces. The password cannot be a single digit, it cannot contain a ? or a tab, and it cannot begin or end with a space.";
var re_xSetup_ErrMsg93 = "Error:\n\n {0} is not a valid password. The password for the switch can have up to 25 alphanumeric characters, can start with a number, is case sensitive, and can have embedded spaces. The password cannot be a single digit, it cannot contain a ? or a tab, and it cannot begin or end with a space.";


