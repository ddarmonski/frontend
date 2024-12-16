<template>
  <div>
    <!-- Header -->
    <div class="mb-12">
      <h1 class="text-4xl font-bold text-gray-800 mb-2">Welcome to PHOENIX Trip Manager</h1>
      <p class="text-gray-600">Manage your reports and trip requests efficiently</p>
    </div>

    <!-- Action Cards -->
    <div class="flex flex-col md:flex-row gap-8 mb-12">
      <div class="flex-1 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
      @click="$router.push('/upload-report')">
        <div class="p-8 flex flex-col items-center text-center">
          <div class="mb-4 p-4 bg-blue-100 rounded-full group-hover:scale-110 transition-transform duration-300">
            <upload-icon size="40" class="text-blue-600" />
          </div>
          <h2 class="text-2xl font-semibold mb-2">Upload Report</h2>
          <p class="text-gray-600">Submit your travel reports and documentation</p>
        </div>
      </div>

      <div class="flex-1 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group">
        <div class="p-8 flex flex-col items-center text-center">
          <div class="mb-4 p-4 bg-green-100 rounded-full group-hover:scale-110 transition-transform duration-300">
            <car-icon size="40" class="text-green-600" />
          </div>
          <h2 class="text-2xl font-semibold mb-2">Request a Trip</h2>
          <p class="text-gray-600">Create a new travel request for approval</p>
        </div>
      </div>
    </div>

    <!-- Dashboard Section -->
<div class="bg-white rounded-lg shadow-lg p-8">
  <h2 class="text-2xl font-semibold mb-8">Dashboard Overview</h2>
  
  <div class="flex flex-col gap-8">
    <!-- First Row: Summary and Pie Chart -->
    <div class="grid lg:grid-cols-2 gap-8">
      <!-- Summary Card -->
      <div class="bg-gray-50 p-6 rounded-lg">
        <h3 class="text-lg font-semibold mb-4">Summary</h3>
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <p class="text-gray-600 mb-2">Total Pending Refunds</p>
          <p class="text-3xl font-bold text-blue-600">${{ totalPendingRefunds.toLocaleString() }}</p>
          <div class="mt-4">
            <p class="text-sm text-gray-600">Pending Requests: {{ pendingTrips.length }}</p>
            <p class="text-sm text-gray-600">Average Amount: ${{ averageRefund.toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <!-- Pie Chart -->
      <div class="bg-gray-50 p-6 rounded-lg">
        <h3 class="text-lg font-semibold mb-4">Request Status</h3>
        <VChart class="w-full h-64" :option="chartOption" autoresize />
      </div>
    </div>

    <!-- Second Row: Table -->
    <div class="bg-gray-50 p-6 rounded-lg">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">
          <button 
            @click="$router.push('/requests')" 
            class="text-gray-800 hover:text-blue-600 flex items-center"
          >
            Pending Requests
            <arrow-right-icon class="h-4 w-4 ml-1" />
          </button>
        </h3>
        <div class="relative">
          <search-icon class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search requests..." 
            class="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse bg-white">
          <!-- Table content remains the same -->
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left p-4 border-b border-gray-200 font-medium text-gray-600">Upload at</th>
              <th class="text-left p-4 border-b border-gray-200 font-medium text-gray-600">Date</th>
              <th class="text-left p-4 border-b border-gray-200 font-medium text-gray-600">Requester</th>
              <th class="text-left p-4 border-b border-gray-200 font-medium text-gray-600">Requested Amount</th>
              <th class="text-left p-4 border-b border-gray-200 font-medium text-gray-600">Status</th>
              
            </tr>
          </thead>
          <tbody>
            <tr 
                v-for="trip in paginatedTrips" 
                :key="trip.id" 
                @click="viewRequest(trip.id)"
                class="hover:bg-blue-50 cursor-pointer transition-colors duration-150"
              >
                <td class="p-4 border-b border-gray-100">{{ formatDate(trip.upload_at) }}</td>
                <td class="p-4 border-b border-gray-100">{{ formatDate(trip.date) }}</td>
                <td class="p-4 border-b border-gray-100">{{ trip.requester }}</td>
                <td class="p-4 border-b border-gray-100">${{ trip.amount.toLocaleString() }}</td>
                <td class="p-4 border-b border-gray-100">
                  <span 
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="{
                      'bg-yellow-100 text-yellow-800': trip.status === 'Pending',
                      'bg-green-100 text-green-800': trip.status === 'Approved',
                      'bg-red-100 text-red-800': trip.status === 'Rejected'
                    }"
                  >
                    {{ trip.status }}
                  </span>
                </td>
              </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4 px-4">
          <div class="text-sm text-gray-500">
            Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredTrips.length }}
          </div>
          <div class="flex space-x-2">
            <button 
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              @click="currentPage++"
              :disabled="currentPage >= totalPages"
              class="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { UploadIcon, CarIcon, SearchIcon, ArrowRightIcon } from 'lucide-vue-next'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  PieChart,
  LegendComponent,
  TooltipComponent
])

export default {
  name: 'DashboardLanding',
  
  components: {
    UploadIcon,
    CarIcon,
    SearchIcon,
    ArrowRightIcon,
    VChart
  },

  setup() {
    const router = useRouter()

    // Sample data - replace with actual API call later
    const pendingTrips = ref([
      { id: 1, upload_at: '2024-12-30',  requester: 'John Doe', amount: 1250, date: '2024-12-15', status: 'Pending' },
      { id: 2, upload_at: '2024-11-15', requester: 'Jane Smith', amount: 850, date: '2024-12-18', status: 'Pending' },
      { id: 3, upload_at: '2024-11-12', requester: 'Mike Johnson', amount: 2100, date: '2024-12-20', status: 'Pending' },
      { id: 4, upload_at: '2024-12-06', requester: 'Sarah Wilson', amount: 1500, date: '2024-12-22', status: 'Pending' },
      { id: 5, upload_at: '2024-12-08', requester: 'Tom Brown', amount: 950, date: '2024-12-23', status: 'Pending' },
      { id: 6, upload_at: '2024-12-08', requester: 'Emma Davis', amount: 1750, date: '2024-12-24', status: 'Pending' },
      { id: 7, upload_at: '2024-12-10', requester: 'James Miller', amount: 2200, date: '2024-12-25', status: 'Pending' }
    ])

    // Pagination and search state
    const searchQuery = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 5

    // Calculate total pending refunds
    const totalPendingRefunds = computed(() => {
      return pendingTrips.value.reduce((sum, trip) => sum + trip.amount, 0)
    })

    // Calculate average refund
    const averageRefund = computed(() => {
      return totalPendingRefunds.value / pendingTrips.value.length
    })

    // Filter trips based on search query
    const filteredTrips = computed(() => {
      if (!searchQuery.value) return pendingTrips.value
      
      const query = searchQuery.value.toLowerCase()
      return pendingTrips.value.filter(trip => 
        trip.requester.toLowerCase().includes(query) ||
        trip.amount.toString().includes(query) ||
        formatDate(trip.date).toLowerCase().includes(query) ||
        formatDate(trip.upload_at).toLowerCase().includes(query) ||
        trip.status.toLowerCase().includes(query)
      )
    })

    // Pagination computeds
    const totalPages = computed(() => 
      Math.ceil(filteredTrips.value.length / itemsPerPage)
    )

    const startIndex = computed(() => 
      (currentPage.value - 1) * itemsPerPage
    )

    const endIndex = computed(() => 
      Math.min(startIndex.value + itemsPerPage, filteredTrips.value.length)
    )

    const paginatedTrips = computed(() => 
      filteredTrips.value.slice(startIndex.value, endIndex.value)
    )

    // Chart configuration
    const chartOption = ref({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 45, name: 'Approved' },
            { value: 30, name: 'Pending' },
            { value: 25, name: 'Rejected' }
          ]
        }
      ]
    })

    // Utility functions
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const viewRequest = (id) => {
      router.push({
        name: 'RequestDetail',
        params: { id: id.toString() }
      })
    }

    // Reset to first page when search query changes
    watch(searchQuery, () => {
      currentPage.value = 1
    })

    return {
      pendingTrips,
      totalPendingRefunds,
      averageRefund,
      chartOption,
      formatDate,
      searchQuery,
      currentPage,
      filteredTrips,
      paginatedTrips,
      startIndex,
      endIndex,
      totalPages,
      viewRequest
    }
  }
}
</script>

<style scoped>
/* Optional: Add transition for hover effects */
tr {
  transition: all 0.2s ease;
}
</style>