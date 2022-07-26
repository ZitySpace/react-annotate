import { Label } from '../labels';

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
