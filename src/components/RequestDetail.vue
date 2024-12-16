<template>
    <div>
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Travel Request Details</h1>
        <div class="flex items-center text-gray-600">
          <span>Request ID: #{{ request.id }}</span>
          <span class="mx-2">•</span>
          <span 
            class="px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 transform"
            :class="{
                'bg-yellow-100 text-yellow-800': request.status === 'Pending',
                'bg-green-100 text-green-800': request.status === 'Approved',
                'bg-red-100 text-red-800': request.status === 'Rejected',
                'scale-110': statusTransition
            }"
            >
            {{ request.status }}
            </span>
        </div>
      </div>
  
      <div class="flex gap-8">
        <!-- Left Column - PDF Viewer -->
        <div class="w-1/2">
          <!-- Documents List -->
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">Uploaded Documents</h2>
            <div v-for="(doc, index) in request.documents" 
                 :key="index" 
                 class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                 :class="{ 'bg-blue-50': selectedDocIndex === index }"
                 @click="selectDocument(index)">
              <div class="flex items-center flex-1">
                <file-icon class="h-5 w-5 text-gray-400 mr-2" />
                <span class="text-sm text-gray-600">{{ doc.name }}</span>
              </div>
              <span class="text-xs text-gray-500">{{ formatFileSize(doc.size) }}</span>
            </div>
          </div>
  
          <!-- PDF Viewer -->
          <div v-if="selectedDocument" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Document Preview</h2>
            <vue-pdf-embed
              :source="selectedDocument"
              class="border border-gray-200 rounded"
            />
          </div>
        </div>
  
        <!-- Right Column - Request Details -->
        <div class="w-1/2">
          <!-- General Information -->
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">General Information</h2>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Employee Name</p>
                  <p class="text-gray-800">{{ request.employee.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Email</p>
                  <p class="text-gray-800">{{ request.employee.email }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Position</p>
                  <p class="text-gray-800">{{ request.employee.position }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Department</p>
                  <p class="text-gray-800">{{ request.employee.department }}</p>
                </div>
              </div>
              <div class="border-t pt-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Start Date</p>
                    <p class="text-gray-800">{{ formatDate(request.startDate) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">End Date</p>
                    <p class="text-gray-800">{{ formatDate(request.endDate) }}</p>
                  </div>
                </div>
              </div>
              <div class="border-t pt-4">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="text-sm text-gray-500">Total Amount</p>
                    <p class="text-2xl font-bold text-blue-600">
                      ${{ request.totalAmount.toLocaleString() }}
                    </p>
                  </div>
                  <div class="flex space-x-2">
                    <button 
                        @click="handleApproval"
                        :disabled="request.status !== 'Pending'"
                        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                    >
                        <span>Approve Request</span>
                    </button>
                    <button 
                        @click="handleRejection"
                        :disabled="request.status !== 'Pending'"
                        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                    >
                        <span>Reject Request</span>
                    </button>
                    </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Expense Details -->
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">Expense Details</h2>
            <div class="space-y-4">
              <div v-for="(expense, index) in request.expenses" 
                   :key="index"
                   class="border-b last:border-0 pb-4 last:pb-0">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-medium text-gray-800">{{ expense.category }}</h3>
                    <p class="text-sm text-gray-500">{{ expense.description }}</p>
                    <p class="text-sm text-gray-500">{{ formatDate(expense.date) }}</p>
                  </div>
                  <p class="font-medium text-gray-800">${{ expense.amount.toLocaleString() }}</p>
                </div>
              </div>
            </div>
          </div>
  
          <!-- History Timeline -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold">Request History</h2>
              <!-- Assignment Section -->
              <div class="relative">
                <button 
                @click="isAssignModalOpen = true"
                :disabled="request.status !== 'Pending'"
                class="text-blue-600 hover:text-blue-700 text-sm flex items-center disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                <user-plus-icon class="h-4 w-4 mr-1" />
                Assign Reviewer
                </button>
              </div>
            </div>
            
            <!-- Timeline -->
            <div class="relative">
              <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div v-for="(event, index) in request.history" 
                   :key="index" 
                   class="relative pl-10 pb-6 last:pb-0">
                <!-- Timeline dot -->
                <div 
                  class="absolute left-2 w-5 h-5 rounded-full border-2 transform -translate-x-1/2 cursor-pointer"
                  :class="{
                    'bg-green-100 border-green-500': event.type === 'approved',
                    'bg-red-100 border-red-500': event.type === 'rejected',
                    'bg-blue-100 border-blue-500': event.type === 'assigned',
                    'bg-yellow-100 border-yellow-500': event.type === 'created'
                  }"
                  @click="openEventDetails(event)"
                ></div>
                
                <!-- Event content -->
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-gray-800">{{ event.title }}</p>
                    <p class="text-sm text-gray-500">
                      {{ event.user }} • {{ formatDate(event.date) }}
                    </p>
                  </div>
                  <button 
                    @click="openEventDetails(event)"
                    class="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
        <!-- Assignment Modal -->
        <div v-if="isAssignModalOpen" 
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-96">
            <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold">Assign Reviewer</h3>
            <button @click="closeAssignModal" class="text-gray-500 hover:text-gray-700">
                <x-icon class="h-5 w-5" />
            </button>
            </div>
            <div class="space-y-4">
            <div>
                <label class="block text-sm text-gray-600 mb-2">Reviewer Email</label>
                <input 
                v-model="assigneeEmail"
                type="email"
                class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
                />
            </div>
            <div>
                <label class="block text-sm text-gray-600 mb-2">Assignment Note</label>
                <textarea
                v-model="assignmentComment"
                rows="3"
                class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Add a note about this assignment..."
                ></textarea>
            </div>
            <p v-if="assignmentError" class="text-sm text-red-500">{{ assignmentError }}</p>
            </div>
            <div class="flex justify-end space-x-2 mt-6">
            <button 
                @click="closeAssignModal"
                class="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
                Cancel
            </button>
            <button 
                @click="handleAssign"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                :disabled="!assigneeEmail.trim()"
            >
                Assign
            </button>
            </div>
        </div>
        </div>
  
      <!-- Event Details Modal -->
      <div v-if="selectedEvent" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-96">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold">{{ selectedEvent.title }}</h3>
            <button @click="selectedEvent = null" class="text-gray-500 hover:text-gray-700">
              <x-icon class="h-5 w-5" />
            </button>
          </div>
          <div class="space-y-3">
            <div>
              <p class="text-sm text-gray-500">Action by</p>
              <p class="text-gray-800">{{ selectedEvent.user }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Date</p>
              <p class="text-gray-800">{{ formatDate(selectedEvent.date) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Comments</p>
              <p class="text-gray-800">{{ selectedEvent.comments }}</p>
            </div>
          </div>
        </div>
      </div>


      <!-- Rejection modal -->
        <div v-if="isRejectionModalOpen" 
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div 
            class="bg-white rounded-lg p-6 w-96 transform transition-all duration-300"
            :class="{ 'opacity-0 scale-95': !isRejectionModalOpen, 'opacity-100 scale-100': isRejectionModalOpen }"
        >
            <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-red-600">Reject Request</h3>
            <button @click="closeRejectionModal" class="text-gray-500 hover:text-gray-700">
                <x-icon class="h-5 w-5" />
            </button>
            </div>
            <div class="mb-4">
            <label class="block text-sm text-gray-600 mb-2">Reason for Rejection</label>
            <textarea
                v-model="rejectionReason"
                rows="4"
                class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Please provide a detailed reason for rejecting this request..."
            ></textarea>
            <p v-if="rejectionError" class="mt-1 text-sm text-red-500">{{ rejectionError }}</p>
            </div>
            <div class="flex justify-end space-x-2">
            <button 
                @click="closeRejectionModal"
                class="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
                Cancel
            </button>
            <button 
                @click="confirmRejection"
                class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
                :disabled="!rejectionReason.trim()"
            >
                <span>Confirm Rejection</span>
            </button>
            </div>
        </div>
        </div>
    </div>
  </template>
  
  
  <script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import VuePdfEmbed from 'vue-pdf-embed'
import { FileIcon, UserPlusIcon, XIcon } from 'lucide-vue-next'


export default {
  name: 'RequestDetail',
  
  components: {
    VuePdfEmbed,
    FileIcon,
    UserPlusIcon,
    XIcon
  },

  setup() {
    const route = useRoute()
    const requestId = route.params.id

    const selectedDocIndex = ref(0)
    const selectedDocument = ref(null)
    const isLoading = ref(true)
    const error = ref(null)
    const isAssignModalOpen = ref(false)
    const assigneeEmail = ref('')
    const selectedEvent = ref(null)

    const isRejectionModalOpen = ref(false)
    const rejectionReason = ref('')
    const rejectionError = ref('')
    const statusTransition = ref(false)
    const assignmentComment = ref('')
    const assignmentError = ref('')

    // Sample request data - replace with API call
    const request = ref({
      id: requestId,
      status: 'Pending',
      employee: {
        name: 'John Doe',
        email: 'john.doe@company.com',
        position: 'Software Engineer',
        department: 'Engineering'
      },
      startDate: '2024-12-15',
      endDate: '2024-12-20',
      totalAmount: 2850,
      documents: [
        { name: 'Flight_Tickets.pdf', size: 1500000, url: '/path/to/pdf1' },
        { name: 'Hotel_Booking.pdf', size: 800000, url: '/path/to/pdf2' },
        { name: 'Receipts.pdf', size: 2100000, url: '/path/to/pdf3' }
      ],
      expenses: [
        {
          category: 'Flight',
          description: 'Round trip to New York',
          date: '2024-12-15',
          amount: 1200
        },
        {
          category: 'Hotel',
          description: 'Hilton - 5 nights',
          date: '2024-12-15',
          amount: 1000
        },
        {
          category: 'Transportation',
          description: 'Taxi and subway fares',
          date: '2024-12-15',
          amount: 150
        },
        {
          category: 'Meals',
          description: 'Daily allowance',
          date: '2024-12-15',
          amount: 500
        }
      ],
      history: [
        {
          type: 'created',
          title: 'Request Created',
          user: 'John Doe',
          date: '2024-12-15T10:00:00',
          comments: 'Travel request submitted for approval'
        },
        {
          type: 'assigned',
          title: 'Assigned to Manager',
          user: 'Jane Smith',
          date: '2024-12-15T11:30:00',
          comments: 'Request assigned to department manager for review'
        },
        {
          type: 'rejected',
          title: 'Request Rejected',
          user: 'Jane Smith',
          date: '2024-12-16T09:15:00',
          comments: 'Missing receipts for taxi expenses. Please upload all required documentation.'
        },
        {
          type: 'approved',
          title: 'Request Approved',
          user: 'Jane Smith',
          date: '2024-12-17T14:20:00',
          comments: 'All documentation verified. Expenses approved for reimbursement.'
        }
      ]
    })

    const fetchRequestData = async () => {
      try {
        isLoading.value = true
        error.value = null
        // Replace with actual API call
        // const response = await ApiService.getRequest(requestId)
        // request.value = response.data
      } catch (err) {
        error.value = 'Error loading request details: ' + (err.message || 'Unknown error')
        console.error('Error:', err)
      } finally {
        isLoading.value = false
      }
    }

    const selectDocument = (index) => {
      selectedDocIndex.value = index
      selectedDocument.value = request.value.documents[index].url
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const handleApproval = async () => {
        try {
            // Add approval logic here
            // await ApiService.approveRequest(requestId)
            
            // Update status
            request.value.status = 'Approved'
            
            // Add to history
            request.value.history.push({
            type: 'approved',
            title: 'Request Approved',
            user: 'Current User', // Replace with actual logged-in user
            date: new Date().toISOString(),
            comments: 'Request approved and ready for processing'
            })
        } catch (err) {
            console.error('Error approving request:', err)
            alert('Error approving request. Please try again.')
        }
    }

    const handleRejection = () => {
        isRejectionModalOpen.value = true
        }

    const closeRejectionModal = () => {
    isRejectionModalOpen.value = false
    rejectionReason.value = ''
    rejectionError.value = ''
    }

    const confirmRejection = async () => {
        if (!rejectionReason.value.trim()) {
            rejectionError.value = 'Please provide a reason for rejection'
            return
        }

        try {
            // Add API call here
            // await ApiService.rejectRequest(requestId, rejectionReason.value)
            
            // Start status transition animation
            statusTransition.value = true
            
            // Update status
            request.value.status = 'Rejected'
            
            // Add to history
            request.value.history.unshift({
            type: 'rejected',
            title: 'Request Rejected',
            user: 'Current User', // Replace with actual logged-in user
            date: new Date().toISOString(),
            comments: rejectionReason.value
            })

            closeRejectionModal()

            // Reset transition flag after animation
            setTimeout(() => {
            statusTransition.value = false
            }, 500)
        } catch (err) {
            console.error('Error rejecting request:', err)
            rejectionError.value = 'Error rejecting request. Please try again.'
        }
    }


    const openEventDetails = (event) => {
      selectedEvent.value = event
    }

    const handleAssign = async () => {
        try {
            if (!assigneeEmail.value.trim()) {
            assignmentError.value = 'Please provide an email address'
            return
            }

            // Add API call here
            // await ApiService.assignRequest(requestId, assigneeEmail.value, assignmentComment.value)
            
            // Add to history
            request.value.history.unshift({
            type: 'assigned',
            title: 'Request Assigned',
            user: assigneeEmail.value,
            date: new Date().toISOString(),
            comments: assignmentComment.value || 'No additional comments provided'
            })
            
            closeAssignModal()
        } catch (err) {
            console.error('Error assigning request:', err)
            assignmentError.value = 'Error assigning request. Please try again.'
        }
    }
    const closeAssignModal = () => {
        isAssignModalOpen.value = false
        assigneeEmail.value = ''
        assignmentComment.value = ''
        assignmentError.value = ''
        }

    // Initialize component
    onMounted(() => {
      fetchRequestData()
      if (request.value.documents.length > 0) {
        selectDocument(0)
      }
    })

    return {
    request,
    selectedDocIndex,
    selectedDocument,
    isLoading,
    error,
    isAssignModalOpen,
    assigneeEmail,
    selectedEvent,
    selectDocument,
    formatDate,
    formatFileSize,
    handleApproval,
    handleAssign,
    openEventDetails,
    handleRejection,
    isRejectionModalOpen,
    rejectionReason,
    rejectionError,
    statusTransition,
    closeRejectionModal,
    confirmRejection,
    assignmentComment,
    assignmentError,
    closeAssignModal
    }
  }
}
</script>

<style scoped>
.status-transition {
  transition: all 0.3s ease-in-out;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Status badge animation */
@keyframes statusPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.status-pulse {
  animation: statusPulse 0.3s ease-in-out;
}
</style>