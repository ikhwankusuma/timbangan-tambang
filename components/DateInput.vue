<template>
  <div ref="input" class="input-field">
    <label
      v-if="input.label"
      :class="input.light ? 'light' : 'subtext'"
      class="label"
      >{{ input.label }}</label
    >
    <div class="input-container">
      <input
        v-model="model"
        :type="input.type"
        class="input"
        :class="input.readonly ? 'invincible' : ''"
        :placeholder="input.placeholder"
        :readonly="input.readonly || disabled"
        :tabindex="input.readonly || disabled ? '-1' : '0'"
        :autocomplete="input.autocomplete || ''"
        :style="input.icon ? '' : 'width: 100%; padding-left: 0.75rem;'"
        @blur="validate"
        @focus="openDd"
      />
      <div v-if="input.icon" class="icon-container">
        <v-icon class="icon">{{ input.icon }}</v-icon>
        <div class="divider"></div>
      </div>
      <div class="border"></div>
      <div
        v-if="input.selection && input.selection.length > 0"
        class="chevron-icon"
        :style="ddOpened ? 'transform: rotate(180deg)' : ''"
      >
        <v-icon class="icon">mdi-chevron-down</v-icon>
      </div>
    </div>
    <div v-if="input.rules" class="error-container">
      <div class="message">{{ message }}</div>
    </div>
    <div
      ref="dropDown"
      v-click-outside="{
        handler: closeDd,
        closeConditional: closeDdCondition,
      }"
      :class="ddOpened ? 'active' : ''"
      class="drop-down"
      :style="input.rightAlign ? 'left: auto; right: 0;' : ''"
    >
      <div class="control">
        <div ref="monthWrapper" class="month-view-wrapper">
          <div class="month-view prev">
            <span class="month">{{ prev ? months[prev.month] : 5 }}</span>
            <span class="year">{{ prev ? prev.year : 2021 }}</span>
          </div>
          <div class="month-view current">
            <span class="month">{{ current ? months[current.month] : 5 }}</span>
            <span class="year">{{ current ? current.year : 2021 }}</span>
          </div>
          <div class="month-view next">
            <span class="month">{{ next ? months[next.month] : 5 }}</span>
            <span class="year">{{ next ? next.year : 2021 }}</span>
          </div>
        </div>
        <div class="actions">
          <div
            v-ripple
            class="btn"
            :class="!input.allowYesterday && !allowPrevMonth ? 'disabled' : ''"
            @click="prevMonth"
          >
            <v-icon class="icon">mdi-chevron-left</v-icon>
          </div>
          <div
            v-ripple
            class="btn"
            style="margin-left: 0.5rem"
            @click="nextMonth"
          >
            <v-icon class="icon">mdi-chevron-right</v-icon>
          </div>
        </div>
      </div>
      <div class="days">
        <div v-for="n in 7" :key="n" class="day">
          {{ days[n - 1].slice(0, 3) }}
        </div>
      </div>
      <div ref="weeksWrapper" class="weeks-wrapper">
        <div class="weeks prev">
          <div v-for="n in 6" :key="n" class="week">
            <div v-for="m in 7" :key="m" class="day">
              <span
                v-if="
                  prevDays &&
                  prevDays[n - 1][m - 1] &&
                  isSameDay(prev.year, prev.month, prevDays[n - 1][m - 1])
                "
                class="same-day"
              ></span>
              <span
                v-if="
                  prevDays &&
                  prevDays[n - 1][m - 1] &&
                  selectedClass(prev.year, prev.month, prevDays[n - 1][m - 1])
                "
                :class="
                  selectedClass(prev.year, prev.month, prevDays[n - 1][m - 1])
                "
                class="select"
              ></span>
              <span
                v-if="prevDays && prevDays[n - 1][m - 1]"
                class="date"
                :class="
                  !input.allowYesterday &&
                  isYesterday(prev.year, prev.month, prevDays[n - 1][m - 1])
                    ? 'disabled'
                    : ''
                "
              >
                {{ prevDays[n - 1][m - 1] }}
              </span>
              <span v-else class="dot"></span>
            </div>
          </div>
        </div>
        <div class="weeks current">
          <div v-for="n in 6" :key="n" class="week">
            <div v-for="m in 7" :key="m" class="day">
              <span
                v-if="
                  currentDays &&
                  currentDays[n - 1][m - 1] &&
                  isSameDay(
                    current.year,
                    current.month,
                    currentDays[n - 1][m - 1]
                  )
                "
                class="same-day"
              ></span>
              <span
                v-if="
                  currentDays &&
                  currentDays[n - 1][m - 1] &&
                  selectedClass(
                    current.year,
                    current.month,
                    currentDays[n - 1][m - 1]
                  )
                "
                :class="
                  selectedClass(
                    current.year,
                    current.month,
                    currentDays[n - 1][m - 1]
                  )
                "
                class="select"
              ></span>
              <span
                v-if="currentDays && currentDays[n - 1][m - 1]"
                v-ripple
                class="date"
                :class="
                  !input.allowYesterday &&
                  isYesterday(
                    current.year,
                    current.month,
                    currentDays[n - 1][m - 1]
                  )
                    ? 'disabled'
                    : ''
                "
                @click="
                  selectDate(
                    current.year,
                    current.month,
                    currentDays[n - 1][m - 1]
                  )
                "
              >
                {{ currentDays[n - 1][m - 1] }}
              </span>
              <span v-else class="dot"></span>
            </div>
          </div>
        </div>
        <div class="weeks next">
          <div v-for="n in 6" :key="n" class="week">
            <div v-for="m in 7" :key="m" class="day">
              <span
                v-if="
                  nextDays &&
                  nextDays[n - 1][m - 1] &&
                  isSameDay(next.year, next.month, nextDays[n - 1][m - 1])
                "
                class="same-day"
              ></span>
              <span
                v-if="
                  nextDays &&
                  nextDays[n - 1][m - 1] &&
                  selectedClass(next.year, next.month, nextDays[n - 1][m - 1])
                "
                :class="
                  selectedClass(next.year, next.month, nextDays[n - 1][m - 1])
                "
                class="select"
              ></span>
              <span v-if="nextDays && nextDays[n - 1][m - 1]" class="date">
                {{ nextDays[n - 1][m - 1] }}
              </span>
              <span v-else class="dot"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="disabled" class="overlay"></div>
  </div>
</template>

<script>
import gsap from "gsap";

export default {
  props: {
    input: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      init: true,
      message: "",
      model: this.input.model || "",
      disabled: !!this.input.disabled,
      ddOpenedHandler: false,
      days: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
      months: [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ],
      current: null,
      today: null,
      todayObj: null,
      selectedObj: null,
    };
  },
  computed: {
    ddOpened() {
      return this.ddOpenedHandler;
    },
    currentDays() {
      if (!this.current) return null;
      return this.getDaysArr(this.current);
    },
    prev() {
      if (!this.current) return null;
      const isPrevYear = this.current.month === 0;
      return {
        month: !isPrevYear ? this.current.month - 1 : 11,
        year: !isPrevYear ? this.current.year : this.current.year - 1,
      };
    },
    prevDays() {
      if (!this.prev) return null;
      return this.getDaysArr(this.prev);
    },
    next() {
      if (!this.current) return null;
      const isNextYear = this.current.month === 11;
      return {
        month: !isNextYear ? this.current.month + 1 : 0,
        year: !isNextYear ? this.current.year : this.current.year + 1,
      };
    },
    nextDays() {
      if (!this.next) return null;
      return this.getDaysArr(this.next);
    },
    allowPrevMonth() {
      const { prev, today } = this;
      if (!prev) return false;
      const prevMonth = new Date(prev.year, prev.month + 1, 0);
      return prevMonth.valueOf() >= today.valueOf();
    },
    rootModel() {
      return this.input.model;
    },
  },
  watch: {
    ddOpened(val) {
      const {
        $refs: { input, dropDown },
      } = this;
      if (val) {
        const { height } = document.body.getBoundingClientRect();
        const { bottom, left } = input.getBoundingClientRect();
        const spaceX = window.innerWidth - left;
        const spaceY = height - bottom;
        input.style.zIndex = 999999;
        if (dropDown.getBoundingClientRect().height >= spaceY) {
          dropDown.style.top = "auto";
          dropDown.style.bottom = this.input.label
            ? "calc(100% - 1rem)"
            : "100%";
          dropDown.style.justifyContent = "flex-end";
        } else {
          dropDown.style.top = this.input.rules ? "calc(100% - 1rem)" : "100%";
          dropDown.style.bottom = "auto";
          dropDown.style.justifyContent = "flex-start";
        }
        if (dropDown.getBoundingClientRect().width >= spaceX) {
          dropDown.style.left = "auto";
          dropDown.style.right = 0;
        } else {
          dropDown.style.left = 0;
          dropDown.style.right = "auto";
        }
      } else {
        input.style.zIndex = 1;
      }
    },
    rootModel(val) {
      this.model = val;
      const dateObj = new Date();
      let date = dateObj.getDay();
      let month = dateObj.getMonth();
      const year = dateObj.getFullYear();
      if (!val) {
        this.current = this.todayObj = {
          month,
          year,
        };
        this.selectedObj = null;
      } else {
        const [d, m, y = year] = val.split("-");
        if (m) month = parseInt(m) - 1;
        if (d) date = parseInt(d);
        this.model = `${date >= 10 ? `0${date}` : date}-${
          month >= 10 ? `0${month}` : month
        }-${year}`;
        this.selectDate(y, month, date);
      }
    },
  },
  mounted() {
    const date = new Date();
    this.current = this.todayObj = {
      month: date.getMonth(),
      year: date.getFullYear(),
    };
    this.todayObj.date = date.getDate();
    this.today = date.setHours(0, 0, 0, 0);

    const {
      $refs: { input, dropDown },
    } = this;
    const { left } = input.getBoundingClientRect();
    const spaceX = window.innerWidth - left;
    input.style.zIndex = 999999;
    if (dropDown.getBoundingClientRect().width >= spaceX) {
      dropDown.style.left = "auto";
      dropDown.style.right = 0;
    } else {
      dropDown.style.left = 0;
      dropDown.style.right = "auto";
    }
  },
  methods: {
    disable(bool) {
      if (typeof bool === "boolean") {
        this.disabled = bool;
        this.model = "";
      }
    },
    validate() {
      const value = this.model;
      const { rules } = this.input;
      const { input } = this.$refs;
      if (!rules || rules.length === 0) return;
      const rL = rules.length;
      let message = "";
      for (let i = 0; i < rL; i++) {
        message = rules[i](value);
        if (message) {
          i = rL;
          this.message = message;
          input.classList.add("err");
          return true;
        }
        if (i === rL - 1) {
          input.classList.remove("err");
          return false;
        }
      }
    },
    openDd() {
      this.ddOpenedHandler = true;
    },
    closeDd() {
      if (this.model) {
        const currentDay = new Date();
        let date = currentDay.getDate();
        let month = currentDay.getMonth();
        const year = currentDay.getFullYear();
        const [d, m, y = year] = this.model.split("-");
        if (m) month = parseInt(m) - 1;
        if (d) date = parseInt(d);
        this.model = `${date >= 10 ? `0${date}` : date}-${
          month >= 10 ? `0${month}` : month
        }-${year}`;
        this.selectDate(y, month, date);
      } else this.updateModel("");
      this.ddOpenedHandler = false;
    },
    closeDdCondition(e) {
      // Close dropdown if the clicked target is not the same as inputfield
      const { target } = e;
      const {
        $refs: { input: inputField },
      } = this;
      const input = inputField.querySelector("input");
      return this.ddOpenedHandler && target !== input;
    },
    updateModel(val) {
      this.model = val || this.model;
      this.validate();
      this.$emit("changed", {
        val: this.model,
        input: this.input,
      });
    },
    daysInMonth(y, m) {
      return 32 - new Date(y, m, 32).getDate();
    },
    getDaysArr({ year: y, month: m }) {
      let date = 1;
      const firstDay = new Date(y, m).getDay();
      const month = [];
      for (let i = 0; i < 6; i++) {
        const week = [];
        for (let j = 0; j < 7; j++) {
          if ((i === 0 && j < firstDay) || date > this.daysInMonth(y, m))
            week.push(0);
          else {
            week.push(date);
            date++;
          }
        }
        month.push(week);
      }
      return month;
    },
    isYesterday(y, m, d) {
      const { today } = this;
      const day = new Date(y, m, d);
      return day.valueOf() < today.valueOf();
    },
    isSameDay(y, m, d) {
      const { todayObj } = this;
      return y === todayObj.year && m === todayObj.month && d === todayObj.date;
    },
    isSameMonth(y, m) {
      const { todayObj } = this;
      return y === todayObj.year && m === todayObj.month;
    },
    slideMonth(dir, cb) {
      this.changing = true;
      const {
        $refs: { weeksWrapper, monthWrapper },
      } = this;
      const targets = weeksWrapper.children;
      const monthTargets = monthWrapper.children;
      gsap.to(monthTargets, {
        y: dir === "left" ? "-1.5rem" : "1.5rem",
        duration: 0.25,
        onComplete() {
          gsap.to(monthTargets, {
            y: 0,
            duration: 0,
          });
        },
      });
      gsap.to(targets, {
        x: dir === "left" ? "-100%" : "100%",
        duration: 0.25,
        onComplete() {
          if (cb) cb();
          gsap.to(targets, {
            x: 0,
            duration: 0,
          });
        },
      });
    },
    prevMonth() {
      if (!this.changing) {
        this.slideMonth("right", () => {
          this.current = this.prev;
          this.changing = false;
        });
      }
    },
    nextMonth() {
      if (!this.changing) {
        this.slideMonth("left", () => {
          this.current = this.next;
          this.changing = false;
        });
      }
    },
    selectDate(y, m, d) {
      this.selectedObj = {
        year: y,
        month: m,
        date: d,
      };
      this.current = {
        month: m,
        year: y,
      };
      this.updateModel(
        `${d >= 10 ? d : `0${d}`}-${m + 1 >= 10 ? m + 1 : `0${m + 1}`}-${y}`
      );
    },
    selectedClass(y, m, d) {
      const { selectedObj } = this;
      return selectedObj &&
        selectedObj.year === y &&
        selectedObj.month === m &&
        selectedObj.date === d
        ? "selected"
        : "";
    },
  },
};
</script>

<style lang="scss" scoped>
.input-field {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  label.label {
    position: relative;
    height: 1rem;
    font-family: "Quicksand";
    font-size: 0.55rem;
    font-weight: 600;
    line-height: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: translateX(0.75rem);
    &.light {
      font-weight: 400;
    }
  }
  .input-container {
    z-index: 2;
    position: relative;
    width: 100%;
    height: 2rem;
    border-radius: 0.75rem;
    overflow: hidden;
    background: $background-secondary-color;
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-start;
    align-items: center;
    .icon-container {
      position: relative;
      width: 2rem;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      .icon {
        position: relative;
        font-size: 0.85rem;
      }
      .divider {
        position: absolute;
        top: calc(50% - 0.25rem);
        right: 0;
        width: 1px;
        height: 0.5rem;
        background: $subtext-color;
        opacity: 0.25;
      }
    }
    .border {
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 0.75rem;
      box-sizing: border-box;
      border: 2px solid $background-secondary-color;
      transition: border-color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    input.input {
      position: relative;
      width: calc(100% - 2rem);
      height: 100%;
      padding: 0 0.55rem;
      font-family: "Consolas", "Azeret Mono", monospace;
      font-size: 0.6rem;
      font-weight: 600;
      color: $text-color;
      &.invincible {
        pointer-events: none;
      }
      &:not(:placeholder-shown) {
        ~ .border {
          border-color: $subtext-color;
        }
      }
      &:focus {
        outline: none;
        ~ .border {
          border-color: $primary-color;
        }
      }
    }
    .chevron-icon {
      pointer-events: none;
      position: absolute;
      top: 0;
      right: 0;
      width: 2rem;
      height: 100%;
      transition: 0.2s transform;
      display: flex;
      justify-content: center;
      align-items: center;
      .icon {
        position: relative;
      }
    }
  }
  .error-container {
    z-index: 1;
    pointer-events: none;
    position: relative;
    width: 100%;
    height: 1rem;
    transition: transform 0.3s cubic-bezier(0.75, 0, 0.75, 0.2);
    transform: translateY(-100%);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .message {
      transform: translateX(0.75rem);
      font-family: "Quicksand";
      font-size: 0.55rem;
      font-weight: 400;
      line-height: 1;
      color: $error-color;
    }
  }
  &.err {
    .border {
      border-color: $error-color !important;
    }
    .error-container {
      transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      transform: translateY(0);
    }
  }
  .drop-down {
    pointer-events: none;
    z-index: 100000;
    position: absolute;
    top: 100%;
    left: 0;
    min-width: calc(16rem - 1px - 1.5rem);
    width: 100%;
    padding: 0.75rem;
    box-sizing: border-box;
    border-radius: 0.75rem;
    border: 1px solid $border-color;
    background: $background-color;
    transition: 0.125s transform cubic-bezier(0.25, 0, 0.75, 1), 0.125s opacity;
    opacity: 0;
    transform: translateY(-1rem);
    transform-origin: center top;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    .control {
      position: relative;
      width: 100%;
      height: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .month-view-wrapper {
        position: relative;
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        .month-view {
          position: relative;
          height: 100%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          .month {
            height: 0.8rem;
            font-size: 0.8rem;
            font-family: "Quicksand";
            font-weight: 600;
            line-height: 1;
          }
          .year {
            height: 0.75rem;
            margin-left: 0.25rem;
            font-size: 0.75rem;
            font-family: "Consolas", "Azeret Mono", monospace;
            font-weight: 300;
            line-height: 1;
          }
        }
      }
      .actions {
        position: relative;
        height: 100%;
        display: flex;
        align-items: center;
        .btn {
          cursor: pointer;
          position: relative;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          background: #fff;
          border: 1px solid $border-color;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          align-items: center;
          .icon {
            font-size: 0.85rem;
          }
          &.disabled {
            pointer-events: none;
            opacity: 0.5;
            .icon {
              opacity: 0.25;
            }
          }
        }
      }
    }
    .days {
      position: relative;
      width: 100%;
      height: 0.55rem;
      margin-top: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .day {
        position: relative;
        width: 1.5rem;
        text-transform: uppercase;
        font-size: 0.55rem;
        font-family: "Quicksand";
        font-weight: 400;
        line-height: 1;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
    .weeks-wrapper {
      position: relative;
      width: 100%;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      .weeks {
        position: relative;
        width: 100%;
        margin-top: 0.5rem;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        .week {
          position: relative;
          width: 100%;
          height: 1.5rem;
          margin-bottom: 0.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .day {
            position: relative;
            width: 1.5rem;
            height: 1.5rem;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            span.same-day {
              pointer-events: none;
              position: absolute;
              top: 0;
              left: 0;
              width: 1.5rem;
              height: 1.5rem;
              border-radius: 50%;
              border: 1px solid $primary-color;
              background: rgba($primary-color, 0.1);
              & + .date {
                color: $primary-color;
              }
            }
            span.select {
              position: absolute;
              top: 0;
              left: 0;
              width: 1.5rem;
              height: 1.5rem;
              border-radius: 50%;
              background: $primary-color;
              & + .date {
                color: #fff;
              }
            }
            span.date {
              cursor: pointer;
              position: relative;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              font-family: "Consolas", "Azeret Mono", monospace;
              font-size: 0.6rem;
              font-weight: 600;
              line-height: 1;
              display: flex;
              justify-content: center;
              align-items: center;
              &.disabled {
                pointer-events: none;
                opacity: 0.5;
              }
            }
            span.dot {
              position: relative;
              width: 0.25rem;
              height: 0.25rem;
              border-radius: 50%;
              background: $border-color;
            }
          }
          &:last-child {
            margin: 0;
          }
        }
      }
    }
    &.active {
      pointer-events: all;
      opacity: 1;
      transform: translateY(0);
    }
  }
  .overlay {
    z-index: 9999;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.5);
  }
}
</style>
