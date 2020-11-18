import { INPUT_TYPES } from '../utils/constants';
import { default as GALLERY_CONSTS } from '../../common/constants';

export default {
  title: 'Item Shadow Color',
  isRelevant: (styleParams) =>
    styleParams.itemEnableShadow &&
    !styleParams.oneRow &&
    !(
      styleParams.cubeImages &&
      styleParams.cubeType === GALLERY_CONSTS.cubeType.FIT
    ) &&
    (styleParams.imageInfoType ===
      GALLERY_CONSTS.infoType.ATTACHED_BACKGROUND ||
      styleParams.titlePlacement === GALLERY_CONSTS.placements.SHOW_ON_HOVER),
  type: INPUT_TYPES.COLOR_PICKER,
  default: 'rgba(0,0,0,0.3)',
};
