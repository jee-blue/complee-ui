# Plan: Simplify RegulatoryRibbon to default export

## Changes

### 1. `src/components/complee/RegulatoryRibbon.tsx`
Replace the entire file with the simplified default-export version:

```tsx
export default function RegulatoryRibbon() {
  return (
    <div className="w-full text-center text-[12px] text-navy-foreground/70">
      Expansion requirements covered across PSD3, GDPR, DORA
    </div>
  );
}
```

### 2. `src/routes/index.tsx`
Update the import from named to default:

- From: `import { RegulatoryRibbon } from "@/components/complee/RegulatoryRibbon";`
- To: `import RegulatoryRibbon from "@/components/complee/RegulatoryRibbon";`

## Notes
- No other files import `RegulatoryRibbon` (will verify via `rg` before edit, and update any additional callsites the same way if found).
- Existing usage `<RegulatoryRibbon />` in the hero section remains unchanged.
