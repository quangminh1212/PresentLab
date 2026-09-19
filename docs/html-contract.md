# HTML deck contract

## Required structure

```html
<!doctype html>
<html lang="en" data-pl-format="16:9" data-pl-title="Deck title">
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="../../resources/styles/presentlab.css" />
  </head>
  <body>
    <section class="pl-slide" data-pl-slide data-slide-id="opening">
      <h1>Opening</h1>
    </section>
  </body>
</html>
```

## Metadata

Metadata can live on `<html>` or `<body>`:

| Attribute                   | Values                                       | Default                                              |
| --------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| `data-pl-title`             | non-empty text                               | document `<title>`, first `<h1>`, or `Untitled deck` |
| `data-pl-format`            | `16:9`, `4:3`, `A4-landscape`, `A4-portrait` | `16:9`                                               |
| `lang` / `data-pl-language` | BCP 47-like language tag                     | `en`                                                 |
| `data-pl-author`            | non-empty text                               | omitted                                              |
| `data-pl-theme`             | local theme name                             | omitted                                              |

## Slide boundaries

PresentLab selects `[data-pl-slide], .pl-slide`. Each selected element is one slide. Use a unique lowercase `data-slide-id`; an HTML `id` is accepted as a fallback, and a generated id produces a validation warning. Duplicate ids are an error after normalization.

Every slide should contain a heading (`[data-slide-title]`, `h1`, `h2`, or `h3`). Every image must have meaningful `alt` text. A deck may contain at most 100 slides by default; callers can lower the limit.

## Rendering assumptions

The renderer fixes the viewport to the selected page dimensions and injects page-break CSS. Keep the slide itself at the matching 1600px canvas used by the shared stylesheet. Avoid animations, timers, random values, current timestamps, and remote fonts when reproducibility matters.

## Validation loop

1. Run `presentlab validate` or call `presentlab_validate_deck`.
2. Fix every error and review warnings.
3. Render PNG first for visual QA.
4. Render PDF/PPTX/catalog only after the PNG result is acceptable.
