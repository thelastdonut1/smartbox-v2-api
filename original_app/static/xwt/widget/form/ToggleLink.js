/* Copyright (c) 2009, 2010 Cisco Systems, Inc. All rights reserved. */

if (!dojo._hasResource["xwt.widget.form.ToggleLink"]) {
    dojo._hasResource["xwt.widget.form.ToggleLink"] = true;
    dojo.provide("xwt.widget.form.ToggleLink");
    dojo.require("dijit._Widget");
    dojo.require("dijit._Templated");
    dojo.require("dojo.html");
    dojo.declare("xwt.widget.form.ToggleLink", [dijit._Widget, dijit._Templated], {
        templateString: '<div dojoAttachPoint="containerNode"></div>',
        activeLinkIndex: null,
        widgetsInTemplate: false,
        anchorNodesList: null,
        LINK_SELECTED_CLASS: "toggleLinkSelected",
        LINK_UNSELECTED_CLASS: "toggleLinkUnselected",
        LINK_FOCUSED_CLASS: "toggleLinkFocused",
        LINK_DISABLED_CLASS: "toggleLinkDisabled",
        LINK_SEPARATOR_CLASS: "toggleLinkSeparator",
        activeLinkObject: null,
        getActiveLink: function () {
            return this.activeLinkObject;
        },
        constructor: function () {
            this.anchorNodesList = [];
            this.activeLinkIndex = null;
            this.activeLinkObject = null;
        },
        postMixInProperties: function () {
            if (!this.srcNodeRef) {
                return;
            }
            this._stripSurroundingTextNodes(this.srcNodeRef);
            var _1 = dojo.query("A", this.srcNodeRef);
            if (_1) {
                for (var i = 0; i < _1.length; i++) {
                    this.anchorNodesList.push(_1[i]);
                }
            }
            this._buildRendering();
        },
        postCreate: function () {
            dojo.removeClass(this.domNode, "dijitHidden");
            dojo.addClass(this.domNode, "toggleLink");
        },
        _buildRendering: function () {
            for (var i = 0; i < this.anchorNodesList.length; i++) {
                var _2 = this.anchorNodesList[i];
                this._initializeLinkIndex(_2, i);
                if (i < this.anchorNodesList.length - 1) {
                    this._renderLinkSeparatorNode(_2);
                }
            }
        },
        _stripSurroundingTextNodes: function (_3) {
            var _4 = _3.childNodes;
            for (var i = _4.length - 1; i >= 0; i--) {
                var n = _4[i];
                if ((n && n.nodeType == 3) || n.nodeType == 4) {
                    this.srcNodeRef.removeChild(n);
                }
            }
        },
        _renderLinkSeparatorNode: function (_5) {
            var _6 = "|";
            dojo.create("SPAN", { className: this.LINK_SEPARATOR_CLASS, innerHTML: _6 }, _5, "after");
        },
        _initializeLinkIndex: function (_7, _8) {
            var _9 = this.anchorNodesList.length;
            var _a = _8 == 0;
            var _b = _8 == _9 - 1;
            var _c = _8 == this.activeLinkIndex;
            var _d = _7.getAttribute("disabled") && (_7.getAttribute("disabled") == true || _7.getAttribute("disabled") == "true" || _7.getAttribute("disabled") == "disabled");
            if (_d) {
                this.disableLink(_7);
            }
            if (!_c) {
                dojo.addClass(_7, this.LINK_UNSELECTED_CLASS);
            } else {
                dojo.addClass(_7, this.LINK_SELECTED_CLASS);
                this.activeLinkObject = _7;
            }
            if (dojo.isIE) {
                _7.setAttribute("unselectable", "on", 0);
                this.connect(_7, "mouseover", function () {
                    dojo.addClass(_7, "linkHoverState");
                });
                this.connect(_7, "mouseout", function () {
                    dojo.removeClass(_7, "linkHoverState");
                });
            } else {
                _7.style.userSelect = "none";
            }
            this.connect(_7, "click", dojo.hitch(this, this.handleButtonClickEvent, _7));
            this.connect(_7, "focus", dojo.hitch(this, this._handleButtonFocusEvent, _7));
            this.connect(_7, "blur", dojo.hitch(this, this._handleButtonUnfocusEvent, _7));
            this.connect(_7, "keydown", dojo.hitch(this, this.handleKeydownEvent, _7));
        },
        reset: function () {
            for (var i = 0; i < this.anchorNodesList.length; i++) {
                var _e = this.anchorNodesList[i];
                dojo.removeClass(_e, this.LINK_SELECTED_CLASS);
                dojo.addClass(_e, this.LINK_UNSELECTED_CLASS);
            }
            this.activeLinkObject = null;
        },
        disableLink: function (_f) {
            _f.setAttribute("disabled", true);
            dojo.addClass(_f, this.LINK_DISABLED_CLASS);
        },
        enableLink: function (_10) {
            _10.removeAttribute("disabled");
            dojo.removeClass(_10, this.LINK_DISABLED_CLASS);
        },
        _handleButtonFocusEvent: function (_11, _12) {
            dojo.addClass(_11, this.LINK_FOCUSED_CLASS);
        },
        _handleButtonUnfocusEvent: function (_13, _14) {
            dojo.removeClass(_13, this.LINK_FOCUSED_CLASS);
        },
        handleKeydownEvent: function (_15, _16) {
            if (_16.keyCode == 13 || _16.keyCode == 32) {
                this.handleButtonClickEvent(_15, _16);
            }
        },
        handleButtonClickEvent: function (_17, _18) {
            var _19 = _17.getAttribute("disabled") && (_17.getAttribute("disabled") == true || _17.getAttribute("disabled") == "true");
            if (_19) {
                return;
            }
            if (_17 == this.activeLinkObject) {
            } else {
                if (this.activeLinkObject != null) {
                    dojo.removeClass(this.activeLinkObject, this.LINK_SELECTED_CLASS);
                    dojo.addClass(this.activeLinkObject, this.LINK_UNSELECTED_CLASS);
                }
                dojo.addClass(_17, this.LINK_SELECTED_CLASS);
                dojo.removeClass(_17, this.LINK_UNSELECTED_CLASS);
                this.activeLinkObject = _17;
                this.onChange(_18);
            }
        },
        addLink: function (_1a) {
            var _1b = "|";
            var l = dojo.create("A", { className: "toggleLink", innerHTML: _1a.innerHTML, tabindex: _1a.tabindex });
            if (_1a.context) {
                l.setAttribute("context", _1a.context);
            }
            this.anchorNodesList.push(l);
            var idx = this.anchorNodesList.length - 1;
            this._initializeLinkIndex(l, idx);
            this.domNode.appendChild(l);
            if (idx > 0) {
                dojo.create("SPAN", { className: this.LINK_SEPARATOR_CLASS, innerHTML: _1b }, l, "before");
            }
        },
        render: function () {},
        onChange: function (_1c) {},
    });
}
