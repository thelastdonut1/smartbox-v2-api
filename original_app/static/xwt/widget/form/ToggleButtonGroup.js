/* Copyright (c) 2009, 2010 Cisco Systems, Inc. All rights reserved. */

if (!dojo._hasResource["xwt.widget.form.ToggleButtonGroup"]) {
    dojo._hasResource["xwt.widget.form.ToggleButtonGroup"] = true;
    dojo.provide("xwt.widget.form.ToggleButtonGroup");
    dojo.require("dijit.form.Button");
    dojo.require("dijit._Widget");
    dojo.require("dijit._Templated");
    dojo.require("dijit._Container");
    dojo.require("dojo.html");
    dojo.declare("xwt.widget.form.ToggleButtonGroup", [dijit._Widget, dijit._Templated, dijit._Container], {
        templateString: '<div dojoAttachPoint="containerNode" class="toggleButtonGroup"></div>',
        imageActiveIndex: 0,
        widgetsInTemplate: true,
        alwaysUseString: true,
        ICON_SELECTED_CLASS: "dijitButtonSelected",
        showLabel: true,
        activeButtonWidget: null,
        baseClass: "",
        postMixInProperties: function () {
            this._stripSurroundingTextNodes(this.srcNodeRef);
            this.inherited("postMixInProperties", arguments);
        },
        postCreate: function () {
            dojo.addClass(this.domNode, this.baseClass);
            this.inherited(arguments);
        },
        startup: function () {
            var _1 = this.getChildren();
            for (var i = 0; i < _1.length; i++) {
                var w = _1[i];
                this._initializeButtonIndex(w, i);
            }
        },
        getActiveButtonWidget: function () {
            return this.activeButtonWidget;
        },
        _initializeButtonIndex: function (_2, _3) {
            var _4 = this.getChildren().length;
            var _5 = _3 == 0;
            var _6 = _3 == _4 - 1;
            var _7 = _3 == this.imageActiveIndex;
            var _8 = _2.domNode;
            if (!_7) {
                dojo.removeClass(_8, this.ICON_SELECTED_CLASS);
            } else {
                dojo.addClass(_8, this.ICON_SELECTED_CLASS);
                this.activeButtonWidget = _2;
            }
            if (this.showLabel == false || this.showLabel == "false") {
                _2.showLabel = false;
            }
            if (_5) {
                var _9 = _2.titleNode.parentNode;
                dojo.addClass(_9, "toggleButtonGroupFirstIcon_rightEdge");
            } else {
                if (_6) {
                    var _a = _2.titleNode;
                    dojo.addClass(_a, "toggleButtonGroupLastIcon_leftEdge");
                    dojo.addClass(_a.parentNode, "toggleButtonGroupLastIcon_rightEdge");
                } else {
                    var _a = _2.titleNode;
                    dojo.addClass(_a, "toggleButtonGroupIcon_leftEdge");
                    dojo.addClass(_a.parentNode, "toggleButtonGroupIcon_rightEdge");
                }
            }
            this.connect(_2, "onClick", dojo.hitch(this, this.handleButtonClickEvent, _2));
            this.connect(_2, "onKeydown", dojo.hitch(this, this.handleButtonClickEvent, _2));
        },
        handleButtonClickEvent: function (_b, _c) {
            if (_b == this.activeButtonWidget) {
            } else {
                var _d = this.getChildren();
                for (var i = 0; i < _d.length; i++) {
                    var w = _d[i];
                    dojo.removeClass(w.domNode, this.ICON_SELECTED_CLASS);
                }
                dojo.addClass(_b.domNode, this.ICON_SELECTED_CLASS);
                this.activeButtonWidget = _b;
                this.onChange(_c);
            }
        },
        reset: function (_e) {
            var _f = this.getChildren();
            for (var i = 0; i < _f.length; i++) {
                var w = _f[i];
                dojo.removeClass(w.domNode, this.ICON_SELECTED_CLASS);
            }
            this.activeButtonWidget = null;
        },
        _stripSurroundingTextNodes: function (_10) {
            if (_10) {
                var _11 = _10.childNodes;
                for (var i = _11.length - 1; i >= 0; i--) {
                    var n = _11[i];
                    if ((n && n.nodeType == 3) || n.nodeType == 4) {
                        this.srcNodeRef.removeChild(n);
                    }
                }
            }
        },
        onChange: function (_12) {},
    });
}
