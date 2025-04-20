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

      // Cache DOM elements
      const latestIcon = document.getElementById('latest-article-icon');
      const tagFilter = document.getElementById('tagFilter');
      const postsContainer = document.getElementById('posts');
      const paginationContainer = document.getElementById('pagination');
      const portfolioSection = document.getElementById('portfolio');

      // Make the plant icon go to the newest article
      if (latestIcon && data.length) {
        latestIcon.addEventListener('click', () => {
          window.open(data[0].link, '_blank');
        });
      }

      // Build tag filter
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
        renderPage(currentPage);
      });

      const postsPerPage = 6;
      let currentPage = 1;

      function getFiltered() {
        return selectedTag === 'all'
          ? data
          : data.filter(post => post.tags && post.tags.includes(selectedTag));
      }

      function renderPage(page) {
        const filtered = getFiltered();
        const totalPages = Math.ceil(filtered.length / postsPerPage);
        const start = (page - 1) * postsPerPage;
        const slice = filtered.slice(start, start + postsPerPage);

        // Render posts
        postsContainer.innerHTML = '';
        slice.forEach(post => {
          const card = document.createElement('div');
          card.className = 'project-card';

          // Image
          const img = document.createElement('img');
          img.src = post.image; img.alt = post.title;
          card.appendChild(img);

          // Title/link
          const h3 = document.createElement('h3');
          const a = document.createElement('a');
          a.href = post.link; a.target = '_blank';
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
            const tc = document.createElement('div');
            tc.className = 'tags-container';
            post.tags.forEach(t => {
              const span = document.createElement('span');
              span.className = 'tag'; span.textContent = t;
              tc.appendChild(span);
            });
            card.appendChild(tc);
          }

          postsContainer.appendChild(card);
        });

        // Render pagination
        paginationContainer.innerHTML = '';
        if (page > 1) {
          const prev = document.createElement('button');
          prev.textContent = 'Previous';
          prev.addEventListener('click', () => {
            currentPage--; renderPage(currentPage);
            portfolioSection.scrollIntoView({ behavior: 'smooth' });
          });
          paginationContainer.appendChild(prev);
        }

        const info = document.createElement('span');
        info.textContent = ` Page ${page} of ${totalPages} `;
        paginationContainer.appendChild(info);

        if (page < totalPages) {
          const next = document.createElement('button');
          next.textContent = 'Next';
          next.addEventListener('click', () => {
            currentPage++; renderPage(currentPage);
            portfolioSection.scrollIntoView({ behavior: 'smooth' });
          });
          paginationContainer.appendChild(next);
        }
      }

      // Initial render
      renderPage(currentPage);
    })
    .catch(error => console.error('Error fetching blog posts:', error));
});
