document.addEventListener('DOMContentLoaded', function() {
  fetch('posts.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      return response.json();
    })
    .then(data => {
      const postsContainer = document.getElementById('posts');
      data.forEach(post => {
        // Create a card container
        const card = document.createElement('div');
        card.className = 'project-card';
        
        // Create and append image element
        const img = document.createElement('img');
        img.src = post.image;
        img.alt = post.title;
        card.appendChild(img);
        
        // Create and append title element (wrapped in an anchor)
        const h3 = document.createElement('h3');
        const a = document.createElement('a');
        a.href = post.link;
        a.target = '_blank';
        a.className = 'post-link';
        a.textContent = post.title;
        h3.appendChild(a);
        card.appendChild(h3);
        
        // If a date exists, create and append a date element
        if (post.date) {
          const dateEl = document.createElement('p');
          dateEl.className = 'post-date';
          dateEl.textContent = post.date;
          card.appendChild(dateEl);
        }
        
        // Create and append description element
        const p = document.createElement('p');
        p.innerHTML = post.description;
        card.appendChild(p);
        
        // Append card to container
        postsContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error fetching blog posts:', error);
    });
});
