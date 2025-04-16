document.addEventListener('DOMContentLoaded', function() {
  fetch('posts.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      return response.json();
    })
    .then(data => {
      // Sort posts so that the newest posts (by date) come first.
      data.sort((a, b) => new Date(b.date) - new Date(a.date));

      const postsPerPage = 6; // Changed from 9 to 6 articles per page
      const totalPages = Math.ceil(data.length / postsPerPage);
      let currentPage = 1;
      const postsContainer = document.getElementById('posts');
      const paginationContainer = document.getElementById('pagination');

      // Function to display posts for a given page
      function displayPosts(page) {
        postsContainer.innerHTML = ''; // Clear current posts
        const startIndex = (page - 1) * postsPerPage;
        const endIndex = Math.min(startIndex + postsPerPage, data.length);

        for (let i = startIndex; i < endIndex; i++) {
          const post = data[i];
          // Create the card container
          const card = document.createElement('div');
          card.className = 'project-card';

          // Create and append the image element
          const img = document.createElement('img');
          img.src = post.image;
          img.alt = post.title;
          card.appendChild(img);

          // Create and append the title (wrapped in an anchor)
          const h3 = document.createElement('h3');
          const a = document.createElement('a');
          a.href = post.link;
          a.target = '_blank';
          a.className = 'post-link';
          a.textContent = post.title;
          h3.appendChild(a);
          card.appendChild(h3);

          // Append date element (if exists)
          if (post.date) {
            const dateEl = document.createElement('p');
            dateEl.className = 'post-date';
            dateEl.textContent = post.date;
            card.appendChild(dateEl);
          }

          // Create and append the description element
          const p = document.createElement('p');
          p.innerHTML = post.description;
          card.appendChild(p);

          // Append the card to the posts container
          postsContainer.appendChild(card);
        }
      }

      // Function to update pagination controls
      function updatePagination() {
        paginationContainer.innerHTML = ''; // Clear any existing controls

        // Create Previous Button if not on the first page
        if (currentPage > 1) {
          const prevBtn = document.createElement('button');
          prevBtn.textContent = 'Previous';
          prevBtn.addEventListener('click', function() {
            currentPage--;
            displayPosts(currentPage);
            updatePagination();
          });
          paginationContainer.appendChild(prevBtn);
        }

        // Display page information
        const pageInfo = document.createElement('span');
        pageInfo.textContent = ` Page ${currentPage} of ${totalPages} `;
        paginationContainer.appendChild(pageInfo);

        // Create Next Button if not on the last page
        if (currentPage < totalPages) {
          const nextBtn = document.createElement('button');
          nextBtn.textContent = 'Next';
          nextBtn.addEventListener('click', function() {
            currentPage++;
            displayPosts(currentPage);
            updatePagination();
          });
          paginationContainer.appendChild(nextBtn);
        }
      }

      // Initial display of posts and pagination setup
      displayPosts(currentPage);
      updatePagination();
    })
    .catch(error => {
      console.error('Error fetching blog posts:', error);
    });
});
