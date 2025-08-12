// Admin JavaScript for Portal Pemerintahan

document.addEventListener('DOMContentLoaded', function() {
  // Initialize TinyMCE editor for rich text fields
  if (typeof tinymce !== 'undefined') {
    tinymce.init({
      selector: '.tinymce-editor',
      height: 400,
      menubar: false,
      plugins: [
        'advlist autolink lists link image charmap print preview anchor',
        'searchreplace visualblocks code fullscreen',
        'insertdatetime media table paste code help wordcount'
      ],
      toolbar: 'undo redo | formatselect | ' +
        'bold italic backcolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | link image | help',
      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
    });
  }
  
  // File upload preview
  const fileInput = document.querySelector('.file-input');
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      const fileName = e.target.files[0]?.name;
      const fileSize = e.target.files[0]?.size;
      
      if (fileName) {
        // Show file name
        const fileNameElement = document.querySelector('.file-name');
        if (fileNameElement) {
          fileNameElement.textContent = fileName;
        }
        
        // Show file size
        const fileSizeElement = document.querySelector('.file-size');
        if (fileSizeElement && fileSize) {
          let size;
          if (fileSize < 1024) {
            size = fileSize + ' B';
          } else if (fileSize < 1048576) {
            size = (fileSize / 1024).toFixed(2) + ' KB';
          } else {
            size = (fileSize / 1048576).toFixed(2) + ' MB';
          }
          
          fileSizeElement.textContent = size;
        }
        
        // Show preview for images
        const filePreview = document.querySelector('.file-preview');
        if (filePreview && e.target.files[0].type.startsWith('image/')) {
          const reader = new FileReader();
          
          reader.onload = function(event) {
            filePreview.innerHTML = `<img src="${event.target.result}" class="img-fluid rounded" alt="Preview">`;
            filePreview.style.display = 'block';
          }
          
          reader.readAsDataURL(e.target.files[0]);
        }
      }
    });
  }
  
  // Handle tag inputs in forms
  const tagsInput = document.querySelector('.tags-input');
  if (tagsInput) {
    const input = tagsInput.querySelector('input');
    const hiddenInput = document.querySelector('[name="tags"]');
    
    // Initialize tags from hidden input
    if (hiddenInput.value) {
      const tags = hiddenInput.value.split(',');
      tags.forEach(tag => {
        if (tag.trim()) {
          addTag(tag.trim());
        }
      });
    }
    
    input.addEventListener('keydown', function(e) {
      if (e.key === ',' || e.key === 'Enter') {
        e.preventDefault();
        
        const value = this.value.trim();
        if (value) {
          addTag(value);
          this.value = '';
        }
      }
    });
    
    function addTag(value) {
      // Get current tags
      const currentTags = hiddenInput.value ? hiddenInput.value.split(',') : [];
      
      // Add new tag if not already in the list
      if (!currentTags.includes(value)) {
        currentTags.push(value);
        hiddenInput.value = currentTags.join(',');
        
        // Create tag element
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerHTML = `${value} <span class="remove">&times;</span>`;
        
        // Add remove event
        tag.querySelector('.remove').addEventListener('click', function() {
          const updatedTags = hiddenInput.value.split(',').filter(t => t !== value);
          hiddenInput.value = updatedTags.join(',');
          tag.remove();
        });
        
        tagsInput.insertBefore(tag, input);
      }
    }
  }
  
  // Confirm delete
  const deleteButtons = document.querySelectorAll('.delete-confirm');
  if (deleteButtons) {
    deleteButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        if (!confirm('Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.')) {
          e.preventDefault();
        }
      });
    });
  }
  
  // Enable Bootstrap tooltips
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Auto-dismiss alerts after 5 seconds
  setTimeout(function() {
    $('.alert').alert('close');
  }, 5000);
  
  // Add active class to current sidebar item
  const currentLocation = window.location.pathname;
  const sidebarLinks = document.querySelectorAll('#sidebar-wrapper .list-group-item');
  
  sidebarLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath && (currentLocation === linkPath || 
        (linkPath !== '/' && currentLocation.startsWith(linkPath)))) {
      link.classList.add('active');
    }
  });
});
