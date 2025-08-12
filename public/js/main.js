// Main JavaScript for Portal Pemerintahan

document.addEventListener('DOMContentLoaded', function() {
  // Enable Bootstrap tooltips
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Enable Bootstrap popovers
  var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
  
  // Auto-dismiss alerts after 5 seconds
  setTimeout(function() {
    $('.alert').alert('close');
  }, 5000);
  
  // Add active class to current nav item
  const currentLocation = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentLocation === linkPath || 
        (linkPath !== '/' && currentLocation.startsWith(linkPath))) {
      link.classList.add('active');
    }
  });
  
  // Handle tag inputs in forms
  const tagsInputs = document.querySelectorAll('.tags-input-field');
  
  tagsInputs.forEach(input => {
    input.addEventListener('keydown', function(e) {
      if (e.key === ',' || e.key === 'Enter') {
        e.preventDefault();
        
        const value = this.value.trim();
        if (value) {
          // Get the hidden input that stores all tags
          const hiddenInput = this.parentElement.querySelector('input[type="hidden"]');
          
          // Get current tags
          let tags = hiddenInput.value ? hiddenInput.value.split(',') : [];
          
          // Add new tag if not already in the list
          if (!tags.includes(value)) {
            tags.push(value);
            hiddenInput.value = tags.join(',');
            
            // Create tag element
            const tagElement = document.createElement('span');
            tagElement.className = 'badge bg-secondary me-1';
            tagElement.textContent = value;
            
            // Add remove button
            const removeBtn = document.createElement('span');
            removeBtn.innerHTML = '&times;';
            removeBtn.className = 'ms-1';
            removeBtn.style.cursor = 'pointer';
            removeBtn.addEventListener('click', function() {
              // Remove from hidden input
              tags = tags.filter(tag => tag !== value);
              hiddenInput.value = tags.join(',');
              
              // Remove tag element
              this.parentElement.remove();
            });
            
            tagElement.appendChild(removeBtn);
            
            // Add to the container
            this.parentElement.insertBefore(tagElement, this);
          }
          
          // Clear input
          this.value = '';
        }
      }
    });
  });
});
