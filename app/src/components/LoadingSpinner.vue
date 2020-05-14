<template>
  <div>
    <div class="row justify-center q-my-xl">
      <q-spinner
        color="secondary"
        size="3rem"
      />
      <div class="col-xs-12 text-center text-italic q-mt-md">
        Loading...
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  data() {
    return {};
  },
};
</script>
