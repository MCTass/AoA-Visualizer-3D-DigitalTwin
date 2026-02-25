(this["webpackJsonppos-server"] = this["webpackJsonppos-server"] || []).push([
    [0], {
        149: function(e, t, n) {
            "use strict";
            n.r(t);
            var a = n(0),
                o = n.n(a),
                r = n(32),
                l = n.n(r),
                s = (n(93), n(94), n(95), function(e, t) {
                    var n = 1;
                    if (t.length < 1) e.alert(!0, "danger", "No anchors detected, minumum 4 must be installed!");
                    else if (t.length >= 4) {
                        for (var a in t)
                            if (console.log("checkAnchor " + t[a]), null == t[a].config) return e.alert(!0, "warning", "Anchor " + t[a].mac + " is not configured."), -1 - a;
                        e.alert(!0, "success", "Sucessfully detected " + t.length + " anchors", 5e3), n = 0
                    } else e.alert(!0, "danger", "Too few anchors detected, minumum 4 must be installed, only " + t.length + " anchors found!");
                    return n
                }),
                i = {
                    center: {
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    },
                    btn_flat: {
                        backgroundColor: "silver",
                        color: "dimgray"
                    }
                },
                c = n(15),
                u = n(22),
                h = n(23),
                d = n(11),
                g = n(25),
                m = n(24),
                f = (n(96), n(34)),
                p = n(17),
                y = n(159),
                b = n(158),
                v = n(160),
                E = n(44),
                _ = n(155),
                C = n(157),
                w = n(80),
                x = n(156),
                O = n(153),
                j = n(154),
                S = function(e) {
                    return o.a.createElement(w.a, {
                        show: e.show,
                        style: {
                            color: "white",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }
                    }, o.a.createElement(O.a, null, o.a.createElement(j.a, {
                        size: "lg",
                        animation: "grow",
                        variant: "danger",
                        role: "status"
                    })), o.a.createElement(O.a, null, o.a.createElement("span", {
                        style: {
                            padding: 40
                        }
                    }, "Loading ", e.connectionConfig, " anchors...")))
                },
                k = function(e) {
                    Object(g.a)(n, e);
                    var t = Object(m.a)(n);

                    function n(e) {
                        var a;
                        return Object(u.a)(this, n), (a = t.call(this, e)).state = {
                            anchors: [],
                            config: {},
                            loading: !1,
                            floor_plan_size_x: 10,
                            floor_plan_size_y: 10
                        }, a.defaultConfig = {
                            angleMax: 45,
                            angleMin: -45,
                            azimuthAngle: 0,
                            tiltAngle: 0,
                            x: 0,
                            y: 0,
                            z: 1.5
                        }, a.handleInputChange = a.handleInputChange.bind(Object(d.a)(a)), a.onConfigureAnchor = a.onConfigureAnchor.bind(Object(d.a)(a)), a.onRescanPorts = a.onRescanPorts.bind(Object(d.a)(a)), a.handleAnchorIdChange = a.handleAnchorIdChange.bind(Object(d.a)(a)), a.selectAnchorId = o.a.createRef(), a
                    }
                    return Object(h.a)(n, [{
                        key: "componentDidMount",
                        value: function() {
                            var e = this;
                            console.log("AnchorConfig componentDidMount"), this.setState({
                                loading: !0
                            }), fetch("/api/ui", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    ui: "local"
                                })
                            }), fetch("/api/configure").then((function(e) {
                                return e.json()
                            })).then((function(t) {
                                console.log("AnchorConfig componentDidMount anchor config", t);
                                fetch("/api/floorplan_size").then((function(e) {
                                    return e.json()
                                })).then((function(n) {
                                    console.log("AnchorConfig componentDidMount floorplan config ", n), console.log("AnchorConfig componentDidMount floorplan config x: " + n.floor_plan_size_x), console.log("AnchorConfig componentDidMount floorplan config y: " + n.floor_plan_size_y), e.setState({
                                        floor_plan_size_x: n.floor_plan_size_x,
                                        floor_plan_size_y: n.floor_plan_size_y
                                    });
                                    var a = e.defaultConfig,
                                        o = s(e.props, t.anchors),
                                        r = 0;
                                    if (0 === o ? t.anchors.length > r && null !== t.anchors[r].config && (a = t.anchors[r].config) : o > 0 || (r = -o - 1), e.setState({
                                            anchors: t.anchors,
                                            anchorId: t.anchors.length > r ? t.anchors[r].com : "",
                                            config: Object(c.a)(Object(c.a)({}, e.defaultConfig), a),
                                            loading: !1
                                        }), console.log("state", e.state), e.state.anchors.length > 0) {
                                        var l = e.state.anchors[r],
                                            i = l.mac;
                                        console.log("onConfigureAnchor: Next anchor", r, l, i), e.setState({
                                            config: Object(c.a)(Object(c.a)({}, e.defaultConfig), l.config),
                                            anchorId: i
                                        }), e.selectAnchorId.current.value = i
                                    }
                                }))
                            })).catch((function(t) {
                                console.log(t), e.setState({
                                    loading: !1
                                }), e.props.alert(!0, "danger", "Failed listing connected anchors, please refresh site or restart the server")
                            }))
                        }
                    }, {
                        key: "onRescanPorts",
                        value: function(e) {
                            var t = this;
                            console.log("rescanPorts"), this.setState({
                                loading: !0
                            }), fetch("/api/rescan").then((function(e) {
                                return e.json()
                            })).then((function(e) {
                                return console.log("rescanPorts ", e), t.setState({
                                    loading: !1
                                }), t.componentDidMount()
                            })).catch((function(e) {
                                t.setState({
                                    loading: !1
                                }), t.props.alert(!0, "danger", "Failed listing connected anchors, please refresh site or restart the server")
                            }))
                        }
                    }, {
                        key: "handleAnchorIdChange",
                        value: function(e) {
                            this.props.alert(!1);
                            var t = e.target.value,
                                n = this.state.anchors.find((function(e) {
                                    return e.mac === t
                                }));
                            console.log("handleAnchorIdChange: anchor changed", n, e.target.name, t), n ? this.setState({
                                config: Object(c.a)(Object(c.a)({}, this.defaultConfig), n.config),
                                anchorId: t
                            }) : console.error("Can't find anchor with id", t)
                        }
                    }, {
                        key: "handleInputChange",
                        value: function(e) {
                            var t = this;
                            this.props.alert(!1);
                            var n = e.target,
                                a = n.name,
                                o = n.valueAsNumber;
                            console.log(o);
                            var r = this.state.anchors,
                                l = this.state.anchors.findIndex((function(e) {
                                    return e.mac === t.state.anchorId
                                }));
                            console.log("handleInputChange: AnchorIndex", l);
                            var s, i = this.state.anchors[l];
                            s = i.config ? Object(c.a)(Object(c.a)({}, i.config), {}, Object(E.a)({}, a, o)) : Object(E.a)({}, a, o), r[l].config = Object(c.a)(Object(c.a)({}, this.defaultConfig), s), this.setState({
                                anchors: r
                            }), console.log(this.state)
                        }
                    }, {
                        key: "onConfigureAnchor",
                        value: function(e) {
                            var t = this;
                            e.preventDefault();
                            var n = this.state.anchors.find((function(e) {
                                return e.mac === t.state.anchorId
                            }));
                            n.config = Object(c.a)(Object(c.a)({}, this.defaultConfig), n.config);
                            var a = this.state.anchors.findIndex((function(e) {
                                return e.mac === t.state.anchorId
                            }));
                            console.log("onConfigureAnchor: AnchorIndex", a), console.log(n), fetch("/api/anchor", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(n)
                            }).then((function(e) {
                                return e.json()
                            })).then((function(e) {
                                if (console.log(e), e.success) {
                                    t.props.alert(!0, "success", "Anchor " + n.mac + " configured successfully");
                                    var o = a + 1;
                                    o >= t.state.anchors.length && (o = 0);
                                    var r = t.state.anchors[o],
                                        l = r.mac;
                                    console.log("onConfigureAnchor: Next anchor", o, r, l), r ? (t.setState({
                                        config: Object(c.a)(Object(c.a)({}, t.defaultConfig), r.config),
                                        anchorId: l
                                    }), t.selectAnchorId.current.value = l) : console.log("No anchor", r, o)
                                } else t.props.alert(!0, "danger", e.message)
                            })).catch((function(e) {
                                t.props.alert(!0, "danger", "Something went wrong"), console.error("Error", e)
                            }))
                        }
                    }, {
                        key: "renderAnchor",
                        value: function(e) {
                            var t, n = this;
                            if (0 === this.state.anchors.length) return null;
                            var a = this.state.anchors.findIndex((function(e) {
                                return e.mac === n.state.anchorId
                            }));
                            if (!(a >= 0)) return null;
                            null === (t = Object(c.a)(Object(c.a)({}, this.defaultConfig), this.state.anchors[a].config)) && (t = this.defaultConfig);
                            var r = this.state.floor_plan_size_x,
                                l = this.state.floor_plan_size_y;
                            return console.log("renderAnchor: AnchorIndex render", a, t), o.a.createElement(_.a, null, o.a.createElement(C.a, {
                                onSubmit: this.onConfigureAnchor
                            }, o.a.createElement(C.a.Group, {
                                controlId: "exampleForm.ControlSelect1"
                            }, o.a.createElement(C.a.Label, null, "Select which anchor to configure"), o.a.createElement(C.a.Control, {
                                as: "select",
                                name: "anchorId",
                                ref: this.selectAnchorId,
                                onChange: this.handleAnchorIdChange
                            }, e.map((function(e) {
                                return o.a.createElement("option", {
                                    key: e.mac
                                }, e.mac)
                            })))), o.a.createElement(C.a.Row, null, o.a.createElement(C.a.Label, null, "Select the location of the anchor within the ", r, " x ", l, " meter area:")), o.a.createElement(C.a.Row, null, o.a.createElement(C.a.Label, null, "X=0 means leftmost edge. X=", r, " means rightmost edge.")), o.a.createElement(C.a.Row, null, o.a.createElement(C.a.Label, null, "Y=0 means bottom edge. Y=", l, " means top edge.")), o.a.createElement(C.a.Row, null, o.a.createElement(C.a.Group, {
                                as: w.a,
                                controlId: "formGridX"
                            }, o.a.createElement(C.a.Label, null, "X"), o.a.createElement(C.a.Control, {
                                name: "x",
                                type: "number",
                                value: t ? t.x : void 0,
                                min: "0",
                                max: r,
                                step: "0.01",
                                onChange: this.handleInputChange,
                                placeholder: "0"
                            })), o.a.createElement(C.a.Group, {
                                as: w.a,
                                controlId: "formGridY"
                            }, o.a.createElement(C.a.Label, null, "Y"), o.a.createElement(C.a.Control, {
                                name: "y",
                                type: "number",
                                value: t ? t.y : void 0,
                                min: "0",
                                max: l,
                                step: "0.01",
                                onChange: this.handleInputChange,
                                placeholder: "0"
                            })), o.a.createElement(C.a.Group, {
                                as: w.a,
                                controlId: "formGridZ"
                            }, o.a.createElement(C.a.Label, null, "Z"), o.a.createElement(C.a.Control, {
                                name: "z",
                                type: "number",
                                value: t ? t.z : void 0,
                                onChange: this.handleInputChange,
                                placeholder: "0"
                            }))), o.a.createElement(C.a.Row, null, o.a.createElement(C.a.Label, null, "Select the direction in which the Anchor's normal is pointing,")), o.a.createElement(C.a.Row, null, o.a.createElement(C.a.Label, null, 'relative to the floorplan, according to the "unit circle":')), o.a.createElement(C.a.Row, null, o.a.createElement(C.a.Label, null, "For the ", o.a.createElement("strong", null, "Azimuth"), ', 0 means "along the x axis" (east on floorplan).')), o.a.createElement(C.a.Row, null, o.a.createElement(C.a.Label, null, '90 means along the y axis ("north"), +/-180 means leftwards.')), o.a.createElement(C.a.Row, null, o.a.createElement(C.a.Label, null, "Finally,-90/+270 means downwards.")), o.a.createElement(C.a.Row, null, o.a.createElement(C.a.Label, null, "For the ", o.a.createElement("strong", null, "Attitude"), ", 0 means parallel to ground.", " ")), o.a.createElement(C.a.Row, null, o.a.createElement(C.a.Label, null, "90 means zenith (upwards), and -90 means nadir (downwards).")), o.a.createElement(C.a.Row, {
                                style: i.center
                            }, o.a.createElement(C.a.Group, {
                                as: w.a,
                                controlId: "formBasicOffsetAngle"
                            }, o.a.createElement(C.a.Label, null, "Azimuth"), o.a.createElement(C.a.Control, {
                                name: "azimuthAngle",
                                type: "number",
                                value: t ? t.azimuthAngle : void 0,
                                onChange: this.handleInputChange,
                                min: "-179",
                                max: "359",
                                placeholder: "0"
                            })), o.a.createElement(C.a.Group, {
                                as: w.a,
                                controlId: "formBasicOffsetAngleV"
                            }, o.a.createElement(C.a.Label, null, "Attitude"), o.a.createElement(C.a.Control, {
                                name: "tiltAngle",
                                type: "number",
                                min: "-90",
                                max: "90",
                                value: t ? t.tiltAngle : 0,
                                onChange: this.handleInputChange,
                                placeholder: "0"
                            }))), o.a.createElement(C.a.Row, {
                                style: i.center
                            }, o.a.createElement(C.a.Label, null, "Anchor angle contraints")), o.a.createElement(C.a.Row, {
                                style: i.center
                            }, o.a.createElement(C.a.Group, {
                                as: w.a,
                                md: "3",
                                controlId: "formGridAngleMin"
                            }, o.a.createElement(C.a.Label, null, "Min angle"), o.a.createElement(C.a.Control, {
                                name: "angleMin",
                                type: "number",
                                value: t ? t.angleMin : void 0,
                                onChange: this.handleInputChange,
                                placeholder: "-90"
                            })), o.a.createElement(C.a.Group, {
                                as: w.a,
                                md: "3",
                                controlId: "formGridAngleMax"
                            }, o.a.createElement(C.a.Label, null, "Max angle"), o.a.createElement(C.a.Control, {
                                name: "angleMax",
                                type: "number",
                                value: t ? t.angleMax : void 0,
                                onChange: this.handleInputChange,
                                placeholder: "90"
                            }))), o.a.createElement(C.a.Row, {
                                style: i.center
                            }, o.a.createElement(C.a.Group, {
                                as: w.a,
                                md: "3",
                                controlId: "formGridConfigureAnchorButton"
                            }, o.a.createElement(x.a, {
                                name: "configureAnchorButton",
                                variant: "secondary",
                                type: "submit"
                            }, "Configure anchor")))), o.a.createElement(C.a, {
                                onSubmit: this.onRescanPorts
                            }, o.a.createElement(C.a.Row, {
                                style: i.center
                            }, o.a.createElement(C.a.Group, {
                                as: w.a,
                                md: "3",
                                controlId: "formGridRescanPortsButton"
                            }, o.a.createElement(x.a, {
                                name: "rescanPortsButton",
                                variant: "secondary",
                                type: "submit"
                            }, "Rescan ports")))))
                        }
                    }, {
                        key: "renderLoading",
                        value: function() {
                            return o.a.createElement("div", {
                                style: {
                                    margin: 10
                                }
                            }, o.a.createElement(S, {
                                connectionConfig: this.props.connectionConfig
                            }))
                        }
                    }, {
                        key: "render",
                        value: function() {
                            return o.a.createElement("div", {
                                style: i.center
                            }, o.a.createElement(w.a, {
                                md: "6",
                                style: {
                                    color: "#EEEEEEEE"
                                }
                            }, this.state.loading ? this.renderLoading() : this.renderAnchor(this.state.anchors)))
                        }
                    }]), n
                }(o.a.Component),
                I = n(47),
                z = (n(151), n(150), function(e) {
                    return o.a.createElement(w.a, {
                        show: e.show,
                        style: {
                            color: "white",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }
                    }, o.a.createElement(O.a, null, o.a.createElement(j.a, {
                        size: "lg",
                        animation: "grow",
                        variant: "danger",
                        role: "status"
                    })), o.a.createElement(O.a, null, o.a.createElement("span", {
                        style: {
                            padding: 40
                        }
                    }, "Saving floorplan...")))
                }),
                A = null,
                P = null,
                T = "primary",
                M = function(e) {
                    var t = Object(a.useContext)(I.a),
                        n = Object(a.useCallback)((function() {
                            t.showFileUpload(), console.log(e)
                        }));
                    return Object(I.d)((function(e) {
                        console.log("useItemStartListener")
                    })), Object(I.c)((function(e) {
                        console.log("useItemFinishListener item ".concat(e)), console.log("useItemFinishListener item ".concat(e.id, " finished uploading, response was: "), e.uploadResponse), console.log("useItemFinishListener item ".concat(e.id, " success: "), e.uploadResponse.data.success), P.setState({
                            loading: !1
                        }), !0 === e.uploadResponse.data.success ? fetch("/api/configure").then((function(e) {
                            return e.json()
                        })).then((function(t) {
                            console.log("useItemFinishListener", t);
                            A.alert(!0, "success", "Image uploaded, approximate room size is " + e.uploadResponse.data.floor_plan_size_x + " x " + e.uploadResponse.data.floor_plan_size_y + " units"), R(A, e.uploadResponse.data.anchors_out_of_range, e.uploadResponse.data.floor_plan_size_x, e.uploadResponse.data.floor_plan_size_y), P.setState({
                                floor_plan_size_x: e.uploadResponse.data.floor_plan_size_x,
                                floor_plan_size_y: e.uploadResponse.data.floor_plan_size_y,
                                image_size_x: e.uploadResponse.data.image_size[0],
                                image_size_y: e.uploadResponse.data.image_size[1],
                                save_configuration_button_variant: "primary"
                            }), T = "secondary"
                        })).catch((function(e) {
                            console.log(e), A.alert(!0, "danger", "Failed listing connected anchors, please refresh site or restart the server")
                        })) : A.alert(!0, "danger", "Image upload failed: " + e.uploadResponse.data.reason)
                    })), o.a.createElement(x.a, {
                        variant: T,
                        onClick: n
                    }, "Upload new floorplan...")
                },
                R = function(e, t, n, a) {
                    if (console.log("checkFloorPlan anchors_out_of_range: " + t), t.length > 0) {
                        for (var o in t) {
                            var r = t[o];
                            console.log("FloorplanConfig Anchor is out of range:" + r.com + " at (" + r.x + ", " + r.y + ")")
                        }
                        e.alert(!0, "warning", t[0].message)
                    }
                },
                D = function(e) {
                    Object(g.a)(n, e);
                    var t = Object(m.a)(n);

                    function n(e) {
                        var a;
                        return Object(u.a)(this, n), (a = t.call(this, e)).state = {
                            anchors: [],
                            config: {},
                            loading: !1,
                            save_configuration_button_variant: "secondary",
                            floor_plan_size_x: -1,
                            floor_plan_size_y: -1,
                            image_size_x: -1,
                            image_size_y: -1,
                            floor_plane_scale_factor: 1
                        }, A = e, P = Object(d.a)(a), a.handleInputChange = a.handleInputChange.bind(Object(d.a)(a)), a.onSaveSettings = a.onSaveSettings.bind(Object(d.a)(a)), a
                    }
                    return Object(h.a)(n, [{
                        key: "handleInputChange",
                        value: function(e) {
                            this.props.alert(!1);
                            var t = e.target,
                                n = t.value,
                                a = t.name,
                                o = this.state.image_size_x,
                                r = o / this.state.image_size_y,
                                l = this.state.floor_plan_size_x,
                                s = this.state.floor_plan_size_y;
                            if (console.log("handleInputChange: name '" + a + "' value ", n), "floor_plan_size_x" === a) {
                                var i = parseFloat(n),
                                    c = i / s / r;
                                (c < .95 || c > 1.05) && (s = Math.round(i / r * 10) / 10), NaN == s && (s = 0), NaN == i && (i = 0), this.setState({
                                    floor_plan_size_x: i,
                                    floor_plan_size_y: s,
                                    floor_plan_scale_factor: o / i
                                })
                            } else if ("floor_plan_size_y" === a) {
                                var u = parseFloat(n),
                                    h = l / u / r;
                                (h < .95 || h > 1.05) && (l = Math.round(u * r * 10) / 10), this.setState({
                                    floor_plan_size_x: l,
                                    floor_plan_size_y: u,
                                    floor_plan_scale_factor: o / l
                                })
                            } else console.log("ERROR: handleInputChange: Invalid name '" + a + "!");
                            console.log(this.state)
                        }
                    }, {
                        key: "componentDidMount",
                        value: function() {
                            var e = this;
                            console.log("FloorplanConfig componentDidMount"), this.props.alert(!1), this.setState({
                                loading: !0
                            }), fetch("/api/floorplan_size").then((function(e) {
                                return e.json()
                            })).then((function(t) {
                                console.log("FloorplanConfig componentDidMount: ", t), R(e.props, t.anchors_out_of_range, t.floor_plan_size_x, t.floor_plan_size_y), e.setState({
                                    floor_plan_size_x: t.floor_plan_size_x,
                                    floor_plan_size_y: t.floor_plan_size_y,
                                    image_size_x: t.image_size[0],
                                    image_size_y: t.image_size[1],
                                    save_configuration_button_variant: "secondary"
                                })
                            })).catch((function(t) {
                                e.props.alert(!0, "danger", "Failed to load floorplan configuration,  please refresh site or restart the server")
                            })), this.setState({
                                loading: !1
                            })
                        }
                    }, {
                        key: "renderSaving",
                        value: function() {
                            return o.a.createElement("div", {
                                style: {
                                    margin: 10
                                }
                            }, o.a.createElement(z, null))
                        }
                    }, {
                        key: "renderFloorplanConfig",
                        value: function() {
                            var e = this.state.floor_plan_size_x,
                                t = this.state.floor_plan_size_y,
                                n = this.state.image_size_x,
                                a = this.state.image_size_y,
                                r = this.state.save_configuration_button_variant;
                            return o.a.createElement(_.a, null, o.a.createElement(C.a, {
                                onSubmit: this.onConfigureFloorplan
                            }, o.a.createElement(C.a.Group, {
                                controlId: "exampleForm.ControlSelect2"
                            }, o.a.createElement(C.a.Label, null), o.a.createElement(C.a.Label, {
                                style: {
                                    marginTop: 50,
                                    fontSize: "150%"
                                }
                            }, "Upload a floor plan. Current floor plan size is ", e, " x ", t, " meters.", " "), o.a.createElement(C.a.Row, null), o.a.createElement(C.a.Row, null, o.a.createElement(C.a.Group, {
                                as: w.a,
                                controlId: "UploadButton"
                            }, o.a.createElement(w.a, {
                                md: "12",
                                show: this.props.show,
                                style: {
                                    marginTop: 20,
                                    color: "white",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }
                            }, o.a.createElement(O.a, {
                                style: {
                                    margin: 10
                                }
                            }, o.a.createElement(I.b, {
                                destination: {
                                    url: "/api/floorplan"
                                },
                                method: "PUT"
                            }, o.a.createElement(M, null)))))))), o.a.createElement(C.a, {
                                onSubmit: this.onSaveSettings
                            }, o.a.createElement(C.a.Group, {
                                controlId: "exampleForm.ControlSelect2"
                            }, o.a.createElement(C.a.Label, null, "Define room size in units (meters). Image size is ", n, " x ", a, " pixels."), o.a.createElement(C.a.Row, null, o.a.createElement(C.a.Group, {
                                as: w.a,
                                controlId: "formGridX"
                            }, o.a.createElement(C.a.Label, null, "X: Width (meters)"), o.a.createElement(C.a.Control, {
                                name: "floor_plan_size_x",
                                type: "number",
                                min: "1",
                                max: "1000",
                                step: "0.1",
                                value: e,
                                onChange: this.handleInputChange,
                                placeholder: "0"
                            }))), o.a.createElement(C.a.Row, null, o.a.createElement(C.a.Group, {
                                as: w.a,
                                controlId: "formGridY"
                            }, o.a.createElement(C.a.Label, null, "Y: Length (meters)"), o.a.createElement(C.a.Control, {
                                name: "floor_plan_size_y",
                                type: "number",
                                min: "1",
                                max: "1000",
                                step: "0.1",
                                value: t,
                                onChange: this.handleInputChange,
                                placeholder: "0"
                            }))), o.a.createElement(C.a.Row, null, o.a.createElement(C.a.Group, {
                                as: w.a,
                                controlId: "SaveSettings"
                            }, o.a.createElement(x.a, {
                                name: "saveSettings",
                                variant: r,
                                type: "submit"
                            }, "Set room size"))))))
                        }
                    }, {
                        key: "onSaveSettings",
                        value: function(e) {
                            var t = this;
                            e.preventDefault(), console.log("saveSettings"), this.setState({
                                loading: !0
                            }), this.state.config.floor_plan_size_x = this.state.floor_plan_size_x, this.state.config.floor_plan_size_y = this.state.floor_plan_size_y, this.state.config.floor_plan_scale_factor = this.floor_plan_scale_factor, fetch("/api/floorplan_size", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(this.state.config)
                            }).then((function(e) {
                                return e.json()
                            })).then((function(e) {
                                console.log(e), 1 == e.success ? (t.props.alert(!0, "success", "New floorplan size is " + e.floor_plan_size_x + " x " + e.floor_plan_size_y + " units (pixels)"), R(t.props, e.anchors_out_of_range, e.floor_plan_size_x, e.floor_plan_size_y), t.setState({
                                    floor_plan_size_x: e.floor_plan_size_x,
                                    floor_plan_size_y: e.floor_plan_size_y
                                })) : t.props.alert(!0, "danger", e.message)
                            })).catch((function(e) {
                                console.error("saveSettings: " + e), t.props.alert(!0, "danger", "Failed to load floorplan configuration,  please refresh site or restart the server")
                            })), this.setState({
                                loading: !1
                            })
                        }
                    }, {
                        key: "render",
                        value: function() {
                            return o.a.createElement("div", {
                                style: i.center
                            }, o.a.createElement(w.a, {
                                md: "6",
                                style: {
                                    color: "#EEEEEEEE"
                                }
                            }, this.state.loading ? this.renderSaving() : this.renderFloorplanConfig(this.state)))
                        }
                    }]), n
                }(o.a.Component),
                F = n(65),
                L = n(81),
                H = n(40),
                N = n(41),
                B = {
                    container: {
                        position: "fixed",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        padding: "5px 0",
                        background: "#FE6D58",
                        color: "#777E87",
                        boxShadow: "0px 0px 5px 0px rgba(25, 25, 25, 0.75)",
                        textAlign: "left",
                        margin: 0
                    },
                    toolbarColumn: {
                        borderColor: "yellow",
                        borderWidth: 5,
                        borderRadius: 2
                    },
                    toolbarRow: {
                        paddingTop: 3
                    },
                    toolbarIcon: {
                        color: "white",
                        fontSize: "1em"
                    }
                },
                G = function(e) {
                    Object(g.a)(n, e);
                    var t = Object(m.a)(n);

                    function n(e) {
                        var a;
                        return Object(u.a)(this, n), (a = t.call(this, e)).state = {
                            ipAddress: a.props.defaultIpAddress
                        }, a.handleChange = a.handleChange.bind(Object(d.a)(a)), a.handleUrlChange = a.handleUrlChange.bind(Object(d.a)(a)), a
                    }
                    return Object(h.a)(n, [{
                        key: "handleChange",
                        value: function(e) {
                            this.setState({
                                ipAddress: e.target.value
                            })
                        }
                    }, {
                        key: "handleUrlChange",
                        value: function(e) {
                            this.setState({
                                imageUrl: e.target.value
                            })
                        }
                    }, {
                        key: "renderConnectButton",
                        value: function() {
                            var e = this,
                                t = null,
                                n = this.props.isConnected ? "danger" : "dark";
                            return t = this.props.isConnecting ? o.a.createElement(H.a, {
                                icon: N.d,
                                spin: !0,
                                style: B.toolbarIcon
                            }) : this.props.isConnected ? o.a.createElement(H.a, {
                                icon: N.e,
                                style: B.toolbarIcon
                            }) : o.a.createElement(H.a, {
                                icon: N.c,
                                style: B.toolbarIcon
                            }), o.a.createElement(x.a, {
                                variant: n,
                                onClick: function() {
                                    return e.props.onConnectDisconnect(e.state.ipAddress)
                                }
                            }, t)
                        }
                    }, {
                        key: "renderUtilButton",
                        value: function() {
                            return o.a.createElement(x.a, {
                                variant: "dark",
                                onClick: this.props.onUtilButtonPressed
                            }, o.a.createElement(H.a, {
                                icon: N.a,
                                style: B.toolbarIcon
                            }))
                        }
                    }, {
                        key: "renderTogglePathButton",
                        value: function() {
                            return o.a.createElement(x.a, {
                                variant: "dark",
                                onClick: this.props.onToggleButtonPressed
                            }, o.a.createElement(H.a, {
                                icon: N.b,
                                style: B.toolbarIcon
                            }))
                        }
                    }, {
                        key: "render",
                        value: function() {
                            return o.a.createElement("div", {
                                style: Object(c.a)({}, B.container)
                            }, o.a.createElement(w.a, {
                                styles: B.toolbarColumn,
                                md: 12
                            }, o.a.createElement(O.a, {
                                xs: 12
                            }, o.a.createElement(w.a, {
                                xs: 2
                            }, this.renderConnectButton()), o.a.createElement(w.a, {
                                xs: 3
                            }, o.a.createElement(L.a, {
                                type: "text",
                                value: this.state.ipAddress,
                                placeholder: "Enter IP Address",
                                onChange: this.handleChange,
                                disabled: this.props.isConnected
                            })), o.a.createElement(w.a, {
                                xs: 3
                            }, this.renderUtilButton()), o.a.createElement(w.a, {
                                xs: 1
                            }, this.renderTogglePathButton()))))
                        }
                    }]), n
                }(o.a.Component);
            G.defaultProps = {
                defaultIpAddress: ""
            };
            var U = n(14),
                W = (n(74), function(e) {
                    Object(g.a)(n, e);
                    var t = Object(m.a)(n);

                    function n(e) {
                        var a;
                        return Object(u.a)(this, n), (a = t.call(this, e)).state = {
                            color: "#FE6D58",
                            fillPatternImage: null,
                            bgImageDimensions: {
                                height: 0,
                                width: 0
                            },
                            shouldDrawArrow: null,
                            showBeacons: !0,
                            showReferencePoints: !0,
                            buttonPressed: !1,
                            trailColor: "white",
                            canvasWidth: 0,
                            canvasHeight: 0,
                            floor_plan_scale_factor: 1
                        }, a.coordHistory = [], a.verticalMargin = 100, a.horizontalMargin = 30, a.colors = ["Tomato", "Cyan", "DarkMagenta", "Gold"], a.handleAnchorClick = a.handleAnchorClick.bind(Object(d.a)(a)), a.handleBeaconClick = a.handleBeaconClick.bind(Object(d.a)(a)), a.drawAnchorAngles = a.drawAnchorAngles.bind(Object(d.a)(a)), a.handleCanvasClick = a.handleCanvasClick.bind(Object(d.a)(a)), a.transform_coords_to_canvas_coords = a.transform_coords_to_canvas_coords.bind(Object(d.a)(a)), a.transform_canvas_coords_to_coords = a.transform_canvas_coords_to_coords.bind(Object(d.a)(a)), a
                    }
                    return Object(h.a)(n, [{
                        key: "componentDidMount",
                        value: function() {
                            var e = this;
                            console.log("DirectionCanvas: componentDidMount");
                            var t = new window.Image;
                            t.src = "/map?param=" + Math.floor(100 * Math.random()), t.onload = function(n) {
                                var a = n.target,
                                    o = a.naturalWidth,
                                    r = a.naturalHeight;
                                if (a.naturalHeight >= a.naturalWidth ? (r = window.innerHeight - e.verticalMargin, o = Math.floor(a.naturalWidth / a.naturalHeight * r)) : (o = window.innerWidth - e.horizontalMargin, r = Math.floor(a.naturalHeight / a.naturalWidth * o)), r > window.innerHeight - e.verticalMargin) {
                                    var l = o / r;
                                    r = window.innerHeight - e.verticalMargin, o = Math.floor(l * r)
                                }
                                if (o > window.innerWidth - e.horizontalMargin) {
                                    var s = r / o;
                                    o = window.innerWidth - e.horizontalMargin, r = Math.floor(s * o)
                                }
                                e.setState({
                                    fillPatternImage: t,
                                    bgImageDimensions: {
                                        height: a.naturalHeight,
                                        width: a.naturalWidth
                                    },
                                    canvasWidth: o,
                                    canvasHeight: r
                                }), console.log("DirectionCanvas: onload next State img.width=" + a.naturalWidth + " img.height=" + a.naturalHeight + " - canvasWidth=" + o + " canvasHeight=" + r)
                            }, console.log("DirectionCanvas: componentDidMount canvasWidth=" + this.state.canvasWidth + " canvasHeight=" + this.state.canvasHeight), fetch("/api/floorplan_size").then((function(e) {
                                return e.json()
                            })).then((function(t) {
                                e.setState({
                                    floor_plan_scale_factor: t.floor_plan_scale_factor
                                })
                            }))
                        }
                    }, {
                        key: "handleAnchorClick",
                        value: function(e) {
                            var t = this.state.shouldDrawArrow;
                            t[e.mac] = !t[e.mac], console.log("change", t), this.setState({
                                shouldDrawArrow: t
                            })
                        }
                    }, {
                        key: "handleBeaconClick",
                        value: function() {
                            this.setState({
                                showBeacons: !this.state.showBeacons
                            })
                        }
                    }, {
                        key: "degrees_to_radians",
                        value: function(e) {
                            return e * (Math.PI / 180)
                        }
                    }, {
                        key: "drawAnchorAngles",
                        value: function(e, t) {
                            var n = this,
                                a = [];
                            return e.x_dir.forEach((function(r, l) {
                                var s = [e.arrowX, e.arrowY, e.x_dir[l], e.y_dir[l]];
                                a.push(o.a.createElement(U.Arrow, {
                                    key: l + "-" + t,
                                    points: s,
                                    fill: n.colors[l % n.colors.length],
                                    stroke: "black"
                                }))
                            })), a
                        }
                    }, {
                        key: "drawAnchors",
                        value: function(e, t) {
                            var n = this;
                            return e.filter((function(e) {
                                return null !== e.config
                            })).map((function(e) {
                                var a = t.map((function(t) {
                                        var n = [];
                                        return t.anglesH.forEach((function(t) {
                                            e.mac === t[0] && n.push(parseInt(parseInt(t[1])))
                                        })), n
                                    })),
                                    r = n.mapAnchorCoordinateToCanvasCoordinate(parseFloat(e.config.x), parseFloat(e.config.y), parseInt(e.config.azimuthAngle), a);
                                return o.a.createElement(U.Layer, {
                                    key: e.mac
                                }, n.state.shouldDrawArrow[e.mac] ? n.drawAnchorAngles(r, e.mac) : null, o.a.createElement(U.Rect, {
                                    x: r.x,
                                    y: r.y,
                                    offsetX: 25,
                                    offsetY: 5,
                                    width: 50,
                                    height: 10,
                                    rotation: r.rotation,
                                    fill: n.state.color,
                                    shadowBlur: 5,
                                    onClick: function() {
                                        return n.handleAnchorClick(e)
                                    }
                                }), o.a.createElement(U.Rect, {
                                    x: r.x,
                                    y: r.y,
                                    offsetY: 5,
                                    width: 2,
                                    height: -30,
                                    rotation: r.rotation,
                                    fill: "black",
                                    shadowBlur: 5,
                                    onClick: function() {
                                        return n.handleAnchorClick(e)
                                    }
                                }), o.a.createElement(U.Text, {
                                    fill: n.state.color,
                                    x: r.textX,
                                    y: r.textY,
                                    text: e.mac
                                }))
                            }))
                        }
                    }, {
                        key: "renderBeacons",
                        value: function(e) {
                            var t = this;
                            return o.a.createElement(U.Layer, null, o.a.createElement(U.Group, null, e.map((function(e, n) {
                                return o.a.createElement(U.Circle, {
                                    hidden: t.state.showBeacons,
                                    key: e.beaconId,
                                    x: e.x,
                                    y: e.y,
                                    radius: 20,
                                    fill: t.colors[n % t.colors.length],
                                    onClick: t.handleBeaconClick
                                })
                            })), e.map((function(e, n) {
                                return o.a.createElement(U.Text, {
                                    key: e.beaconId,
                                    x: e.x > t.state.canvasWidth / 2 ? e.x - 100 : e.x,
                                    y: e.y > t.state.canvasHeight / 2 ? e.y - 20 : e.y + 10,
                                    fill: "DarkRed",
                                    fontSize: 18,
                                    fontStyle: "bold",
                                    text: "".concat(e.beaconId, " \nZ=").concat((parseFloat(e.z) < 0 ? 0 : parseFloat(e.z)).toFixed(2))
                                })
                            }))))
                        }
                    }, {
                        key: "renderBeaconsHistory",
                        value: function(e) {
                            var t = this;
                            return o.a.createElement(U.Layer, null, o.a.createElement(U.Group, null, e.map((function(e, n) {
                                return o.a.createElement(U.Circle, {
                                    key: e.beaconId,
                                    x: e.x,
                                    y: e.y,
                                    radius: 2,
                                    fill: t.state.trailColor
                                })
                            }))))
                        }
                    }, {
                        key: "renderReferencePoints",
                        value: function(e, t) {
                            var n = this;
                            return console.log("renderReferencePoints", e), o.a.createElement(U.Layer, null, e.map((function(e) {
                                return n.transform_coords_to_canvas_coords(e)
                            })).map((function(e, a) {
                                var r = "black",
                                    l = "Ref: ".concat(a, "\n");
                                return t && t.refPointIndex === a ? (r = "gold", l += "Err: ".concat(parseFloat(t.distance).toFixed(2), "m\n") + "Mean: ".concat(parseFloat(e.meanError).toFixed(2), "m\n") + "Max: ".concat(parseFloat(e.maxError).toFixed(2), "m")) : e.meanError && (l += "Mean: ".concat(parseFloat(e.meanError).toFixed(2), "m\n") + "Max: ".concat(parseFloat(e.maxError).toFixed(2), "m")), o.a.createElement(U.Group, {
                                    key: e.x + "," + e.y + "," + a
                                }, o.a.createElement(U.Label, {
                                    x: e.x > n.state.canvasWidth - 100 ? e.x - 60 : e.x,
                                    y: e.y < 100 ? e.y + 20 : e.y - 60,
                                    draggable: !0
                                }, o.a.createElement(U.Tag, {
                                    x: e.x,
                                    y: e.y - 60,
                                    fill: "#FE6D58",
                                    stroke: "#333",
                                    shadowColor: "#1F1F1F",
                                    shadowOffset: [10, 10],
                                    shadowOpacity: .1,
                                    lineJoin: "round",
                                    cornerRadius: 2
                                }), o.a.createElement(U.Text, {
                                    text: l,
                                    lineHeight: 1,
                                    fontSize: 12,
                                    x: e.x,
                                    y: e.y - 60,
                                    fill: r,
                                    padding: 5
                                })), o.a.createElement(U.Circle, {
                                    x: e.x,
                                    y: e.y,
                                    radius: 7,
                                    fill: r,
                                    strokeWidth: 2,
                                    stroke: "red"
                                }))
                            })))
                        }
                    }, {
                        key: "get_scale",
                        value: function(e, t, n) {
                            return n * t / e
                        }
                    }, {
                        key: "transform_coords_to_canvas_coords",
                        value: function(e) {
                            var t = Object.assign({}, e),
                                n = Math.floor(e.x * this.get_scale(this.state.bgImageDimensions.width, this.state.canvasWidth, this.state.floor_plan_scale_factor)),
                                a = Math.floor(e.y * this.get_scale(this.state.bgImageDimensions.height, this.state.canvasHeight, this.state.floor_plan_scale_factor));
                            return t.y = this.state.canvasHeight - a, t.x = n, t
                        }
                    }, {
                        key: "transform_canvas_coords_to_coords",
                        value: function(e) {
                            var t = e.x / this.get_scale(this.state.bgImageDimensions.width, this.state.canvasWidth, this.state.floor_plan_scale_factor),
                                n = (this.state.canvasWidth - e.y) / this.get_scale(this.state.bgImageDimensions.height, this.state.canvasHeight, this.state.floor_plan_scale_factor);
                            return {
                                x: t,
                                y: n
                            }
                        }
                    }, {
                        key: "handleCanvasClick",
                        value: function(e) {
                            console.log("handleCanvasClick", e);
                            var t = e.target.getStage().getPointerPosition(),
                                n = e.target.attrs.x,
                                a = e.target.attrs.y,
                                o = t.x - n,
                                r = t.y - a;
                            this.props.referenceAddedCallback(this.transform_canvas_coords_to_coords({
                                x: o,
                                y: r
                            }))
                        }
                    }, {
                        key: "render",
                        value: function() {
                            var e, t = this;
                            return e = 0 === this.props.data.length ? [{
                                beaconId: "TEST Point",
                                x: .16,
                                y: .8,
                                anglesH: [
                                    ["COM22", 10],
                                    ["COM200", 10],
                                    ["COM120", 10],
                                    ["COM231", 10]
                                ],
                                anglesV: [
                                    ["COM22", 10],
                                    ["COM200", 10],
                                    ["COM120", 10],
                                    ["COM231", 10]
                                ]
                            }].map((function(e) {
                                return t.transform_coords_to_canvas_coords(e)
                            })) : this.props.data.map((function(e) {
                                return t.transform_coords_to_canvas_coords(e)
                            })), o.a.createElement(U.Stage, {
                                width: this.state.canvasWidth,
                                height: this.state.canvasHeight
                            }, o.a.createElement(U.Layer, null, o.a.createElement(U.Rect, {
                                x: 0,
                                y: 0,
                                width: this.state.canvasWidth,
                                height: this.state.canvasHeight,
                                shadowBlur: 5,
                                fillPatternImage: this.state.fillPatternImage,
                                fillPatternScaleY: this.state.canvasHeight / this.state.bgImageDimensions.height,
                                fillPatternScaleX: this.state.canvasWidth / this.state.bgImageDimensions.width,
                                onClick: this.handleCanvasClick
                            })), this.drawAnchors(this.props.anchors, e), this.state.showBeacons ? this.renderBeacons(e) : null, this.props.drawHistory ? this.renderBeaconsHistory(this.props.coordHistory.map(this.transform_coords_to_canvas_coords)) : null, this.state.showReferencePoints ? this.renderReferencePoints(this.props.referencePoints, this.props.currentError) : null)
                        }
                    }, {
                        key: "mapAnchorCoordinateToCanvasCoordinate",
                        value: function(e, t, n, a) {
                            var o = Math.floor((this.state.canvasHeight + this.state.canvasHeight) / 8),
                                r = 0,
                                l = 0,
                                s = Math.floor(e * this.get_scale(this.state.bgImageDimensions.width, this.state.canvasWidth, this.state.floor_plan_scale_factor)),
                                i = Math.floor(t * this.get_scale(this.state.bgImageDimensions.height, this.state.canvasHeight, this.state.floor_plan_scale_factor));
                            i = this.state.canvasHeight - i, r = s < this.state.canvasWidth / 2 ? 0 : 1, l = i < this.state.canvasHeight / 2 ? 0 : 1;
                            var c = this.state.canvasWidth,
                                u = this.state.canvasHeight,
                                h = function(e, t) {
                                    var n = t - parseInt(e);
                                    return [n * (Math.PI / 180), n]
                                },
                                d = a.map((function(e) {
                                    var t = h(e, n),
                                        a = t[0],
                                        r = Math.floor(o * Math.cos(a)),
                                        l = s + r;
                                    return Math.min(Math.max(0, l), c - 1)
                                })),
                                g = a.map((function(e) {
                                    var t = h(e, n),
                                        a = t[0],
                                        r = Math.floor(o * Math.sin(a)),
                                        l = i - r;
                                    return Math.min(Math.max(0, l), u - 1)
                                }));
                            return 0 === r && 0 === l ? {
                                x: s + 30,
                                y: i + 30,
                                textX: s,
                                textY: i + 60,
                                rotation: 90 - n,
                                x_dir: d,
                                y_dir: g,
                                arrowX: s,
                                arrowY: i
                            } : 1 === r && 0 === l ? {
                                x: s - 30,
                                y: i + 30,
                                textX: s - 120,
                                textY: i + 60,
                                rotation: 90 - n,
                                x_dir: d,
                                y_dir: g,
                                arrowX: s,
                                arrowY: i
                            } : 0 === r && 1 === l ? {
                                x: s + 30,
                                y: i - 30,
                                textX: s,
                                textY: i - 60,
                                rotation: 90 - n,
                                x_dir: d,
                                y_dir: g,
                                arrowX: s,
                                arrowY: i
                            } : 1 === r && 1 === l ? {
                                x: s - 30,
                                y: i - 30,
                                textX: s - 120,
                                textY: i - 60,
                                rotation: 90 - n,
                                x_dir: d,
                                y_dir: g,
                                arrowX: s,
                                arrowY: i
                            } : (console.error("Invalid coordinates, TODO show error to user"), null)
                        }
                    }], [{
                        key: "getDerivedStateFromProps",
                        value: function(e, t) {
                            var n = {};
                            if (t.buttonPressed !== e.buttonPressed && (console.log("New button state", t.buttonPressed), n = {
                                    trailColor: "red",
                                    buttonPressed: e.buttonPressed
                                }), null !== t.shouldDrawArrow) return n;
                            var a = {};
                            return e.anchors.forEach((function(e) {
                                return a[e.mac] = !1
                            })), n.shouldDrawArrow = a, n
                        }
                    }]), n
                }(o.a.Component)),
                X = function(e) {
                    Object(g.a)(n, e);
                    var t = Object(m.a)(n);

                    function n(e) {
                        var a;
                        return Object(u.a)(this, n), (a = t.call(this, e)).state = {
                            anchors: [],
                            loading: !1,
                            wsOpen: !1,
                            wsClosing: !1,
                            wsConnecting: !1,
                            data: [],
                            coordHistory: [],
                            referencePoints: [],
                            showHistory: !1
                        }, a.ip = "ws:localhost:5000/ws/angles", a.connect = a.connect.bind(Object(d.a)(a)), a.connectDisconnectClicked = a.connectDisconnectClicked.bind(Object(d.a)(a)), a.handleReferencePointInserted = a.handleReferencePointInserted.bind(Object(d.a)(a)), a.handleUtilButton = a.handleUtilButton.bind(Object(d.a)(a)), a.handleTogglePath = a.handleTogglePath.bind(Object(d.a)(a)), a.defaultRefPoints = [], a.mounted = !1, a
                    }
                    return Object(h.a)(n, [{
                        key: "componentDidMount",
                        value: function() {
                            var e = this;
                            this.mounted = !0, this.mounted && (this.setState({
                                loading: !0
                            }), fetch("/api/ui", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    ui: "local"
                                })
                            }), fetch("/api/configure").then((function(e) {
                                return e.json()
                            })).then((function(t) {
                                console.log("Run componentDidMount Initital anchor config loaded", t), console.log(t), e.setState({
                                    anchors: t.anchors,
                                    loading: !1
                                })
                            })).catch((function(t) {
                                e.setState({
                                    loading: !1
                                }), e.props.alert(!0, "danger", "Failed listing connected anchors, please refresh site or restart the server")
                            })))
                        }
                    }, {
                        key: "connect",
                        value: function(e) {
                            var t = this;
                            console.log("Connecting to", e), this.ws = new WebSocket(e), this.ws.binaryType = "arraybuffer", this.state.wsClosing || this.state.wsOpen || !this.mounted ? console.error("ws is in closing or closed state") : (this.setState({
                                wsConnecting: !0,
                                wsClosing: !1,
                                referencePoints: this.defaultRefPoints
                            }), this.ws.onopen = function() {
                                console.log("WebSocket open"), t.setState({
                                    wsOpen: !0,
                                    wsConnecting: !1,
                                    wsClosing: !1
                                })
                            }, this.ws.onclose = function(e) {
                                console.log("WebSocket close", e), t.setState({
                                    wsOpen: !1,
                                    wsConnecting: !1,
                                    wsClosing: !1
                                })
                            }, this.ws.onerror = function(e) {
                                console.log(e), t.setState({
                                    wsOpen: !1,
                                    wsConnecting: !1,
                                    wsClosing: !1
                                })
                            }, this.ws.onmessage = function(e) {
                                console.log("Received ", JSON.parse(e.data));
                                var n = JSON.parse(e.data);
                                console.log(n);
                                var a = t.state.coordHistory;
                                n.forEach((function(e) {
                                    a.some((function(t) {
                                        return t.x === e.x && t.y === e.y
                                    })) || isNaN(e.x) || isNaN(e.y) || (a.push({
                                        x: e.x,
                                        y: e.y,
                                        button: e.button
                                    }), a.length > 2e3 && a.shift())
                                }));
                                var o = t.state.overrideButtonState ? t.state.overrideButtonState : n[0].button,
                                    r = o % 2 !== 0,
                                    l = Math.floor(o / 2);
                                if (-1 !== o && t.state.referencePoints.length > l && r) {
                                    var s = n[0],
                                        i = Object.assign({}, t.state.currentError),
                                        c = t.state.referencePoints;
                                    if (r && t.state.referencePoints.length >= l) {
                                        i || (i = {});
                                        var u = t.state.referencePoints[l];
                                        i.refPointIndex = l, i.distance = Math.sqrt(Math.pow(s.x - u.x, 2) + Math.pow(s.y - u.y, 2)), c[l].history.push(i), c[l].maxError = Math.max.apply(Math, Object(F.a)(c[l].history.map((function(e) {
                                            return Math.abs(e.distance)
                                        }))));
                                        var h = c[l].history.reduce((function(e, t) {
                                            return e + t.distance
                                        }), 0);
                                        c[l].meanError = h / c[l].history.length || 0
                                    }
                                    t.setState({
                                        data: n,
                                        coordHistory: a,
                                        buttonPressed: r,
                                        buttonState: o,
                                        currentError: i,
                                        referencePoints: c
                                    })
                                } else t.setState({
                                    data: n,
                                    coordHistory: a,
                                    buttonPressed: !1,
                                    currentError: null
                                })
                            })
                        }
                    }, {
                        key: "componentWillUnmount",
                        value: function() {
                            this.mounted = !1, console.log("closing web socket"), null != this.ws && this.ws.close()
                        }
                    }, {
                        key: "connectDisconnectClicked",
                        value: function(e) {
                            this.state.wsOpen ? (this.setState({
                                wsClosing: !0
                            }), this.ws.close()) : (console.log("connect to ws"), this.connect(e))
                        }
                    }, {
                        key: "handleReferencePointInserted",
                        value: function(e) {
                            e.history = [], this.setState({
                                referencePoints: [].concat(Object(F.a)(this.state.referencePoints), [e])
                            })
                        }
                    }, {
                        key: "handleUtilButton",
                        value: function() {
                            var e = 0 | this.state.overrideButtonState;
                            e++, console.log("Pressed", e), this.setState({
                                overrideButtonState: e
                            })
                        }
                    }, {
                        key: "handleTogglePath",
                        value: function() {
                            this.state.showHistory ? this.setState({
                                showHistory: !1,
                                coordHistory: []
                            }) : this.setState({
                                showHistory: !0,
                                coordHistory: []
                            })
                        }
                    }, {
                        key: "renderLoading",
                        value: function() {
                            return o.a.createElement("div", {
                                style: {
                                    margin: 10
                                }
                            }, o.a.createElement(S, {
                                connectionConfig: this.props.connectionConfig
                            }))
                        }
                    }, {
                        key: "renderDirectionCanvas",
                        value: function() {
                            return o.a.createElement(W, {
                                anchors: this.state.anchors,
                                data: this.state.data,
                                referenceAddedCallback: this.handleReferencePointInserted,
                                referencePoints: this.state.referencePoints,
                                coordHistory: this.state.coordHistory,
                                currentError: this.state.currentError,
                                drawHistory: this.state.showHistory,
                                buttonPressed: this.state.buttonPressed
                            })
                        }
                    }, {
                        key: "render",
                        value: function() {
                            return o.a.createElement("div", {
                                style: {
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }
                            }, this.state.loading ? this.renderLoading() : this.renderDirectionCanvas(), o.a.createElement(G, {
                                defaultIpAddress: this.ip,
                                isConnected: this.state.wsOpen,
                                isConnecting: this.state.wsConnecting,
                                onConnectDisconnect: this.connectDisconnectClicked,
                                onUtilButtonPressed: this.handleUtilButton,
                                onToggleButtonPressed: this.handleTogglePath
                            }))
                        }
                    }]), n
                }(o.a.Component),
                Y = n(12),
                J = function(e) {
                    fetch("/api/restart").then((function(e) {
                        return e.json()
                    })).then((function(t) {
                        e.alert(!0, "success", "Successfully restarted server")
                    })).catch((function(t) {
                        e.alert(!0, "danger", "Restart failed, manually restart server")
                    }))
                },
                V = function(e) {
                    fetch("/api/clear").then((function(e) {
                        return e.json()
                    })).then((function(t) {
                        e.alert(!0, "success", "Successfully cleared settings")
                    })).catch((function(t) {
                        e.alert(!0, "danger", "Clearing failed, try again or restart server")
                    }))
                },
                Z = function(e) {
                    var t = Object(a.useState)("54444"),
                        n = Object(Y.a)(t, 2),
                        r = n[0],
                        l = n[1],
                        s = Object(a.useState)(!1),
                        i = Object(Y.a)(s, 2),
                        c = i[0],
                        u = i[1],
                        h = Object(a.useState)("0.0.0.0"),
                        d = Object(Y.a)(h, 2),
                        g = d[0],
                        m = d[1],
                        f = Object(a.useState)(!1),
                        p = Object(Y.a)(f, 2),
                        y = p[0],
                        b = p[1];
                    return Object(a.useEffect)((function() {
                        fetch("api/logging", {
                            method: "GET"
                        }).then((function(e) {
                            return e.json()
                        })).then((function(e) {
                            e.logging != c && u(e.logging)
                        })).catch((function(t) {
                            console.log(t), e.alert(!0, "danger", "Could not fetch Util data")
                        })), fetch("api/udp", {
                            method: "GET"
                        }).then((function(e) {
                            return e.json()
                        })).then((function(t) {
                            t.running ? y || (b(!0), e.setConnectionConfig("UDP")) : e.setConnectionConfig("UART"), m(t.ip), l(String(t.port))
                        })).catch((function(t) {
                            console.log(t), e.alert(!0, "danger", "Could not fetch Util data")
                        }))
                    }), []), o.a.createElement("div", {
                        style: {
                            justifyContent: "center"
                        }
                    }, o.a.createElement(w.a, {
                        md: "12",
                        show: e.show,
                        style: {
                            marginTop: 50,
                            color: "white",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "right"
                        }
                    }, o.a.createElement("h4", null, "Choose anchor connection method")), o.a.createElement(w.a, {
                        md: "12",
                        show: e.show,
                        style: {
                            marginTop: 30,
                            color: "white",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "right"
                        }
                    }, o.a.createElement("h6", null, y ? " UDP Server running on:" : "UART mode chosen")), o.a.createElement(w.a, {
                        md: "12",
                        show: e.show,
                        style: {
                            marginTop: 5,
                            color: "white",
                            display: "flex",
                            justifyContent: "center"
                        }
                    }, o.a.createElement(C.a, {
                        inline: !0,
                        style: {
                            margin: 10
                        },
                        onSubmit: function(t) {
                            t.preventDefault(), fetch("/api/udp", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    port: r
                                })
                            }).then((function(e) {
                                return e.json()
                            })).then((function(t) {
                                !0 === t.success ? (e.alert(!0, "success", t.message), b(!0), e.setConnectionConfig("UDP")) : e.alert(!0, "danger", t.message)
                            })).catch((function(t) {
                                console.log(t), e.alert(!0, "danger", "failed to start udp server")
                            }))
                        }
                    }, o.a.createElement(O.a, null, o.a.createElement(C.a.Group, {
                        size: "lg",
                        controlId: "port"
                    }, o.a.createElement(x.a, {
                        variant: "danger",
                        active: y,
                        type: "submit",
                        style: {
                            alignSelf: "flex-start",
                            margin: 10
                        }
                    }, y ? " Change port:" : "Start UDP server"), o.a.createElement(C.a.Control, {
                        style: {
                            margin: 10
                        },
                        autoFocus: !0,
                        type: "port",
                        value: r,
                        onChange: function(e) {
                            return l(e.target.value)
                        }
                    }), o.a.createElement("div", null, " ip: ", g))))), o.a.createElement(w.a, {
                        md: "12",
                        show: e.show,
                        style: {
                            display: "flex",
                            justifyContent: "center"
                        }
                    }, o.a.createElement(O.a, {
                        md: "12",
                        show: e.show,
                        style: {
                            display: "flex",
                            alignSelf: "flex-start",
                            paddingRight: 310
                        }
                    }, o.a.createElement(x.a, {
                        style: {
                            color: "white",
                            display: "flex",
                            alignItem: "flex-start"
                        },
                        variant: "danger",
                        active: !y,
                        onClick: function(t) {
                            t.preventDefault(), fetch("/api/useuart", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                }
                            }).then((function(e) {
                                return e.json()
                            })).then((function(t) {
                                e.alert(!0, "success", t.message), b(!1), e.setConnectionConfig("UART")
                            })).catch((function(t) {
                                e.alert(!0, "danger", "could not swith to uart")
                            }))
                        }
                    }, "Serial via UART"))), o.a.createElement(w.a, {
                        md: "12",
                        show: e.show,
                        style: {
                            marginTop: 50,
                            color: "white",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "right"
                        }
                    }, o.a.createElement("h4", null, "Options")), o.a.createElement(w.a, {
                        md: "12",
                        show: e.show,
                        style: {
                            marginTop: 50,
                            color: "white",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }
                    }, o.a.createElement(O.a, {
                        style: {
                            margin: 10
                        }
                    }, o.a.createElement(x.a, {
                        variant: "danger",
                        type: "submit",
                        onClick: function() {
                            return J(e)
                        }
                    }, "Restart server")), o.a.createElement(O.a, {
                        style: {
                            margin: 10
                        }
                    }, o.a.createElement(x.a, {
                        variant: "danger",
                        type: "submit",
                        onClick: function() {
                            return V(e)
                        }
                    }, "Clear saved config")), o.a.createElement(O.a, {
                        style: {
                            margin: 10
                        }
                    }, o.a.createElement(x.a, {
                        variant: "danger",
                        type: "submit",
                        onClick: function() {
                            fetch("/api/logging", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    logging: !c
                                })
                            }).then((function(e) {
                                return e.json()
                            })).then((function(e) {
                                return u(e.logging)
                            })).catch((function(t) {
                                console.log(t), e.alert(!0, "danger", "could not toggle logging")
                            }))
                        }
                    }, "Turn logging ", c ? "Off" : "On"))))
                },
                q = function(e) {
                    var t = e.callback,
                        n = e.switchmenutext,
                        r = e.alert,
                        l = Object(a.useState)(""),
                        s = Object(Y.a)(l, 2),
                        i = s[0],
                        c = s[1],
                        u = Object(a.useState)(""),
                        h = Object(Y.a)(u, 2),
                        d = h[0],
                        g = h[1],
                        m = Object(a.useState)(""),
                        f = Object(Y.a)(m, 2),
                        p = f[0],
                        y = f[1],
                        b = Object(a.useState)(!1),
                        v = Object(Y.a)(b, 2),
                        E = v[0],
                        _ = v[1];

                    function O(e) {
                        e.preventDefault(), fetch("/api/traxmate/login", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                email: i,
                                password: d
                            })
                        }).then((function(e) {
                            return e.json()
                        })).then((function(e) {
                            return function(e) {
                                e.success ? (_(!0), y(""), t(!0)) : (r(!0, "danger", "Wrong email or password"), _(!1))
                            }(e), console.log(e), e
                        })).catch((function(e) {
                            console.log(e), r(!0, "danger", "Could not log in to Traxmate")
                        }))
                    }
                    return o.a.createElement(w.a, null, E ? o.a.createElement("h4", null, "Setting up...") : o.a.createElement("div", {
                        className: "Login"
                    }, o.a.createElement("h5", {
                        style: {
                            color: "red"
                        }
                    }, p), o.a.createElement(C.a, {
                        onSubmit: O
                    }, o.a.createElement(C.a.Group, {
                        size: "lg",
                        controlId: "email"
                    }, o.a.createElement(C.a.Label, null, "Email"), o.a.createElement(C.a.Control, {
                        autoFocus: !0,
                        type: "email",
                        value: i,
                        onChange: function(e) {
                            return c(e.target.value)
                        }
                    })), o.a.createElement(C.a.Group, {
                        size: "lg",
                        controlId: "password"
                    }, o.a.createElement(C.a.Label, null, "Password"), o.a.createElement(C.a.Control, {
                        type: "password",
                        value: d,
                        onChange: function(e) {
                            return g(e.target.value)
                        }
                    })), o.a.createElement(x.a, {
                        block: !0,
                        size: "lg",
                        variant: "danger",
                        type: "submit",
                        disabled: !(i.length > 0 && d.length > 0)
                    }, "Login"), n)))
                },
                $ = function(e) {
                    var t = e.callback,
                        n = e.switchmenutext,
                        r = e.alert,
                        l = Object(a.useState)(""),
                        s = Object(Y.a)(l, 2),
                        i = s[0],
                        c = s[1],
                        u = Object(a.useState)(""),
                        h = Object(Y.a)(u, 2),
                        d = h[0],
                        g = h[1],
                        m = Object(a.useState)(""),
                        f = Object(Y.a)(m, 2),
                        p = f[0],
                        y = f[1],
                        b = Object(a.useState)(""),
                        v = Object(Y.a)(b, 2),
                        E = v[0],
                        _ = v[1],
                        O = Object(a.useState)(""),
                        j = Object(Y.a)(O, 2),
                        S = j[0],
                        k = j[1],
                        I = Object(a.useState)(""),
                        z = Object(Y.a)(I, 2),
                        A = z[0],
                        P = z[1],
                        T = Object(a.useState)(!1),
                        M = Object(Y.a)(T, 2),
                        R = M[0],
                        D = M[1],
                        F = Object(a.useState)(""),
                        L = Object(Y.a)(F, 2),
                        H = L[0],
                        N = L[1];

                    function B(e) {
                        e.preventDefault(), fetch("/api/traxmate/register", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                email: i,
                                password: d,
                                name: E,
                                firstname: S,
                                lastname: A
                            })
                        }).then((function(e) {
                            return e.json()
                        })).then((function(e) {
                            return function(e) {
                                e.success ? (D(!0), N(""), t(!0)) : (r(!0, "danger", "Registration failed"), D(!1))
                            }(e), console.log(e), e
                        })).catch((function(e) {
                            console.log(e), r(!0, "danger", "Could not register account on Traxmate")
                        }))
                    }
                    return o.a.createElement(w.a, null, R ? o.a.createElement("h4", null, "Searching for connected anchors and setting up default building...") : o.a.createElement("div", {
                        className: "Registration"
                    }, o.a.createElement("h5", {
                        style: {
                            color: "red"
                        }
                    }, H), o.a.createElement(C.a, {
                        onSubmit: B
                    }, o.a.createElement(C.a.Group, {
                        size: "lg",
                        controlId: "name"
                    }, o.a.createElement(C.a.Label, null, "Name"), o.a.createElement(C.a.Control, {
                        autoFocus: !0,
                        type: "name",
                        value: E,
                        onChange: function(e) {
                            return _(e.target.value)
                        }
                    })), o.a.createElement(C.a.Group, {
                        size: "lg",
                        controlId: "firstname"
                    }, o.a.createElement(C.a.Label, null, "First Name"), o.a.createElement(C.a.Control, {
                        autoFocus: !0,
                        type: "firstname",
                        value: S,
                        onChange: function(e) {
                            return k(e.target.value)
                        }
                    })), o.a.createElement(C.a.Group, {
                        size: "lg",
                        controlId: "lastname"
                    }, o.a.createElement(C.a.Label, null, "Last Name"), o.a.createElement(C.a.Control, {
                        autoFocus: !0,
                        type: "lastname",
                        value: A,
                        onChange: function(e) {
                            return P(e.target.value)
                        }
                    })), o.a.createElement(C.a.Group, {
                        size: "lg",
                        controlId: "email"
                    }, o.a.createElement(C.a.Label, null, "Email"), o.a.createElement(C.a.Control, {
                        autoFocus: !0,
                        type: "email",
                        value: i,
                        onChange: function(e) {
                            return c(e.target.value)
                        }
                    })), o.a.createElement(C.a.Group, {
                        size: "lg",
                        controlId: "password"
                    }, o.a.createElement(C.a.Label, null, "Password"), o.a.createElement(C.a.Control, {
                        type: "password",
                        value: d,
                        onChange: function(e) {
                            return g(e.target.value)
                        }
                    })), o.a.createElement(C.a.Group, {
                        size: "lg",
                        controlId: "validationpassword"
                    }, o.a.createElement(C.a.Label, null, "Please type your password again"), o.a.createElement(C.a.Control, {
                        type: "password",
                        value: p,
                        onChange: function(e) {
                            return y(e.target.value)
                        }
                    })), o.a.createElement(x.a, {
                        block: !0,
                        size: "lg",
                        variant: "danger",
                        type: "submit",
                        disabled: !(d === p && i.length > 0 && d.length > 0)
                    }, "Register"), n)))
                },
                K = function(e) {
                    var t = e.alert,
                        n = e.buildings,
                        r = e.connectionConfig,
                        l = Object(a.useState)(!0),
                        s = Object(Y.a)(l, 2),
                        i = s[0],
                        c = s[1],
                        u = Object(a.useState)(!1),
                        h = Object(Y.a)(u, 2),
                        d = h[0],
                        g = h[1],
                        m = Object(a.useState)(!1),
                        f = Object(Y.a)(m, 2),
                        p = f[0],
                        y = f[1],
                        b = Object(a.useState)(0),
                        v = Object(Y.a)(b, 2),
                        E = v[0],
                        _ = v[1],
                        C = {};

                    function j() {
                        if (C != {}) {
                            var e = n.find((function(e) {
                                return String(e.id) === String(C)
                            }));
                            fetch("/api/traxmate/uploadbuildingmodel", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(e)
                            }).then((function(e) {
                                return e.json()
                            })).then((function(e) {
                                e.success ? t(!0, "success", e.message) : t(!0, "danger", e.message), console.log(e)
                            })).catch((function(e) {
                                console.log(e), t(!0, "danger", "Could not log in to Traxmate")
                            }))
                        }
                    }

                    function k() {
                        !1 === i && c(!0), fetch("/api/traxmate/anchors", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }).then((function(e) {
                            return e.json()
                        })).then((function(e) {
                            console.log(e), !0 === e.success ? t(!1) : t(!0, "danger", "Too few anchors, at least 2 are needed. If you are using XPLR-AOA-2 kit, please connect all 4 anchors"), _(e.nbrAnchors), c(!1), y(!0)
                        })).catch((function(e) {
                            console.log(e), c(!1), y(!0), t(!0, "danger", "Failed listing connected anchors, please refresh site or restart the server")
                        }))
                    }

                    function I() {
                        var e = n.find((function(e) {
                            return String(e.id) === String(C)
                        }));
                        fetch("/api/traxmate/run", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(e)
                        }).then((function(e) {
                            return e.json()
                        })).then((function(e) {
                            return console.log(e), e.success ? (g(!0), t(!0, "success", "Positioning engine started successfully")) : t(!0, "danger", e.message), e
                        })).catch((function(e) {
                            console.log(e), t(!0, "danger", "Could not start Positioning Engine")
                        }))
                    }

                    function z(e) {
                        C = e.target.value
                    }

                    function A() {
                        return o.a.createElement("div", null, n.map((function(e) {
                            var t;
                            return t = e.id, C = t, o.a.createElement(O.a, {
                                style: {
                                    margin: 30
                                }
                            }, " ", o.a.createElement("input", {
                                type: "radio",
                                key: e.id,
                                value: e.id,
                                name: "building",
                                checked: !0,
                                onClick: z,
                                onChange: z
                            }), e.address)
                        })))
                    }
                    return Object(a.useEffect)((function() {
                        k()
                    }), []), i ? o.a.createElement("div", null, o.a.createElement(S, {
                        connectionConfig: r
                    })) : o.a.createElement(w.a, null, o.a.createElement(O.a, null, o.a.createElement("h4", null, "Found ", E, " anchors. Select a building and then go to", " ", o.a.createElement("a", {
                        href: "https://online.traxmate.io",
                        target: "_blank",
                        style: {
                            color: "#FE6D58",
                            textDecorationLine: "underline"
                        }
                    }, "Traxmate"), " ", "to configure it.")), A(), o.a.createElement(O.a, {
                        style: {
                            margin: 30
                        }
                    }, o.a.createElement(x.a, {
                        block: !0,
                        size: "lg",
                        variant: "danger",
                        type: "submit",
                        disabled: d && p || E < 2,
                        onClick: I
                    }, "Run Position Engine for the selected building")), o.a.createElement(O.a, {
                        style: {
                            margin: 30
                        }
                    }, o.a.createElement(x.a, {
                        block: !0,
                        size: "lg",
                        variant: "danger",
                        type: "submit",
                        disabled: d || E < 2,
                        onClick: j
                    }, "Add new building model to the selected building")), o.a.createElement(O.a, {
                        style: {
                            margin: 30,
                            justifyContent: "center"
                        }
                    }, o.a.createElement(x.a, {
                        block: !0,
                        size: "lg",
                        variant: "danger",
                        style: {
                            width: "50%"
                        },
                        disabled: d,
                        onClick: k
                    }, "Rescan anchors")), o.a.createElement("div", {
                        className: "container",
                        style: {
                            marginTop: 100
                        }
                    }, o.a.createElement("div", {
                        className: "row-lg-6"
                    }, o.a.createElement("div", {
                        className: "border border-danger rounded"
                    }, o.a.createElement("legend", null, "First time setup"), o.a.createElement("p", {
                        className: "text-left",
                        style: {
                            marginLeft: 20
                        },
                        id: "innerPara"
                    }, o.a.createElement("li", null, "Use the Building already setup for you in Traxmate or add a new one"), o.a.createElement("li", null, "Add a building model manually in Traxmate or upload one using the button above"), o.a.createElement("li", null, "Configure the building model in Traxmate, by placing and configuring the anchors"), o.a.createElement("li", null, "Publish the building model"), o.a.createElement("li", null, "Now you are ready to run the positioning engine"))))))
                },
                Q = function(e) {
                    var t = Object(a.useState)(!1),
                        n = Object(Y.a)(t, 2),
                        r = n[0],
                        l = n[1],
                        s = Object(a.useState)([]),
                        c = Object(Y.a)(s, 2),
                        u = c[0],
                        h = c[1],
                        d = Object(a.useState)(!1),
                        g = Object(Y.a)(d, 2),
                        m = g[0],
                        f = g[1],
                        p = Object(a.useState)(!1),
                        y = Object(Y.a)(p, 2),
                        b = y[0],
                        v = y[1],
                        E = o.a.createElement("h6", {
                            style: {
                                textDecorationLine: "underline"
                            },
                            onClick: function() {
                                return C()
                            }
                        }, "Are you new? Signup here"),
                        _ = o.a.createElement("h6", {
                            style: {
                                textDecorationLine: "underline"
                            },
                            onClick: function() {
                                return C()
                            }
                        }, "Already a member? Log in");

                    function C() {
                        l(!r), f(!m)
                    }
                    Object(a.useEffect)((function() {
                        e.alert(!1), e.alert(!0, "primary", o.a.createElement("strong", null, "This version of Positioning Engine requires u-locateEmbed 3.0.0 or later. Make sure to update all anchors.")), fetch("/api/ui", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                ui: "combain"
                            })
                        }).then((function(e) {
                            return e.json()
                        })), j()
                    }), []);
                    var x = function(e) {
                        j(), l(!1), f(!1)
                    };

                    function j() {
                        fetch("api/traxmate/setup", {
                            method: "GET"
                        }).then((function(e) {
                            return e.json()
                        })).then((function(e) {
                            e.isLoggedin ? (h(e.buildings), v(!0), l(!1), f(!1)) : l(!0)
                        })).catch((function(t) {
                            console.log(t), e.alert(!0, "danger", "Failed retrieving Traxmate info")
                        }))
                    }
                    return o.a.createElement("div", {
                        style: i.center
                    }, o.a.createElement(w.a, {
                        md: "6",
                        style: {
                            marginTop: 50,
                            color: "white",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center"
                        }
                    }, o.a.createElement(O.a, null, r ? o.a.createElement("div", {
                        className: "border border-danger rounded"
                    }, o.a.createElement("legend", null, "Either use Traxmate or the local UI (Map View tab)"), o.a.createElement("p", {
                        className: "text-left",
                        style: {
                            marginLeft: 20
                        },
                        id: "innerPara"
                    }, o.a.createElement("ul", null, o.a.createElement("li", null, "For Traxmate: login or create an account below, all configuration is done on the Traxmate website.")), o.a.createElement("ul", null, o.a.createElement("li", null, 'For local UI tracking: configure using the tabs "Floorplan", "Anchors" and "Map View".')), "Detailed manual for how to use the u-blox Positioning Engine follow ", o.a.createElement("a", {
                        href: "https://www.u-blox.com/en/docs/UBX-21006395",
                        target: "_blank"
                    }, "this link"), ".")) : null), o.a.createElement(O.a, {
                        style: {
                            margin: 10
                        }
                    }, m && o.a.createElement($, {
                        callback: x,
                        switchmenutext: _,
                        alert: e.alert
                    }), r && o.a.createElement(q, {
                        callback: x,
                        switchmenutext: E,
                        alert: e.alert
                    }), b && o.a.createElement(K, {
                        alert: e.alert,
                        buildings: u,
                        connectionConfig: e.connectionConfig
                    }))))
                },
                ee = function(e) {
                    Object(g.a)(n, e);
                    var t = Object(m.a)(n);

                    function n(e) {
                        var a;
                        return Object(u.a)(this, n), (a = t.call(this, e)).state = {
                            alert: {
                                show: !1,
                                type: "danger",
                                message: ""
                            },
                            connectionConfig: ""
                        }, a.dismissAlert = a.dismissAlert.bind(Object(d.a)(a)), a.setError = a.setError.bind(Object(d.a)(a)), a.setConnectionConfig = a.setConnectionConfig.bind(Object(d.a)(a)), a
                    }
                    return Object(h.a)(n, [{
                        key: "componentDidMount",
                        value: function() {
                            var e = this;
                            "" === this.state.connectionConfig && fetch("api/udp", {
                                method: "GET"
                            }).then((function(e) {
                                return e.json()
                            })).then((function(t) {
                                console.log(t), t.running ? e.setConnectionConfig("UDP") : e.setConnectionConfig("UART")
                            }))
                        }
                    }, {
                        key: "setError",
                        value: function(e, t, n, a) {
                            var o = this;
                            this.setState({
                                alert: {
                                    show: e,
                                    type: t,
                                    message: n
                                }
                            }), a && setTimeout((function() {
                                o.setState({
                                    alert: Object(c.a)(Object(c.a)({}, alert), {}, {
                                        show: !1
                                    })
                                })
                            }), a)
                        }
                    }, {
                        key: "dismissAlert",
                        value: function() {
                            var e = this.state.alert;
                            e.show = !1, this.setState({
                                alert: e
                            })
                        }
                    }, {
                        key: "setConnectionConfig",
                        value: function(e) {
                            e != this.state.connectionConfig && this.setState({
                                connectionConfig: e
                            })
                        }
                    }, {
                        key: "render",
                        value: function() {
                            return console.log(this.state.alert), o.a.createElement("div", {
                                className: "App"
                            }, o.a.createElement(f.a, {
                                onChange: this.dismissAlert
                            }, o.a.createElement("header", {
                                className: "App-header"
                            }, o.a.createElement("div", {
                                style: {
                                    backgroundColor: "#FE6D58"
                                }
                            }, o.a.createElement(y.a, {
                                expand: "sm",
                                collapseOnSelect: !0
                            }, o.a.createElement(y.a.Brand, {
                                as: f.b,
                                to: "/"
                            }, o.a.createElement("img", {
                                alt: "",
                                height: 30,
                                src: "/logo.png",
                                className: "d-inline-block align-top"
                            }), " ", o.a.createElement("span", null, "Pos Server")), o.a.createElement(y.a.Toggle, {
                                "aria-controls": "basic-navbar-nav"
                            }), o.a.createElement(y.a.Collapse, {
                                id: "basic-navbar-nav"
                            }, o.a.createElement(b.a, {
                                className: "mr-auto"
                            }, o.a.createElement("div", {
                                className: "border-right border-dark"
                            }, o.a.createElement(b.a.Link, {
                                as: f.b,
                                to: "/traxmate"
                            }, "TraxMate")), o.a.createElement(b.a.Link, {
                                as: f.b,
                                to: "/floorplan"
                            }, "Floorplan"), o.a.createElement(b.a.Link, {
                                as: f.b,
                                to: "/anchors"
                            }, "Anchors"), o.a.createElement(f.b, {
                                className: "nav-link",
                                to: "/run"
                            }, "Map View"), o.a.createElement("div", {
                                className: "border-left border-dark"
                            }, o.a.createElement(b.a.Link, {
                                as: f.b,
                                to: "/utils"
                            }, "Utils")))))), o.a.createElement(v.a, {
                                dismissible: !0,
                                show: this.state.alert.show,
                                variant: this.state.alert.type,
                                onClose: this.dismissAlert
                            }, this.state.alert.message), o.a.createElement(p.c, null, o.a.createElement(p.a, {
                                path: "/",
                                exact: !0
                            }, o.a.createElement(Q, {
                                alert: this.setError,
                                connectionConfig: this.state.connectionConfig
                            })), o.a.createElement(p.a, {
                                path: "/traxmate",
                                exact: !0
                            }, o.a.createElement(Q, {
                                alert: this.setError,
                                connectionConfig: this.state.connectionConfig
                            })), o.a.createElement(p.a, {
                                path: "/floorplan",
                                exact: !0
                            }, o.a.createElement(D, {
                                alert: this.setError
                            })), o.a.createElement(p.a, {
                                path: "/anchors",
                                exact: !0
                            }, o.a.createElement(k, {
                                alert: this.setError,
                                connectionConfig: this.state.connectionConfig
                            })), o.a.createElement(p.a, {
                                path: "/run",
                                exact: !0
                            }, o.a.createElement(X, {
                                alert: this.setError,
                                connectionConfig: this.state.connectionConfig
                            })), o.a.createElement(p.a, {
                                path: "/utils",
                                exact: !0
                            }, o.a.createElement(Z, {
                                alert: this.setError,
                                setConnectionConfig: this.setConnectionConfig
                            }))))))
                        }
                    }]), n
                }(o.a.Component);
            Boolean("localhost" === window.location.hostname || "[::1]" === window.location.hostname || window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));
            l.a.render(o.a.createElement("div", null, o.a.createElement(ee, null)), document.getElementById("root")), "serviceWorker" in navigator && navigator.serviceWorker.ready.then((function(e) {
                e.unregister()
            })).catch((function(e) {
                console.error(e.message)
            }))
        },
        89: function(e, t, n) {
            e.exports = n(149)
        },
        93: function(e, t, n) {},
        96: function(e, t, n) {}
    },
    [
        [89, 1, 2]
    ]
]);
//# sourceMappingURL=main.9dffd466.chunk.js.map