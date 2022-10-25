import TinyQueue from 'tinyqueue';
import { MAX_FONT_SIZE } from '../config';

export const getFontSize = (width: number, height: number) => {
  return Math.min(MAX_FONT_SIZE, width / 2, height / 2);
};

export const getLocalTimeISOString = () => {
  const tzoffset = new Date().getTimezoneOffset() * 60000;
  const localISOString = new Date(Date.now() - tzoffset)
    .toISOString()
    .slice(0, -5);
  return localISOString;
};

export const getArea = (points: { x: number; y: number }[]) => {
  const l = points.length;

  const area = points.reduce((ar, pt, i) => {
    const { x: addX, y: subY } = pt;
    const { x: subX, y: addY } = points[(i + 1) % l];

    ar += addX * addY * 0.5;
    ar -= subX * subY * 0.5;

    return ar;
  }, 0);

  return Math.abs(area);
};

// utils for caclculating polygon relationships: intersect / contain
// line/segment intersection ab & cd
export const calcIntersection = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
  d: { x: number; y: number },
  tol: number = 0 //tolerance
): [boolean, string, string | null] => {
  const dist = {
    ab: Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2),
    ac: Math.sqrt((c.x - a.x) ** 2 + (c.y - a.y) ** 2),
    ad: Math.sqrt((d.x - a.x) ** 2 + (d.y - a.y) ** 2),
    cd: Math.sqrt((d.x - c.x) ** 2 + (d.y - c.y) ** 2),
    bc: Math.sqrt((c.x - b.x) ** 2 + (c.y - b.y) ** 2),
    bd: Math.sqrt((d.x - b.x) ** 2 + (d.y - b.y) ** 2),
  };

  const ab = { x: b.x - a.x, y: b.y - a.y };
  const ac = { x: c.x - a.x, y: c.y - a.y };
  const ad = { x: d.x - a.x, y: d.y - a.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  const bd = { x: d.x - b.x, y: d.y - b.y };
  const cd = { x: d.x - c.x, y: d.y - c.y };

  const tol_ab = tol * dist.ab;
  const tol_cd = tol * dist.cd;

  const abac = ab.x * ac.y - ab.y * ac.x;
  const abad = ab.x * ad.y - ab.y * ad.x;
  const c_on_ab = Math.abs(abac) <= tol_ab;
  const d_on_ab = Math.abs(abad) <= tol_ab;

  if (c_on_ab || d_on_ab) {
    const abbc_ = ab.x * bc.x + ab.y * bc.y;
    const baac_ = -ab.x * ac.x - ab.y * ac.y;
    const abbd_ = ab.x * bd.x + ab.y * bd.y;
    const baad_ = -ab.x * ad.x - ab.y * ad.y;

    const c_in_ab =
      c_on_ab &&
      ((abbc_ <= 0 && baac_ <= 0) || dist.bc <= tol || dist.ac <= tol);
    const d_in_ab =
      d_on_ab &&
      ((abbd_ <= 0 && baad_ <= 0) || dist.bd <= tol || dist.ad <= tol);

    // weak intersection/separation both treated as weak separation
    // acdb, adcb
    if (c_in_ab && d_in_ab) return [false, 'weak', 'line-cd'];

    // acbd, dacb, acb
    if (c_in_ab) {
      if (d_on_ab) return [false, 'weak', 'line-c'];
      return [false, 'weak', 'point-c'];
    }

    // adbc, cadb, adb
    if (d_in_ab) {
      if (c_on_ab) return [false, 'weak', 'line-d'];
      return [false, 'weak', 'point-d'];
    }

    // cabd, dabc
    if (c_on_ab && d_on_ab) {
      const acad_ = ac.x * ad.x + ac.y * ad.y;
      if (acad_ < 0) return [false, 'weak', 'line-ab'];
    }

    return [false, 'strong', null];
  }

  // strong separation
  if ((abac < -tol_ab && abad < -tol_ab) || (abac > tol_ab && abad > tol_ab))
    return [false, 'strong', null];

  const cdca = -cd.x * ac.y + cd.y * ac.x;
  const cdcb = -cd.x * bc.y + cd.y * bc.x;
  const a_on_cd = Math.abs(cdca) <= tol_cd;
  const b_on_cd = Math.abs(cdcb) <= tol_cd;

  if (a_on_cd || b_on_cd) {
    const cdda_ = -cd.x * ad.x - cd.y * ad.y;
    const dcca_ = cd.x * ac.x + cd.y * ac.y;
    const cddb_ = -cd.x * bd.x - cd.y * bd.y;
    const dccb_ = cd.x * bc.x + cd.y * bc.y;

    const a_in_cd =
      a_on_cd &&
      ((cdda_ <= 0 && dcca_ <= 0) || dist.ac <= tol || dist.ad <= tol);
    const b_in_cd =
      b_on_cd &&
      ((cddb_ <= 0 && dccb_ <= 0) || dist.bc <= tol || dist.bd <= tol);

    if (a_in_cd && b_in_cd) return [false, 'weak', 'line-ab'];

    if (a_in_cd) {
      if (b_on_cd) return [false, 'weak', 'line-a'];
      return [false, 'weak', 'point-a'];
    }

    if (b_in_cd) {
      if (a_on_cd) return [false, 'weak', 'line-b'];
      return [false, 'weak', 'point-b'];
    }

    if (a_on_cd && b_on_cd) {
      const cacb_ = ac.x * bc.x + ac.y * bc.y;
      if (cacb_ < 0) return [false, 'weak', 'line-cd'];
    }

    return [false, 'stong', null];
  }

  // strong separation
  if ((cdca < -tol_cd && cdcb < -tol_cd) || (cdca > tol_cd && cdcb > tol_cd))
    return [false, 'strong', null];

  // strong intersection
  return [true, 'strong', null];
};

interface EndpointIF {
  x: number;
  y: number;
  ipoly: number;
  ipoint: number;
  startOf: number[];
  endOf: number[];
}

interface SegmentIF {
  pt0: { x: number; y: number };
  pt1: { x: number; y: number };
  ipoly: number;
  iline: number;
  t?: number;
}

export const analyzeHoles = (
  mask: { x: number; y: number }[],
  holes: { x: number; y: number }[][],
  tol: number = 0
) => {
  // event datastructure
  const maskEndpoints: EndpointIF[] = mask.map((pt, j) => ({
    ...pt,
    ipoly: 0,
    ipoint: j,
    startOf: [],
    endOf: [],
  }));

  const holesEndpoints: EndpointIF[][] = holes.map((path, i) =>
    path.map((pt, j) => ({
      ...pt,
      ipoly: i,
      ipoint: j,
      startOf: [],
      endOf: [],
    }))
  );

  // segments datastructure
  const maskSegments: SegmentIF[][] = [
    Array.from({ length: mask.length }, (_, j) => {
      const j_nxt = j === mask.length - 1 ? 0 : j + 1;
      const pt0_: { x: number; y: number } = { ...mask[j] };
      const pt1_: { x: number; y: number } = { ...mask[j_nxt] };

      // enforce pt0 to be the upper-left endpoint to simplify
      // the comparator logic for segments queue
      const [pt0, pt1] =
        pt0_.y === pt1_.y
          ? pt0_.x <= pt1_.x
            ? [pt0_, pt1_]
            : [pt1_, pt0_]
          : pt0_.y < pt1_.y
          ? [pt0_, pt1_]
          : [pt1_, pt0_];

      // build correlations between events and segments so
      // given an event, we know how to find segments starting/ending
      // at this event point
      if (pt0 === pt0_) {
        maskEndpoints[j].startOf.push(j);
        maskEndpoints[j_nxt].endOf.push(j);
      } else {
        maskEndpoints[j].endOf.push(j);
        maskEndpoints[j_nxt].startOf.push(j);
      }

      return {
        pt0,
        pt1,
        ipoly: 0,
        iline: j,
      };
    }),
  ];

  const holesSegments: SegmentIF[][] = holes.map((hole, i) => {
    const l = hole.length;
    return Array.from({ length: l }, (_, j) => {
      const j_nxt = j === l - 1 ? 0 : j + 1;
      const pt0_: { x: number; y: number } = { ...hole[j] };
      const pt1_: { x: number; y: number } = { ...hole[j_nxt] };

      const [pt0, pt1] =
        pt0_.y === pt1_.y
          ? pt0_.x <= pt1_.x
            ? [pt0_, pt1_]
            : [pt1_, pt0_]
          : pt0_.y < pt1_.y
          ? [pt0_, pt1_]
          : [pt1_, pt0_];

      if (pt0 === pt0_) {
        holesEndpoints[i][j].startOf.push(j);
        holesEndpoints[i][j_nxt].endOf.push(j);
      } else {
        holesEndpoints[i][j].endOf.push(j);
        holesEndpoints[i][j_nxt].startOf.push(j);
      }

      return {
        pt0,
        pt1,
        ipoly: i,
        iline: j,
      };
    });
  });

  // build events queue
  const maskEventsQ = new TinyQueue<EndpointIF>(
    maskEndpoints,
    (pt0: { x: number; y: number }, pt1: { x: number; y: number }) => {
      return pt0.y === pt1.y ? pt0.x - pt1.x : pt0.y - pt1.y;
    }
  );

  const holesEventsQ = new TinyQueue<EndpointIF>(
    holesEndpoints.flat(),
    (pt0: { x: number; y: number }, pt1: { x: number; y: number }) => {
      return pt0.y === pt1.y ? pt0.x - pt1.x : pt0.y - pt1.y;
    }
  );

  // initialize an empty segments queue with comparator
  // - assumption for the comparator:
  //    pt0 is the upper-left point of a segment
  //    this assumption is embbeded when building the segments array
  // - algorithm specialized for polygon intersections:
  //    see Algorithm notes of https://github.com/rowanwins/sweepline-intersections
  //      * compare an entering segment with all queued segments
  //      * queue segments are sorted based on y value of its lower/right endpoint,
  //        then when the sweep line hit y value, segments end with that y value
  //        are on the top of the queue so can be easily poped
  //    this simplify the implementation:
  //      * simplified comparator
  //      * no need to search segment and its neighbors where deleting/adding segments
  const segmentsComparator = (
    seg0: {
      pt0: { x: number; y: number };
      pt1: { x: number; y: number };
    },
    seg1: {
      pt0: { x: number; y: number };
      pt1: { x: number; y: number };
    }
  ) => {
    return seg0.pt1.y === seg1.pt1.y
      ? seg0.pt1.x - seg1.pt1.x
      : seg0.pt1.y - seg1.pt1.y;
  };

  const maskSegmentsQ = new TinyQueue<SegmentIF>([], segmentsComparator);
  const holesSegmentsQ = new TinyQueue<SegmentIF>([], segmentsComparator);

  // analyze events and maintain segments queue
  let evtM = maskEventsQ.pop();
  let evtH = holesEventsQ.pop();
  const intersections: { sM: SegmentIF; sH: SegmentIF }[] = [];
  const closesections: { sM: SegmentIF; sH: SegmentIF; mode: string | null }[] =
    [];

  // at the same time calculate inner/outer/intersect/close
  // relations between mask and holes
  const rel = Array.from({ length: holes.length }).fill('unknown');

  while (evtH) {
    const sweepLineOnMask = evtM && evtM.y <= evtH.y + tol;
    const eventsQ = sweepLineOnMask ? maskEventsQ : holesEventsQ;
    const evt = sweepLineOnMask ? evtM! : evtH;

    const evts = [evt];
    let evt_ = eventsQ.pop();
    while (evt_?.x === evt?.x && evt_?.y === evt?.y) {
      evts.push(evt_);
      evt_ = eventsQ.pop();
    }

    const segments = sweepLineOnMask ? maskSegments : holesSegments;
    const [segmentsQ, segmentsQ_] = sweepLineOnMask
      ? [maskSegmentsQ, holesSegmentsQ]
      : [holesSegmentsQ, maskSegmentsQ];

    const starts: number[][] = [];
    const ends: number[][] = [];
    evts.forEach((e) => {
      const { ipoly, startOf, endOf } = e;
      startOf.forEach((j) => {
        const segment = segments[ipoly][j];
        segmentsQ.push(segment);
        starts.push([ipoly, j]);
      });
      endOf.forEach((j) => ends.push([ipoly, j]));
    });

    // dequeue lines end with y < evt.y - tol
    let seg_ = segmentsQ_.peek();
    while (seg_ && seg_.pt1.y < evt.y - tol) {
      segmentsQ_.pop();
      seg_ = segmentsQ_.peek();
    }

    // calculate intersections between new lines and
    // status-quo/snapshot of relavent segments upto evt.y +/- tol
    // from the other segments queue
    starts.forEach((s1_) => {
      const [i1, j1] = s1_;
      const s1 = segments[i1][j1];

      segmentsQ_.data.forEach((s0) => {
        const [sM, sH] = sweepLineOnMask ? [s1, s0] : [s0, s1];

        const { pt0: a, pt1: b } = sM;
        const { ipoly: iH, pt0: c, pt1: d } = sH;

        const [intersected, strongness, mode] = calcIntersection(
          a,
          b,
          c,
          d,
          tol
        );

        if (intersected) {
          intersections.push({ sM, sH });
          rel[iH] = 'intersected';
        } else if (strongness === 'weak') closesections.push({ sM, sH, mode });
      });
    });

    // calculate inner/outer mask-hole relation based on ending segments of holes
    if (!sweepLineOnMask) {
      ends.forEach((s1_) => {
        const [i1, j1] = s1_;

        if (rel[i1] === 'intersected') return;

        const s1 = segments[i1][j1];
        const { pt0: c, pt1: d } = s1;

        // track number of mask segments that are
        // on the right side of current hole ending segment
        let n = 0;
        let ignore = false;

        for (const s0 of segmentsQ_.data) {
          const { pt0: a, pt1: b } = s0;
          const [intersected, strongness, mode] = calcIntersection(
            a,
            b,
            c,
            d,
            tol
          );

          // when ending line is parallel and has overlap with mask boundary
          // then we are not confident about which side it is with respect to
          // mask boundary, especially when considering tolerance margin
          if (
            intersected ||
            (strongness === 'weak' && mode?.includes('line'))
          ) {
            ignore = true;
            break;
          }

          const ab = { x: b.x - a.x, y: b.y - a.y };
          const ac = { x: c.x - a.x, y: c.y - a.y };
          const ad = { x: d.x - a.x, y: d.y - a.y };

          const abac = ab.x * ac.y - ab.y * ac.x;
          const abad = ab.x * ad.y - ab.y * ad.x;

          // use the hole segment endpoint that has larger perpendicular distance
          // to the mask segment for more confident clockwise/anti-closewise
          // calculation, especially when considering one point is on/near mask segment
          if (Math.min(abac, abad) > 0) n++;
        }

        if (ignore) return;

        if (n % 2) rel[i1] = 'inner';
        else rel[i1] = 'outer';
      });
    }

    if (sweepLineOnMask) evtM = evt_;
    else evtH = evt_;
  }

  return { intersections, closesections, rel };
};
