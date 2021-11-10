import { Point, Vertex } from "./struct.js";
export { drawSolid };
function assert(value) {
    if (!value)
        throw new Error("Error!");
}
var OBJ = /** @class */ (function () {
    function OBJ() {
        this.v = [];
        this.f = [];
    }
    return OBJ;
}());
function getobj(obj) {
    var ans = "";
    for (var i = 0; i < obj.v.length; i++) {
        ans = ans + ("v " + obj.v[i].x + " " + obj.v[i].y + " " + obj.v[i].z + "\n");
    }
    for (var i = 0; i < obj.f.length; i++) {
        ans = ans + "f ";
        for (var j = 0; j < obj.f[i].length; j++)
            ans = ans + (obj.f[i][j] + " ");
        ans = ans + "\n";
    }
    return ans;
}
function triangulate(scene) {
    var idmap = {};
    var plist = [];
    var trilist = [];
    for (var idx in scene.vdict) {
        var vert = scene.vdict[idx];
        plist.push(vert);
        idmap[idx] = plist.length - 1;
    }
    function randomTransVert(v, trans1, trans2) {
        var xx = v.x * trans1.x + v.y * trans1.y + v.z * trans1.z;
        var yy = v.y * trans2.x + v.y * trans2.y + v.z * trans2.z;
        var nvert = new Vertex(new Point(xx, yy, 0.0));
        nvert.id = v.id;
        return nvert;
    }
    for (var si = 0; si < scene.solids.length; si++) {
        var nowSolid = scene.solids[si];
        for (var fi = 0; fi < nowSolid.faces.length; fi++) {
            var nowFace = nowSolid.faces[fi];
            // loops[0] contour
            var nowLoop = nowFace.loops[0];
            var contour = [];
            var foo = nowLoop.bgEdge;
            var trans1 = new Point(0.432, 1.432, 0.893);
            var trans2 = new Point(0.932, 1.232, 1.23);
            do {
                assert(!(!foo || !foo.next || !foo.vert));
                contour.push(randomTransVert(foo.vert, trans1, trans2));
                foo = foo.next;
            } while (foo !== nowLoop.bgEdge);
            var swctx = new poly2tri.SweepContext(contour);
            // loop[i] hole
            var holes = [];
            for (var li = 1; li < nowFace.loops.length; li++) {
                nowLoop = nowFace.loops[li];
                var hole = [];
                var foo_1 = nowLoop.bgEdge;
                do {
                    assert(!(!foo_1 || !foo_1.next || !foo_1.vert));
                    hole.push(randomTransVert(foo_1.vert, trans1, trans2));
                    foo_1 = foo_1.next;
                } while (foo_1 !== nowLoop.bgEdge);
                holes.push(hole);
            }
            swctx.addHoles(holes);
            swctx.triangulate();
            var triangles = swctx.getTriangles();
            triangles.forEach(function (tri) {
                var bar = [];
                tri.getPoints().forEach(function (p) {
                    bar.push(idmap[p.id] + 1);
                });
                trilist.push(bar);
            });
        }
    }
    var ans = { v: plist, f: trilist };
    return ans;
}
function drawSolid(scene, content) {
    content.split("\n").forEach(function (line) {
        var words = line.replace(/[(),]+/g, ' ').split(' ').filter(function (str) { return str; });
        if (words[0] === 'mvsf') {
            var idx = parseInt(words[1]);
            var _a = [parseFloat(words[2]), parseFloat(words[3]), parseFloat(words[4])], x = _a[0], y = _a[1], z = _a[2];
            var loopid = parseInt(words[5]);
            var faceid = parseInt(words[6]);
            assert(scene.mvsf(idx, new Point(x, y, z), loopid, faceid));
        }
        else if (words[0] === 'mev') {
            var _b = [parseInt(words[1]), parseInt(words[2])], idx = _b[0], idy = _b[1];
            var _c = [parseFloat(words[3]), parseFloat(words[4]), parseFloat(words[5])], x = _c[0], y = _c[1], z = _c[2];
            var loopid = parseInt(words[6]);
            var edgeid = parseInt(words[7]);
            assert(scene.mev(idx, idy, new Point(x, y, z), loopid, edgeid));
        }
        else if (words[0] === 'mef') {
            var _d = [parseInt(words[1]), parseInt(words[2])], idx = _d[0], idy = _d[1];
            var _e = [parseInt(words[3]), parseInt(words[4]), parseInt(words[5]), parseInt(words[6])], loopid = _e[0], edgeid = _e[1], faceid = _e[2], newloopid = _e[3];
            assert(scene.mef(idx, idy, loopid, edgeid, faceid, newloopid));
        }
        else if (words[0] === 'kemr') {
            var _f = [parseInt(words[1]), parseInt(words[2])], ide = _f[0], loopid = _f[1];
            var newloopid = parseInt(words[3]);
            assert(scene.kemr(ide, loopid, newloopid));
        }
        else if (words[0] === 'kfmrh') {
            var _g = [parseInt(words[1]), parseInt(words[2])], fs = _g[0], fl = _g[1];
            assert(scene.kfmrh(fs, fl));
        }
        else if (words[0] === 'sweep') {
            var _h = [parseFloat(words[1]), parseFloat(words[2]), parseFloat(words[3])], x = _h[0], y = _h[1], z = _h[2];
            assert(scene.sweep(new Point(x, y, z)));
        }
        else
            return;
    });
    var obj = triangulate(scene);
    assert(obj);
    var objstring = getobj(obj);
    console.log(scene);
    return objstring;
}
