<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep gallery tab and lightbox navigation scroll-neutral (`resetScroll: false`) so browsing does not jump away from the collection.
- Keep public and curator form text at least 16px on phones to avoid automatic input zoom.
- Use native absolute external anchors with `target="_blank"` and `rel="noopener noreferrer"`; scripted redirects cannot override preview sandbox restrictions.
