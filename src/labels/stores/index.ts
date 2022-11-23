import { LabelType } from '../Base';
import { useKeypointsLabelStore } from '../Keypoints/store';

export const useLabelStores = () => {
  return {
    [LabelType.Keypoints]: useKeypointsLabelStore(),
  };
};
