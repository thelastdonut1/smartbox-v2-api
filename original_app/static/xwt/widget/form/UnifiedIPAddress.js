/* Copyright (c) 2009, 2010 Cisco Systems, Inc. All rights reserved. */

if (!dojo._hasResource["xwt.widget.form.UnifiedIPAddress"]) {
    dojo._hasResource["xwt.widget.form.UnifiedIPAddress"] = true;
    dojo.provide("xwt.widget.form.UnifiedIPAddress");
    dojo.require("xwt.widget.form.IPv4TextBox");
    dojo.require("xwt.widget.form.IPv6Address");
    dojo.require("dijit.form.ValidationTextBox");
    dojo.require("xwt.widget.notification.ValidationTextBox");
    dojo.require("xwt.widget.form._BaseIPInputWidget");
    dojo.require("xwt.widget.i18nMixin");
    dojo.require("dojo.i18n");
    dojo.declare("xwt.widget.form._Mask", [xwt.widget.form._BaseIPInputWidget], {
        i18nPackageName: "",
        i18nBundleName: "",
        messages: null,
        invalidMessage: "",
        xwtIPv6: null,
        xwtIPv4: null,
        ipAddressType: 0,
        _messages: null,
        debug: false,
        required: false,
        intermediateChanges: true,
        _format: "",
        postMixInProperties: function () {
            var _1 = new xwt.widget.i18nMixin();
            if (this.i18nPackageName && this.i18nBundleName) {
                _1.addBundle(this.i18nPackageName, this.i18nBundleName);
                this._messages = dojo.mixin(this._messages, _1._messages);
                this._useI18 = true;
            } else {
                this._useI18 = false;
            }
            this.inherited(arguments);
        },
        _geti18NMessage: function (_2) {
            if (this._messages) {
                this.invalidMessage = this._messages[_2];
            }
        },
        postCreate: function () {
            this.inherited(arguments);
            this._geti18NMessage("uip_invalid_mask");
            this.xwtIPv4 = new xwt.widget.form.IPv4TextBox();
            this.xwtIPv6 = new xwt.widget.form.IPv6Address({ i18nPackageName: "xwt", i18nBundleName: "XMPProperties" });
        },
        isValid: function (_3) {
            var _4 = this.getValue();
            _4 = _4.replace(/^\s*/, "").replace(/\s*$/, "");
            if (_4 == "") {
                if (this.required) {
                    this._geti18NMessage("uip_mandatory_mask");
                    if (this.debug) {
                    }
                    return false;
                } else {
                    return true;
                }
            }
            if (this.debug) {
            }
            if (this.ipAddressType == 0) {
                this._geti18NMessage("uip_validip_for_mask");
            } else {
                if (this.ipAddressType == 4) {
                    var c = this.checkIP(_4, 32);
                    if (_3) {
                        return c;
                    } else {
                        if (c) {
                            if (!this.isInteger(_4)) {
                                c = this.validateNetMask(_4);
                            } else {
                                if (this._format === "dotteddecimal") {
                                    this._geti18NMessage("uip_dotteddecimalipv4_mask");
                                    c = false;
                                } else {
                                    if (_4.valueOf() < 0 || _4.valueOf() > 32) {
                                        this._geti18NMessage("uip_ip4_range_mask");
                                        if (this.debug) {
                                        }
                                        c = false;
                                    }
                                }
                            }
                        }
                    }
                    return c;
                } else {
                    if (this.ipAddressType == 6) {
                        this.maxlength = 3;
                        return this.checkIP(_4, 128);
                    } else {
                        return false;
                    }
                }
            }
        },
        checkIP: function (_5, _6) {
            var _7 = new Number(_5);
            if (!this.isInteger(_5)) {
                if (_6 == 32 && this.xwtIPv4._validateIPv4FormatWithInput(_5) && !(this._format === "prefix")) {
                    return true;
                } else {
                    if (_6 == 32) {
                        if (!this.xwtIPv4._validateIPv4FormatWithInput(_5)) {
                            this._geti18NMessage("uip_NaN_mask");
                        } else {
                            if (this._format === "prefix") {
                                this._geti18NMessage("uip_prefixipv4_mask");
                            }
                        }
                    } else {
                        this._geti18NMessage("uip_ip6_range_mask");
                    }
                    if (this.debug) {
                    }
                    return false;
                }
            } else {
                if (_6 == 32) {
                    if (_5.length > 3 || _7 > 255) {
                        this._geti18NMessage("uip_wrongipv4_mask");
                        return false;
                    }
                } else {
                    if (_6 == 128 && (_7.valueOf() < 0 || _7.valueOf() > _6 || _5.length > 3)) {
                        this._geti18NMessage("uip_wrongipv6_mask");
                        if (this.debug) {
                        }
                        return false;
                    }
                }
            }
            return true;
        },
        _supressLeadingZeros: function (_8) {
            if (this.state !== "Error") {
                var _9 = "";
                if (_8.indexOf(".") < 0) {
                    return parseInt(_8, 10);
                }
                var m = _8.split(".");
                var i;
                for (i = 0; i <= 3; i++) {
                    m[i] = parseInt(m[i], 10);
                    if (i === 3) {
                        _9 += m[i];
                    } else {
                        _9 += m[i] + ".";
                    }
                }
                return _9;
            }
        },
        validateNetMask: function (_a) {
            var _b = true;
            var _c = { 128: 1, 192: 1, 224: 1, 240: 1, 248: 1, 252: 1, 254: 1, 255: 1, 0: 1 };
            if (_a.indexOf(".") < 0) {
                return true;
            }
            var m = _a.split(".");
            var i;
            for (i = 0; i <= 3; i++) {
                m[i] = parseInt(m[i], 10);
                if (!(_c && _c.hasOwnProperty(m[i]))) {
                    this._geti18NMessage("uip_ddrange_mask");
                    if (this.debug) {
                    }
                    _b = false;
                    break;
                }
            }
            if ((m[0] == 0 && m[1] != 0 && m[2] != 0 && m[3] != 0) || (m[0] != 255 && m[1] != 0) || (m[1] != 255 && m[2] != 0) || (m[2] != 255 && m[3] != 0)) {
                this._geti18NMessage("uip_ddrange_mask2");
                _b = false;
                if (this.debug) {
                }
            }
            return _b;
        },
        setValue: function (_d) {
            this.attr("value", _d);
        },
        getValue: function () {
            return this.attr("value");
        },
        disable: function () {
            this.attr("disabled", true);
        },
        enable: function () {
            this.attr("disabled", false);
        },
        destroy: function () {
            if (this.xwtIPv4) {
                this.xwtIPv4.destroy();
            }
            if (this.xwtIPv6) {
                this.xwtIPv6.destroy();
            }
            this.inherited(arguments);
        },
    });
    dojo.declare("xwt.widget.form._IPAddress", [dijit.form.ValidationTextBox], {
        i18nPackageName: "",
        i18nBundleName: "",
        messages: null,
        xwtIPv6: null,
        xwtIPv4: null,
        addressType: 0,
        required: false,
        debug: false,
        acceptZeros: true,
        isV4: false,
        isV6: false,
        supressZeros: false,
        _ipv4only: false,
        _ipv6only: false,
        invalidMessage: "",
        _messages: null,
        intermediateChanges: true,
        postMixInProperties: function () {
            var _e = new xwt.widget.i18nMixin();
            if (this.i18nBundleName === "") {
                this.i18nBundleName = "XMPProperties";
            }
            if (this.i18nPackageName === "") {
                this.i18nPackageName = "xwt";
            }
            if (this.i18nPackageName && this.i18nBundleName) {
                _e.addBundle(this.i18nPackageName, this.i18nBundleName);
                this._messages = dojo.mixin(this._messages, _e._messages);
                this._useI18 = true;
            } else {
                this._useI18 = false;
            }
            this.inherited(arguments);
        },
        _geti18NMessage: function (_f) {
            if (this._messages) {
                this.invalidMessage = this._messages[_f];
            }
        },
        postCreate: function () {
            this.xwtIPv4 = new xwt.widget.form.IPv4TextBox();
            this.xwtIPv6 = new xwt.widget.form.IPv6Address({ i18nPackageName: "xwt", i18nBundleName: "XMPProperties" });
            this.inherited(arguments);
            this._geti18NMessage("uip_gen_ip");
        },
        isValid: function (_10) {
            var _11 = this.getValue();
            _11 = _11.replace(/^\s*/, "").replace(/\s*$/, "");
            if (_11 == "") {
                this.addressType = 0;
                if (this.required) {
                    this._geti18NMessage("uip_mandatory_ip");
                    if (this.debug) {
                    }
                    return false;
                } else {
                    if (this.debug) {
                    }
                    return true;
                }
            }
            if (!this.xwtIPv4) {
                return true;
            }
            if (!this._ipv6only) {
                this.xwtIPv4.textbox.value = _11;
            }
            if (!this._ipv4only) {
                this.xwtIPv6.textbox.value = _11;
            }
            var v4 = false;
            var v6 = false;
            if (!this._ipv6only) {
                v4 = this.xwtIPv4.isValid(_10) && this.validZeros(this.xwtIPv4.textbox.value, 4, _10);
            }
            if (!this._ipv4only) {
                v6 = this.xwtIPv6.isValid(_10) && this.validZeros(this.xwtIPv6.textbox.value, 6, _10);
            }
            if (v4 && !v6) {
                this.invalidMessage = this.xwtIPv4.invalidMessage;
            } else {
                if (v6 && !v4) {
                    this.invalidMessage = this.xwtIPv6.invalidMessage;
                } else {
                    if (!v4 && !v6) {
                        var _12 = " ";
                        if (this.xwtIPv4.invalidMessage.length > 0) {
                            _12 = "<br>";
                        }
                        if (_11.indexOf(":") >= 0) {
                            if (_11.indexOf(".") >= 0 && _11.indexOf(".") < _11.indexOf(":")) {
                                this.invalidMessage = this.xwtIPv4.invalidMessage;
                            } else {
                                this.invalidMessage = this.xwtIPv6.invalidMessage;
                            }
                        } else {
                            if (_11.indexOf(".") >= 0) {
                                var _13 = _11.split(".");
                                if (_13.length - 1 < 2 && (isNaN(_13[0]) || _13[0] == "" || _13[0] > 255)) {
                                    this.invalidMessage = this.xwtIPv4.invalidMessage + _12 + this.xwtIPv6.invalidMessage;
                                } else {
                                    this.invalidMessage = this.xwtIPv4.invalidMessage;
                                }
                            } else {
                                this.invalidMessage = this.xwtIPv4.invalidMessage + _12 + this.xwtIPv6.invalidMessage;
                            }
                        }
                        if (!this.invalidMessage || this.invalidMessage == "") {
                            this.invalidMessage = this.xwtIPv4.invalidMessage + _12 + this.xwtIPv6.invalidMessage;
                        }
                    }
                }
            }
            if (v4) {
                this.addressType = 4;
            } else {
                if (v6) {
                    this.addressType = 6;
                } else {
                    this.addressType = 0;
                }
            }
            if (this.debug) {
            }
            return v4 || v6;
        },
        isInteger: function (num) {
            return num.toString().search(/^-?[0-9]+$/) == 0;
        },
        validZeros: function (_14, _15, _16) {
            if (!this.acceptZeros && !_16) {
                if (_15 == 4) {
                    return _14 != "0.0.0.0";
                } else {
                    if (_15 == 6) {
                        var re = new RegExp("^(0|:)+$", "i");
                        return !re.test(_14);
                    }
                }
            }
            return true;
        },
        _supressLeadingIpv4Zeros: function (_17) {
            var _18;
            var _19 = _17.split(".");
            if (_19.length > 1) {
                var _1a;
                for (_1a = 0; _1a < _19.length; _1a++) {
                    var _1b = _19[_1a];
                    _1b = _1b.replace(/^[0]+/g, "");
                    if (_1b === "") {
                        _1b = "0";
                    }
                    if (_1a == 0) {
                        _18 = _1b + ".";
                    } else {
                        if (_1a == 3) {
                            _18 = _18 + _1b;
                        } else {
                            _18 = _18 + _1b + ".";
                        }
                    }
                }
            }
            return _18;
        },
        _supressLeadingIpZeros: function (_1c) {
            var _1d = _1c;
            if (this.addressType == 4) {
                _1d = this._supressLeadingIpv4Zeros(_1c);
            } else {
                if (this.addressType == 6) {
                    _1d = "";
                    if (_1c.indexOf(".") > 0) {
                        var _1e = _1c.lastIndexOf(":");
                        var _1f = _1c.slice(0, _1e + 1);
                        var _20 = _1c.slice(_1e + 1, _1c.length);
                        _20 = this._supressLeadingIpv4Zeros(_20);
                        _1c = _1f + _20;
                    }
                    var _21 = false;
                    var _22 = false;
                    if (_1c.indexOf("::") >= 0) {
                        _21 = true;
                    }
                    var _23 = _1c.split(":");
                    if (_23.length > 1) {
                        var _24;
                        for (_24 = 0; _24 < _23.length; _24++) {
                            var _25 = _23[_24];
                            if (parseInt(_25, 10) === 0) {
                                _25 = "0";
                                if (!_21) {
                                    if (parseInt(_23[_24 + 1], 10) === 0) {
                                        _22 = true;
                                        _25 = _25.replace(/^[0]+/g, "");
                                        continue;
                                    } else {
                                        if (_22) {
                                            _25 = _25.replace(/^[0]+/g, ":");
                                        }
                                    }
                                }
                            }
                            if (_24 == 0) {
                                _1d = _25 + ":";
                            } else {
                                if (_24 == _23.length - 1) {
                                    _1d = _1d + _25;
                                } else {
                                    _1d = _1d + _25 + ":";
                                }
                            }
                            if (_1d.indexOf("::") >= 0) {
                                _21 = true;
                            }
                            if (_1d.indexOf(":::") >= 0) {
                                _1d = _1d.replace(":::", "::");
                            }
                        }
                    }
                }
            }
            return _1d;
        },
        convertCannonicalUppercase: function (_26) {
            if (this.addressType == 6) {
                return _26.toUpperCase();
            } else {
                return _26;
            }
        },
        getAddressType: function () {
            return this.addressType;
        },
        setValue: function (_27) {
            this.attr("value", _27);
        },
        getValue: function () {
            return this.attr("value");
        },
        disable: function () {
            this.attr("disabled", true);
        },
        enable: function () {
            this.attr("disabled", false);
        },
        destroy: function () {
            if (this.xwtIPv4) {
                this.xwtIPv4.destroy();
            }
            if (this.xwtIPv6) {
                this.xwtIPv6.destroy();
            }
            this.inherited(arguments);
        },
        lastLineForIE7: null,
    });
    dojo.declare("xwt.widget.form.UnifiedIPAddress", [dijit._Widget, dijit._Templated], {
        ipaddress: null,
        mask: null,
        debug: false,
        requireIP: false,
        requireMask: false,
        hintLabel: "",
        showHint: false,
        hint: null,
        supressZeros: false,
        noMask: false,
        ipValue: "",
        maskValue: "",
        ipWidth: "",
        maskWidth: "",
        value: "",
        i18nPackageName: "",
        i18nBundleName: "",
        _messages: null,
        iPv4Only: false,
        iPv6Only: false,
        disabled: false,
        readOnly: false,
        tabIndex: "0",
        maskFormat: "",
        templateString:
            '<div class = "xwtUnifiedIP" dojoAttachPoint ="ipContainerNode">\n    <div class="xwtIpdivalignment">\n                    <div  class="xwtIP" dojoAttachPoint="ipAddressNode">\n                  </div>\n    </div>\n    <div class="xwtSlash" dojoAttachPoint="slashNode">\n        /\n    </div>\n\t <div class="xwtMask" dojoAttachPoint="maskNode"></div>\t \n\t <div class="xwtUnifiedErrorIconNodeHide" dojoAttachPoint="errorIconNode"> </div>\t\n     <div class="xwtIPHint" dojoAttachPoint="hintNode"> </div>\n  </div>\n \n',
        invalidMessage: "",
        postCreate: function () {
            this.inherited(arguments);
        },
        _geti18NMessage: function (_28) {
            if (this._messages) {
                return this._messages[_28];
            }
        },
        buildRendering: function () {
            this.inherited(arguments);
            var _29 = new xwt.widget.i18nMixin();
            if (this.i18nBundleName === "") {
                this.i18nBundleName = "XMPProperties";
            }
            if (this.i18nPackageName === "") {
                this.i18nPackageName = "xwt";
            }
            if (this.i18nPackageName && this.i18nBundleName) {
                _29.addBundle(this.i18nPackageName, this.i18nBundleName);
                this._messages = dojo.mixin(this._messages, _29._messages);
                this._useI18 = true;
            } else {
                this._useI18 = false;
            }
            this.ipaddress = new xwt.widget.form._IPAddress({ value: this.ipValue }, this.ipAddressNode);
            dojo.addClass(this.ipaddress.domNode, "xwtIP");
            if (!this.noMask) {
                this.mask = new xwt.widget.form._Mask({ value: this.maskValue, i18nPackageName: this.i18nPackageName, i18nBundleName: this.i18nBundleName }, this.maskNode);
                dojo.addClass(this.mask.domNode, "xwtMask");
            } else {
                dojo.style(this.slashNode, "display", "none");
            }
            if (this.showHint) {
                if (this.noMask) {
                    if (this.iPv4Only) {
                        this.hintLabel = this._geti18NMessage("uip_hintIPv4");
                    } else {
                        if (this.iPv6Only) {
                            this.hintLabel = this._geti18NMessage("uip_hintIPv6");
                        } else {
                            this.hintLabel = this._geti18NMessage("uip_hintIP");
                        }
                    }
                } else {
                    if (this.iPv4Only) {
                        this.hintLabel = this._geti18NMessage("uip_hintIPv4") + this._geti18NMessage("uip_hintIPv4Mask");
                    } else {
                        if (this.iPv6Only) {
                            this.hintLabel = this._geti18NMessage("uip_hintIPv6") + this._geti18NMessage("uip_hintIPv6Mask");
                        } else {
                            this.hintLabel = this._geti18NMessage("uip_hintIP") + this._geti18NMessage("uip_hintIPv4Mask");
                        }
                    }
                }
                this.hint = new dijit.form.TextBox({ readOnly: "yes", value: "(" + this.hintLabel + ")" }, this.hintNode);
                dojo.style(this.hint.domNode, "width", this.hintLabel.length * 6 + "px");
                dojo.addClass(this.hint.domNode, "xwtIPHint");
            }
            this._assignParams();
            this._hookEventHandlers();
            this.hookToValidate();
            this.setIPValue(this.ipValue);
            this.setMaskValue(this.maskValue);
            this.setWidth(this.ipWidth, this.maskWidth);
        },
        _onFocus: function (e) {
            dijit.focus(this.ipaddress.focusNode);
            dijit.selectInputText(this.ipaddress.textbox);
        },
        hookToValidate: function () {
            this.connect(this.ipaddress, "validate", function (_2a) {
                this._displayErrorIcon();
            });
            if (!this.noMask) {
                this.connect(this.mask, "validate", function (_2b) {
                    this._displayErrorIcon();
                });
            }
        },
        _getErrorMessage: function () {
            if (this.debug) {
            }
            if (this.ipaddress.state === "Error") {
                if (this.ipaddress.invalidMessage) {
                    this.invalidMessage = this.ipaddress.invalidMessage;
                }
            } else {
                if (!this.noMask && this.mask.state === "Error") {
                    if (this.mask.invalidMessage) {
                        this.invalidMessage = this.mask.invalidMessage;
                    }
                } else {
                    this.invalidMessage = this.ipaddress.invalidMessage + " " + this.mask.invalidMessage;
                }
            }
            return this.invalidMessage;
        },
        _displayErrorIcon: function () {
            if (this.ipaddress.state === "Error" || (!this.noMask && this.mask.state === "Error")) {
                dojo.removeClass(this.errorIconNode, "xwtUnifiedErrorIconNodeHide");
                dojo.addClass(this.errorIconNode, "dijitValidationIcon");
                var _2c = this._getErrorMessage();
                if (!this._errorMOver) {
                    this._errorMOver = dojo.connect(this.errorIconNode, "onmouseover", this, "_showTooltip");
                }
                if (!this._errorMOut) {
                    this._errorMOut = dojo.connect(this.errorIconNode, "onmouseout", this, "_hideTooltip");
                }
            } else {
                dojo.removeClass(this.errorIconNode, "dijitValidationIcon");
                dojo.addClass(this.errorIconNode, "xwtUnifiedErrorIconNodeHide");
            }
        },
        _showTooltip: function () {
            var _2d = this._getErrorMessage();
            dijit.showTooltip(_2d, this.errorIconNode, this.tooltipPosition);
        },
        _hideTooltip: function () {
            dijit.hideTooltip(this.errorIconNode);
        },
        _assignParams: function () {
            this.ipaddress.debug = this.debug;
            if (!(this.iPv4Only && this.iPv6Only)) {
                if (this.iPv4Only) {
                    if (!this.ipWidth) {
                        this.ipWidth = "110px";
                    }
                    if (!this.maskWidth) {
                        this.maskWidth = "100px";
                    }
                } else {
                    if (this.iPv6Only) {
                        if (!this.ipWidth) {
                            this.ipWidth = "240px";
                        }
                        if (!this.maskWidth) {
                            this.maskWidth = "40px";
                        }
                    }
                }
                this.ipaddress._ipv4only = this.iPv4Only;
                this.ipaddress._ipv6only = this.iPv6Only;
                if (!this.noMask) {
                    this.mask._format = this.maskFormat;
                }
            }
            this.ipaddress.required = this.requireIP;
            if (!this.noMask) {
                this.mask.required = this.requireMask;
                if (this.requireMask) {
                    this.ipaddress.required = this.requireMask;
                }
                this.mask.debug = this.debug;
                this.mask.i18nPackageName = this.i18nPackageName;
                this.mask.i18nBundleName = this.i18nBundleName;
            }
            this.ipaddress.supressZeros = this.supressZeros;
        },
        _hookEventHandlers: function () {
            this.connect(this.ipaddress, "onBlur", "updateIpAddressType");
            this.connect(this.ipaddress, "validate", "validateUIP");
            this.connect(this.ipaddress, "onChange", "onChange");
            if (!this.noMask) {
                this.connect(this.mask, "onChange", "onChange");
                this.connect(this.mask, "validate", "validateUIP");
                this.connect(this.mask, "onBlur", "updateMask");
            }
        },
        updateMask: function () {
            var _2e = this.mask._supressLeadingZeros(this.mask.value);
            this.mask.setValue(_2e);
        },
        updateIpAddressType: function () {
            if (!this.noMask) {
                this.mask.ipAddressType = this.ipaddress.getAddressType();
                if (this.mask.value) {
                    this.mask.validate();
                }
            }
            var _2f = this.ipaddress.value;
            if (this.supressZeros) {
                _2f = this.ipaddress._supressLeadingIpZeros(this.ipaddress.value);
            }
            _2f = this.ipaddress.convertCannonicalUppercase(_2f);
            _2f = _2f.replace(/^\s*/, "").replace(/\s*$/, "");
            this.ipaddress.setValue(_2f);
        },
        isInteger: function (num) {
            return num.toString().search(/^-?[0-9]+$/) == 0;
        },
        onChange: function (_30) {},
        validateUIP: function (_31) {},
        isValid: function () {
            var bIP = this.ipaddress.isValid();
            if (!this.noMask) {
                var _32 = this.mask.isValid();
                return bIP && _32;
            } else {
                return bIP;
            }
        },
        getIP: function () {
            return this.ipaddress;
        },
        getMask: function () {
            return this.mask;
        },
        reset: function () {
            this.getIP().reset();
            if (!this.noMask) {
                this.getMask().reset();
            }
        },
        disable: function () {
            this.getIP().attr("disabled", true);
            if (!this.noMask) {
                this.getMask().attr("disabled", true);
            }
        },
        enable: function () {
            this.getIP().attr("disabled", false);
            if (!this.noMask) {
                this.getMask().attr("disabled", false);
            }
        },
        enableReadOnly: function () {
            this.getIP().attr("readOnly", true);
            if (!this.noMask) {
                this.getMask().attr("readOnly", true);
            }
            this.attr("readOnly", true);
        },
        disableReadOnly: function () {
            this.getIP().attr("readOnly", false);
            if (!this.noMask) {
                this.getMask().attr("readOnly", false);
            }
            this.attr("readOnly", false);
        },
        getReadOnly: function () {
            return this.attr("readOnly");
        },
        setReadOnly: function (val) {
            return this.attr("readOnly", val);
        },
        getDisabled: function () {
            return this.attr("disabled");
        },
        setDisabled: function (val) {
            return this.attr("disabled", val);
        },
        _getDisabledAttr: function () {
            return this.attr("disabled");
        },
        _setDisabledAttr: function (val) {
            this.disabled = val ? true : false;
            if (this.disabled) {
                this.disable();
            } else {
                this.enable();
            }
        },
        _setTabIndexAttr: function (_33) {
            this.ipaddress.focusNode.tabIndex = _33;
            if (!this.noMask) {
                this.mask.focusNode.tabIndex = _33;
            }
        },
        getIPValue: function () {
            return this.getIP().getValue();
        },
        setIPValue: function (_34) {
            this.getIP().setValue(_34);
            this.updateIpAddressType();
        },
        getValue: function () {
            if (this.noMask) {
                return this.getIPValue();
            } else {
                return this.getIPValue() + "/" + this.getMaskValue();
            }
        },
        _getValueAttr: function () {
            return this.getValue();
        },
        _setValueAttr: function (_35) {
            this.setValue(_35);
            this.isValid();
        },
        setValue: function (_36) {
            var arr = _36.split("/");
            this.setIPValue(arr[0]);
            if (!this.noMask && arr[1] != null) {
                this.setMaskValue(arr[1]);
            }
        },
        getMaskValue: function () {
            if (!this.noMask) {
                return this.getMask().getValue();
            }
        },
        setMaskValue: function (_37) {
            if (!this.noMask) {
                this.getMask().setValue(_37);
            }
        },
        setWidth: function (_38, _39) {
            dojo.style(this.getIP().domNode, { width: _38 });
            if (!this.noMask) {
                dojo.style(this.getMask().domNode, { width: _39 });
            }
        },
        resize: function (_3a) {
            if (_3a && typeof _3a === "number") {
                _3a = { w: _3a };
            }
            if (!this.showHint && this.noMask && _3a) {
                if (this.ipaddress.resize) {
                    this.ipaddress.resize({ w: _3a.w });
                } else {
                    if (this.debug) {
                    }
                    dojo.style(this.ipaddress.domNode, "width", _3a.w + "px");
                }
            }
        },
        destroy: function () {
            if (this._errorMOver) {
                dojo.disconnect(this._errorMOver);
                delete this._errorMOver;
            }
            if (this._errorMOut) {
                dojo.disconnect(this._errorMOut);
                delete this._errorMOut;
            }
            delete this.errorIconNode;
            if (this.__connections) {
                dojo.forEach(
                    this.__connections,
                    function (c) {
                        dojo.disconnect(c);
                    },
                    this
                );
                delete this.__connections;
            }
            if (this.mask) {
                this.mask.destroy();
            }
            if (this.ipaddress) {
                this.ipaddress.destroy();
            }
            if (this.hint) {
                this.hint.destroy();
            }
            this.inherited(arguments);
        },
    });
}
