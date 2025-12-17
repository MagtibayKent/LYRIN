# Asset Migration Instructions

Copy the following assets from the original project to the React frontend:

## Images
Copy all files from:
`assets/images/` → `frontend/public/images/`

This includes:
- logo.png
- Heading - Copy.png
- 2.png, 3.png, 4.png, 5.png, 6.png (team member photos)
- Any other images

## Fonts (if any)
Copy all files from:
`assets/fonts/` → `frontend/public/fonts/`

## Directory Structure After Migration

```
frontend/
├── public/
│   ├── images/
│   │   ├── logo.png
│   │   ├── Heading - Copy.png
│   │   ├── 2.png
│   │   ├── 3.png
│   │   ├── 4.png
│   │   ├── 5.png
│   │   └── 6.png
│   └── fonts/
│       └── (any custom fonts)
```

## Usage in React
Images in the `public` folder can be referenced with absolute paths:
```jsx
<img src="/images/logo.png" alt="Logo" />
```
