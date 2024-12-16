<template>
    <div>
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Upload Report</h1>
        <p class="text-gray-600">Upload up to 5 PDF files for report generation</p>
      </div>
  
      <div class="flex gap-8">
        <!-- Left Column -->
        <div class="flex-1">
          <!-- Drag & Drop Zone -->
          <div 
            class="mb-6 border-2 border-dashed border-gray-300 rounded-lg p-8 bg-white"
            :class="{ 'border-blue-500 bg-blue-50': isDragging }"
            @dragenter.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <div class="text-center">
              <upload-icon 
                class="mx-auto h-12 w-12 text-gray-400 mb-4"
                :class="{ 'text-blue-500': isDragging }"
              />
              <p class="text-gray-600">
                Drag and drop your PDF files here, or
                <label class="text-blue-500 hover:text-blue-600 cursor-pointer">
                  browse
                  <input 
                    type="file" 
                    class="hidden" 
                    accept=".pdf" 
                    multiple 
                    @change="handleFileSelect"
                  >
                </label>
              </p>
              <p class="text-sm text-gray-500 mt-2">Up to 5 PDF files, max 10MB each</p>
            </div>
          </div>
  
          <!-- Uploaded Files List -->
            <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">Uploaded Files</h2>
            <div v-if="uploadedFiles.length === 0" class="text-gray-500 text-center py-4">
                No files uploaded yet
            </div>
            <div v-for="(file, index) in uploadedFiles" 
                :key="index" 
                class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                :class="{ 'bg-blue-50': selectedFileIndex === index }"
                @click="selectFile(index)">
                <div class="flex items-center flex-1">
                <file-icon class="h-5 w-5 text-gray-400 mr-2" />
                <span class="text-sm text-gray-600">{{ file.name }}</span>
                </div>
                <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</span>
                <button 
                    @click.stop="removeFile(index)"
                    class="text-red-500 hover:text-red-600 ml-2"
                >
                    <trash-icon class="h-5 w-5" />
                </button>
                </div>
            </div>
            </div>
  
          <!-- PDF Viewer -->
          <div v-if="selectedFile" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">PDF Preview</h2>
            <vue-pdf-embed
              :source="selectedFile"
              class="border border-gray-200 rounded"
            />
          </div>
        </div>
  
       <!-- Right Column -->
          <div class="w-1/2 bg-white rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-lg font-semibold">Report Preview</h2>
              <button 
                @click="generateReport"
                :disabled="!canGenerateReport"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <div class="flex items-center">
                  <span v-if="isGenerating" class="mr-2">Generating...</span>
                  <span v-else>Generate Report</span>
                  <loader-icon v-if="isGenerating" class="animate-spin ml-2 h-5 w-5" />
                </div>
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="isGenerating" class="text-center py-12">
              <loader-icon class="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
              <p class="text-gray-600">Processing your documents...</p>
            </div>

            <!-- Interactive Report Preview -->
            <InteractiveReportPreview
              v-else-if="generatedReport"
              :reportData="generatedReport"
              @save="handleSaveReport"
              @submit="handleSubmitReport"
            />

            <!-- Empty State -->
            <div v-else class="text-center py-12 text-gray-500">
              <document-icon class="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p>Upload files and click "Generate Report" to see the preview</p>
            </div>
          </div>
      </div>
    </div>
  </template>
  
  <script>
import { ref, computed } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
import { UploadIcon, FileIcon, TrashIcon, LoaderIcon, DocumentIcon } from 'lucide-vue-next'
import ApiService from '@/services/api'
import InteractiveReportPreview from '@/components/InteractiveReportPreview.vue'

export default {
  name: 'UploadReport',
  
  components: {
    VuePdfEmbed,
    UploadIcon,
    FileIcon,
    TrashIcon,
    LoaderIcon,
    DocumentIcon,
    InteractiveReportPreview
  },

  setup() {
    const isDragging = ref(false)
    const uploadedFiles = ref([])
    const selectedFile = ref(null)
    const selectedFileIndex = ref(null)
    const isGenerating = ref(false)
    const generatedReport = ref(null)

    const canGenerateReport = computed(() => {
      return uploadedFiles.value.length > 0 && !isGenerating.value
    })


    const handleSaveReport = async (updatedReport) => {
        try {
          const response = await ApiService.updateReport(updatedReport.id, updatedReport);
          generatedReport.value = response.data;
        } catch (error) {
          console.error('Error saving report:', error);
          alert('Error saving report changes');
        }
      };

      const handleSubmitReport = async (reportData) => {
        try {
          console.log('UploadReport - Sending report data:', reportData);
          const response = await ApiService.submitReport({
            requester: reportData.requester,
            department: reportData.department,
            position: reportData.position,
            start_date: reportData.start_date,
            end_date: reportData.end_date,
            total_amount: parseFloat(reportData.total_amount),
            expenses: reportData.expenses.map(exp => ({
              id: exp.id,
              date: exp.date,
              category: exp.category,
              description: exp.description,
              amount: parseFloat(exp.amount)
            })),
            uploaded_files: reportData.uploaded_files
          });
          
          console.log('Submit response:', response);
          
        } catch (error) {
          console.error('Error submitting report:', error);
          
        }
      };

    const handleDrop = (e) => {
      isDragging.value = false
      const files = [...e.dataTransfer.files].filter(file => file.type === 'application/pdf')
      addFiles(files)
    }

    const handleFileSelect = (e) => {
      const files = [...e.target.files].filter(file => file.type === 'application/pdf')
      addFiles(files)
    }

    const selectFile = (index) => {
      selectedFileIndex.value = index
      selectedFile.value = URL.createObjectURL(uploadedFiles.value[index])
    }


    const removeFile = (index) => {
      URL.revokeObjectURL(uploadedFiles.value[index])
      uploadedFiles.value.splice(index, 1)
      
      // Update selected file if necessary
      if (uploadedFiles.value.length === 0) {
        selectedFile.value = null
        selectedFileIndex.value = null
      } else if (selectedFileIndex.value === index) {
        // If we removed the selected file, select the first file
        selectFile(0)
      } else if (selectedFileIndex.value > index) {
        // If we removed a file before the selected one, update the index
        selectedFileIndex.value--
        selectFile(selectedFileIndex.value)
      }
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }


    const generateReport = async () => {
      try {
        isGenerating.value = true;
        const formData = new FormData();
        
        uploadedFiles.value.forEach((file, index) => {
          formData.append(`file${index}`, file);
        });

        const response = await ApiService.generateReport(formData);
        
        if (response.data) {
          generatedReport.value = response.data;  // Now contains extracted_data
        }
      } catch (error) {
        console.error('Error generating report:', error);
        const errorMessage = error.response?.data?.error || 'Error generating report. Please try again.';
        alert(errorMessage);
      } finally {
        isGenerating.value = false;
      }
    };

  // Add a method to verify file type
  const isValidFile = (file) => {
    return file.type === 'application/pdf';
  };

  // Update the addFiles method to include validation
  const addFiles = (files) => {
    if (uploadedFiles.value.length + files.length > 5) {
      alert('Maximum 5 files allowed');
      return;
    }

    files.forEach(file => {
      if (!isValidFile(file)) {
        alert(`File ${file.name} is not a PDF`);
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB`);
        return;
      }
      
      uploadedFiles.value.push(file);
      if (selectedFileIndex.value === null) {
        selectFile(uploadedFiles.value.length - 1);
      }
    });
  };


    return {
      isDragging,
      uploadedFiles,
      selectedFile,
      selectedFileIndex,
      isGenerating,
      generatedReport,
      canGenerateReport,
      handleDrop,
      handleFileSelect,
      removeFile,
      generateReport,
      selectFile,
      formatFileSize,
      handleSaveReport,    // Add these
      handleSubmitReport
    }
  }
}
</script>