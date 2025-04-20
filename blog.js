// blog.js

document.addEventListener('DOMContentLoaded', function() {
  fetch('posts.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      return response.json();
    })
    .then(data => {
      // Sort posts so the newest come first
      data.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Cache DOM elements
      const tagFilter = document.getElementById('tagFilter');
      const postsContainer = document.getElementById('posts');
      const paginationContainer = document.getElementById('pagination');
      const portfolioSection = document.getElementById('portfolio');

      // Build tag filter options
      const allTags = new Set();
      data.forEach(post => {
        if (post.tags) {
          post.tags.forEach(tag => allTags.add(tag));
        }
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
        renderPage(currentPage);
      });

      const postsPerPage = 6;
      let currentPage = 1;

      // Helper: get posts matching current tag
      function getFiltered() {
        if (selectedTag === 'all') {
          return data;
        }
        return data.filter(post => post.tags && post.tags.includes(selectedTag));
      }

      // Render posts + pagination for a given page
      function renderPage(page) {
        const filtered = getFiltered();
        const totalPages = Math.ceil(filtered.length / postsPerPage);
        const startIndex = (page - 1) * postsPerPage;
        const slice = filtered.slice(startIndex, startIndex + postsPerPage);

        // Clear and render posts
        postsContainer.innerHTML = '';
        slice.forEach(post => {
          const card = document.createElement('div');
          card.className = 'project-card';

          // Image
          const img = document.createElement('img');
          img.src = post.image;
          img.alt = post.title;
          card.appendChild(img);

          // Title + link
          const h3 = document.createElement('h3');
          const a = document.createElement('a');
          a.href = post.link;
          a.target = '_blank';
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
          const desc = document.createElement('p');
          desc.innerHTML = post.description;
          card.appendChild(desc);

          // Tags
          if (post.tags) {
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'tags-container';
            post.tags.forEach(tag => {
              const span = document.createElement('span');
              span.className = 'tag';
              span.textContent = tag;
              tagsContainer.appendChild(span);
            });
            card.appendChild(tagsContainer);
          }

          postsContainer.appendChild(card);
        });

        // Clear and render pagination controls
        paginationContainer.innerHTML = '';

        if (page > 1) {
          const prevBtn = document.createElement('button');
          prevBtn.textContent = 'Previous';
          prevBtn.addEventListener('click', () => {
            currentPage--;
            renderPage(currentPage);
            portfolioSection.scrollIntoView({ behavior: 'smooth' });
          });
          paginationContainer.appendChild(prevBtn);
        }

        const pageInfo = document.createElement('span');
        pageInfo.textContent = ` Page ${page} of ${totalPages} `;
        paginationContainer.appendChild(pageInfo);

        if (page < totalPages) {
          const nextBtn = document.createElement('button');
          nextBtn.textContent = 'Next';
          nextBtn.addEventListener('click', () => {
            currentPage++;
            renderPage(currentPage);
            portfolioSection.scrollIntoView({ behavior: 'smooth' });
          });
          paginationContainer.appendChild(nextBtn);
        }
      }

      // Initial render
      renderPage(currentPage);
    })
    .catch(error => {
      console.error('Error fetching blog posts:', error);
    });
});
