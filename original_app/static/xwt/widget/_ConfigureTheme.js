/* Copyright (c) 2009, 2010 Cisco Systems, Inc. All rights reserved. */

if (!dojo._hasResource["xwt.widget._ConfigureTheme"]) {
    dojo._hasResource["xwt.widget._ConfigureTheme"] = true;
    dojo.provide("xwt.widget._ConfigureTheme");
    dojo.require("dojo.parser");
    var themeInUse = "";
    (function () {
        var d = dojo,
            _1 = false,
            _2 = null,
            _3 = "reboot2";
        var _4 = ["reboot2"];
        var _5 = ["reboot2-base", "reboot2-xwt", "reboot2-explorer"];
        if (window.location.href.indexOf("?") > -1) {
            var _6 = window.location.href.substr(window.location.href.indexOf("?") + 1).split(/#/);
            var _7 = _6[0].split(/&/);
            for (var i = 0; i < _7.length; i++) {
                var _8 = _7[i].split(/=/),
                    _9 = _8[0];
                var _a = "";
                if (_8.length >= 2) {
                    _a = _8[1].replace(/[^\w]/g, "");
                }
                switch (_9) {
                    case "locale":
                        dojo.config.locale = locale = _a;
                        break;
                    case "dir":
                        document.getElementsByTagName("html")[0].dir = _a;
                        break;
                    case "theme":
                        _1 = _a;
                        break;
                    case "a11y":
                        if (_a) {
                            _2 = "dijit_a11y";
                        }
                }
            }
        }
        if (_1 || _2) {
            var _b = "";
            var _c = dojo.query("head link", dojo.doc.documentElement);
            var _d = null;
            _d = _5;
            for (var m = 0; m < _c.length; m++) {
                var l = _c[m];
                if (l && l.rel == "stylesheet" && l.href) {
                    if (l.href.indexOf("reboot2.css") > 0) {
                        dojo.destroy(l);
                    }
                }
            }
            for (var k = 0; k < _c.length; k++) {
                var _e = _c[k];
                if (_e && _e.rel == "stylesheet") {
                    for (var l = 0; l < _d.length; l++) {
                        if (_e.href && _e.href.indexOf(_d[l] + ".css") > 0) {
                            dojo.destroy(_e);
                        }
                    }
                }
            }
            var _f;
            if (_1) {
                _f = _5;
                for (var i = 0; i < _f.length; i++) {
                    var _10 = d.moduleUrl("xwt.themes", _1 + "/" + _f[i] + ".css");
                    document.write('<link rel="stylesheet" type="text/css" href="' + _10 + '">');
                }
            }
            dojo.parser._xwtOldParse = dojo.parser.parse;
            dojo.parser.parse = function (_11, _12) {
                var b = dojo.body();
                if (_1) {
                    if (!dojo.hasClass(b, _1)) {
                        dojo.removeClass(b, _3);
                        if (!d.hasClass(b, _1)) {
                            d.addClass(b, _1);
                        }
                        var n = d.byId("themeStyles");
                        if (n) {
                            d.destroy(n);
                        }
                    }
                    if (_2) {
                        d.addClass(b, _2);
                    }
                }
                return dojo.parser._xwtOldParse(_11, _12);
            };
            d.addOnLoad(function () {
                themeInUse = _1;
            });
        }
    })();
}
