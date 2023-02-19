import './styles/tailwind.css';
export { Annotator } from './components/Annotator';

export { ImageData, LabelConfigs, Annotations } from './interfaces/basic';
export {
  Label,
  LabelType,
  PointLabel,
  LineLabel,
  BoxLabel,
  MaskLabel,
  KeypointsLabel,
} from './labels';

export { ColorStore } from './stores/ColorStore';
