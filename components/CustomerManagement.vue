<template>
  <div ref="component" class="form">
    <div class="wrapper">
      <div class="header">
        <div class="action">
          <round-button :icon="'mdi-close'" @clicked="exit" />
          <round-button :icon="'mdi-plus'" :primary="true" @clicked="add" />
        </div>
        <div class="main-information">
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div class="page-title">
            Atur Customer
          </div>
        </div>
      </div>
      <div class="body">
        <div class="tab">
          <div
            v-for="customer in customerList"
            :key="customer.name"
            class="customerData"
          >
            <div class="details" @click="edit(customer)">
              <div class="customer">
                {{ customer.name }}
              </div>
              <div class="sub-details">
                <div class="email">
                  {{ customer.email }}
                </div>
              </div>
            </div>
            <div
              v-ripple
              class="remove-button"
              @click="deleteCustomer(customer._id)"
            >
              <v-icon class="icon">
                mdi-close
              </v-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gsap from 'gsap'

/* eslint-disable */
const animate = {
  init(component, cb, reverseCb) {
    const tl = gsap.timeline({
      onComplete() {
        if (cb) cb()
      },
      onReverseComplete() {
        if (reverseCb) reverseCb()
      },
    })

    const wrapper = component.children

    tl.from(wrapper, {
      x: '100%',
      duration: 0.5,
      ease: 'power2.inOut',
    })

    return tl
  },
}
/* eslint-enable */

export default {
  data() {
    return {
      errorMessage: '',
      customerList: [],
    }
  },
  mounted() {
    const {
      $refs: { component },
    } = this
    this.anim = animate.init(component, null, () => {
      this.$emit('exit')
    })
    this.panggil()
    this.$root.$on('refresh', () => {
      this.panggil()
    })
  },
  methods: {
    exit() {
      this.anim.reverse()
    },
    add() {
      this.$emit('open')
    },
    edit(user) {
      if (
        user.username === this.username ||
        this.role === 'owner' ||
        this.role === 'admin'
      )
        this.$root.$emit('customer-edit', user)
    },
    async panggil() {
      const { data } = await this.$axios.get(`${this.$config.apiURL}/customers`)
      if (data.message !== 'SUCCESS') console.log(data.message)
      this.customerList = data.customers
    },
    async deleteCustomer(user) {
      try {
        const { $axios, $config } = this
        const { data } = await $axios.delete(
          `${$config.apiURL}/customers/${user}`
        )
        if (data.message === 'SUCCESS') this.panggil()
        else throw new Error(data.message)
      } catch (e) {
        this.loading = false
        this.errorMessage = 'Terjadi masalah, silahkan coba lagi'
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.form {
  z-index: 10000;
  position: fixed;
  top: 0;
  right: 0;
  width: 20rem;
  height: 100vh;
  height: calc((var(--vh, 1vh) * 100));
  border-left: 1px solid $border-color;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  .wrapper {
    position: relative;
    width: 20rem;
    height: 100%;
    padding: 0 2rem;
    overflow-y: auto;
    background: $background-color;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    .header {
      position: relative;
      width: 100%;
      padding: 2rem 0 0 0;
      margin-bottom: 1rem;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;

      .action {
        position: relative;
        width: 100%;
        height: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .main-information {
        position: relative;
        width: 100%;
        margin-top: 2rem;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        .error-message {
          position: relative;
          font-family: 'Quicksand';
          font-size: 0.75rem;
          font-weight: 400;
          line-height: 1;
          color: $error-color;
        }
        .page-title {
          position: relative;
          margin: 0.25rem 0;
          font-family: 'Consolas', 'Azeret Mono', monospace;
          font-size: 1rem;
          font-weight: 600;
          line-height: 1;
          color: $text-color;
        }
      }
    }
    .body {
      position: relative;
      width: 100%;
      height: 2rem;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      .tab {
        position: relative;
        width: 100%;
        margin: 0 2rem 1rem 2rem;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        .customerData {
          position: relative;
          width: 100%;
          height: 3rem;
          padding: 0.5rem;
          border-radius: 0.75rem;
          border: 2px solid $border-color;
          box-sizing: border-box;
          margin-bottom: 0.5rem;
          color: $subtext-color;
          text-decoration: none;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          transition: 0.2s border-color;
          * {
            transition: 0.2s color;
          }

          .details {
            cursor: pointer;

            position: relative;
            width: calc(100% - 2.5rem);
            // margin-left: 0.5rem;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            .customer {
              position: relative;
              width: 100%;
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow: hidden;
              font-family: 'Consolas', 'Azeret Mono', monospace;
              font-size: 0.75rem;
              font-weight: 600;
              color: $text-color;
            }
            .sub-details {
              position: relative;
              display: flex;
              justify-content: flex-start;
              align-items: center;
              .email,
              .size {
                position: relative;
                font-family: 'Quicksand';
                font-size: 0.6rem;
                font-weight: 400;
                color: $subtext-color;
              }
            }
          }
          .remove-button {
            cursor: pointer;
            position: absolute;
            border-radius: 20%;
            top: 0;
            right: 0;
            width: 2rem;
            height: 2rem;
            margin: 0.35rem 0.35rem 0 0;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 50%;
            .icon {
              font-size: 1rem;
              color: inherit;
            }
            &:hover {
              opacity: 100%;
            }
          }
        }
      }
    }
  }
  @media only screen and (max-width: 1024px) {
    width: 100vw;
    .wrapper {
      width: 100%;
      padding: 0 1rem;
      .header {
        padding: 1rem 0 0 0;
        .main-information {
          margin-top: 1rem;
        }
      }
    }
  }
}
</style>
