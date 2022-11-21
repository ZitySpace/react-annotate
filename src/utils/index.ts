import {
  Label,
  LabelConfig,
  LabelType,
  PointLabel,
  LineLabel,
  BoxLabel,
  PolylineLabel,
  MaskLabel,
  KeypointsLabel,
} from '../labels';

import { Annotations } from '../interfaces/basic';

export const isTouchEvent = (event: React.TouchEvent | React.MouseEvent) =>
  // safari and firefox has no TouchEvent
  typeof TouchEvent !== 'undefined' && event instanceof TouchEvent;

export const groupBy = (annotations: Label[], property: string) => {
  const groupedAnnosObj = annotations.reduce(
    (groupedAnnos: Object, theAnno: Label) => {
      if (!groupedAnnos[theAnno[property]])
        groupedAnnos[theAnno[property]] = [];
      groupedAnnos[theAnno[property]].push(theAnno);
      return groupedAnnos;
    },
    {}
  );

  return Object.entries(groupedAnnosObj);
};

export const mostRepeatedValue = (array: any[]) =>
  array.sort(
    (a, b) =>
      array.filter((v) => v === b).length - array.filter((v) => v === a).length
  )[0];

export const placeAtLast = (
  array: string[],
  item: string,
  sort: boolean = true,
  unique: boolean = true
) => {
  const array_ = unique ? [...new Set(array)] : array;
  const idx = array_.indexOf(item);

  if (idx !== -1) array_.splice(idx, 1);

  return sort ? [...array_.sort(), item] : [...array_, item];
};

export const annosToLabels = (
  annos: Annotations,
  sharedLabelConfigs: {
    [key in Exclude<LabelType, LabelType.None>]?: LabelConfig;
  }
) => {
  const labels: Label[] = [];
  let id: number = 0;

  annos.forEach((anno) => {
    const { type: labelType } = anno;

    let label: Label;

    if (labelType === LabelType.Point) {
      label = new PointLabel({ ...anno, id });
    } else if (labelType === LabelType.Line) {
      label = new LineLabel({ ...anno, id });
    } else if (labelType === LabelType.Box) {
      label = new BoxLabel({ ...anno, id });
    } else if (labelType === LabelType.Polyline) {
      label = new PolylineLabel({ ...anno, id });
    } else if (labelType === LabelType.Mask) {
      label = new MaskLabel({ ...anno, id });
    } else if (labelType === LabelType.Keypoints) {
      const config = sharedLabelConfigs[LabelType.Keypoints]!;
      label = new KeypointsLabel({ ...anno, id, config });
    } else return;

    labels.push(label);
    id++;
  });

  return labels;
};

export const labelsToAnnos = (labels: Label[]) => {
  const annos: Annotations = [];

  labels.forEach((label) => {
    let anno: any;

    if (label instanceof PointLabel) {
      const { x, y, category, id, timestamp, hash } = label;
      anno = { x, y, category, id, timestamp, hash, type: 'point' };
    } else if (label instanceof LineLabel) {
      const { x1, y1, x2, y2, category, id, timestamp, hash } = label;
      anno = { x1, y1, x2, y2, category, id, timestamp, hash, type: 'line' };
    } else if (label instanceof BoxLabel) {
      const { x, y, w, h, category, id, timestamp, hash } = label;
      anno = { x, y, w, h, category, id, timestamp, hash, type: 'box' };
    } else if (label instanceof PolylineLabel) {
      const { paths, category, id, timestamp, hash } = label;
      anno = { paths, category, id, timestamp, hash, type: 'polyline' };
    } else if (label instanceof MaskLabel) {
      const { paths, category, id, timestamp, hash } = label;
      anno = { paths, category, id, timestamp, hash, type: 'mask' };
    } else if (label instanceof KeypointsLabel) {
      const { keypoints, category, id, timestamp, hash } = label;
      anno = { keypoints, category, id, timestamp, hash, type: 'keypoints' };
    }

    if (anno) annos.push(anno);
  });

  return annos;
};
