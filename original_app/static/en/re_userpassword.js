/*
 *------------------------------------------------------------------
 * users and passwords resource file
 * Copyright (c) 2006, 2013 by cisco Systems, Inc.
 * feature code - usrPwd
 *------------------------------------------------------------------
*/

//Screen 1 - (Main Screen)
var re_usrPwd_Scr1Ttl = "Users";

//Table 1
var re_usrPwd_Scr1TblHeader1 = "Username";
var re_usrPwd_Scr1TblHeader2 = "Password";
var re_usrPwd_Scr1TblHeader3 = "Select";

//Buttons
var re_usrPwd_Btn1 = "Create";
var re_usrPwd_Btn2 = "Modify";
var re_usrPwd_Btn3 = "Delete";

var re_usrPwd_Btn4 = "Confirm Password";

//Screen 2 - (Create Screen)
var re_usrPwd_Scr2Ttl = "Users and Passwords: Create";
var re_usrPwd_Scr2UsrName = "Username";
var re_usrPwd_Scr2Pwd = "Password";
var re_usrPwd_Scr2ConfPwd = "Confirm Password";

//Screen 3 - (Modify Screen)
var re_usrPwd_Scr3Ttl = "Users and Passwords: Modify";
var re_usrPwd_Scr3UsrName = "Username";
var re_usrPwd_Scr3Pwd = "Password";
var re_usrPwd_Scr3ConfPwd = "Confirm Password";

//Error Messages
var re_usrPwd_ErrMsg1 = "Enter a username. It can have up to 64 alphanumeric characters. The name cannot contain a ?, a space, or a tab.";
var re_usrPwd_ErrMsg2 = "A password is assigned to the switch, but not a username. Enter a username.";
var re_usrPwd_ErrMsg3 = "The password can be up to 25 alphanumeric characters.";
var re_usrPwd_ErrMsg4 = "A username is assigned to the switch, but not a password. Enter a password";
var re_usrPwd_ErrMsg5 = "The password can start with a number, is case sensitive, and allows embedded spaces. It cannot contain a ? or a tab.";
var re_usrPwd_ErrMsg6 = "The password cannot have spaces at the beginning or end.";
var re_usrPwd_ErrMsg7 = "Enter the same password in the Password and Confirm Password fields.";
var re_usrPwd_ErrMsg8 = "The specified username already has an associated password. A username can only have one password. Enter a different username.";
var re_usrPwd_ErrMsg9 = "No usernames exist.";
var re_usrPwd_ErrMsg10 = "Select at least one username to delete.";
var re_usrPwd_ErrMsg11 = "Select a username to modify.";
var re_usrPwd_ErrMsg12 = "Select only one username to modify.";

//new strings
var re_usrPwd_ErrMsg13 = "The first character in a username cannot be a double quote ( \" ).";

//additional strings - 03/06/06
var re_usrPwd_ErrMsg14 = "The username cannot contain non-English letters.";
var re_usrPwd_ErrMsg15 = "The password cannot contain non-English letters.";
var re_usrPwd_ErrMsg16 = "Password and Confirm Password don't match";
var re_usrPwd_ErrMsg17 = "Password can't be empty";
