# Portfolio content and reproduction status

This ledger separates a project’s portfolio value from permission to reproduce a publisher’s complete article text.

## Complete semantic web editions

- The three supplied research papers are converted in full from Paul Shannon’s source PDFs into `/report/` pages. The PDFs remain available as source documents.
- Seventeen independently published LinkedIn or Medium articles are stored as structured article content in `content/articles/` and rendered in full at `/article/` routes.
- Seven Workinman Interactive articles are stored as complete authorized portfolio editions. Paul Shannon reports explicit permission from Matt at Workinman to include public-facing, non-confidential content in his portfolio. Each edition identifies Paul Shannon as the author and Workinman Interactive as the original publisher, and links to the original Workinman page.

The Workinman records use `authorized-client-portfolio-edition`; independently published records use `complete-owned-web-edition`. Both statuses produce complete on-site reading pages, but the Workinman status preserves its separate publisher relationship in visible metadata and structured data.

## Unverified source

The supplied URL for *Sustainable585: Issue #2 — Where the Work Begins* resolves to a different issue. The project therefore has an original overview and an on-site guide, but no external-source button and no claim that complete source text has been reproduced. Add a verified Issue #2 source or Paul-owned manuscript before converting it to a complete web edition.

## Adding future work

Only mark a content record `complete-owned-web-edition` when Paul owns the edition. Use `authorized-client-portfolio-edition` for client work with documented portfolio-reproduction permission and retain the original publisher in the record and page schema. If permission or a verified source is unknown, retain the overview and guide treatment until both are documented.
