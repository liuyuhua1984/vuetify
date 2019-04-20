// Mixins
import Delayable from '../delayable'
import Toggleable from '../toggleable'

// Utilities
import mixins from '../../util/mixins'
import { getSlot, getSlotType } from '../../util/helpers'
import { consoleError } from '../../util/console'

// Types
import { PropValidator } from 'vue/types/options'
import { VNode } from 'vue'

const baseMixins = mixins(
  Delayable,
  Toggleable
)

/* @vue/component */
export default baseMixins.extend({
  name: 'activatable',

  props: {
    activateOnHover: Boolean,
    activator: {
      default: null,
      validator: (val: string | object) => {
        return ['string', 'object'].includes(typeof val)
      }
    } as PropValidator<string | HTMLElement>,
    disabled: Boolean,
    internalActivator: Boolean
  },

  data: () => ({
    activatorElement: null as null | HTMLElement,
    activatorNode: [] as VNode[]
  }),

  mounted () {
    if (getSlotType(this, 'activator', true) === 'v-slot') {
      consoleError(`The activator slot must be bound, try '<template v-slot:activator="{ on }"><v-btn v-on="on">'`, this)
    }
  },

  methods: {
    genActivator () {
      const node = getSlot(this, 'activator', {
        on: this.genActivatorListeners()
      }) || []

      this.activatorNode = node

      return node
    },
    genActivatorListeners () {
      if (this.disabled) return {}

      const listeners: Record<string, (e: MouseEvent) => void> = {}

      if (this.activateOnHover) {
        listeners.mouseenter = (e: MouseEvent) => {
          this.getActivator(e)
          this.runDelay('open')
        }
        listeners.mouseleave = (e: MouseEvent) => {
          this.getActivator(e)
          this.runDelay('close')
        }
      } else {
        listeners.click = (e: MouseEvent) => {
          const activator = this.getActivator(e)

          if (activator) activator.focus()

          this.isActive = !this.isActive
        }
      }

      return listeners
    },
    getActivator (e?: Event): HTMLElement | null {
      // If we've already fetched the activator, re-use
      if (this.activatorElement) return this.activatorElement

      let activator = null

      if (this.activator) {
        const target = this.internalActivator ? this.$el : document

        activator = typeof this.activator === 'string'
          ? target.querySelector(this.activator)
          : this.activator
      } else if (e) {
        activator = e.currentTarget || e.target
      }

      this.activatorElement = activator as HTMLElement

      return this.activatorElement
    }
  }
})
