# yalla-source

Rebuild-only inputs for the Yalla card bank:

- `romanian-glosses.tsv`
- `course-expansion.json`

They are consumed by the offline builders `build-romanian.py` and
`expand-content.py`. Nothing the website serves reads them — `public/yalla/`
is the authoritative runtime.
