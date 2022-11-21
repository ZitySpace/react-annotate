import {
  Label,
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

export const annosToLabels = (annos: Annotations) => {
  const labels: Label[] = [];
  let id: number = 0;

  for (const labelType in annos) {
    const labelCls =
      labelType === 'point'
        ? PointLabel
        : labelType === 'line'
        ? LineLabel
        : labelType === 'box'
        ? BoxLabel
        : labelType === 'polyline'
        ? PolylineLabel
        : labelType === 'mask'
        ? MaskLabel
        : labelType === 'keypoints'
        ? KeypointsLabel
        : null;

    if (!labelCls) continue;

    annos[labelType].forEach((anno: any) => {
      labels.push(new labelCls({ ...anno, id }));
      id++;
    });
  }

  return labels;
};

export const labelsToAnnos = (labels: Label[]) => {
  const annos: Annotations = {};

  labels.forEach((label) => {
    let labelType: string | null = null;
    let anno: any;

    if (label instanceof PointLabel) {
      labelType = 'point';
      const { x, y, category, id, timestamp, hash } = label;
      anno = { x, y, category, id, timestamp, hash };
    } else if (label instanceof LineLabel) {
      labelType = 'line';
      const { x1, y1, x2, y2, category, id, timestamp, hash } = label;
      anno = { x1, y1, x2, y2, category, id, timestamp, hash };
    } else if (label instanceof BoxLabel) {
      labelType = 'box';
      const { x, y, w, h, category, id, timestamp, hash } = label;
      anno = { x, y, w, h, category, id, timestamp, hash };
    } else if (label instanceof PolylineLabel) {
      labelType = 'polyline';
      const { paths, category, id, timestamp, hash } = label;
      anno = { paths, category, id, timestamp, hash };
    } else if (label instanceof MaskLabel) {
      labelType = 'mask';
      const { paths, category, id, timestamp, hash } = label;
      anno = { paths, category, id, timestamp, hash };
    } else if (label instanceof KeypointsLabel) {
      labelType = 'keypoints';
      const { keypoints, category, id, timestamp, hash } = label;
      anno = { keypoints, category, id, timestamp, hash };
    }

    if (!labelType) return;

    if (!annos.hasOwnProperty(labelType)) annos[labelType] = [anno];
    else annos[labelType].push(anno);
  });

  return annos;
};
