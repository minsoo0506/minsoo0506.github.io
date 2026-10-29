# Minsoo XP Portfolio Implementation Plan

Goal: Personalize fsystemweb/xp-portfolio and publish at minsoo0506.github.io.
Architecture: Retain React/Vite desktop, windows and styles; static JSON content; GitHub Pages Actions deployment at root.
Source: User request, current GitHub profile and four pinned repository READMEs.

1. Update portfolio.json with Minsoo's biography, skills, work/education, four pinned repositories and contact links. Keep MJSEC vulnerability research separate from Defense Security Lab anti-tampering. Do not infer graduation or unverified achievements.
2. Replace personal-name boot splash with the historical XP Professional boot image and animated blue bar. Preserve 3-second boot transition and reduced-motion support.
3. Extend About and Contact with skills and Instagram; retain existing window interactions and responsive layout. Replace unrelated project pictures with repository-themed thumbnails.
4. Set Vite root base, page metadata, attribution and GitHub Pages workflow. Retain original authorship/history.
5. Run tests, typecheck and build. Check desktop/mobile window opening, content, images and contact/project links. Review changes before publishing; verify deployed URL.

Review focus: Root asset paths, no original personal details in live content, correct current pins, mobile scroll/close controls, boot completion.
