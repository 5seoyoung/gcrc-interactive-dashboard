/**
 * GCRC Upload Component
 * File upload and drag-and-drop functionality
 */

export class FileUploadComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.files = [];
        this.options = {
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: ['.csv', '.json', '.txt'],
            multiple: true,
            ...options
        };
        
        this.onFileAdd = options.onFileAdd || (() => {});
        this.onFileRemove = options.onFileRemove || (() => {});
        this.onError = options.onError || (() => {});
    }

    init() {
        this.setupDropzone();
        this.setupFileInput();
    }

    setupDropzone() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            container.addEventListener(eventName, () => {
                container.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, () => {
                container.classList.remove('dragover');
            }, false);
        });

        // Handle dropped files
        container.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        }, false);
    }

    setupFileInput() {
        const fileInput = document.querySelector(`#${this.containerId} input[type="file"]`);
        if (!fileInput) return;

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleFiles(files) {
        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                this.addFile(file);
            }
        });
    }

    validateFile(file) {
        // Check file size
        if (file.size > this.options.maxFileSize) {
            this.onError(`File too large: ${file.name} (max ${this.formatFileSize(this.options.maxFileSize)})`);
            return false;
        }

        // Check file type
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!this.options.allowedTypes.includes(extension)) {
            this.onError(`Unsupported file type: ${file.name}`);
            return false;
        }

        return true;
    }

    addFile(file) {
        const fileObj = {
            id: Date.now() + Math.random(),
            file: file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'ready'
        };

        this.files.push(fileObj);
        this.onFileAdd(fileObj);
    }

    removeFile(fileId) {
        const index = this.files.findIndex(f => f.id === fileId);
        if (index !== -1) {
            const removedFile = this.files.splice(index, 1)[0];
            this.onFileRemove(removedFile);
        }
    }

    getFiles() {
        return this.files;
    }

    clear() {
        this.files = [];
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    async readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

export class ProgressUploader extends FileUploadComponent {
    constructor(containerId, options = {}) {
        super(containerId, options);
        this.uploadProgress = new Map();
    }

    async uploadFile(fileObj, uploadUrl) {
        const formData = new FormData();
        formData.append('file', fileObj.file);
        formData.append('metadata', JSON.stringify({
            originalName: fileObj.name,
            size: fileObj.size,
            type: fileObj.type
        }));

        try {
            fileObj.status = 'uploading';
            this.updateProgress(fileObj.id, 0);

            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    this.updateProgress(fileObj.id, percentCompleted);
                }
            });

            if (response.ok) {
                fileObj.status = 'completed';
                this.updateProgress(fileObj.id, 100);
                return await response.json();
            } else {
                throw new Error('Upload failed');
            }

        } catch (error) {
            fileObj.status = 'error';
            this.onError(`Upload failed: ${fileObj.name}`);
            throw error;
        }
    }

    updateProgress(fileId, progress) {
        this.uploadProgress.set(fileId, progress);
        
        // Trigger progress update event
        if (this.onProgress) {
            this.onProgress(fileId, progress);
        }
    }

    getProgress(fileId) {
        return this.uploadProgress.get(fileId) || 0;
    }
}

export default FileUploadComponent;