import ConfigureDelegation from './ConfigureDelegation';
import { partialApply } from '~/utils/componentHelpers';

const UpdateDelegation = partialApply(ConfigureDelegation, { isUpdate: true });
export default UpdateDelegation;
