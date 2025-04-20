// blog.js
document.addEventListener('DOMContentLoaded', function() {
  fetch('posts.json')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not OK');
      return response.json();
    })
    .then(data => {
      // Sort newest first
      data.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Populate tag filter dropdown
      const tagFilter = document.getElementById('tagFilter');
      const allTags = new Set();
      data.forEach(post => {
        if (post.tags) post.tags.forEach(tag => allTags.add(tag));
      });
      allTags.forEach(tag => {
        const opt = document.createElement('option');
        opt.value = tag;
        opt.textContent = tag;
        tagFilter.appendChild(opt);
      });

      let selectedTag = 'all';
      tagFilter.addEventListener('change', () => {
        selectedTag = tagFilter.value;
        currentPage = 1;
        displayPosts(currentPage);
        updatePagination();
      });

      const postsPerPage = 6;
      let currentPage = 1;
      const postsContainer = document.getElementById('posts');
      const paginationContainer = document.getElementById('pagination');

      function getFiltered() {
        return selectedTag === 'all'
          ? data
          : data.filter(post => post.tags && post.tags.includes(selectedTag));
      }

      function displayPosts(page) {
        postsContainer.innerHTML = '';
        const filtered = getFiltered();
        const start = (page - 1) * postsPerPage;
        const end = Math.min(start + postsPerPage, filtered.length);

        filtered.slice(start, end).forEach(post => {
          const card = document.createElement('div');
          card.className = 'project-card';

          // Image
          const img = document.createElement('img');
          img.src = post.image;
          img.alt = post.title;
          card.appendChild(img);

          // Title & link
          const h3 = document.createElement('h3');
          const a = document.createElement('a');
          a.href = post.link;
          a.target = '_blank';
          a.className = 'post-link';
          a.textContent = post.title;
          h3.appendChild(a);
          card.appendChild(h3);

          // Date
          if (post.date) {
            const dateEl = document.createElement('p');
            dateEl.className = 'post-date';
            dateEl.textContent = post.date;
            card.appendChild(dateEl);
          }

          // Description
          const p = document.createElement('p');
          p.innerHTML = post.description;
          card.appendChild(p);

          // Tags
          if (post.tags) {
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'tags-container';
            post.tags.forEach(tag => {
              const tagEl = document.createElement('span');
              tagEl.className = 'tag';
              tagEl.textContent = tag;
              tagsContainer.appendChild(tagEl);
            });
            card.appendChild(tagsContainer);
          }

          postsContainer.appendChild(card);
        });
      }

      function updatePagination() {
        paginationContainer.innerHTML = '';
        const filtered = getFiltered();
        const totalPages = Math.ceil(filtered.length / postsPerPage);

        if (currentPage > 1) {
          const prevBtn = document.createElement('button');
          prevBtn.textContent = 'Previous';
          prevBtn.addEventListener('click', () => {
            currentPage--;
            displayPosts(currentPage);
            updatePagination();
          });
          paginationContainer.appendChild(prevBtn);
        }

        const pageInfo = document.createElement('span');
        pageInfo.textContent = ` Page ${currentPage} of ${totalPages} `;
        paginationContainer.appendChild(pageInfo);

        if (currentPage < totalPages) {
          const nextBtn = document.createElement('button');
          nextBtn.textContent = 'Next';
          nextBtn.addEventListener('click', () => {
            currentPage++;
            displayPosts(currentPage);
            updatePagination();
          });
          paginationContainer.appendChild(nextBtn);
        }
      }

      // Initialize display
      displayPosts(currentPage);
      updatePagination();
    })
    .catch(error => console.error('Error fetching blog posts:', error));
});
