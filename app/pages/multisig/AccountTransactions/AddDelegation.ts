import ConfigureDelegation from './ConfigureDelegation';
import { partialApply } from '~/utils/componentHelpers';

const AddDelegation = partialApply(ConfigureDelegation, { isUpdate: false });
export default AddDelegation;
