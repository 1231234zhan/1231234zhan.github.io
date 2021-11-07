var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
export { Point, Vertex, HalfEdge, Loop, Face, Solid, Scene };
function rand() {
    return Math.floor(Math.random() * 11451418);
}
function validid(id) {
    return id ? id : rand();
}
var Point = /** @class */ (function () {
    function Point(xx, yy, zz) {
        this.x = .0;
        this.y = .0;
        this.z = .0;
        this.x = xx;
        this.y = yy;
        this.z = zz;
    }
    return Point;
}());
function addPoint(a, b) {
    return new Point(a.x + b.x, a.y + b.y, a.z + b.z);
}
var Vertex = /** @class */ (function (_super) {
    __extends(Vertex, _super);
    function Vertex(p) {
        var _this = _super.call(this, p.x, p.y, p.z) || this;
        // c: Point;
        _this.id = 0; // id must larger than zero, id=0 is not valid!
        return _this;
    }
    return Vertex;
}(Point));
var HalfEdge = /** @class */ (function () {
    function HalfEdge() {
        this.id = 0; // twin halfedge will share same id
        this.next = null;
        this.prev = null;
        this.vert = null;
        this.floop = null;
        this.twin = null;
    }
    return HalfEdge;
}());
var Loop = /** @class */ (function () {
    function Loop() {
        this.id = 0;
        this.fface = null;
        this.bgEdge = null;
    }
    return Loop;
}());
var Face = /** @class */ (function () {
    function Face() {
        this.id = 0;
        this.fsolid = null;
        this.loops = [];
    }
    return Face;
}());
var Solid = /** @class */ (function () {
    function Solid() {
        this.faces = [];
    }
    return Solid;
}());
var Scene = /** @class */ (function () {
    function Scene() {
        this.solids = [];
        this.vdict = {};
        this.edict = {};
        this.ldict = {};
        this.fdict = {};
        this.vid = 10000;
    }
    Scene.prototype.mvsf = function (idx, p, loopid, faceid) {
        if (loopid === void 0) { loopid = rand(); }
        if (faceid === void 0) { faceid = rand(); }
        var solid = new Solid();
        var face = new Face();
        var loop = new Loop();
        var vert = new Vertex(p);
        vert.id = validid(idx);
        this.vdict[vert.id] = vert;
        this.solids.push(solid);
        solid.faces.push(face);
        face.loops.push(loop);
        loop.fface = face;
        loop.id = validid(loopid);
        this.ldict[loop.id] = loop;
        face.fsolid = solid;
        face.id = validid(faceid);
        this.fdict[face.id] = face;
        return loopid;
    };
    Scene.prototype.findVertEdgebyNext = function (pEdge, vert) {
        var _a;
        if (!pEdge)
            return null;
        var bgEdge = pEdge;
        do {
            if (((_a = pEdge.next) === null || _a === void 0 ? void 0 : _a.vert) === vert)
                return pEdge;
            pEdge = pEdge.next;
        } while (pEdge && pEdge !== bgEdge);
        return null;
    };
    Scene.prototype.findVertEdgebyPrev = function (pEdge, vert) {
        if (!pEdge)
            return null;
        var bgEdge = pEdge;
        do {
            if (pEdge.vert === vert)
                return pEdge;
            pEdge = pEdge.prev;
        } while (pEdge && pEdge !== bgEdge);
        return null;
    };
    Scene.prototype.mev = function (idx, idy, py, loopid, edgeid) {
        if (edgeid === void 0) { edgeid = rand(); }
        var vertx = this.vdict[idx];
        var nowLoop = this.ldict[loopid];
        if (!vertx)
            return false;
        var verty = new Vertex(py);
        verty.id = validid(idy);
        this.vdict[verty.id] = verty;
        var edgex = new HalfEdge();
        var edgey = new HalfEdge();
        edgey.id = edgex.id = validid(edgeid);
        this.edict[edgey.id] = edgex;
        edgex.vert = vertx;
        edgey.vert = verty;
        edgex.twin = edgey;
        edgey.twin = edgex;
        edgex.floop = nowLoop;
        edgey.floop = nowLoop;
        if (nowLoop.bgEdge === null) {
            nowLoop.bgEdge = edgey;
            edgex.next = edgex.prev = edgey;
            edgey.next = edgey.prev = edgex;
        }
        else {
            var prevVertxEdge = nowLoop.bgEdge;
            prevVertxEdge = this.findVertEdgebyNext(prevVertxEdge, vertx);
            var nextVertxEdge = prevVertxEdge === null || prevVertxEdge === void 0 ? void 0 : prevVertxEdge.next;
            if (!prevVertxEdge || !nextVertxEdge)
                return false;
            nextVertxEdge.prev = edgey;
            edgey.next = nextVertxEdge;
            prevVertxEdge.next = edgex;
            edgex.prev = prevVertxEdge;
            edgex.next = edgey;
            edgey.prev = edgex;
        }
        return loopid;
    };
    Scene.prototype.checkSameLoop = function (edge1, edge2) {
        var bgEdge = edge1;
        do {
            if (edge1 === edge2)
                return true;
            if (!edge1)
                return false;
            edge1 = edge1.next;
        } while (edge1 && edge1 !== bgEdge);
        return false;
    };
    Scene.prototype.mef = function (idx, idy, loopid, edgeid, faceid, newloopid) {
        var _a;
        if (edgeid === void 0) { edgeid = rand(); }
        if (faceid === void 0) { faceid = rand(); }
        if (newloopid === void 0) { newloopid = rand(); }
        var nowLoop = this.ldict[loopid];
        var vertx = this.vdict[idx];
        var verty = this.vdict[idy];
        if (!vertx || !verty)
            return false;
        var newFace = new Face;
        var newLoop = new Loop;
        var edgex = new HalfEdge();
        var edgey = new HalfEdge();
        edgey.id = edgex.id = validid(edgeid);
        this.edict[edgey.id] = edgex;
        edgex.vert = vertx;
        edgey.vert = verty;
        edgex.floop = nowLoop;
        edgey.floop = newLoop;
        edgex.twin = edgey;
        edgey.twin = edgex;
        var edgeXP = nowLoop.bgEdge;
        var edgeYP = nowLoop.bgEdge;
        edgeXP = this.findVertEdgebyNext(edgeXP, vertx);
        edgeYP = this.findVertEdgebyNext(edgeYP, verty);
        var edgeXN = edgeXP === null || edgeXP === void 0 ? void 0 : edgeXP.next;
        var edgeYN = edgeYP === null || edgeYP === void 0 ? void 0 : edgeYP.next;
        if (!edgeXN || !edgeXP || !edgeYN || !edgeYP)
            return false;
        edgex.prev = edgeXP;
        edgex.next = edgeYN;
        edgey.prev = edgeYP;
        edgey.next = edgeXN;
        edgeXP.next = edgex;
        edgeYP.next = edgey;
        edgeXN.prev = edgey;
        edgeYN.prev = edgex;
        newLoop.bgEdge = edgey;
        if (this.checkSameLoop(newLoop.bgEdge, nowLoop.bgEdge))
            nowLoop.bgEdge = edgex;
        // TODO: change new loop edges' floop
        newLoop.fface = newFace;
        newLoop.id = validid(newloopid);
        this.ldict[newLoop.id] = newLoop;
        newFace.loops.push(newLoop);
        var nowSolid = (_a = nowLoop.fface) === null || _a === void 0 ? void 0 : _a.fsolid;
        if (!nowSolid)
            return false;
        newFace.fsolid = nowSolid;
        newFace.id = validid(faceid);
        this.fdict[newFace.id] = newFace;
        nowSolid.faces.push(newFace);
        return newloopid;
    };
    Scene.prototype.kemr = function (ide, loopid, newloopid) {
        if (newloopid === void 0) { newloopid = rand(); }
        var nowLoop = this.ldict[loopid];
        var edgei = this.edict[ide];
        var edgej = edgei.twin;
        if (!edgei || !edgej)
            return false;
        var edgePi = edgei.prev;
        var edgeNi = edgei.next;
        var edgePj = edgej.prev;
        var edgeNj = edgej.next;
        if (!edgePi || !edgePj || !edgeNi || !edgeNj)
            return false;
        edgePi.next = edgeNj;
        edgeNj.prev = edgePi;
        edgeNi.prev = edgePj;
        edgePj.next = edgeNi;
        delete this.edict[ide];
        // without being refered, edgei and edgej should be deleted automaticly
        // check which loop is new loop
        var newLoop = new Loop;
        var faface = nowLoop.fface;
        if (!faface)
            return false;
        var verti = edgei.vert;
        var vertj = edgej.vert;
        if (!verti || !vertj)
            return false;
        var foo = nowLoop.bgEdge;
        var bar = nowLoop.bgEdge;
        foo = this.findVertEdgebyPrev(foo, verti);
        bar = this.findVertEdgebyPrev(bar, vertj);
        if (foo) {
            // vertj at new loop
            newLoop.bgEdge = edgePj;
        }
        else if (bar) {
            // verti at new loop
            newLoop.bgEdge = edgePi;
        }
        else
            return false;
        newLoop.fface = faface;
        faface.loops.push(newLoop);
        newLoop.id = validid(newloopid);
        this.ldict[newLoop.id] = newLoop;
        return newloopid;
    };
    Scene.prototype.kfmrh = function (fs, fl) {
        var faceS = this.fdict[fs];
        var faceL = this.fdict[fl];
        // only one loop is allowed to exist in small face
        if (faceS.loops.length != 1)
            return false;
        var loopS = faceS.loops[0];
        faceS.loops.splice(0, 1);
        faceL.loops.push(loopS);
        loopS.fface = faceL;
        // delete faceS
        delete this.fdict[fs];
        var nowSolid = faceS.fsolid;
        if (!nowSolid)
            return false;
        for (var i = 0; i < nowSolid.faces.length; i++)
            if (nowSolid.faces[i].id === faceS.id) {
                nowSolid.faces.splice(i, 1);
                return true;
            }
        return false;
    };
    Scene.prototype.sweepLoop = function (vec, loopid) {
        var nowLoop = this.ldict[loopid];
        var foo = nowLoop.bgEdge;
        var newVertList = [];
        var oldVertList = [];
        do {
            if (!foo || !foo.vert)
                return false;
            var idx = foo.vert.id;
            newVertList.push(this.vid);
            oldVertList.push(idx);
            this.vid += 1;
            foo = foo.next;
        } while (foo !== nowLoop.bgEdge);
        // make new vertex and edge
        for (var i = 0; i < oldVertList.length; i++) {
            var oldVert = this.vdict[oldVertList[i]];
            this.mev(oldVertList[i], newVertList[i], addPoint(oldVert, vec), loopid);
        }
        // make new face
        newVertList.push(newVertList[0]);
        for (var i = 1; i < newVertList.length; i++) {
            this.mef(newVertList[i - 1], newVertList[i], loopid);
        }
        return true;
    };
    // Use Point to represent sweep direction and length
    Scene.prototype.sweep = function (vec) {
        for (var si = 0; si < this.solids.length; si++) {
            var nowSolid = this.solids[si];
            // the largest face's index is 0
            var oldFaceNum = nowSolid.faces.length;
            var faceL = nowSolid.faces[0];
            this.sweepLoop(vec, faceL.loops[0].id);
            // normally, inner faces' index start from 2
            for (var i = 2; i < oldFaceNum; oldFaceNum--) {
                var faceS = nowSolid.faces[i];
                if (faceS.loops.length != 1)
                    return false;
                if (!this.sweepLoop(vec, faceS.loops[0].id))
                    return false;
                if (!this.kfmrh(faceS.id, faceL.id))
                    return false;
            }
        }
        return true;
    };
    return Scene;
}());
function test1() {
    var scene = new Scene();
    var p1 = new Point(0, 0, 0);
    var p2 = new Point(1, 0, 0);
    var p3 = new Point(0, 1, 0);
    var lid = scene.mvsf(1, p1, 1);
    if (lid === false)
        return;
    lid = scene.mev(1, 2, p2, lid);
    if (lid === false)
        return;
    lid = scene.mev(2, 3, p3, lid);
    if (lid === false)
        return;
    lid = scene.mef(1, 3, lid);
    if (lid === false)
        return;
    console.log(scene.solids[0]);
    console.log(scene.solids[0].faces[0]);
    console.log(scene.solids[0].faces[1]);
}
function test2() {
    var scene = new Scene();
    var p1 = new Point(0, 0, 0);
    var p2 = new Point(3, 0, 0);
    var p3 = new Point(0, 3, 0);
    var p4 = new Point(1, 1, 0);
    var p5 = new Point(2, 1, 0);
    var p6 = new Point(1, 2, 0);
    var lid = scene.mvsf(1, p1, 1, 20);
    if (lid === false)
        return;
    lid = scene.mev(1, 2, p2, lid, 11);
    if (lid === false)
        return;
    lid = scene.mev(2, 3, p3, lid, 12);
    if (lid === false)
        return;
    lid = scene.mef(1, 3, lid, 13, 21, 2);
    if (lid === false)
        return;
    lid = scene.mev(1, 4, p4, lid, 14);
    if (lid === false)
        return;
    lid = scene.mev(4, 5, p5, lid, 15);
    if (lid === false)
        return;
    lid = scene.mev(5, 6, p6, lid, 16);
    if (lid === false)
        return;
    lid = scene.mef(4, 6, lid, 17, 22, 3);
    if (lid === false)
        return;
    lid = scene.kemr(14, 2, 4);
    if (lid === false)
        return;
    // TODO : repeat id number identification
    console.log(scene.solids[0].faces[0]);
    console.log(scene.solids[0].faces[1]);
    console.log(scene.solids[0].faces[2]);
}
// test2();
