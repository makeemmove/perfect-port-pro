

## Plan: Update Color Palette Only

**Single file change: `src/index.css`** — update CSS custom properties in `:root`.

### Color Mapping (hex → HSL)

| Role | Hex | HSL |
|------|-----|-----|
| Primary (headings, buttons) `--primary` | #003366 | 210 100% 20% |
| Foreground (dark navy) `--foreground`, `--card-foreground`, `--popover-foreground` | #003366 | 210 100% 20% |
| Muted foreground (subtext) `--muted-foreground` | #666666 | 0 0% 40% |
| Background `--background` | #F5F5F5 | 0 0% 96% |
| Card / popover `--card`, `--popover` | #FFFFFF | 0 0% 100% |
| Muted bg `--muted` | #F5F5F5 | 0 0% 96% |
| Accent (teal) `--accent` | #00BFA6 | 170 100% 37% |
| Gold `--gold`, `--orange` | #FFA500 | 39 100% 50% |
| Secondary (teal) `--secondary` | #00BFA6 | 170 100% 37% |
| Icons (dark gray) — already handled by foreground | #333333 | 0 0% 20% |
| Ring `--ring` | #003366 | 210 100% 20% |
| Destructive — keep red as-is | — | unchanged |
| Sidebar vars — mirror main palette | — | same as above |

### Custom palette updates
- `--blue`: 210 100% 20%
- `--purple`: 170 100% 37% (match teal accent)
- `--emerald`: 170 100% 37%
- `--crimson`: keep as-is (destructive)

### What stays the same
All fonts, spacing, shapes, border-radius, glass effects, animations — untouched. Only HSL values in `:root` change.

