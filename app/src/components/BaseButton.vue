<template>
  <div>
    <q-btn
      id="style"
      class="q-my-sm"
      :class="{'full-width': fullWidth}"
      :color="color"
      :dense="dense"
      :flat="flat"
      :label="label"
      :loading="loading"
      :outline="outline"
      :rounded="rounded"
      :size="size"
      style="min-width: 140px"
      @click="handleClick"
    />
  </div>
</template>

<script>
export default {
  name: 'BaseButton',

  props: {
    color: {
      type: String,
      required: false,
      default: 'secondary',
    },

    dense: {
      type: Boolean,
      required: false,
      default: false,
    },

    flat: {
      type: Boolean,
      required: false,
      default: true,
    },

    fullWidth: {
      type: Boolean,
      required: false,
      default: false,
    },

    label: {
      type: String,
      required: true,
      default: undefined,
    },

    loading: {
      type: Boolean,
      required: false,
      default: false,
    },

    outline: {
      type: Boolean,
      required: false,
      default: false,
    },

    rounded: {
      type: Boolean,
      required: false,
      default: true,
    },

    size: {
      type: String,
      required: false,
      default: undefined,
    },
  },

  methods: {
    handleClick() {
      this.$emit('click');
    },
  },
};
</script>

<style lang="sass" scoped>
#style
  border: 4px solid $secondary
  border-bottom-left-radius: 20% 100%
  border-bottom-right-radius: 20% 100%
  border-top-left-radius: 20% 100%
  border-top-right-radius: 20% 100%
  padding: 0 1rem
</style>
