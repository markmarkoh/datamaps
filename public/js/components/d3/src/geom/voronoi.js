import "../arrays/range";
import "../core/functor";
import "../math/trigonometry";
import "../svg/line";
import "delaunay";
import "geom";
import "polygon";

// Adapted from Nicolas Garcia Belmonte's JIT implementation:
// http://blog.thejit.org/2010/02/12/voronoi-tessellation/
// http://blog.thejit.org/assets/voronoijs/voronoi.js
// See lib/jit/LICENSE for details.

// Notes:
//
// This implementation does not clip the returned polygons, so if you want to
// clip them to a particular shape you will need to do that either in SVG or by
// post-processing with d3.geom.polygon's clip method.
//
// If any points are coincident or have NaN positions, the behavior of this
// method is undefined. Most likely invalid polygons will be returned. You
// should filter invalid points, and consolidate coincident points, before
// computing the tessellation.

/**
 * @param points [[x1, y1], [x2, y2], …]
 * @returns polygons [[[x1, y1], [x2, y2], …], …]
 */
d3.geom.voronoi = function(points) {
  var x = d3_svg_lineX,
      y = d3_svg_lineY,
      clipPolygon = null;

  // For backwards-compatibility.
  if (arguments.length) return voronoi(points);

  function voronoi(data) {
    var points,
        polygons = data.map(function() { return []; }),
        fx = d3_functor(x),
        fy = d3_functor(y),
        d,
        i,
        n = data.length,
        Z = 1e6;

    if (fx === d3_svg_lineX && fy === d3_svg_lineY) points = data;
    else for (points = new Array(n), i = 0; i < n; ++i) {
      points[i] = [+fx.call(this, d = data[i], i), +fy.call(this, d, i)];
    }

    d3_geom_voronoiTessellate(points, function(e) {
      var s1,
          s2,
          x1,
          x2,
          y1,
          y2;
      if (e.a === 1 && e.b >= 0) {
        s1 = e.ep.r;
        s2 = e.ep.l;
      } else {
        s1 = e.ep.l;
        s2 = e.ep.r;
      }
      if (e.a === 1) {
        y1 = s1 ? s1.y : -Z;
        x1 = e.c - e.b * y1;
        y2 = s2 ? s2.y : Z;
        x2 = e.c - e.b * y2;
      } else {
        x1 = s1 ? s1.x : -Z;
        y1 = e.c - e.a * x1;
        x2 = s2 ? s2.x : Z;
        y2 = e.c - e.a * x2;
      }
      var v1 = [x1, y1],
          v2 = [x2, y2];
      polygons[e.region.l.index].push(v1, v2);
      polygons[e.region.r.index].push(v1, v2);
    });

    // Connect edges into counterclockwise polygons without coincident points.
    polygons = polygons.map(function(polygon, i) {
      var cx = points[i][0],
          cy = points[i][1],
          angle = polygon.map(function(v) { return Math.atan2(v[0] - cx, v[1] - cy); }),
          order = d3.range(polygon.length).sort(function(a, b) { return angle[a] - angle[b]; });
      return order
          .filter(function(d, i) { return !i || (angle[d] - angle[order[i - 1]] > ε); })
          .map(function(d) { return polygon[d]; });
    });

    // Fix degenerate polygons.
    polygons.forEach(function(polygon, i) {
      var n = polygon.length;
      if (!n) return polygon.push([-Z, -Z], [-Z, Z], [Z, Z], [Z, -Z]);
      if (n > 2) return;

      var p0 = points[i],
          p1 = polygon[0],
          p2 = polygon[1],
          x0 = p0[0], y0 = p0[1],
          x1 = p1[0], y1 = p1[1],
          x2 = p2[0], y2 = p2[1],
          dx = Math.abs(x2 - x1), dy = y2 - y1;

      if (Math.abs(dy) < ε) { // 0°
        var y = y0 < y1 ? -Z : Z;
        polygon.push([-Z, y], [Z, y]);
      } else if (dx < ε) { // ±90°
        var x = x0 < x1 ? -Z : Z;
        polygon.push([x, -Z], [x, Z]);
      } else {
        var y = (x2 - x1) * (y1 - y0) < (x1 - x0) * (y2 - y1) ? Z : -Z,
            z = Math.abs(dy) - dx;
        if (Math.abs(z) < ε) { // ±45°
          polygon.push([dy < 0 ? y : -y, y]);
        } else {
          if (z > 0) y *= -1;
          polygon.push([-Z, y], [Z, y]);
        }
      }
    });

    if (clipPolygon) for (i = 0; i < n; ++i) clipPolygon.clip(polygons[i]);
    for (i = 0; i < n; ++i) polygons[i].point = data[i];

    return polygons;
  }

  voronoi.x = function(_) {
    return arguments.length ? (x = _, voronoi) : x;
  };

  voronoi.y = function(_) {
    return arguments.length ? (y = _, voronoi) : y;
  };

  voronoi.clipExtent = function(_) {
    if (!arguments.length) return clipPolygon && [clipPolygon[0], clipPolygon[2]];
    if (_ == null) clipPolygon = null;
    else {
      var x1 = +_[0][0], y1 = +_[0][1], x2 = +_[1][0], y2 = +_[1][1];
      clipPolygon = d3.geom.polygon([[x1, y1], [x1, y2], [x2, y2], [x2, y1]]);
    }
    return voronoi;
  };

  // @deprecated; use clipExtent instead
  voronoi.size = function(_) {
    if (!arguments.length) return clipPolygon && clipPolygon[2];
    return voronoi.clipExtent(_ && [[0, 0], _]);
  };

  voronoi.links = function(data) {
    var points,
        graph = data.map(function() { return []; }),
        links = [],
        fx = d3_functor(x),
        fy = d3_functor(y),
        d,
        i,
        n = data.length;

    if (fx === d3_svg_lineX && fy === d3_svg_lineY) points = data;
    else for (points = new Array(n), i = 0; i < n; ++i) {
      points[i] = [+fx.call(this, d = data[i], i), +fy.call(this, d, i)];
    }

    d3_geom_voronoiTessellate(points, function(e) {
      var l = e.region.l.index,
          r = e.region.r.index;
      if (graph[l][r]) return;
      graph[l][r] = graph[r][l] = true;
      links.push({source: data[l], target: data[r]});
    });

    return links;
  };

  voronoi.triangles = function(data) {
    if (x === d3_svg_lineX && y === d3_svg_lineY) return d3.geom.delaunay(data);

    var points = new Array(n),
        fx = d3_functor(x),
        fy = d3_functor(y),
        d,
        i = -1,
        n = data.length;

    while (++i < n) {
      (points[i] = [+fx.call(this, d = data[i], i), +fy.call(this, d, i)]).data = d;
    }

    return d3.geom.delaunay(points).map(function(triangle) {
      return triangle.map(function(point) {
        return point.data;
      });
    });
  };

  return voronoi;
};

var d3_geom_voronoiOpposite = {l: "r", r: "l"};

function d3_geom_voronoiTessellate(points, callback) {

  var Sites = {
    list: points
      .map(function(v, i) {
        return {
          index: i,
          x: v[0],
          y: v[1]
        };
      })
      .sort(function(a, b) {
        return a.y < b.y ? -1
          : a.y > b.y ? 1
          : a.x < b.x ? -1
          : a.x > b.x ? 1
          : 0;
      }),
    bottomSite: null
  };

  var EdgeList = {
    list: [],
    leftEnd: null,
    rightEnd: null,

    init: function() {
      EdgeList.leftEnd = EdgeList.createHalfEdge(null, "l");
      EdgeList.rightEnd = EdgeList.createHalfEdge(null, "l");
      EdgeList.leftEnd.r = EdgeList.rightEnd;
      EdgeList.rightEnd.l = EdgeList.leftEnd;
      EdgeList.list.unshift(EdgeList.leftEnd, EdgeList.rightEnd);
    },

    createHalfEdge: function(edge, side) {
      return {
        edge: edge,
        side: side,
        vertex: null,
        "l": null,
        "r": null
      };
    },

    insert: function(lb, he) {
      he.l = lb;
      he.r = lb.r;
      lb.r.l = he;
      lb.r = he;
    },

    leftBound: function(p) {
      var he = EdgeList.leftEnd;
      do {
        he = he.r;
      } while (he != EdgeList.rightEnd && Geom.rightOf(he, p));
      he = he.l;
      return he;
    },

    del: function(he) {
      he.l.r = he.r;
      he.r.l = he.l;
      he.edge = null;
    },

    right: function(he) {
      return he.r;
    },

    left: function(he) {
      return he.l;
    },

    leftRegion: function(he) {
      return he.edge == null
          ? Sites.bottomSite
          : he.edge.region[he.side];
    },

    rightRegion: function(he) {
      return he.edge == null
          ? Sites.bottomSite
          : he.edge.region[d3_geom_voronoiOpposite[he.side]];
    }
  };

  var Geom = {

    bisect: function(s1, s2) {
      var newEdge = {
        region: {"l": s1, "r": s2},
        ep: {"l": null, "r": null}
      };

      var dx = s2.x - s1.x,
          dy = s2.y - s1.y,
          adx = dx > 0 ? dx : -dx,
          ady = dy > 0 ? dy : -dy;

      newEdge.c = s1.x * dx + s1.y * dy
          + (dx * dx + dy * dy) * .5;

      if (adx > ady) {
        newEdge.a = 1;
        newEdge.b = dy / dx;
        newEdge.c /= dx;
      } else {
        newEdge.b = 1;
        newEdge.a = dx / dy;
        newEdge.c /= dy;
      }

      return newEdge;
    },

    intersect: function(el1, el2) {
      var e1 = el1.edge,
          e2 = el2.edge;
      if (!e1 || !e2 || (e1.region.r == e2.region.r)) {
        return null;
      }
      var d = (e1.a * e2.b) - (e1.b * e2.a);
      if (Math.abs(d) < 1e-10) {
        return null;
      }
      var xint = (e1.c * e2.b - e2.c * e1.b) / d,
          yint = (e2.c * e1.a - e1.c * e2.a) / d,
          e1r = e1.region.r,
          e2r = e2.region.r,
          el,
          e;
      if ((e1r.y < e2r.y) ||
         (e1r.y == e2r.y && e1r.x < e2r.x)) {
        el = el1;
        e = e1;
      } else {
        el = el2;
        e = e2;
      }
      var rightOfSite = (xint >= e.region.r.x);
      if ((rightOfSite && (el.side === "l")) ||
        (!rightOfSite && (el.side === "r"))) {
        return null;
      }
      return {
        x: xint,
        y: yint
      };
    },

    rightOf: function(he, p) {
      var e = he.edge,
          topsite = e.region.r,
          rightOfSite = (p.x > topsite.x);

      if (rightOfSite && (he.side === "l")) {
        return 1;
      }
      if (!rightOfSite && (he.side === "r")) {
        return 0;
      }
      if (e.a === 1) {
        var dyp = p.y - topsite.y,
            dxp = p.x - topsite.x,
            fast = 0,
            above = 0;

        if ((!rightOfSite && (e.b < 0)) ||
          (rightOfSite && (e.b >= 0))) {
          above = fast = (dyp >= e.b * dxp);
        } else {
          above = ((p.x + p.y * e.b) > e.c);
          if (e.b < 0) {
            above = !above;
          }
          if (!above) {
            fast = 1;
          }
        }
        if (!fast) {
          var dxs = topsite.x - e.region.l.x;
          above = (e.b * (dxp * dxp - dyp * dyp)) <
            (dxs * dyp * (1 + 2 * dxp / dxs + e.b * e.b));

          if (e.b < 0) {
            above = !above;
          }
        }
      } else /* e.b == 1 */ {
        var yl = e.c - e.a * p.x,
            t1 = p.y - yl,
            t2 = p.x - topsite.x,
            t3 = yl - topsite.y;

        above = (t1 * t1) > (t2 * t2 + t3 * t3);
      }
      return he.side === "l" ? above : !above;
    },

    endPoint: function(edge, side, site) {
      edge.ep[side] = site;
      if (!edge.ep[d3_geom_voronoiOpposite[side]]) return;
      callback(edge);
    },

    distance: function(s, t) {
      var dx = s.x - t.x,
          dy = s.y - t.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
  };

  var EventQueue = {
    list: [],

    insert: function(he, site, offset) {
      he.vertex = site;
      he.ystar = site.y + offset;
      for (var i=0, list=EventQueue.list, l=list.length; i<l; i++) {
        var next = list[i];
        if (he.ystar > next.ystar ||
          (he.ystar == next.ystar &&
          site.x > next.vertex.x)) {
          continue;
        } else {
          break;
        }
      }
      list.splice(i, 0, he);
    },

    del: function(he) {
      for (var i=0, ls=EventQueue.list, l=ls.length; i<l && (ls[i] != he); ++i) {}
      ls.splice(i, 1);
    },

    empty: function() { return EventQueue.list.length === 0; },

    nextEvent: function(he) {
      for (var i=0, ls=EventQueue.list, l=ls.length; i<l; ++i) {
        if (ls[i] == he) return ls[i+1];
      }
      return null;
    },

    min: function() {
      var elem = EventQueue.list[0];
      return {
        x: elem.vertex.x,
        y: elem.ystar
      };
    },

    extractMin: function() {
      return EventQueue.list.shift();
    }
  };

  EdgeList.init();
  Sites.bottomSite = Sites.list.shift();

  var newSite = Sites.list.shift(), newIntStar;
  var lbnd, rbnd, llbnd, rrbnd, bisector;
  var bot, top, temp, p, v;
  var e, pm;

  while (true) {
    if (!EventQueue.empty()) {
      newIntStar = EventQueue.min();
    }
    if (newSite && (EventQueue.empty()
      || newSite.y < newIntStar.y
      || (newSite.y == newIntStar.y
      && newSite.x < newIntStar.x))) { //new site is smallest
      lbnd = EdgeList.leftBound(newSite);
      rbnd = EdgeList.right(lbnd);
      bot = EdgeList.rightRegion(lbnd);
      e = Geom.bisect(bot, newSite);
      bisector = EdgeList.createHalfEdge(e, "l");
      EdgeList.insert(lbnd, bisector);
      p = Geom.intersect(lbnd, bisector);
      if (p) {
        EventQueue.del(lbnd);
        EventQueue.insert(lbnd, p, Geom.distance(p, newSite));
      }
      lbnd = bisector;
      bisector = EdgeList.createHalfEdge(e, "r");
      EdgeList.insert(lbnd, bisector);
      p = Geom.intersect(bisector, rbnd);
      if (p) {
        EventQueue.insert(bisector, p, Geom.distance(p, newSite));
      }
      newSite = Sites.list.shift();
    } else if (!EventQueue.empty()) { //intersection is smallest
      lbnd = EventQueue.extractMin();
      llbnd = EdgeList.left(lbnd);
      rbnd = EdgeList.right(lbnd);
      rrbnd = EdgeList.right(rbnd);
      bot = EdgeList.leftRegion(lbnd);
      top = EdgeList.rightRegion(rbnd);
      v = lbnd.vertex;
      Geom.endPoint(lbnd.edge, lbnd.side, v);
      Geom.endPoint(rbnd.edge, rbnd.side, v);
      EdgeList.del(lbnd);
      EventQueue.del(rbnd);
      EdgeList.del(rbnd);
      pm = "l";
      if (bot.y > top.y) {
        temp = bot;
        bot = top;
        top = temp;
        pm = "r";
      }
      e = Geom.bisect(bot, top);
      bisector = EdgeList.createHalfEdge(e, pm);
      EdgeList.insert(llbnd, bisector);
      Geom.endPoint(e, d3_geom_voronoiOpposite[pm], v);
      p = Geom.intersect(llbnd, bisector);
      if (p) {
        EventQueue.del(llbnd);
        EventQueue.insert(llbnd, p, Geom.distance(p, bot));
      }
      p = Geom.intersect(bisector, rrbnd);
      if (p) {
        EventQueue.insert(bisector, p, Geom.distance(p, bot));
      }
    } else {
      break;
    }
  }//end while

  for (lbnd = EdgeList.right(EdgeList.leftEnd);
      lbnd != EdgeList.rightEnd;
      lbnd = EdgeList.right(lbnd)) {
    callback(lbnd.edge);
  }
}
