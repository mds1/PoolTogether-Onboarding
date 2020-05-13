<template>
  <div>
    <q-btn
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
      default: false,
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
