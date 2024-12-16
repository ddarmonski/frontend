<template>
   
    <div class="bg-white rounded-lg shadow p-6">
            <!-- Animated Confirmation Modal -->
            <Transition name="fade">
            <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Transition name="scale">
                <div v-if="showConfirmModal" class="bg-white rounded-lg p-6 w-96 shadow-xl">
                <h3 class="text-lg font-semibold mb-4">Confirm Submission</h3>
                <div v-if="isProcessing" class="text-center py-4">
                    <loader-icon class="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
                    <p class="text-gray-600">Processing your submission...</p>
                </div>
                <template v-else>
                    <p class="text-gray-600 mb-6">Are you sure you want to submit this report? After submission, you won't be able to make further changes.</p>
                    <div class="flex justify-end space-x-3">
                    <button 
                        @click="showConfirmModal = false"
                        class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        @click="confirmSubmit"
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
                    >
                        Confirm Submit
                    </button>
                    </div>
                </template>
                </div>
            </Transition>
            </div>
            </Transition>

            <!-- Success Message -->
            <Transition name="slide-fade">
            <div 
                v-if="showSuccessMessage" 
                class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center"
            >
                <check-icon class="h-5 w-5 mr-2" />
                Report submitted successfully
            </div>
            </Transition>
  
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-semibold">Travel Expense Report</h2>
        <button 
          v-if="!isSubmitted"
          @click="showConfirmModal = true"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
        >
          <user-plus-icon class="h-4 w-4 mr-2" />
          Submit Report
        </button>
        <div v-else class="text-green-500 flex items-center">
          <check-icon class="h-5 w-5 mr-2" />
          Submitted
        </div>
      </div>
  
      <!-- Basic Information -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div v-for="(field, key) in editableFields" :key="key" class="relative">
          <label class="block text-sm font-medium mb-1">{{ field.label }}</label>
          <div class="relative flex items-center">
            <input
              v-if="field.isEditing && !isSubmitted"
              v-model="field.value"
              :type="field.type || 'text'"
              class="w-full p-2 border rounded pr-20"
              @keyup.enter="saveField(key)"
            />
            <div v-else class="w-full p-2 border rounded" :class="isSubmitted ? 'bg-gray-100' : 'bg-gray-50'">
              {{ formatValue(field.value, field.type) }}
            </div>
            <div v-if="!isSubmitted" class="absolute right-2 flex space-x-1">
              <button
                v-if="field.isEditing"
                @click="saveField(key)"
                class="text-green-500 hover:text-green-600 p-1"
                title="Save"
              >
                <save-icon class="h-4 w-4" />
              </button>
              <button
                v-if="field.isEditing"
                @click="cancelEdit(key)"
                class="text-red-500 hover:text-red-600 p-1"
                title="Cancel"
              >
                <x-icon class="h-4 w-4" />
              </button>
              <button
                v-if="!field.isEditing"
                @click="startEdit(key)"
                class="text-blue-500 hover:text-blue-600 p-1"
                title="Edit"
              >
                <edit-icon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Expenses Table -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-lg font-medium">Expenses</h3>
          <button 
            v-if="!isSubmitted"
            @click="addExpense"
            class="text-blue-500 hover:text-blue-600 flex items-center"
          >
            <plus-icon class="h-4 w-4 mr-1" />
            Add Expense
          </button>
        </div>
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-50">
              <th class="border p-2 text-left">Date</th>
              <th class="border p-2 text-left">Category</th>
              <th class="border p-2 text-left">Description</th>
              <th class="border p-2 text-left">Amount</th>
              <th v-if="!isSubmitted" class="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(expense, index) in expenses" :key="expense.id || index">
              <td v-for="field in ['date', 'category', 'description', 'amount']" :key="field" class="border p-2">
                <div class="relative">
                  <input
                    v-if="expense.editingState && !isSubmitted"
                    v-model="expense[field]"
                    :type="field === 'date' ? 'date' : field === 'amount' ? 'number' : 'text'"
                    class="w-full p-1 border rounded"
                    step="0.01"
                  />
                  <span v-else :class="{ 'text-gray-500': isSubmitted }">
                    {{ formatValue(expense[field], field === 'amount' ? 'currency' : field === 'date' ? 'date' : 'text') }}
                  </span>
                </div>
              </td>
              <td v-if="!isSubmitted" class="border p-2">
                <div class="flex justify-center space-x-1">
                  <button
                    v-if="expense.editingState"
                    @click="saveExpense(index)"
                    class="text-green-500 hover:text-green-600"
                    title="Save"
                  >
                    <save-icon class="h-4 w-4" />
                  </button>
                  <button
                    v-if="expense.editingState"
                    @click="cancelExpenseEdit(index)"
                    class="text-red-500 hover:text-red-600"
                    title="Cancel"
                  >
                    <x-icon class="h-4 w-4" />
                  </button>
                  <button
                    v-if="!expense.editingState"
                    @click="startExpenseEdit(index)"
                    class="text-blue-500 hover:text-blue-600"
                    title="Edit"
                  >
                    <edit-icon class="h-4 w-4" />
                  </button>
                  <button
                    @click="removeExpense(index)"
                    class="text-red-500 hover:text-red-600"
                    title="Delete"
                  >
                    <trash-icon class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, watch } from 'vue'
  import { 
    SaveIcon, 
    EditIcon, 
    XIcon, 
    PlusIcon, 
    UserPlusIcon, 
    TrashIcon, 
    CheckIcon,
    Loader as LoaderIcon 
  } from 'lucide-vue-next'
  
  export default {
    name: 'InteractiveReportPreview',
    
    components: {
      SaveIcon,
      EditIcon,
      XIcon,
      PlusIcon,
      UserPlusIcon,
      TrashIcon,
      CheckIcon,
      LoaderIcon  
    },
  
    props: {
      reportData: {
        type: Object,
        required: true
      }
    },
  
    emits: ['submit'],
  
    setup(props, { emit }) {
      const showConfirmModal = ref(false)
      const isSubmitted = ref(false)
      const editableFields = ref({
        requester: { label: 'Requester', value: '', isEditing: false },
        department: { label: 'Department', value: '', isEditing: false },
        position: { label: 'Position', value: '', isEditing: false },
        start_date: { label: 'Start Date', value: '', type: 'date', isEditing: false },
        end_date: { label: 'End Date', value: '', type: 'date', isEditing: false },
        total_amount: { label: 'Total Amount', value: 0, type: 'number', isEditing: false }
      })
      const showSuccessMessage = ref(false)
  
      const expenses = ref([])
      const originalData = ref({})
      const isProcessing = ref(false)
  
      // Watch for changes in reportData prop
      watch(() => props.reportData, (newValue) => {
        if (newValue) {
          originalData.value = { ...newValue }
          
          Object.keys(editableFields.value).forEach(key => {
            editableFields.value[key].value = newValue[key] || ''
          })
          
          expenses.value = (newValue.expenses || []).map(exp => ({
            id: exp.id,
            date: exp.date,
            category: exp.category,
            description: exp.description,
            amount: exp.amount,
            editingState: false
          }))
        }
      }, { immediate: true })
  
      const formatValue = (value, type) => {
        if (!value) return '';
        if (type === 'currency') return `$${parseFloat(value).toFixed(2)}`
        if (type === 'date') return new Date(value).toLocaleDateString()
        return value
      }
  
      const startEdit = (key) => {
        if (!isSubmitted.value) {
          editableFields.value[key].isEditing = true
        }
      }
  
      const saveField = (key) => {
        editableFields.value[key].isEditing = false
      }
  
      const cancelEdit = (key) => {
        editableFields.value[key].value = originalData.value[key] || ''
        editableFields.value[key].isEditing = false
      }
  
      const addExpense = () => {
        if (!isSubmitted.value) {
          expenses.value.push({
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            category: '',
            description: '',
            amount: 0,
            editingState: true
          })
        }
      }
  
      const startExpenseEdit = (index) => {
        if (!isSubmitted.value) {
          expenses.value[index].editingState = true
        }
      }
  
      const saveExpense = (index) => {
        expenses.value[index].editingState = false
      }
  
      const cancelExpenseEdit = (index) => {
        if (expenses.value[index].id && originalData.value.expenses) {
          const original = originalData.value.expenses.find(e => e.id === expenses.value[index].id)
          if (original) {
            expenses.value[index] = { ...original, editingState: false }
          }
        } else {
          expenses.value.splice(index, 1)
        }
      }
  
      const removeExpense = (index) => {
        if (!isSubmitted.value) {
          expenses.value.splice(index, 1)
        }
      }
  
      const confirmSubmit = async () => {
        try {
            isProcessing.value = true;
            const reportData = {
            requester: editableFields.value.requester.value,
            department: editableFields.value.department.value,
            position: editableFields.value.position.value,
            start_date: editableFields.value.start_date.value,
            end_date: editableFields.value.end_date.value,
            total_amount: parseFloat(editableFields.value.total_amount.value),
            expenses: expenses.value.map(expense => ({
                id: expense.id,
                date: expense.date,
                category: expense.category,
                description: expense.description,
                amount: parseFloat(expense.amount)
            })),
            uploaded_files: props.reportData.uploaded_files || []
            }

            await emit('submit', reportData)
            showConfirmModal.value = false
            isSubmitted.value = true
            
            // Show and automatically hide success message
            showSuccessMessage.value = true
            setTimeout(() => {
            showSuccessMessage.value = false
            }, 3000)
        } catch (error) {
            console.error('Error submitting report:', error)
        } finally {
            isProcessing.value = false
        }
        }
  
      return {
        editableFields,
        expenses,
        showConfirmModal,
        isSubmitted,
        formatValue,
        startEdit,
        saveField,
        cancelEdit,
        addExpense,
        startExpenseEdit,
        saveExpense,
        cancelExpenseEdit,
        removeExpense,
        confirmSubmit,
        showSuccessMessage,
        isProcessing
      }
    }
  }
  </script>

<style scoped>
/* Fade transition for modal backdrop */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scale transition for modal content */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

/* Slide-fade transition for success message */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Add smooth transitions for interactive elements */
button {
  transition: all 0.2s ease;
}

input,
.border {
  transition: border-color 0.2s ease;
}

.hover\:bg-gray-50:hover {
  transition: background-color 0.2s ease;
}
</style>