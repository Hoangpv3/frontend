<script setup lang="ts">
import dayjs from 'dayjs';
import { LikeFilled, LikeOutlined, DislikeFilled, DislikeOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';
// import relativeTime from 'dayjs/plugin/relativeTime';
// dayjs.extend(relativeTime);

const props = defineProps({
  comment: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    required: true
  }
});

const likes = ref<number>(0);
const dislikes = ref<number>(0);
const action = ref<string>();

const like = () => {
  likes.value = 1;
  dislikes.value = 0;
  action.value = 'liked';
};

const dislike = () => {
  likes.value = 0;
  dislikes.value = 1;
  action.value = 'disliked';
};
</script>

<template>
  <a-comment>
    <template #actions>
      <span key="comment-basic-like">
        <a-tooltip title="Like">
          <template v-if="action === 'liked'">
            <LikeFilled @click="like" />
          </template>
          <template v-else>
            <LikeOutlined @click="like" />
          </template>
        </a-tooltip>
        <span style="padding-left: 8px; cursor: auto">
          {{ likes }}
        </span>
      </span>

      <span key="comment-basic-dislike">
        <a-tooltip title="Dislike">
          <template v-if="action === 'disliked'">
            <DislikeFilled @click="dislike" />
          </template>
          <template v-else>
            <DislikeOutlined @click="dislike" />
          </template>
        </a-tooltip>
        <span style="padding-left: 8px; cursor: auto">
          {{ dislikes }}
        </span>
      </span>

      <!-- <span key="comment-basic-reply-to">Reply to</span> -->
    </template>
    <template #author
      ><a>{{ username }}</a></template
    >
    <!-- avatar icon -->
    <template #avatar>
      <a-avatar style="color: #f56a00; background-color: #fde3cf">{{
        username.slice(0, 1)
      }}</a-avatar>
    </template>

    <!-- comment content-->
    <template #content>
      <p>
        {{ comment }}
      </p>
    </template>
    <template #datetime>
      <span>{{ dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss') }}</span>
      <!-- <a-tooltip :title="dayjs().format('YYYY-MM-DD HH:mm:ss')">
      </a-tooltip> -->
    </template>
  </a-comment>
</template>

<style scoped>
:deep(.ant-comment-actions) {
  margin: 0px;
}
</style>
