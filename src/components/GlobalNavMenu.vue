<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        icon
        color="white"
        :class="`mr-${marginRight}`"
        v-bind="attrs"
        v-on="on"
        @click="moveToTo"
      >
        <v-icon>{{ iconName }}</v-icon>
      </v-btn>
    </template>
    <span>{{ toolTipValue }}</span>
  </v-tooltip>
</template>
<script>
export default {
  props: {
    iconName: {
      type: String,
      required: true,
    },
    toolTipValue: {
      type: String,
      required: true,
    },
    marginRight: {
      type: String,
      default: "0",
    },
    to: {
      type: Object,
      required: false,
    },
  },
  methods: {
    moveToTo() {
      this.$router.push(this.to);
    },
  },
};
</script>
