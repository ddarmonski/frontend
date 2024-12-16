<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <!-- Logo and Home Link -->
        <router-link to="/" class="flex items-center space-x-2">
          <img src="@/assets/logo.png" alt="Logo" class="h-12 w-auto">
          
        </router-link>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <button class="text-gray-600 hover:text-gray-800">
            <bell-icon class="h-5 w-5" />
          </button>
          
          <!-- User Dropdown -->
          <div class="relative">
            <button 
              @click="isUserMenuOpen = !isUserMenuOpen"
              class="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <user-circle-icon class="h-8 w-8" />
              <chevron-down-icon class="h-4 w-4" />
            </button>

            <!-- Dropdown Menu -->
            <div 
              v-if="isUserMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
            >
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
              <div class="border-t border-gray-100"></div>
              <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</a>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content with back button when needed -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <div v-if="showBackButton" class="mb-6">
        <button 
          @click="$router.back()" 
          class="flex items-center text-gray-600 hover:text-gray-800"
        >
          <arrow-left-icon class="h-5 w-5 mr-2" />
          Back
        </button>
      </div>

      <!-- Route transition -->
      <router-view v-slot="{ Component }">
        <transition 
          name="page" 
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  BellIcon, 
  UserCircleIcon, 
  ChevronDownIcon,
  ArrowLeftIcon 
} from 'lucide-vue-next'

export default {
  name: 'BaseLayout',
  
  components: {
    BellIcon,
    UserCircleIcon,
    ChevronDownIcon,
    ArrowLeftIcon
  },

  setup() {
    const route = useRoute()
    const isUserMenuOpen = ref(false)

    // Show back button on all pages except home
    const showBackButton = computed(() => {
      return route.path !== '/'
    })

    // Close menu when clicking outside
    const closeMenu = (e) => {
      if (!e.target.closest('.relative')) {
        isUserMenuOpen.value = false
      }
    }

    // Add click outside listener
    window.addEventListener('click', closeMenu)

    return {
      isUserMenuOpen,
      showBackButton
    }
  }
}
</script>

<style>
/* Page Transition Animations */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>