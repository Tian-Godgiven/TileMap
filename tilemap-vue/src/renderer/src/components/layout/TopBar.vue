<script setup lang="ts">
import { useFileStore } from '../../stores/fileStore';
import TopAbility from '../top/TopAbility.vue';

const fileStore = useFileStore();
</script>

<template>
  <div class="top-bar">
    <div class="left">
      <div id="topArea_icon"></div>
      <div id="topArea_main">
        <div id="topArea_fileName">
          <span>{{ fileStore.fileName }}</span>
        </div>
        <div id="topArea_ability">
          <TopAbility />
        </div>
      </div>
    </div>

    <div id="topArea_user">
      <div id="topArea_userIcon">未登录</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.top-bar {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  .left{
    display: flex;
    flex-grow: 1;
  }
}

#topArea_icon {
  flex-shrink: 0;
  background-image: url('../../assets/img/icon.png');
  background-size: 80%;
  background-position: center;
  background-repeat: no-repeat;
  height: 120px;
  width: 120px;
}

#topArea_main {
  margin-top: auto;
  flex-grow: 1;
}

#topArea_fileName {
  height: 50px;
  font-size: 40px;
  font-weight: bold;
  padding-top: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1;
}

#topArea_ability {
  width: 100%;
  height: 38px;
  font-size: 20px;
  display: flex;
  align-items: center;
}

#topArea_user {
  width: 80px;
  height: 80px;
  position: absolute;
  right: 0;
  top: 0;
}

#topArea_userIcon {
  margin-top: 10px;
  margin-right: 10px;
  height: 65px;
  width: 65px;
  overflow: hidden;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  color: var(--color-unlog);
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
}
</style>
