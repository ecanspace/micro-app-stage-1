<template>
  <div class="home">
    <section class="slider-section">
      <div class="img-box">
        <img src="https://image.tz12306.com/media/slide/imgs_online/96e9c8a8ca14da6e4d1d85ac13790720.png" class="bg-img" ref="bgImg" />
        <img src="https://image.tz12306.com/media/slide/imgs_online/04504c6baa3d170b94fcffcf4761670f.png" class="slider-img" ref="sliderImg" :style="{top: answerY/2 + 'px'}" />
      </div>
      <div class="slider-box">
        <span class="slider-text"></span>
        <div class="slider-icon" ref="sliderIcon" @mousedown="rangeMove">></div>
      </div>
    </section>
  </div>
</template>

<script>
// import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  data() {
    return {
      answerY: 177
    }
  },
  methods: {
    // 移动事件触发
    rangeMove(e) {
      this.addMouseMoveListener(e)
    },
    addMouseMoveListener(e) {
      let ele = e.target;
      let startX = e.clientX;
      let eleWidth = ele.offsetWidth;
      let parentWidth = ele.parentElement.offsetWidth;
      let MaxX = parentWidth - eleWidth;
      let sliderImg = this.$refs.sliderImg;
      document.onmousemove = e => {
        let endX = e.clientX;
        this.disX = endX - startX;
        sliderImg.style.left = this.disX + "px";
        if (this.disX <= 0) {
          this.disX = 0;
          sliderImg.style.left = 0;
        }
        if (this.disX >= MaxX) {
          //减去滑块的宽度,体验效果更好
          this.disX = MaxX;
          sliderImg.style.left = parentWidth - sliderImg.width + "px";
          this.$refs.sliderImg.transition = "inherit";
        }
        ele.style.transition = "inherit";
        ele.style.transform = "translateX(" + this.disX + "px)";
        e.preventDefault();
      };
      document.onmouseup = e => {
        setTimeout(() => {
          ele.style.transition = "inherit"; // 初始化滑块位置
          // ele.style.transform = "translateX(0)";
          let data = {
            x: parseFloat(sliderImg.style.left) * 2,
            y: parseFloat(sliderImg.style.top) * 2
          };
          this.$emit("loginCheck", data);
          this.$router.push("/about")
          // sliderImg.style.left = 0;
        }, 100);
        document.onmousemove = null;
        document.onmouseup = null;
      };
    }
  },
}
</script>

<style scoped>
.main {
  width: 500px;
  height: 400px;
  position: fixed;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2001;
}
.slider-section {
  margin: 0 auto;
  width: 300px;
}

.slider-section .img-box {
  position: relative;
  text-align: center;
}

.slider-section .bg-img {
  width: 300px;
  height: 160px;
}

.slider-section .slider-img {
  position: absolute;
  left: 0;
  width: 44px;
  height: 44px;
  z-index: 2001;
}

.slider-box {
  margin-top: 20px;
  background: #f7f9fa;
  color: #666;
  border: 1px solid #e4e7eb;
  position: relative;
  height: 30px;
  width: 100%;
  line-height: 30px;
  text-align: center;
}

.slider-box:hover {
  box-shadow: 0 0 3px #ccc;
}

.slider-box .slider-text {
  font-size: 14px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2001;
}

.slider-box .slider-icon {
  width: 44px;
  height: 30px;
  background: #c8923a;
  text-align: center;
  font-size: 20px;
  color: #fff;
  box-shadow: 0 0 6px #ccc;
  /* cursor: move; */
  cursor: pointer;
}
</style>
