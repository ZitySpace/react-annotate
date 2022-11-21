import './styles/tailwind.css';
export { Annotator } from './components/Annotator';

export { ImageData, LabelConfigs } from './interfaces/basic';
export {
  Label,
  PointLabel,
  LineLabel,
  BoxLabel,
  MaskLabel,
  KeypointsLabel,
} from './labels';

export { ColorStore } from './stores/ColorStore';
