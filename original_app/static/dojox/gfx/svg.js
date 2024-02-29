/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if (!dojo._hasResource["dojox.gfx.svg"]) {
    dojo._hasResource["dojox.gfx.svg"] = true;
    dojo.provide("dojox.gfx.svg");
    dojo.require("dojox.gfx._base");
    dojo.require("dojox.gfx.shape");
    dojo.require("dojox.gfx.path");
    (function () {
        var d = dojo,
            g = dojox.gfx,
            gs = g.shape,
            _1 = g.svg;
        _1.useSvgWeb = typeof window.svgweb != "undefined";
        function _2(ns, _3) {
            if (dojo.doc.createElementNS) {
                return dojo.doc.createElementNS(ns, _3);
            } else {
                return dojo.doc.createElement(_3);
            }
        }
        function _4(_5) {
            if (_1.useSvgWeb) {
                return dojo.doc.createTextNode(_5, true);
            } else {
                return dojo.doc.createTextNode(_5);
            }
        }
        function _6() {
            if (_1.useSvgWeb) {
                return dojo.doc.createDocumentFragment(true);
            } else {
                return dojo.doc.createDocumentFragment();
            }
        }
        function _7(_8, ns, _9, _a) {
            if (_8.setAttributeNS) {
                return _8.setAttributeNS(ns, _9, _a);
            } else {
                return _8.setAttribute(_9, _a);
            }
        }
        _1.xmlns = { xlink: "http://www.w3.org/1999/xlink", svg: "http://www.w3.org/2000/svg" };
        _1.getRef = function (_b) {
            if (!_b || _b == "none") {
                return null;
            }
            if (_b.match(/^url\(#.+\)$/)) {
                return d.byId(_b.slice(5, -1));
            }
            if (_b.match(/^#dojoUnique\d+$/)) {
                return d.byId(_b.slice(1));
            }
            return null;
        };
        _1.dasharray = {
            solid: "none",
            shortdash: [4, 1],
            shortdot: [1, 1],
            shortdashdot: [4, 1, 1, 1],
            shortdashdotdot: [4, 1, 1, 1, 1, 1],
            dot: [1, 3],
            dash: [4, 3],
            longdash: [8, 3],
            dashdot: [4, 3, 1, 3],
            longdashdot: [8, 3, 1, 3],
            longdashdotdot: [8, 3, 1, 3, 1, 3],
        };
        d.declare("dojox.gfx.svg.Shape", gs.Shape, {
            setFill: function (_c) {
                if (!_c) {
                    this.fillStyle = null;
                    this.rawNode.setAttribute("fill", "none");
                    this.rawNode.setAttribute("fill-opacity", 0);
                    return this;
                }
                var f;
                var _d = function (x) {
                    this.setAttribute(x, f[x].toFixed(8));
                };
                if (typeof _c == "object" && "type" in _c) {
                    switch (_c.type) {
                        case "linear":
                            f = g.makeParameters(g.defaultLinearGradient, _c);
                            var _e = this._setFillObject(f, "linearGradient");
                            d.forEach(["x1", "y1", "x2", "y2"], _d, _e);
                            break;
                        case "radial":
                            f = g.makeParameters(g.defaultRadialGradient, _c);
                            var _e = this._setFillObject(f, "radialGradient");
                            d.forEach(["cx", "cy", "r"], _d, _e);
                            break;
                        case "pattern":
                            f = g.makeParameters(g.defaultPattern, _c);
                            var _f = this._setFillObject(f, "pattern");
                            d.forEach(["x", "y", "width", "height"], _d, _f);
                            break;
                    }
                    this.fillStyle = f;
                    return this;
                }
                var f = g.normalizeColor(_c);
                this.fillStyle = f;
                this.rawNode.setAttribute("fill", f.toCss());
                this.rawNode.setAttribute("fill-opacity", f.a);
                this.rawNode.setAttribute("fill-rule", "evenodd");
                return this;
            },
            setStroke: function (_10) {
                var rn = this.rawNode;
                if (!_10) {
                    this.strokeStyle = null;
                    rn.setAttribute("stroke", "none");
                    rn.setAttribute("stroke-opacity", 0);
                    return this;
                }
                if (typeof _10 == "string" || d.isArray(_10) || _10 instanceof d.Color) {
                    _10 = { color: _10 };
                }
                var s = (this.strokeStyle = g.makeParameters(g.defaultStroke, _10));
                s.color = g.normalizeColor(s.color);
                if (s) {
                    rn.setAttribute("stroke", s.color.toCss());
                    rn.setAttribute("stroke-opacity", s.color.a);
                    rn.setAttribute("stroke-width", s.width);
                    rn.setAttribute("stroke-linecap", s.cap);
                    if (typeof s.join == "number") {
                        rn.setAttribute("stroke-linejoin", "miter");
                        rn.setAttribute("stroke-miterlimit", s.join);
                    } else {
                        rn.setAttribute("stroke-linejoin", s.join);
                    }
                    var da = s.style.toLowerCase();
                    if (da in _1.dasharray) {
                        da = _1.dasharray[da];
                    }
                    if (da instanceof Array) {
                        da = d._toArray(da);
                        for (var i = 0; i < da.length; ++i) {
                            da[i] *= s.width;
                        }
                        if (s.cap != "butt") {
                            for (var i = 0; i < da.length; i += 2) {
                                da[i] -= s.width;
                                if (da[i] < 1) {
                                    da[i] = 1;
                                }
                            }
                            for (var i = 1; i < da.length; i += 2) {
                                da[i] += s.width;
                            }
                        }
                        da = da.join(",");
                    }
                    rn.setAttribute("stroke-dasharray", da);
                    rn.setAttribute("dojoGfxStrokeStyle", s.style);
                }
                return this;
            },
            _getParentSurface: function () {
                var _11 = this.parent;
                for (; _11 && !(_11 instanceof g.Surface); _11 = _11.parent) {}
                return _11;
            },
            _setFillObject: function (f, _12) {
                var _13 = _1.xmlns.svg;
                this.fillStyle = f;
                var _14 = this._getParentSurface(),
                    _15 = _14.defNode,
                    _16 = this.rawNode.getAttribute("fill"),
                    ref = _1.getRef(_16);
                if (ref) {
                    _16 = ref;
                    if (_16.tagName.toLowerCase() != _12.toLowerCase()) {
                        var id = _16.id;
                        _16.parentNode.removeChild(_16);
                        _16 = _2(_13, _12);
                        _16.setAttribute("id", id);
                        _15.appendChild(_16);
                    } else {
                        while (_16.childNodes.length) {
                            _16.removeChild(_16.lastChild);
                        }
                    }
                } else {
                    _16 = _2(_13, _12);
                    _16.setAttribute("id", g._base._getUniqueId());
                    _15.appendChild(_16);
                }
                if (_12 == "pattern") {
                    _16.setAttribute("patternUnits", "userSpaceOnUse");
                    var img = _2(_13, "image");
                    img.setAttribute("x", 0);
                    img.setAttribute("y", 0);
                    img.setAttribute("width", f.width.toFixed(8));
                    img.setAttribute("height", f.height.toFixed(8));
                    _7(img, _1.xmlns.xlink, "xlink:href", f.src);
                    _16.appendChild(img);
                } else {
                    _16.setAttribute("gradientUnits", "userSpaceOnUse");
                    for (var i = 0; i < f.colors.length; ++i) {
                        var c = f.colors[i],
                            t = _2(_13, "stop"),
                            cc = (c.color = g.normalizeColor(c.color));
                        t.setAttribute("offset", c.offset.toFixed(8));
                        t.setAttribute("stop-color", cc.toCss());
                        t.setAttribute("stop-opacity", cc.a);
                        _16.appendChild(t);
                    }
                }
                this.rawNode.setAttribute("fill", "url(#" + _16.getAttribute("id") + ")");
                this.rawNode.removeAttribute("fill-opacity");
                this.rawNode.setAttribute("fill-rule", "evenodd");
                return _16;
            },
            _applyTransform: function () {
                var _17 = this.matrix;
                if (_17) {
                    var tm = this.matrix;
                    this.rawNode.setAttribute("transform", "matrix(" + tm.xx.toFixed(8) + "," + tm.yx.toFixed(8) + "," + tm.xy.toFixed(8) + "," + tm.yy.toFixed(8) + "," + tm.dx.toFixed(8) + "," + tm.dy.toFixed(8) + ")");
                } else {
                    this.rawNode.removeAttribute("transform");
                }
                return this;
            },
            setRawNode: function (_18) {
                var r = (this.rawNode = _18);
                if (this.shape.type != "image") {
                    r.setAttribute("fill", "none");
                }
                r.setAttribute("fill-opacity", 0);
                r.setAttribute("stroke", "none");
                r.setAttribute("stroke-opacity", 0);
                r.setAttribute("stroke-width", 1);
                r.setAttribute("stroke-linecap", "butt");
                r.setAttribute("stroke-linejoin", "miter");
                r.setAttribute("stroke-miterlimit", 4);
            },
            setShape: function (_19) {
                this.shape = g.makeParameters(this.shape, _19);
                for (var i in this.shape) {
                    if (i != "type") {
                        this.rawNode.setAttribute(i, this.shape[i]);
                    }
                }
                this.bbox = null;
                return this;
            },
            _moveToFront: function () {
                this.rawNode.parentNode.appendChild(this.rawNode);
                return this;
            },
            _moveToBack: function () {
                this.rawNode.parentNode.insertBefore(this.rawNode, this.rawNode.parentNode.firstChild);
                return this;
            },
        });
        dojo.declare("dojox.gfx.svg.Group", _1.Shape, {
            constructor: function () {
                gs.Container._init.call(this);
            },
            setRawNode: function (_1a) {
                this.rawNode = _1a;
            },
        });
        _1.Group.nodeType = "g";
        dojo.declare("dojox.gfx.svg.Rect", [_1.Shape, gs.Rect], {
            setShape: function (_1b) {
                this.shape = g.makeParameters(this.shape, _1b);
                this.bbox = null;
                for (var i in this.shape) {
                    if (i != "type" && i != "r") {
                        this.rawNode.setAttribute(i, this.shape[i]);
                    }
                }
                if (this.shape.r) {
                    this.rawNode.setAttribute("ry", this.shape.r);
                    this.rawNode.setAttribute("rx", this.shape.r);
                }
                return this;
            },
        });
        _1.Rect.nodeType = "rect";
        dojo.declare("dojox.gfx.svg.Ellipse", [_1.Shape, gs.Ellipse], {});
        _1.Ellipse.nodeType = "ellipse";
        dojo.declare("dojox.gfx.svg.Circle", [_1.Shape, gs.Circle], {});
        _1.Circle.nodeType = "circle";
        dojo.declare("dojox.gfx.svg.Line", [_1.Shape, gs.Line], {});
        _1.Line.nodeType = "line";
        dojo.declare("dojox.gfx.svg.Polyline", [_1.Shape, gs.Polyline], {
            setShape: function (_1c, _1d) {
                if (_1c && _1c instanceof Array) {
                    this.shape = g.makeParameters(this.shape, { points: _1c });
                    if (_1d && this.shape.points.length) {
                        this.shape.points.push(this.shape.points[0]);
                    }
                } else {
                    this.shape = g.makeParameters(this.shape, _1c);
                }
                this.bbox = null;
                this._normalizePoints();
                var _1e = [],
                    p = this.shape.points;
                for (var i = 0; i < p.length; ++i) {
                    _1e.push(p[i].x.toFixed(8), p[i].y.toFixed(8));
                }
                this.rawNode.setAttribute("points", _1e.join(" "));
                return this;
            },
        });
        _1.Polyline.nodeType = "polyline";
        dojo.declare("dojox.gfx.svg.Image", [_1.Shape, gs.Image], {
            setShape: function (_1f) {
                this.shape = g.makeParameters(this.shape, _1f);
                this.bbox = null;
                var _20 = this.rawNode;
                for (var i in this.shape) {
                    if (i != "type" && i != "src") {
                        _20.setAttribute(i, this.shape[i]);
                    }
                }
                _20.setAttribute("preserveAspectRatio", "none");
                _7(_20, _1.xmlns.xlink, "xlink:href", this.shape.src);
                return this;
            },
        });
        _1.Image.nodeType = "image";
        dojo.declare("dojox.gfx.svg.Text", [_1.Shape, gs.Text], {
            setShape: function (_21) {
                this.shape = g.makeParameters(this.shape, _21);
                this.bbox = null;
                var r = this.rawNode,
                    s = this.shape;
                r.setAttribute("x", s.x);
                r.setAttribute("y", s.y);
                r.setAttribute("text-anchor", s.align);
                r.setAttribute("text-decoration", s.decoration);
                r.setAttribute("rotate", s.rotated ? 90 : 0);
                r.setAttribute("kerning", s.kerning ? "auto" : 0);
                r.setAttribute("text-rendering", "optimizeLegibility");
                if (r.firstChild) {
                    r.firstChild.nodeValue = s.text;
                } else {
                    r.appendChild(_4(s.text));
                }
                return this;
            },
            getTextWidth: function () {
                var _22 = this.rawNode,
                    _23 = _22.parentNode,
                    _24 = _22.cloneNode(true);
                _24.style.visibility = "hidden";
                var _25 = 0,
                    _26 = _24.firstChild.nodeValue;
                _23.appendChild(_24);
                if (_26 != "") {
                    while (!_25) {
                        if (_24.getBBox) {
                            _25 = parseInt(_24.getBBox().width);
                        } else {
                            _25 = 68;
                        }
                    }
                }
                _23.removeChild(_24);
                return _25;
            },
        });
        _1.Text.nodeType = "text";
        dojo.declare("dojox.gfx.svg.Path", [_1.Shape, g.path.Path], {
            _updateWithSegment: function (_27) {
                this.inherited(arguments);
                if (typeof this.shape.path == "string") {
                    this.rawNode.setAttribute("d", this.shape.path);
                }
            },
            setShape: function (_28) {
                this.inherited(arguments);
                if (this.shape.path) {
                    this.rawNode.setAttribute("d", this.shape.path);
                } else {
                    this.rawNode.removeAttribute("d");
                }
                return this;
            },
        });
        _1.Path.nodeType = "path";
        dojo.declare("dojox.gfx.svg.TextPath", [_1.Shape, g.path.TextPath], {
            _updateWithSegment: function (_29) {
                this.inherited(arguments);
                this._setTextPath();
            },
            setShape: function (_2a) {
                this.inherited(arguments);
                this._setTextPath();
                return this;
            },
            _setTextPath: function () {
                if (typeof this.shape.path != "string") {
                    return;
                }
                var r = this.rawNode;
                if (!r.firstChild) {
                    var tp = _2(_1.xmlns.svg, "textPath"),
                        tx = _4("");
                    tp.appendChild(tx);
                    r.appendChild(tp);
                }
                var ref = r.firstChild.getAttributeNS(_1.xmlns.xlink, "href"),
                    _2b = ref && _1.getRef(ref);
                if (!_2b) {
                    var _2c = this._getParentSurface();
                    if (_2c) {
                        var _2d = _2c.defNode;
                        _2b = _2(_1.xmlns.svg, "path");
                        var id = g._base._getUniqueId();
                        _2b.setAttribute("id", id);
                        _2d.appendChild(_2b);
                        _7(r.firstChild, _1.xmlns.xlink, "xlink:href", "#" + id);
                    }
                }
                if (_2b) {
                    _2b.setAttribute("d", this.shape.path);
                }
            },
            _setText: function () {
                var r = this.rawNode;
                if (!r.firstChild) {
                    var tp = _2(_1.xmlns.svg, "textPath"),
                        tx = _4("");
                    tp.appendChild(tx);
                    r.appendChild(tp);
                }
                r = r.firstChild;
                var t = this.text;
                r.setAttribute("alignment-baseline", "middle");
                switch (t.align) {
                    case "middle":
                        r.setAttribute("text-anchor", "middle");
                        r.setAttribute("startOffset", "50%");
                        break;
                    case "end":
                        r.setAttribute("text-anchor", "end");
                        r.setAttribute("startOffset", "100%");
                        break;
                    default:
                        r.setAttribute("text-anchor", "start");
                        r.setAttribute("startOffset", "0%");
                        break;
                }
                r.setAttribute("baseline-shift", "0.5ex");
                r.setAttribute("text-decoration", t.decoration);
                r.setAttribute("rotate", t.rotated ? 90 : 0);
                r.setAttribute("kerning", t.kerning ? "auto" : 0);
                r.firstChild.data = t.text;
            },
        });
        _1.TextPath.nodeType = "text";
        dojo.declare("dojox.gfx.svg.Surface", gs.Surface, {
            constructor: function () {
                gs.Container._init.call(this);
            },
            destroy: function () {
                this.defNode = null;
                this.inherited(arguments);
            },
            setDimensions: function (_2e, _2f) {
                if (!this.rawNode) {
                    return this;
                }
                this.rawNode.setAttribute("width", _2e);
                this.rawNode.setAttribute("height", _2f);
                return this;
            },
            getDimensions: function () {
                var t = this.rawNode ? { width: g.normalizedLength(this.rawNode.getAttribute("width")), height: g.normalizedLength(this.rawNode.getAttribute("height")) } : null;
                return t;
            },
        });
        _1.createSurface = function (_30, _31, _32) {
            var s = new _1.Surface();
            s.rawNode = _2(_1.xmlns.svg, "svg");
            s.rawNode.setAttribute("overflow", "hidden");
            if (_31) {
                s.rawNode.setAttribute("width", _31);
            }
            if (_32) {
                s.rawNode.setAttribute("height", _32);
            }
            var _33 = _2(_1.xmlns.svg, "defs");
            s.rawNode.appendChild(_33);
            s.defNode = _33;
            s._parent = d.byId(_30);
            s._parent.appendChild(s.rawNode);
            return s;
        };
        var _34 = {
            _setFont: function () {
                var f = this.fontStyle;
                this.rawNode.setAttribute("font-style", f.style);
                this.rawNode.setAttribute("font-variant", f.variant);
                this.rawNode.setAttribute("font-weight", f.weight);
                this.rawNode.setAttribute("font-size", f.size);
                this.rawNode.setAttribute("font-family", f.family);
            },
        };
        var C = gs.Container,
            _35 = {
                openBatch: function () {
                    this.fragment = _6();
                },
                closeBatch: function () {
                    if (this.fragment) {
                        this.rawNode.appendChild(this.fragment);
                        delete this.fragment;
                    }
                },
                add: function (_36) {
                    if (this != _36.getParent()) {
                        if (this.fragment) {
                            this.fragment.appendChild(_36.rawNode);
                        } else {
                            this.rawNode.appendChild(_36.rawNode);
                        }
                        C.add.apply(this, arguments);
                    }
                    return this;
                },
                remove: function (_37, _38) {
                    if (this == _37.getParent()) {
                        if (this.rawNode == _37.rawNode.parentNode) {
                            this.rawNode.removeChild(_37.rawNode);
                        }
                        if (this.fragment && this.fragment == _37.rawNode.parentNode) {
                            this.fragment.removeChild(_37.rawNode);
                        }
                        C.remove.apply(this, arguments);
                    }
                    return this;
                },
                clear: function () {
                    var r = this.rawNode;
                    while (r.lastChild) {
                        r.removeChild(r.lastChild);
                    }
                    var _39 = this.defNode;
                    if (_39) {
                        while (_39.lastChild) {
                            _39.removeChild(_39.lastChild);
                        }
                        r.appendChild(_39);
                    }
                    return C.clear.apply(this, arguments);
                },
                _moveChildToFront: C._moveChildToFront,
                _moveChildToBack: C._moveChildToBack,
            };
        var _3a = {
            createObject: function (_3b, _3c) {
                if (!this.rawNode) {
                    return null;
                }
                var _3d = new _3b(),
                    _3e = _2(_1.xmlns.svg, _3b.nodeType);
                _3d.setRawNode(_3e);
                _3d.setShape(_3c);
                this.add(_3d);
                return _3d;
            },
        };
        d.extend(_1.Text, _34);
        d.extend(_1.TextPath, _34);
        d.extend(_1.Group, _35);
        d.extend(_1.Group, gs.Creator);
        d.extend(_1.Group, _3a);
        d.extend(_1.Surface, _35);
        d.extend(_1.Surface, gs.Creator);
        d.extend(_1.Surface, _3a);
        if (_1.useSvgWeb) {
            _1.createSurface = function (_3f, _40, _41) {
                var s = new _1.Surface();
                if (!_40 || !_41) {
                    var pos = d.position(_3f);
                    _40 = _40 || pos.w;
                    _41 = _41 || pos.h;
                }
                _3f = d.byId(_3f);
                var id = _3f.id ? _3f.id + "_svgweb" : g._base._getUniqueId();
                var _42 = _2(_1.xmlns.svg, "svg");
                _42.id = id;
                _42.setAttribute("width", _40);
                _42.setAttribute("height", _41);
                svgweb.appendChild(_42, _3f);
                _42.addEventListener(
                    "SVGLoad",
                    function () {
                        s.rawNode = this;
                        s.isLoaded = true;
                        var _43 = _2(_1.xmlns.svg, "defs");
                        s.rawNode.appendChild(_43);
                        s.defNode = _43;
                        if (s.onLoad) {
                            s.onLoad(s);
                        }
                    },
                    false
                );
                s.isLoaded = false;
                return s;
            };
            _1.Surface.extend({
                destroy: function () {
                    var _44 = this.rawNode;
                    svgweb.removeChild(_44, _44.parentNode);
                },
            });
            var _45 = {
                connect: function (_46, _47, _48) {
                    if (_46.substring(0, 2) === "on") {
                        _46 = _46.substring(2);
                    }
                    if (arguments.length == 2) {
                        _48 = _47;
                    } else {
                        _48 = d.hitch(_47, _48);
                    }
                    this.getEventSource().addEventListener(_46, _48, false);
                    return [this, _46, _48];
                },
                disconnect: function (_49) {
                    this.getEventSource().removeEventListener(_49[1], _49[2], false);
                    delete _49[0];
                },
            };
            dojo.extend(_1.Shape, _45);
            dojo.extend(_1.Surface, _45);
        }
        if (g.loadAndSwitch === "svg") {
            g.switchTo("svg");
            delete g.loadAndSwitch;
        }
    })();
}
