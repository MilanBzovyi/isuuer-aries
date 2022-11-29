<template>
  <div>転送ページです</div>
</template>
<script>
export default {
  created() {
    const params = document.location.search;
    console.log(params);
    // 後で外す。
    // document.location.href = "holder://invitation" + params;
  },
};
</script>
