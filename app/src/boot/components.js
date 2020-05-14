import BaseButton from 'components/BaseButton';
import BaseInput from 'components/BaseInput';
import LoadingSpinner from 'components/LoadingSpinner';

// "async" is optional
export default async ({ Vue /* app, router, store, ... */ }) => {
  Vue.component('base-button', BaseButton);
  Vue.component('base-input', BaseInput);
  Vue.component('loading-spinner', LoadingSpinner);
};
